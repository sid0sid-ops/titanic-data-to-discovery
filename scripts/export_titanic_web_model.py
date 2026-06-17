from pathlib import Path
import json
import re

import numpy as np
import pandas as pd

from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split, GridSearchCV, StratifiedKFold
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler


PROJECT_ROOT = Path(__file__).resolve().parents[1]
MODEL_DIR = PROJECT_ROOT / "public" / "assets" / "model"
MODEL_PATH = MODEL_DIR / "titanic_logistic_model.json"
TEST_PREDICTIONS_PATH = MODEL_DIR / "test_predictions.json"
DATA_URL = "https://www.openml.org/data/get_csv/16826755/phpMYEkMl"

NUMERIC_FEATURES = ["age", "sibsp", "parch", "fare", "family_size"]
CATEGORICAL_FEATURES = ["pclass", "sex", "embarked", "is_alone", "title", "has_cabin"]


class GroupMedianAgeImputer(BaseEstimator, TransformerMixin):
    """Impute missing age from training-fold medians grouped by pclass and sex."""
    def __init__(self, age_col="age", group_cols=("pclass", "sex")):
        self.age_col = age_col
        self.group_cols = group_cols
        self.group_medians_ = {}
        self.global_median_ = None

    def fit(self, X, y=None):
        X_fit = X.copy()
        self.global_median_ = X_fit[self.age_col].median()
        medians = X_fit.groupby(list(self.group_cols), dropna=False)[self.age_col].median()
        self.group_medians_ = medians.to_dict()
        return self

    def transform(self, X):
        X_out = X.copy()
        def fill_age(row):
            if pd.isna(row[self.age_col]):
                key = tuple(row[col] for col in self.group_cols)
                return self.group_medians_.get(key, self.global_median_)
            return row[self.age_col]
        X_out[self.age_col] = X_out.apply(fill_age, axis=1)
        return X_out


class TitanicFeatureEngineer(BaseEstimator, TransformerMixin):
    """Create leakage-safe Titanic model features inside the pipeline."""
    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X_out = X.copy()
        X_out["family_size"] = X_out["sibsp"] + X_out["parch"] + 1
        X_out["is_alone"] = (X_out["family_size"] == 1).astype(int)

        def extract_title(name):
            if not isinstance(name, str):
                return "Mr"
            match = re.search(r",\s*([^\.]+)\.", name)
            return match.group(1).strip() if match else "Mr"

        X_out["title"] = X_out["name"].apply(extract_title)
        title_mapping = {
            "Mr": "Mr",
            "Mrs": "Mrs",
            "Miss": "Miss",
            "Master": "Master",
            "Mme": "Mrs",
            "Ms": "Miss",
            "Mlle": "Miss",
        }
        X_out["title"] = X_out["title"].map(title_mapping).fillna("Rare")
        X_out["has_cabin"] = X_out["cabin"].notna().astype(int)

        leakage_or_raw = ["passengerid", "name", "ticket", "cabin", "boat", "body", "home_dest"]
        return X_out.drop(columns=[col for col in leakage_or_raw if col in X_out.columns])


def clean_data(df):
    df = df.copy()
    df.columns = (
        df.columns
        .str.strip()
        .str.lower()
        .str.replace(".", "_", regex=False)
        .str.replace(" ", "_", regex=False)
    )
    df = df.replace("?", np.nan)
    for numeric_column in ["age", "fare"]:
        if numeric_column in df.columns:
            df[numeric_column] = pd.to_numeric(df[numeric_column], errors="coerce")
    return df


def train_model(df_raw):
    X = df_raw.drop(columns=["survived"])
    y = df_raw["survived"].astype(int)

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y,
    )

    numeric_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
        ]
    )
    categorical_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("encoder", OneHotEncoder(handle_unknown="ignore", drop="first")),
        ]
    )
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_pipeline, NUMERIC_FEATURES),
            ("cat", categorical_pipeline, CATEGORICAL_FEATURES),
        ]
    )
    base_pipeline = Pipeline(
        steps=[
            ("group_age_imputer", GroupMedianAgeImputer()),
            ("feature_engineer", TitanicFeatureEngineer()),
            ("preprocess", preprocessor),
            ("classifier", LogisticRegression(max_iter=1000, solver="liblinear", random_state=42)),
        ]
    )
    
    param_grid = {
        "classifier__C": [0.1, 1.0, 10.0]
    }
    
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    grid_search = GridSearchCV(
        estimator=base_pipeline,
        param_grid=param_grid,
        cv=cv,
        scoring="accuracy",
        n_jobs=-1
    )
    grid_search.fit(X_train, y_train)
    best_pipeline = grid_search.best_estimator_
    
    y_pred = best_pipeline.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    return best_pipeline, accuracy


