"""Feature construction and leakage controls."""

import numpy as np
import pandas as pd

from .cleaning import normalize_columns

LEAKAGE_COLUMNS = frozenset({"boat", "body"})
IDENTIFIER_COLUMNS = frozenset({"passengerid", "name", "ticket", "cabin", "home.dest"})
MODEL_FEATURES = ["pclass", "sex", "age", "sibsp", "parch", "fare", "embarked", "family_size", "is_alone"]


def build_feature_frame(frame: pd.DataFrame) -> tuple[pd.DataFrame, pd.Series]:
    cleaned = normalize_columns(frame)
    if "survived" not in cleaned:
        raise ValueError("The training dataset must contain the Survived target.")
    cleaned["family_size"] = cleaned["sibsp"] + cleaned["parch"] + 1
    cleaned["is_alone"] = (cleaned["family_size"] == 1).astype(int)
    excluded = LEAKAGE_COLUMNS | IDENTIFIER_COLUMNS | {"survived"}
    candidates = cleaned.drop(columns=[c for c in excluded if c in cleaned], errors="ignore")
    available = [column for column in MODEL_FEATURES if column in candidates]
    features = candidates[available].copy()
    for column in features.select_dtypes(include=["string"]).columns:
        features[column] = features[column].astype(object).replace({pd.NA: np.nan})
    return features, cleaned["survived"].astype(int)


def add_reporting_features(frame: pd.DataFrame) -> pd.DataFrame:
    cleaned = normalize_columns(frame)
    cleaned["family_size"] = cleaned["sibsp"] + cleaned["parch"] + 1
    cleaned["family_group"] = pd.cut(
        cleaned["family_size"], bins=[0, 1, 4, float("inf")], labels=["Alone", "Small Family", "Large Family"]
    ).astype("string")
    cleaned["outcome"] = cleaned["survived"].map({0: "Died", 1: "Survived"})
    cleaned["class_label"] = cleaned["pclass"].map({1: "1st Class", 2: "2nd Class", 3: "3rd Class"})
    cleaned["sex_label"] = cleaned["sex"].str.title()
    cleaned["port_label"] = cleaned["embarked"].map(
        {"S": "Southampton", "C": "Cherbourg", "Q": "Queenstown"}
    ).fillna("Unknown")
    return cleaned
