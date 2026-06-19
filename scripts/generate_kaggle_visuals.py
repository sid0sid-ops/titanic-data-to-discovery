#!/usr/bin/env python3
"""
scripts/generate_kaggle_visuals.py
Generates all Kaggle Titanic plots and trains models to output performance data.
"""
from pathlib import Path
import re
import json
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import train_test_split, cross_validate, StratifiedKFold
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix, classification_report

PROJECT_ROOT = Path(__file__).resolve().parents[1]
KAGGLE_DIR = PROJECT_ROOT / "kaggle"
PLOTS_DIR = PROJECT_ROOT / "public" / "assets" / "plots"
DATA_DIR = PROJECT_ROOT / "public" / "assets" / "data"

PLOTS_DIR.mkdir(parents=True, exist_ok=True)
DATA_DIR.mkdir(parents=True, exist_ok=True)

# Color-blind-safe palette
COLORS = {
    "survived": "#0072B2",
    "not_survived": "#D55E00",
    "female": "#CC79A7",
    "male": "#56B4E9",
    "class_1": "#009E73",
    "class_2": "#E69F00",
    "class_3": "#D55E00",
    "neutral": "#6B7280"
}

def clean_data(df):
    df = df.copy()
    df.columns = df.columns.str.strip().str.lower()
    
    # Feature Engineering
    df["family_size"] = df["sibsp"] + df["parch"] + 1
    df["is_alone"] = (df["family_size"] == 1).astype(int)
    
    # Title extraction
    def get_title(name):
        if not isinstance(name, str):
            return "Mr"
        match = re.search(r",\s*([^.]+)\.", name)
        return match.group(1).strip() if match else "Mr"
    
    df["title"] = df["name"].apply(get_title)
    title_mapping = {
        "Mr": "Mr", "Mrs": "Mrs", "Miss": "Miss", "Master": "Master",
        "Mme": "Mrs", "Ms": "Miss", "Mlle": "Miss"
    }
    df["title"] = df["title"].map(title_mapping).fillna("Rare")
    df["cabin_known"] = df["cabin"].notna().astype(int)
    df["fare_log"] = np.log1p(df["fare"])
    
    # Age Grouping
    bins = [0, 12, 18, 30, 50, 120]
    labels = ["Child", "Teenager", "Young Adult", "Adult", "Senior"]
    df["age_group"] = pd.cut(df["age"], bins=bins, labels=labels).astype(str)
    df["age_group"] = df["age_group"].fillna("Unknown")
    
    return df

