#!/usr/bin/env python3
"""Generate a pure ML submission using Group Target Encoding.

This script implements a real-world machine learning approach:
1. It extracts family/ticket groups (Surname + Ticket).
2. It calculates a 'group_survival_rate' feature using only the other
   members of the group (excluding the passenger to prevent self-leakage).
3. It preprocesses features using a safe Scikit-Learn Pipeline.
4. It trains a Random Forest Classifier to learn the decision boundaries.
5. It evaluates the model using a 5-fold Stratified Cross-Validation loop.
6. It exports the predictions to kaggle_uploads/submission_ml_group_model.csv.
"""

from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import StratifiedKFold
from sklearn.metrics import accuracy_score

ROOT = Path(__file__).resolve().parents[1]
UPLOADS = ROOT / "kaggle_uploads"

def extract_group_features(train_df: pd.DataFrame, test_df: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame]:
    # Combine train and test for grouping
    comb = pd.concat([train_df.assign(_is_train=True), test_df.assign(_is_train=False)], ignore_index=True)
    comb.columns = comb.columns.str.strip().str.lower()
    
    # Standard Title and Surname extraction
    comb["title"] = comb["name"].str.extract(r",\s*([^.]+)\.")[0].str.strip()
    title_mapping = {"Mr": "Mr", "Mrs": "Mrs", "Miss": "Miss", "Master": "Master", "Mme": "Mrs", "Ms": "Miss", "Mlle": "Miss"}
    comb["title"] = comb["title"].map(title_mapping).fillna("Rare")
    comb["surname"] = comb["name"].str.split(",", n=1).str[0].str.strip()
    
    # Define Women & Children group indicator
    comb["wc"] = (comb["sex"] == "female") | (comb["title"] == "Master")
    
    # Create group identifier (Surname + Pclass + Ticket prefix)
    comb["ticket_prefix"] = comb["ticket"].str.extract(r"([A-Za-z0-9\./\s]+)\s+\d+")[0].fillna("XXX")
    comb["group_id"] = comb["surname"] + "_" + comb["pclass"].astype(str) + "_" + comb["ticket_prefix"]
    
    # Calculate group survival rates leakage-free (excluding the passenger themselves)
    group_survival_rates = []
    
    # Map passenger IDs to their survival if in train
    survival_map = comb.set_index("passengerid")["survived"].to_dict()
    
    for idx, row in comb.iterrows():
        pid = row["passengerid"]
        gid = row["group_id"]
        is_wc = row["wc"]
        
        # Find other members in the same group who are women/children and are in train
        group_members = comb[(comb["group_id"] == gid) & (comb["passengerid"] != pid) & comb["_is_train"] & comb["wc"]]
        
        if len(group_members) > 0:
            # Calculate the survival rate of the other group members
            rate = group_members["survived"].mean()
            group_survival_rates.append(rate)
        else:
            # Default rate if no other group members are in train (fallback to global female rate or neutral 0.5)
            group_survival_rates.append(0.5)
            
    comb["group_survival_rate"] = group_survival_rates
    
    train_out = comb[comb["_is_train"]].drop(columns=["_is_train"])
    test_out = comb[~comb["_is_train"]].drop(columns=["_is_train"])
    
    return train_out, test_out

def main():
    train = pd.read_csv(UPLOADS / "train.csv")
    test = pd.read_csv(UPLOADS / "test.csv")
    
    # Extract leakage-free group target features
    train_fe, test_fe = extract_group_features(train, test)
    
    # Select features
    num_cols = ["age", "sibsp", "parch", "fare", "group_survival_rate"]
    cat_cols = ["pclass", "sex", "embarked", "title"]
    
    X = train_fe[num_cols + cat_cols]
    y = train_fe["survived"].astype(int)
    X_test = test_fe[num_cols + cat_cols]
    
    # Build preprocessor
    num_pipeline = Pipeline([
        ("imp", SimpleImputer(strategy="median")),
        ("scale", StandardScaler())
    ])
    cat_pipeline = Pipeline([
        ("imp", SimpleImputer(strategy="most_frequent")),
        ("ohe", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
    ])
    preprocessor = ColumnTransformer([
        ("num", num_pipeline, num_cols),
        ("cat", cat_pipeline, cat_cols)
    ])
    
    # Define Random Forest pipeline
    model_pipeline = Pipeline([
        ("preprocess", preprocessor),
        ("classifier", RandomForestClassifier(n_estimators=150, max_depth=5, min_samples_leaf=3, random_state=42))
    ])
    
    # Evaluate using 5-fold Stratified CV
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    oof_predictions = np.zeros(len(train))
    cv_scores = []
    
    for train_idx, val_idx in cv.split(X, y):
        X_tr, y_tr = X.iloc[train_idx], y.iloc[train_idx]
        X_va, y_va = X.iloc[val_idx], y.iloc[val_idx]
        
        # Fit on training split
        model_pipeline.fit(X_tr, y_tr)
        
        # Predict on validation split
        val_preds = model_pipeline.predict(X_va)
        oof_predictions[val_idx] = val_preds
        
        score = accuracy_score(y_va, val_preds)
        cv_scores.append(score)
        
    print(f"5-Fold Cross-Validation Accuracy Scores: {[round(s, 4) for s in cv_scores]}")
    print(f"Mean CV Accuracy (OOF): {np.mean(cv_scores):.4f}")
    
    # Refit on all training data and predict on test set
    model_pipeline.fit(X, y)
    test_preds = model_pipeline.predict(X_test)
    
    # Save submission file
    submission = pd.DataFrame({
        "PassengerId": test_fe["passengerid"].astype(int),
        "Survived": test_preds.astype(int)
    })
    
    out_path = UPLOADS / "submission_ml_group_model.csv"
    submission.to_csv(out_path, index=False)
    print(f"\nSaved pure ML group predictions to {out_path.name}")
    print(f"Survivors: {int(submission['Survived'].sum())}/418")

if __name__ == "__main__":
    main()
