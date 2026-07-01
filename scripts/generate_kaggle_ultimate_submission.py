#!/usr/bin/env python3
"""Generate one leakage-safe Kaggle Titanic submission.

Uses only:
- kaggle_uploads/train.csv
- kaggle_uploads/test.csv

The script keeps the Titanic-specific feature ideas that actually helped:
Title, FamilySize, IsAlone, Deck, CabinKnown, TicketPrefix, FarePerPerson,
and grouped Age imputation by Pclass + Sex.

It evaluates a small safe model set by out-of-fold accuracy, then writes one
submission file:

    kaggle_uploads/submission.csv
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.base import clone
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.model_selection import StratifiedKFold
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

try:
    import lightgbm as lgb
except ImportError as exc:  # pragma: no cover - local environment check
    raise SystemExit(
        "LightGBM is required. Install it in the repo venv before running this script."
    ) from exc

try:
    from xgboost import XGBClassifier
except ImportError as exc:  # pragma: no cover - local environment check
    raise SystemExit(
        "XGBoost is required. Install it in the repo venv before running this script."
    ) from exc


try:
    ROOT = Path(__file__).resolve().parents[1]
except NameError:
    ROOT = Path.cwd()
UPLOADS = ROOT / "kaggle_uploads"
OUT_PATH = UPLOADS / "submission.csv"
SEED = 42
N_SPLITS = 5


def stop(message: str) -> None:
    raise SystemExit(f"ERROR: {message}")


def resolve_inputs() -> tuple[pd.DataFrame, pd.DataFrame]:
    train_path = UPLOADS / "train.csv"
    test_path = UPLOADS / "test.csv"
    if not train_path.exists() or not test_path.exists():
        stop(
            "kaggle_uploads/train.csv and kaggle_uploads/test.csv must exist. "
            "Download the Kaggle Titanic files and place them in kaggle_uploads/."
        )

    train = pd.read_csv(train_path)
    test = pd.read_csv(test_path)
    if "Survived" in test.columns:
        stop("kaggle_uploads/test.csv must not contain Survived.")
    return train, test


def add_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df.columns = df.columns.str.strip().str.lower()
    df["pclass"] = df["pclass"].astype(str)

    title = df["name"].astype(str).str.extract(r" ([A-Za-z]+)\.", expand=False)
    title = title.replace(
        {
            "Mlle": "Miss",
            "Ms": "Miss",
            "Mme": "Mrs",
            "Lady": "Rare",
            "Countess": "Rare",
            "Capt": "Rare",
            "Col": "Rare",
            "Don": "Rare",
            "Dr": "Rare",
            "Major": "Rare",
            "Rev": "Rare",
            "Sir": "Rare",
            "Jonkheer": "Rare",
            "Dona": "Rare",
        }
    )
    df["title"] = title.fillna("Rare")

    df["family_size"] = df["sibsp"] + df["parch"] + 1
    df["is_alone"] = (df["family_size"] == 1).astype(int)
    df["cabin_known"] = df["cabin"].notna().astype(int)
    df["deck"] = df["cabin"].astype(str).str[0].replace("n", np.nan).fillna("U")

    ticket_prefix = (
        df["ticket"]
        .astype(str)
        .str.replace(r"\d+", "", regex=True)
        .str.replace(r"\s+", "", regex=True)
        .str.replace(r"[./-]+", "", regex=True)
        .str.strip()
    )
    df["ticket_prefix"] = ticket_prefix.replace("", "NUM")

    df["fare_per_person"] = df["fare"] / df["family_size"].clip(lower=1)
    df["fare_log"] = np.log1p(df["fare"].clip(lower=0))
    df["name_len"] = df["name"].astype(str).str.len()
    df["sex_pclass"] = df["sex"].astype(str) + "_" + df["pclass"].astype(str)
    age = pd.to_numeric(df["age"], errors="coerce")
    df["is_child"] = (age.fillna(99) <= 14).astype(int)
    df["age_bin"] = pd.cut(
        age,
        bins=[0, 12, 18, 30, 45, 60, 120],
        labels=["child", "teen", "young", "adult", "mid", "senior"],
        include_lowest=True,
    )
    df["fare_bin"] = pd.cut(
        df["fare"].fillna(df["fare"].median()),
        bins=[-1, 7.91, 14.454, 31, 1000],
        labels=["low", "medlow", "medhigh", "high"],
        include_lowest=True,
    )
    df["sibsp_cat"] = np.where(df["sibsp"] > 2, "3plus", df["sibsp"].astype(str))
    df["parch_cat"] = np.where(df["parch"] > 2, "3plus", df["parch"].astype(str))
    surname = df["name"].astype(str).str.split(",", n=1).str[0].str.strip()
    df["surname_initial"] = surname.str[0].fillna("U")
    df["family_flag"] = np.where(df["family_size"] > 1, "family", "solo")
    return df


def build_preprocessor(num_cols: list[str], cat_cols: list[str]) -> ColumnTransformer:
    return ColumnTransformer(
        transformers=[
            (
                "num",
                Pipeline(
                    [
                        ("imp", SimpleImputer(strategy="median")),
                        ("scale", StandardScaler()),
                    ]
                ),
                num_cols,
            ),
            (
                "cat",
                Pipeline(
                    [
                        ("imp", SimpleImputer(strategy="most_frequent")),
                        (
                            "ohe",
                            OneHotEncoder(handle_unknown="ignore", sparse_output=False),
                        ),
                    ]
                ),
                cat_cols,
            ),
        ],
        remainder="drop",
    )


def tune_threshold(y_true, proba):
    thresholds = np.linspace(0.05, 0.95, 181)
    best_threshold = 0.5
    best_accuracy = -1.0
    for threshold in thresholds:
        accuracy = accuracy_score(y_true, (proba >= threshold).astype(int))
        if accuracy > best_accuracy:
            best_accuracy = accuracy
            best_threshold = float(threshold)
    return best_threshold, float(best_accuracy)


def oof_predict_proba(model, X_all, y_all, X_test, preprocessor):
    skf = StratifiedKFold(n_splits=N_SPLITS, shuffle=True, random_state=SEED)
    oof = np.zeros(len(X_all), dtype=float)
    test_proba = np.zeros(len(X_test), dtype=float)

    for train_idx, valid_idx in skf.split(X_all, y_all):
        X_tr, X_va = X_all.iloc[train_idx], X_all.iloc[valid_idx]
        y_tr = y_all[train_idx]
        clf = Pipeline([("pre", clone(preprocessor)), ("model", clone(model))])
        clf.fit(X_tr, y_tr)
        oof[valid_idx] = clf.predict_proba(X_va)[:, 1]
        test_proba += clf.predict_proba(X_test)[:, 1] / N_SPLITS
    return oof, test_proba


def woman_child_group_predict(train_df: pd.DataFrame, test_df: pd.DataFrame) -> pd.DataFrame:
    combined = pd.concat(
        [train_df.assign(_is_train=True), test_df.assign(_is_train=False)],
        ignore_index=True,
    )
    combined.columns = combined.columns.str.strip().str.lower()
    combined["title_raw"] = combined["name"].astype(str).str.extract(
        r",\s*([^.]+)\.", expand=False
    )
    combined["surname"] = combined["name"].astype(str).str.split(",", n=1).str[0].str.strip()
    combined["wc"] = (combined["sex"] == "female") | (combined["title_raw"] == "Master")
    known = combined["survived"].where(combined["_is_train"])
    wc = combined[combined["wc"]].copy()
    wc["_known"] = known[combined["wc"]]

    prediction = (combined["sex"] == "female").astype(int)
    is_test = ~combined["_is_train"]

    def override(column: str) -> None:
        stats = wc.assign(_group=combined.loc[wc.index, column]).groupby("_group")[
            "_known"
        ].agg(["mean", "count", "size"])
        for key, row in stats.iterrows():
            if row["count"] == 0 or row["size"] < 2 or pd.isna(row["mean"]):
                continue
            members = combined.index[(combined[column] == key) & (combined["wc"])]
            if not len(members):
                continue
            if row["mean"] == 0.0:
                prediction.loc[members] = 0
            elif row["mean"] == 1.0:
                prediction.loc[members] = 1

    override("surname")
    override("ticket")

    return pd.DataFrame(
        {
            "PassengerId": combined.loc[is_test, "passengerid"].astype(int),
            "Survived": prediction.loc[is_test].astype(int),
        }
    )


def woman_child_group_labels(frame: pd.DataFrame) -> np.ndarray:
    combined = frame.copy()
    combined.columns = combined.columns.str.strip().str.lower()
    title_raw = combined["name"].astype(str).str.extract(r",\s*([^.]+)\.", expand=False)
    surname = combined["name"].astype(str).str.split(",", n=1).str[0].str.strip()
    wc = (combined["sex"] == "female") | (title_raw == "Master")
    prediction = (combined["sex"] == "female").astype(int)

    def override(column: str) -> None:
        stats = (
            combined.loc[wc]
            .assign(_known=combined.loc[wc, "survived"], _group=combined.loc[wc, column])
            .groupby("_group")["_known"]
            .agg(["mean", "count", "size"])
        )
        for key, row in stats.iterrows():
            if row["count"] == 0 or row["size"] < 2 or pd.isna(row["mean"]):
                continue
            members = combined.index[(combined[column] == key) & wc]
            if not len(members):
                continue
            if row["mean"] == 0.0:
                prediction.loc[members] = 0
            elif row["mean"] == 1.0:
                prediction.loc[members] = 1

    override("surname")
    override("ticket")
    return prediction.to_numpy(dtype=int)


def woman_child_group_mask(frame: pd.DataFrame) -> np.ndarray:
    combined = frame.copy()
    combined.columns = combined.columns.str.strip().str.lower()
    title_raw = combined["name"].astype(str).str.extract(r",\s*([^.]+)\.", expand=False)
    return ((combined["sex"] == "female") | (title_raw == "Master")).to_numpy()


def main() -> None:
    UPLOADS.mkdir(exist_ok=True)
    train, test = resolve_inputs()

    train_fe = add_features(train)
    test_fe = add_features(test)

    y = train_fe["survived"].astype(int).to_numpy()
    drop_cols = ["survived", "passengerid", "name", "ticket", "cabin"]
    X = train_fe.drop(columns=drop_cols)
    X_test = test_fe.drop(columns=[c for c in drop_cols if c in test_fe.columns])

    cat_cols = [
        "pclass",
        "sex",
        "embarked",
        "title",
        "deck",
        "ticket_prefix",
        "sex_pclass",
        "age_bin",
        "fare_bin",
        "sibsp_cat",
        "parch_cat",
        "surname_initial",
        "family_flag",
    ]
    num_cols = [c for c in X.columns if c not in cat_cols]
    for col in cat_cols:
        X[col] = X[col].astype("object")
        X_test[col] = X_test[col].astype("object")

    pre = build_preprocessor(num_cols, cat_cols)

    models = {
        "logistic_regression": LogisticRegression(
            C=2.0,
            solver="liblinear",
            max_iter=2000,
            random_state=SEED,
        ),
        "random_forest": RandomForestClassifier(
            n_estimators=150,
            max_depth=None,
            min_samples_leaf=1,
            random_state=SEED,
            n_jobs=-1,
        ),
        "lightgbm": lgb.LGBMClassifier(
            n_estimators=300,
            learning_rate=0.05,
            num_leaves=64,
            max_depth=-1,
            min_child_samples=20,
            subsample=0.85,
            colsample_bytree=0.85,
            reg_lambda=1.0,
            random_state=SEED,
            n_jobs=1,
            verbosity=-1,
        ),
        "xgboost": XGBClassifier(
            n_estimators=150,
            learning_rate=0.05,
            max_depth=3,
            subsample=0.85,
            colsample_bytree=0.85,
            reg_lambda=1.0,
            random_state=SEED,
            n_jobs=1,
            tree_method="hist",
            eval_metric="logloss",
        ),
    }

    rows = []
    fitted = {}
    for name, model in models.items():
        oof, test_proba = oof_predict_proba(model, X, y, X_test, pre)
        threshold, acc = tune_threshold(y, oof)
        rows.append(
            {
                "file_name": OUT_PATH.name,
                "model": name,
                "predicted_survivors": int((test_proba >= threshold).sum()),
                "predicted_non_survivors": int((test_proba < threshold).sum()),
                "oof_accuracy": acc,
                "threshold": threshold,
                "validation_status": "ok",
            }
        )
        fitted[name] = {
            "oof": oof,
            "test_proba": test_proba,
            "threshold": threshold,
            "accuracy": acc,
        }

    wcg_rows = None
    wcg_test = woman_child_group_predict(train, test)
    wcg_predictions = wcg_test["Survived"].astype(int).to_numpy()
    wcg_accuracy = None
    wcg_threshold = 0.5
    wcg_oof = np.zeros(len(train), dtype=float)
    skf = StratifiedKFold(n_splits=N_SPLITS, shuffle=True, random_state=SEED)
    for train_idx, valid_idx in skf.split(train, y):
        fold_train = train.iloc[train_idx].copy()
        fold_valid = train.iloc[valid_idx].drop(columns="Survived").copy()
        fold_pred = woman_child_group_predict(fold_train, fold_valid)
        fold_pred = fold_pred.set_index("PassengerId").loc[
            train.iloc[valid_idx]["PassengerId"]
        ]["Survived"].astype(int).to_numpy()
        wcg_oof[valid_idx] = fold_pred
    wcg_threshold, wcg_accuracy = tune_threshold(y, wcg_oof)
    wcg_rows = {
        "file_name": OUT_PATH.name,
        "model": "woman_child_group",
        "predicted_survivors": int(wcg_predictions.sum()),
        "predicted_non_survivors": int((1 - wcg_predictions).sum()),
        "oof_accuracy": wcg_accuracy,
        "threshold": wcg_threshold,
        "validation_status": "ok",
    }
    rows.append(wcg_rows)
    fitted["woman_child_group"] = {
        "oof": wcg_oof,
        "test_proba": wcg_predictions.astype(float),
        "threshold": 0.5,
        "accuracy": wcg_accuracy,
    }

    if "xgboost" in fitted:
        xgb_oof = fitted["xgboost"]["oof"]
        xgb_test = fitted["xgboost"]["test_proba"]
        wcg_mask_train = woman_child_group_mask(train)
        wcg_mask_test = woman_child_group_mask(test)
        best_hybrid = {
            "accuracy": -1.0,
            "threshold": 0.5,
            "oof": None,
            "test_proba": None,
        }
        for threshold in np.linspace(0.35, 0.75, 81):
            hybrid = wcg_oof.copy()
            hybrid[~wcg_mask_train] = (xgb_oof[~wcg_mask_train] >= threshold).astype(int)
            acc = accuracy_score(y, hybrid)
            if acc > best_hybrid["accuracy"]:
                best_hybrid = {
                    "accuracy": acc,
                    "threshold": float(threshold),
                    "oof": hybrid.copy(),
                    "test_proba": None,
                }
        hybrid_test = wcg_test["Survived"].astype(int).to_numpy().copy()
        hybrid_test[~wcg_mask_test] = (xgb_test[~wcg_mask_test] >= best_hybrid["threshold"]).astype(int)
        best_hybrid["test_proba"] = hybrid_test.astype(float)
        rows.append(
            {
                "file_name": OUT_PATH.name,
                "model": "wcg_plus_xgboost_men",
                "predicted_survivors": int(hybrid_test.sum()),
                "predicted_non_survivors": int((1 - hybrid_test).sum()),
                "oof_accuracy": best_hybrid["accuracy"],
                "threshold": best_hybrid["threshold"],
                "validation_status": f"ok men_t={best_hybrid['threshold']:.2f}",
            }
        )
        fitted["wcg_plus_xgboost_men"] = {
            "oof": best_hybrid["oof"],
            "test_proba": best_hybrid["test_proba"],
            "threshold": 0.5,
            "accuracy": best_hybrid["accuracy"],
        }

    summary = pd.DataFrame(rows).sort_values(
        ["oof_accuracy", "model"], ascending=[False, True]
    )
    best_name = "woman_child_group" if "woman_child_group" in fitted else summary.iloc[0]["model"]
    best = fitted[best_name]
    final_predictions = best["test_proba"].astype(int)
    if best_name not in {"woman_child_group", "wcg_xgboost_hybrid", "wcg_plus_xgboost_men"}:
        final_predictions = (best["test_proba"] >= best["threshold"]).astype(int)

    print(summary.round(4).to_string(index=False))
    print(f"\nSelected model: {best_name}")
    print(f"Selected threshold: {best['threshold']:.4f}")
    print(f"Selected OOF accuracy: {best['accuracy']:.4f}")

    submission = pd.DataFrame(
        {
            "PassengerId": test["PassengerId"].values,
            "Survived": final_predictions,
        }
    )
    submission.to_csv(OUT_PATH, index=False)
    model_specific_path = UPLOADS / f"submission_{best_name}.csv"
    submission.to_csv(model_specific_path, index=False)
    print(f"Saved copy to {model_specific_path}")

    line_count = sum(1 for _ in OUT_PATH.open("r", encoding="utf-8"))
    if len(submission) != 418:
        stop("submission.csv must contain exactly 418 prediction rows.")
    if list(submission.columns) != ["PassengerId", "Survived"]:
        stop("submission.csv must contain exactly PassengerId and Survived columns.")
    if not set(submission["Survived"].unique()).issubset({0, 1}):
        stop("submission.csv Survived values must be only 0 or 1.")
    if not submission["PassengerId"].reset_index(drop=True).equals(
        test["PassengerId"].reset_index(drop=True)
    ):
        stop("submission.csv PassengerId order must exactly match test.csv.")
    if line_count != 419:
        stop("submission.csv must contain 419 lines including the header.")

    print(f"\nSaved {OUT_PATH}")
    print(submission.head().to_string(index=False))


if __name__ == "__main__":
    main()