def generate_visualizations(df):
    print("=== Generating Kaggle Visualizations ===")
    sns.set_theme(style="whitegrid")
    
    # Helper functions for saving plots
    def save_plot(name):
        plt.tight_layout()
        plt.savefig(PLOTS_DIR / name, dpi=150, bbox_inches="tight")
        plt.close()
        print(f"✓ Saved {name}")

    # 1. Survival count
    plt.figure(figsize=(6, 4))
    sns.countplot(data=df, x="survived", hue="survived", palette=[COLORS["not_survived"], COLORS["survived"]], legend=False)
    plt.title("Survival Count")
    plt.xlabel("Survival Status")
    plt.ylabel("Passenger Count")
    plt.xticks([0, 1], ["Not Survived (0)", "Survived (1)"])
    save_plot("survival_count.png")

    # 2. Sex count
    plt.figure(figsize=(6, 4))
    sns.countplot(data=df, x="sex", hue="sex", palette=[COLORS["male"], COLORS["female"]], legend=False)
    plt.title("Passenger Count by Gender")
    plt.xlabel("Gender")
    plt.ylabel("Count")
    save_plot("sex_count.png")

    # 3. Survival rate by sex
    plt.figure(figsize=(6, 4))
    sns.barplot(data=df, x="sex", y="survived", hue="sex", palette=[COLORS["male"], COLORS["female"]], errorbar=None, legend=False)
    plt.title("Survival Rate by Gender")
    plt.xlabel("Gender")
    plt.ylabel("Survival Rate")
    save_plot("survival_rate_by_sex.png")

    # 4. Survival rate by class
    plt.figure(figsize=(6, 4))
    df_temp = df.copy()
    df_temp["pclass"] = df_temp["pclass"].map({1: "1st Class", 2: "2nd Class", 3: "3rd Class"})
    sns.barplot(data=df_temp, x="pclass", y="survived", hue="pclass", palette=[COLORS["class_1"], COLORS["class_2"], COLORS["class_3"]], order=["1st Class", "2nd Class", "3rd Class"], errorbar=None, legend=False)
    plt.title("Survival Rate by Passenger Class")
    plt.xlabel("Passenger Class")
    plt.ylabel("Survival Rate")
    save_plot("survival_rate_by_class.png")

    # 5. Survival by sex & class heatmap
    plt.figure(figsize=(6, 4))
    pivot = df.pivot_table(index="sex", columns="pclass", values="survived", aggfunc="mean")
    pivot.columns = ["1st Class", "2nd Class", "3rd Class"]
    pivot.index = [idx.capitalize() for idx in pivot.index]
    sns.heatmap(pivot, annot=True, cmap="Blues", fmt=".2f", cbar_kws={'label': 'Survival Rate'}, vmin=0, vmax=1)
    plt.title("Survival Rate by Gender and Class")
    plt.xlabel("Passenger Class")
    plt.ylabel("Gender")
    save_plot("survival_by_sex_class_heatmap.png")

    # 6. Age distribution survival
    plt.figure(figsize=(7, 4.5))
    sns.kdeplot(data=df[df["survived"] == 1], x="age", fill=True, color=COLORS["survived"], label="Survived", alpha=0.5)
    sns.kdeplot(data=df[df["survived"] == 0], x="age", fill=True, color=COLORS["not_survived"], label="Not Survived", alpha=0.5)
    plt.title("Age Distribution by Survival")
    plt.xlabel("Age")
    plt.ylabel("Density")
    plt.legend()
    save_plot("age_distribution_survival.png")

    # 7. Age group survival
    plt.figure(figsize=(8, 4.5))
    order = ["Child", "Teenager", "Young Adult", "Adult", "Senior"]
    sns.barplot(data=df, x="age_group", y="survived", order=order, hue="age_group", palette="viridis", errorbar=None, legend=False)
    plt.title("Survival Rate by Age Group")
    plt.xlabel("Age Group")
    plt.ylabel("Survival Rate")
    save_plot("age_group_survival.png")

    # 8. Fare distribution
    plt.figure(figsize=(7, 4.5))
    df_temp = df.copy()
    df_temp["Survival Status"] = df_temp["survived"].map({0: "Not Survived", 1: "Survived"})
    sns.histplot(data=df_temp, x="fare", hue="Survival Status", palette={"Not Survived": COLORS["not_survived"], "Survived": COLORS["survived"]}, kde=True, bins=30, alpha=0.5, multiple="stack")
    plt.title("Fare Distribution by Survival")
    plt.xlabel("Fare ($)")
    plt.ylabel("Passenger Count")
    save_plot("fare_distribution.png")

    # 9. Fare outlier boxplot
    plt.figure(figsize=(6, 4))
    df_temp = df.copy()
    df_temp["Survival Status"] = df_temp["survived"].map({0: "Not Survived", 1: "Survived"})
    sns.boxplot(data=df_temp, x="Survival Status", y="fare", hue="Survival Status", palette={"Not Survived": COLORS["not_survived"], "Survived": COLORS["survived"]}, legend=False)
    plt.title("Fare Boxplot (Identifying Outliers)")
    plt.xlabel("Survival Status")
    plt.ylabel("Fare ($)")
    save_plot("fare_outlier_boxplot.png")

    # 10. Age vs Fare scatter
    plt.figure(figsize=(8, 5))
    df_temp = df.copy()
    df_temp["Survival Status"] = df_temp["survived"].map({0: "Not Survived", 1: "Survived"})
    sns.scatterplot(data=df_temp, x="age", y="fare", hue="Survival Status", palette={"Not Survived": COLORS["not_survived"], "Survived": COLORS["survived"]}, alpha=0.7)
    plt.title("Age vs Fare Scatter Plot")
    plt.xlabel("Age")
    plt.ylabel("Fare ($)")
    plt.yscale("log")
    plt.legend(title="Survival Status")
    save_plot("age_fare_scatter.png")

    # 11. Family size survival
    plt.figure(figsize=(7, 4))
    sns.barplot(data=df, x="family_size", y="survived", hue="family_size", palette="Set2", errorbar=None, legend=False)
    plt.title("Survival Rate by Family Size")
    plt.xlabel("Family Size (SibSp + Parch + 1)")
    plt.ylabel("Survival Rate")
    save_plot("family_size_survival.png")

    # 12. Embarked survival
    plt.figure(figsize=(7, 4.5))
    df_emb = df.dropna(subset=["embarked"]).copy()
    df_emb["Survival Status"] = df_emb["survived"].map({0: "Not Survived", 1: "Survived"})
    df_emb["embarked"] = df_emb["embarked"].map({"C": "Cherbourg", "Q": "Queenstown", "S": "Southampton"})
    sns.countplot(data=df_emb, x="embarked", hue="Survival Status", palette={"Not Survived": COLORS["not_survived"], "Survived": COLORS["survived"]})
    plt.title("Embarked Port vs Survival Status")
    plt.xlabel("Port of Embarkation")
    plt.ylabel("Passenger Count")
    plt.legend(title="Survival Status")
    save_plot("embarked_survival.png")

    # 13. Cabin known survival
    plt.figure(figsize=(6, 4))
    df_temp = df.copy()
    df_temp["cabin_known"] = df_temp["cabin_known"].map({0: "Missing / Unknown", 1: "Known / Recorded"})
    sns.barplot(data=df_temp, x="cabin_known", y="survived", hue="cabin_known", palette=[COLORS["not_survived"], COLORS["survived"]], order=["Missing / Unknown", "Known / Recorded"], errorbar=None, legend=False)
    plt.title("Survival Rate by Cabin Availability")
    plt.xlabel("Cabin Location Recorded")
    plt.ylabel("Survival Rate")
    save_plot("cabin_known_survival.png")

    # 14. Title survival
    plt.figure(figsize=(7, 4.5))
    sns.barplot(data=df, x="title", y="survived", hue="title", palette="Set1", errorbar=None, legend=False)
    plt.title("Survival Rate by Passenger Title")
    plt.xlabel("Title")
    plt.ylabel("Survival Rate")
    save_plot("title_survival.png")

