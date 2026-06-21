"""Small, auditable cleaning operations."""

import pandas as pd


def normalize_columns(frame: pd.DataFrame) -> pd.DataFrame:
    cleaned = frame.copy()
    cleaned.columns = cleaned.columns.str.strip().str.lower()
    cleaned = cleaned.replace("?", pd.NA)
    for column in ("age", "fare", "sibsp", "parch", "pclass", "survived"):
        if column in cleaned:
            cleaned[column] = pd.to_numeric(cleaned[column], errors="coerce")
    if "sex" in cleaned:
        cleaned["sex"] = cleaned["sex"].astype("string").str.strip().str.lower()
    if "embarked" in cleaned:
        cleaned["embarked"] = cleaned["embarked"].astype("string").str.strip().str.upper()
    return cleaned


def clean_assignment_frame(frame: pd.DataFrame) -> pd.DataFrame:
    """Create the complete, human-readable frame used for assignment EDA audits."""
    cleaned = normalize_columns(frame)
    for column in ("age", "fare", "sibsp", "parch", "pclass"):
        if column in cleaned:
            cleaned[column] = cleaned[column].fillna(cleaned[column].median())
    for column in ("sex", "embarked"):
        if column in cleaned:
            mode = cleaned[column].mode(dropna=True)
            cleaned[column] = cleaned[column].fillna(mode.iloc[0] if not mode.empty else "Unknown")
    cleaned["family_size"] = cleaned["sibsp"] + cleaned["parch"] + 1
    cleaned["is_alone"] = (cleaned["family_size"] == 1).astype(int)
    return cleaned
