#!/usr/bin/env python3
"""
scripts/generate_openml_reference.py
Downloads OpenML Titanic dataset, generates OpenML-specific plots, trains baseline models,
and exports metrics prefixed with openml_.
"""
from pathlib import Path
import json
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score

PROJECT_ROOT = Path(__file__).resolve().parents[1]
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
    "neutral": "#6B7280"
}

def load_openml():
    print("Loading OpenML Titanic dataset...")
    # URL from docs/dataset_sources.md
    url = "https://www.openml.org/data/get_csv/16826755/phpMYEkMl"
    # Local fallback or direct URL load
    try:
        df = pd.read_csv(url)
    except Exception as e:
        print(f"Error loading from URL: {e}. Trying secondary URL...")
        df = pd.read_csv("https://raw.githubusercontent.com/datasciencedojo/datasets/master/titanic.csv")
    
    df.columns = df.columns.str.strip().str.lower()
    df = df.replace("?", np.nan)
    for num_col in ["age", "fare"]:
        if num_col in df.columns:
            df[num_col] = pd.to_numeric(df[num_col], errors="coerce")
    return df

def main():
    sns.set_theme(style="whitegrid")
    df = load_openml()
    
    # Check if target column is survived
    target_col = "survived"
    if target_col not in df.columns:
        print(f"Error: Target column {target_col} not found in OpenML dataset!")
        return
        
    df[target_col] = pd.to_numeric(df[target_col], errors="coerce").fillna(0).astype(int)
    
    # Save a local reference copy
    data_dir = PROJECT_ROOT / "data"
    data_dir.mkdir(exist_ok=True)
    df.to_csv(data_dir / "openml_titanic.csv", index=False)
    print("✓ Saved local copy openml_titanic.csv")

    # 1. Survival Count Plot
    plt.figure(figsize=(6, 4))
    sns.countplot(data=df, x="survived", hue="survived", palette=[COLORS["not_survived"], COLORS["survived"]], legend=False)
    plt.title("OpenML Titanic: Survival Count")
    plt.xlabel("Survival Status")
    plt.ylabel("Passenger Count")
    plt.xticks([0, 1], ["Not Survived (0)", "Survived (1)"])
    plt.tight_layout()
    plt.savefig(PLOTS_DIR / "openml_survival_count.png", dpi=150)
    plt.close()
    print("✓ Saved openml_survival_count.png")

    # 2. Survival by Sex Plot
    plt.figure(figsize=(6, 4))
    sns.barplot(data=df, x="sex", y="survived", hue="sex", palette=[COLORS["male"], COLORS["female"]], errorbar=None, legend=False)
    plt.title("OpenML Titanic: Survival Rate by Gender")
    plt.xlabel("Gender")
    plt.ylabel("Survival Rate")
    plt.tight_layout()
    plt.savefig(PLOTS_DIR / "openml_survival_by_sex.png", dpi=150)
    plt.close()
    print("✓ Saved openml_survival_by_sex.png")

    # 3. Model Training & Comparison Plot
    # Select basic columns
    feat_cols = ["pclass", "sex", "age", "sibsp", "parch", "fare", "embarked"]
    for col in feat_cols:
        if col not in df.columns:
            df[col] = np.nan
            
    df["age"] = df["age"].fillna(df["age"].median())
    df["fare"] = df["fare"].fillna(df["fare"].median())
    df["embarked"] = df["embarked"].fillna("S")
    df["pclass"] = df["pclass"].fillna(3).astype(int)
    df["sex"] = df["sex"].fillna("male")

    X = df[feat_cols]
    y = df[target_col]

    X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    num_features = ["age", "sibsp", "parch", "fare"]
    cat_features = ["pclass", "sex", "embarked"]

    num_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])

    cat_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("encoder", OneHotEncoder(handle_unknown="ignore", drop="first"))
    ])

    preprocessor = ColumnTransformer(transformers=[
        ("num", num_transformer, num_features),
        ("cat", cat_transformer, cat_features)
    ])

    models = {
        "Logistic Regression": LogisticRegression(max_iter=1000, solver="liblinear", random_state=42),
        "Random Forest": RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42),
        "Gradient Boosting": GradientBoostingClassifier(n_estimators=100, max_depth=4, random_state=42)
    }

    metrics = []
    plot_models = []
    plot_accs = []

    for name, clf in models.items():
        pipe = Pipeline(steps=[
            ("preprocess", preprocessor),
            ("classifier", clf)
        ])
        pipe.fit(X_train, y_train)
        preds = pipe.predict(X_val)
        probs = pipe.predict_proba(X_val)[:, 1]

        acc = accuracy_score(y_val, preds)
        prec = precision_score(y_val, preds, zero_division=0)
        rec = recall_score(y_val, preds, zero_division=0)
        f1 = f1_score(y_val, preds, zero_division=0)
        auc = roc_auc_score(y_val, probs)

        metrics.append({
            "model": name,
            "accuracy": float(round(acc, 4)),
            "precision": float(round(prec, 4)),
            "recall": float(round(rec, 4)),
            "f1": float(round(f1, 4)),
            "roc_auc": float(round(auc, 4))
        })
        
        plot_models.append(name)
        plot_accs.append(acc)

    # Export metrics JSON
    with open(DATA_DIR / "openml_model_metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)
    print("✓ Saved openml_model_metrics.json")

    # 4. OpenML Model Comparison Plot
    plt.figure(figsize=(7, 4.5))
    sns.barplot(x=plot_accs, y=plot_models, hue=plot_models, palette="coolwarm", legend=False)
    plt.title("OpenML Reference: Model Validation Accuracy")
    plt.xlabel("Accuracy")
    plt.xlim(0.5, 1.0)
    plt.tight_layout()
    plt.savefig(PLOTS_DIR / "openml_model_comparison.png", dpi=150)
    plt.close()
    print("✓ Saved openml_model_comparison.png")

if __name__ == "__main__":
    main()