def train_and_eval_models(df):
    print("=== Training Classical Models ===")
    
    # Handle NaNs for modelling
    df = df.copy()
    df["age"] = df["age"].fillna(df["age"].median())
    df["fare"] = df["fare"].fillna(df["fare"].median())
    df["embarked"] = df["embarked"].fillna(df["embarked"].mode()[0])
    
    features = ["pclass", "sex", "age", "sibsp", "parch", "fare", "embarked", "family_size", "is_alone", "title", "cabin_known"]
    X = df[features]
    y = df["survived"].astype(int)
    
    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    
    numeric_features = ["age", "sibsp", "parch", "fare", "family_size"]
    categorical_features = ["pclass", "sex", "embarked", "is_alone", "title", "cabin_known"]
    
    numeric_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])
    
    categorical_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("encoder", OneHotEncoder(handle_unknown="ignore", drop="first"))
    ])
    
    preprocessor = ColumnTransformer(transformers=[
        ("num", numeric_transformer, numeric_features),
        ("cat", categorical_transformer, categorical_features)
    ])
    
    # Models to train
    models = {
        "Logistic Regression": LogisticRegression(max_iter=1000, solver="liblinear", random_state=42),
        "Decision Tree": DecisionTreeClassifier(max_depth=5, random_state=42),
        "Random Forest": RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42),
        "Gradient Boosting": GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, max_depth=4, random_state=42)
    }
    
    comparison_data = []
    
    # Gender baseline manual metrics
    gender_pred = (X_val["sex"] == "female").astype(int)
    gender_acc = accuracy_score(y_val, gender_pred)
    gender_prec = precision_score(y_val, gender_pred, zero_division=0)
    gender_rec = recall_score(y_val, gender_pred, zero_division=0)
    gender_f1 = f1_score(y_val, gender_pred, zero_division=0)
    gender_auc = roc_auc_score(y_val, gender_pred)
    
    comparison_data.append({
        "Model": "Gender Baseline",
        "Accuracy": float(round(gender_acc, 4)),
        "Precision": float(round(gender_prec, 4)),
        "Recall": float(round(gender_rec, 4)),
        "F1": float(round(gender_f1, 4)),
        "ROC-AUC": float(round(gender_auc, 4)),
        "Notes": "Baseline predicting all females survive and all males die."
    })
    
    best_model_name = ""
    best_val_score = 0
    best_pipeline = None
    
    for name, clf in models.items():
        pipe = Pipeline(steps=[
            ("preprocess", preprocessor),
            ("classifier", clf)
        ])
        
        # Train
        pipe.fit(X_train, y_train)
        
        # Predict validation
        val_pred = pipe.predict(X_val)
        val_proba = pipe.predict_proba(X_val)[:, 1]
        
        acc = accuracy_score(y_val, val_pred)
        prec = precision_score(y_val, val_pred)
        rec = recall_score(y_val, val_pred)
        f1 = f1_score(y_val, val_pred)
        auc = roc_auc_score(y_val, val_proba)
        
        # 5-fold CV on train data
        cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
        cv_results = cross_validate(pipe, X_train, y_train, cv=cv, scoring="accuracy")
        cv_mean = float(cv_results["test_score"].mean())
        
        comparison_data.append({
            "Model": name,
            "Accuracy": float(round(acc, 4)),
            "Precision": float(round(prec, 4)),
            "Recall": float(round(rec, 4)),
            "F1": float(round(f1, 4)),
            "ROC-AUC": float(round(auc, 4)),
            "Notes": f"CV score on train: {cv_mean:.4f}."
        })
        
        if acc > best_val_score:
            best_val_score = acc
            best_model_name = name
            best_pipeline = pipe
            
    print(f"✓ Best classical model on validation: {best_model_name} (Acc: {best_val_score:.4f})")
    
    # Generate Best Model plots
    # 15. Confusion Matrix
    y_pred_best = best_pipeline.predict(X_val)
    cm = confusion_matrix(y_val, y_pred_best)
    plt.figure(figsize=(5, 4))
    sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", cbar=False,
                xticklabels=["Not Survived", "Survived"],
                yticklabels=["Not Survived", "Survived"])
    plt.title(f"Confusion Matrix: {best_model_name}")
    plt.ylabel("Actual")
    plt.xlabel("Predicted")
    plt.tight_layout()
    plt.savefig(PLOTS_DIR / "confusion_matrix.png", dpi=150)
    plt.close()
    print("✓ Saved confusion_matrix.png")
    
    # 16. Feature Importance
    clf_best = best_pipeline.named_steps["classifier"]
    preprocessor_best = best_pipeline.named_steps["preprocess"]
    feature_names = numeric_features + list(preprocessor_best.named_transformers_["cat"].named_steps["encoder"].get_feature_names_out(categorical_features))
    
    plt.figure(figsize=(7, 5))
    if hasattr(clf_best, "feature_importances_"):
        importances = clf_best.feature_importances_
        imp_df = pd.DataFrame({"Feature": feature_names, "Importance": importances}).sort_values("Importance", ascending=False)
        sns.barplot(data=imp_df.head(10), x="Importance", y="Feature", hue="Feature", palette="viridis", legend=False)
        plt.title(f"Top 10 Feature Importances: {best_model_name}")
    elif hasattr(clf_best, "coef_"):
        coefs = clf_best.coef_[0]
        imp_df = pd.DataFrame({"Feature": feature_names, "Coefficient": coefs, "AbsCoef": np.abs(coefs)}).sort_values("AbsCoef", ascending=False)
        sns.barplot(data=imp_df.head(10), x="Coefficient", y="Feature", hue="Feature", palette="coolwarm", legend=False)
        plt.title(f"Top 10 Log-Odds Coefficients: {best_model_name}")
    else:
        imp_df = pd.DataFrame({"Feature": feature_names, "Importance": [1.0] * len(feature_names)})
        plt.title("Feature Importance Unavailable")
        
    plt.tight_layout()
    plt.savefig(PLOTS_DIR / "feature_importance.png", dpi=150)
    plt.close()
    print("✓ Saved feature_importance.png")
    
    # Write model comparison data
    with open(DATA_DIR / "model_comparison.json", "w") as f:
        json.dump(comparison_data, f, indent=2)
    print("✓ Saved model_comparison.json")
    
    # Write story metrics
    story_metrics = {
        "total_passengers": int(len(df)),
        "survival_rate": float(df["survived"].mean()),
        "survival_rate_female": float(df[df["sex"] == "female"]["survived"].mean()),
        "survival_rate_male": float(df[df["sex"] == "male"]["survived"].mean()),
        "survival_rate_pclass1": float(df[df["pclass"] == 1]["survived"].mean()),
        "survival_rate_pclass2": float(df[df["pclass"] == 2]["survived"].mean()),
        "survival_rate_pclass3": float(df[df["pclass"] == 3]["survived"].mean()),
    }
    with open(DATA_DIR / "titanic_story_metrics.json", "w") as f:
        json.dump(story_metrics, f, indent=2)
    print("✓ Saved titanic_story_metrics.json")
    
    # Write main workflow metrics
    main_metrics = {
        "best_model": best_model_name,
        "validation_accuracy": float(round(best_val_score, 4)),
        "precision": float(round(precision_score(y_val, y_pred_best), 4)),
        "recall": float(round(recall_score(y_val, y_pred_best), 4)),
        "f1": float(round(f1_score(y_val, y_pred_best), 4)),
        "roc_auc": float(round(roc_auc_score(y_val, best_pipeline.predict_proba(X_val)[:, 1]), 4)),
        "confusion_matrix": [[int(val) for val in row] for row in cm]
    }
    with open(DATA_DIR / "main_workflow_metrics.json", "w") as f:
        json.dump(main_metrics, f, indent=2)
    print("✓ Saved main_workflow_metrics.json")
    
    # Generate test predictions and Kaggle submission
    test_df = pd.read_csv(KAGGLE_DIR / "test.csv")
    cleaned_test = clean_data(test_df)
    
    # Handle NaNs for test data
    cleaned_test["age"] = cleaned_test["age"].fillna(df["age"].median())
    cleaned_test["fare"] = cleaned_test["fare"].fillna(df["fare"].median())
    cleaned_test["embarked"] = cleaned_test["embarked"].fillna(df["embarked"].mode()[0])
    
    X_test_sub = cleaned_test[features]
    predictions = best_pipeline.predict(X_test_sub)
    
    submission = pd.DataFrame({
        "PassengerId": test_df["PassengerId"],
        "Survived": predictions
    })
    
    submissions_dir = PROJECT_ROOT / "submissions"
    submissions_dir.mkdir(exist_ok=True)
    submission.to_csv(submissions_dir / "submission_best_classical.csv", index=False)
    print("✓ Saved submission_best_classical.csv")

def main():
    train_path = KAGGLE_DIR / "train.csv"
    if not train_path.is_file():
        print(f"Error: train.csv not found in {KAGGLE_DIR}!")
        return
        
    df = pd.read_csv(train_path)
    cleaned_df = clean_data(df)
    generate_visualizations(cleaned_df)
    train_and_eval_models(cleaned_df)
    print("=== Visualizations and Metrics Export Complete! ===")

if __name__ == "__main__":
    main()