def jsonable(value):
    if isinstance(value, np.generic):
        return value.item()
    if isinstance(value, np.ndarray):
        return [jsonable(item) for item in value.tolist()]
    return value


def export_model(model, accuracy):
    preprocess = model.named_steps["preprocess"]
    numeric_pipeline = preprocess.named_transformers_["num"]
    categorical_pipeline = preprocess.named_transformers_["cat"]
    classifier = model.named_steps["classifier"]

    numeric_imputer = numeric_pipeline.named_steps["imputer"]
    numeric_scaler = numeric_pipeline.named_steps["scaler"]
    categorical_imputer = categorical_pipeline.named_steps["imputer"]
    encoder = categorical_pipeline.named_steps["encoder"]

    export = {
        "metadata": {
            "project": "From Data to Discovery — Lessons from the Titanic Project",
            "model": "Logistic Regression",
            "dataset": "OpenML Titanic 1309-row dataset",
            "testAccuracy": float(accuracy),
            "accuracyPercent": float(accuracy * 100),
            "warning": "Accuracy may vary depending on preprocessing, dataset version, random state, and feature engineering.",
        },
        "inputFeatures": ["pclass", "name", "sex", "age", "sibsp", "parch", "fare", "embarked", "cabin"],
        "numericFeatures": NUMERIC_FEATURES,
        "categoricalFeatures": CATEGORICAL_FEATURES,
        "numericImputerStatistics": dict(zip(NUMERIC_FEATURES, jsonable(numeric_imputer.statistics_))),
        "numericScalerMean": dict(zip(NUMERIC_FEATURES, jsonable(numeric_scaler.mean_))),
        "numericScalerScale": dict(zip(NUMERIC_FEATURES, jsonable(numeric_scaler.scale_))),
        "categoricalImputerStatistics": dict(zip(CATEGORICAL_FEATURES, jsonable(categorical_imputer.statistics_))),
        "categoricalCategories": {
            feature: jsonable(categories)
            for feature, categories in zip(CATEGORICAL_FEATURES, encoder.categories_)
        },
        "oneHotDropFirst": True,
        "encodedFeatureNames": jsonable(preprocess.get_feature_names_out()),
        "coefficients": jsonable(classifier.coef_[0]),
        "intercept": float(classifier.intercept_[0]),
    }
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    MODEL_PATH.write_text(json.dumps(export, indent=2), encoding="utf-8")
    return export


def write_test_predictions(model):
    examples = pd.DataFrame([
        {"pclass": 3, "sex": "male", "age": 22.0, "sibsp": 0, "parch": 0, "fare": 7.25, "embarked": "S", "cabin": np.nan, "name": "Single, Mr. Third Class"},
        {"pclass": 1, "sex": "female", "age": 38.0, "sibsp": 1, "parch": 0, "fare": 71.28, "embarked": "C", "cabin": "C85", "name": "Married, Mrs. First Class"},
        {"pclass": 2, "sex": "male", "age": 6.0, "sibsp": 1, "parch": 1, "fare": 26.00, "embarked": "S", "cabin": np.nan, "name": "Child, Master. Second Class"}
    ])
    probabilities = model.predict_proba(examples)[:, 1]
    predictions = model.predict(examples)
    records = []
    for idx, row in examples.iterrows():
        records.append({
            "profile": row["name"],
            "input": row.to_dict(),
            "probability": float(probabilities[idx]),
            "prediction": int(predictions[idx]),
            "label": "Survived" if int(predictions[idx]) == 1 else "Not Survived",
        })
    TEST_PREDICTIONS_PATH.write_text(json.dumps(records, indent=2), encoding="utf-8")


def main():
    df_raw = clean_data(pd.read_csv(DATA_URL))
    model, accuracy = train_model(df_raw)
    export_model(model, accuracy)
    write_test_predictions(model)
    print(f"Test Accuracy: {accuracy:.4f}")
    print(f"Saved model export: {MODEL_PATH}")
    print(f"Saved test predictions: {TEST_PREDICTIONS_PATH}")


if __name__ == "__main__":
    main()
