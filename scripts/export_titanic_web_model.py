from pathlib import Path
import json

import numpy as np
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler


PROJECT_ROOT = Path(__file__).resolve().parents[1]
MODEL_DIR = PROJECT_ROOT / "public" / "assets" / "model"
MODEL_PATH = MODEL_DIR / "titanic_logistic_model.json"
TEST_PREDICTIONS_PATH = MODEL_DIR / "test_predictions.json"
DATA_URL = "https://www.openml.org/data/get_csv/16826755/phpMYEkMl"

FEATURES = [
    "pclass",
    "sex",
    "age",
    "sibsp",
    "parch",
    "fare",
    "embarked",
    "family_size",
    "is_alone",
    "title",
    "has_cabin",
]
NUMERIC_FEATURES = ["age", "sibsp", "parch", "fare", "family_size"]
CATEGORICAL_FEATURES = ["pclass", "sex", "embarked", "is_alone", "title", "has_cabin"]


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
    df["age"] = pd.to_numeric(df["age"], errors="coerce")
    df["fare"] = pd.to_numeric(df["fare"], errors="coerce")
    return df


def engineer_features(df):
    df_model = df.copy()
    df_model["family_size"] = df_model["sibsp"] + df_model["parch"] + 1
    df_model["is_alone"] = np.where(df_model["family_size"] == 1, 1, 0)
    df_model["title"] = df_model["name"].str.extract(r",\s*([^\.]+)\.", expand=False).str.strip()
    df_model["title"] = df_model["title"].replace({"Mlle": "Miss", "Ms": "Miss", "Mme": "Mrs"})
    df_model["title"] = np.where(df_model["title"].isin(["Mr", "Mrs", "Miss", "Master"]), df_model["title"], "Rare")
    df_model["has_cabin"] = np.where(df_model["cabin"].notna(), 1, 0)
    return df_model


def train_model(df_model):
    X = df_model[FEATURES].copy()
    y = df_model["survived"].astype(int)

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
    model = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("classifier", LogisticRegression(max_iter=1000, solver="liblinear", random_state=42)),
        ]
    )
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    return model, accuracy


def jsonable(value):
    if isinstance(value, np.generic):
        return value.item()
    if isinstance(value, np.ndarray):
        return [jsonable(item) for item in value.tolist()]
    return value


def export_model(model, accuracy):
    preprocessor = model.named_steps["preprocessor"]
    numeric_pipeline = preprocessor.named_transformers_["num"]
    categorical_pipeline = preprocessor.named_transformers_["cat"]
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
        "inputFeatures": FEATURES,
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
        "encodedFeatureNames": jsonable(preprocessor.get_feature_names_out()),
        "coefficients": jsonable(classifier.coef_[0]),
        "intercept": float(classifier.intercept_[0]),
    }
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    MODEL_PATH.write_text(json.dumps(export, indent=2), encoding="utf-8")
    return export


def sigmoid(value):
    return 1 / (1 + np.exp(-value))


def write_test_predictions(model):
    examples = pd.DataFrame(
        [
            {
                "profile": "Young third-class male passenger",
                "pclass": 3,
                "sex": "male",
                "age": 25,
                "sibsp": 0,
                "parch": 0,
                "fare": 7.25,
                "embarked": "S",
                "family_size": 1,
                "is_alone": 1,
                "title": "Mr",
                "has_cabin": 0,
            },
            {
                "profile": "First-class female passenger",
                "pclass": 1,
                "sex": "female",
                "age": 38,
                "sibsp": 1,
                "parch": 0,
                "fare": 71.28,
                "embarked": "C",
                "family_size": 2,
                "is_alone": 0,
                "title": "Mrs",
                "has_cabin": 1,
            },
            {
                "profile": "Child passenger",
                "pclass": 2,
                "sex": "male",
                "age": 6,
                "sibsp": 1,
                "parch": 1,
                "fare": 26.0,
                "embarked": "S",
                "family_size": 3,
                "is_alone": 0,
                "title": "Master",
                "has_cabin": 0,
            },
        ]
    )
    probabilities = model.predict_proba(examples[FEATURES])[:, 1]
    predictions = model.predict(examples[FEATURES])
    records = []
    for row, probability, prediction in zip(examples.to_dict(orient="records"), probabilities, predictions):
        records.append(
            {
                "profile": row.pop("profile"),
                "input": row,
                "probability": float(probability),
                "prediction": int(prediction),
                "label": "Survived" if int(prediction) == 1 else "Not Survived",
            }
        )
    TEST_PREDICTIONS_PATH.write_text(json.dumps(records, indent=2), encoding="utf-8")


def main():
    df = engineer_features(clean_data(pd.read_csv(DATA_URL)))
    model, accuracy = train_model(df)
    export_model(model, accuracy)
    write_test_predictions(model)
    print(f"Test Accuracy: {accuracy:.4f}")
    print(f"Saved model export: {MODEL_PATH}")
    print(f"Saved test predictions: {TEST_PREDICTIONS_PATH}")


if __name__ == "__main__":
    main()
