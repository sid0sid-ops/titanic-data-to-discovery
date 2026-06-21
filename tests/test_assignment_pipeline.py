from pathlib import Path

import pandas as pd
from sklearn.model_selection import train_test_split

from titanic_project.cleaning import clean_assignment_frame
from titanic_project.data_loading import load_titanic_data
from titanic_project.features import build_feature_frame
from titanic_project.modeling import RANDOM_STATE, build_logistic_pipeline
from titanic_project.statistics import gender_survival_test


ROOT = Path(__file__).resolve().parents[1]
REQUIRED_REPORTS = [
    "reports/tables/missing_values_before_cleaning.csv",
    "reports/tables/missing_values_after_cleaning.csv",
    "reports/metrics/hypothesis_test_gender_survival.txt",
    "reports/metrics/model_metrics.json",
    "reports/figures/confusion_matrix.png",
    "reports/interactive/titanic_sunburst.html",
]


def test_pipeline_fits_predicts_and_transforms_without_nulls():
    raw, _ = load_titanic_data(ROOT / "kaggle" / "train.csv")
    features, target = build_feature_frame(raw)
    x_train, x_test, y_train, _ = train_test_split(
        features, target, test_size=0.2, stratify=target, random_state=RANDOM_STATE
    )
    pipeline = build_logistic_pipeline().fit(x_train, y_train)
    assert len(pipeline.predict(x_test)) == len(x_test)
    transformed = pipeline.named_steps["preprocessing"].transform(x_test)
    assert not pd.isna(transformed).any()


def test_assignment_cleaning_removes_selected_feature_nulls():
    raw, _ = load_titanic_data(ROOT / "kaggle" / "train.csv")
    cleaned = clean_assignment_frame(raw)
    selected = ["pclass", "sex", "age", "sibsp", "parch", "fare", "embarked", "family_size", "is_alone"]
    assert int(cleaned[selected].isna().sum().sum()) == 0


def test_gender_test_is_directional_and_matches_observed_rates():
    raw, _ = load_titanic_data(ROOT / "kaggle" / "train.csv")
    result = gender_survival_test(clean_assignment_frame(raw))
    assert result["test_name"] == "Fisher exact test (one-sided)"
    assert result["alternative_hypothesis"] == "female survival rate > male survival rate"
    assert result["female_survival_rate"] > result["male_survival_rate"]
    assert result["rate_difference"] > 0
    assert result["p_value"] < result["alpha"]


def test_required_reports_exist_and_public_copies_match():
    for relative in REQUIRED_REPORTS:
        report = ROOT / relative
        assert report.is_file() and report.stat().st_size > 0
        if relative.startswith("reports/"):
            public = ROOT / "public" / relative
            assert public.read_bytes() == report.read_bytes()
