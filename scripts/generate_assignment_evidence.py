#!/usr/bin/env python3
# ruff: noqa: E402
"""Generate professor-assignment evidence from the local Kaggle training data."""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
try:
    import plotly.express as px
    import plotly.graph_objects as go
except ModuleNotFoundError:
    local_python = ROOT / "venv" / "bin" / "python"
    if local_python.exists() and Path(sys.prefix).resolve() != (ROOT / "venv").resolve():
        os.execv(local_python, [str(local_python), str(Path(__file__).resolve()), *sys.argv[1:]])
    raise

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns
from sklearn.metrics import ConfusionMatrixDisplay, RocCurveDisplay, confusion_matrix
from sklearn.model_selection import train_test_split

sys.path.insert(0, str(ROOT / "src"))

from titanic_project.cleaning import clean_assignment_frame, normalize_columns
from titanic_project.data_loading import load_titanic_data
from titanic_project.evaluation import classification_metrics
from titanic_project.features import add_reporting_features, build_feature_frame
from titanic_project.modeling import RANDOM_STATE, build_logistic_pipeline
from titanic_project.reporting import mirror_report_tree
from titanic_project.statistics import gender_survival_test
from titanic_project.visualization import save_figure

REPORTS = ROOT / "reports"
PUBLIC_REPORTS = ROOT / "public" / "reports"
FIGURES = REPORTS / "figures"
TABLES = REPORTS / "tables"
METRICS = REPORTS / "metrics"
INTERACTIVE = REPORTS / "interactive"


def prepare_directories() -> None:
    for path in (FIGURES, TABLES, METRICS, INTERACTIVE):
        path.mkdir(parents=True, exist_ok=True)


def missing_value_audit(frame: pd.DataFrame, stage: str) -> pd.DataFrame:
    return frame.isna().sum().rename_axis("column").reset_index(name="missing_count").assign(
        missing_percent=lambda data: (data["missing_count"] / len(frame) * 100).round(2),
        stage=stage,
    )[["stage", "column", "missing_count", "missing_percent"]]


def save_tables(frame: pd.DataFrame, cleaned_frame: pd.DataFrame, predicted_rows: pd.DataFrame) -> pd.DataFrame:
    before = missing_value_audit(frame, "before_cleaning_raw_kaggle")
    frame["survival_label"] = frame["survived"].map({0: "Died", 1: "Survived"})
    frame["survival_label"].value_counts().rename_axis("outcome").reset_index(name="count").to_csv(
        TABLES / "survival_counts.csv", index=False
    )
    selected_columns = ["pclass", "sex", "age", "sibsp", "parch", "fare", "embarked", "family_size", "is_alone"]
    after = missing_value_audit(cleaned_frame[selected_columns], "after_assignment_cleaning")
    before.to_csv(TABLES / "missing_values_before_cleaning.csv", index=False)
    after.to_csv(TABLES / "missing_values_after_cleaning.csv", index=False)
    before.to_csv(TABLES / "missing_values.csv", index=False)

    statistics = frame[["age", "fare", "sibsp", "parch", "survived"]].describe().T
    statistics["median"] = frame[["age", "fare", "sibsp", "parch", "survived"]].median()
    statistics.to_csv(TABLES / "descriptive_statistics.csv", float_format="%.4f")

    correlation_source = frame[["age", "fare", "sibsp", "parch", "pclass", "survived"]].copy()
    correlation_source["sex_female"] = (frame["sex"] == "female").astype(int)
    correlation_source["family_size"] = frame["sibsp"] + frame["parch"] + 1
    correlation = correlation_source.corr(numeric_only=True)
    correlation.to_csv(TABLES / "correlation_table.csv", float_format="%.4f")
    predicted_rows.to_csv(TABLES / "predicted_vs_actual_10.csv", index=False)
    return correlation


def plot_static(frame: pd.DataFrame, correlation: pd.DataFrame, y_test, predictions, probabilities) -> None:
    sns.set_theme(style="whitegrid", context="notebook")
    outcome_palette = ["#c2415d", "#137f8b"]
    frame = frame.copy()
    frame["survival_label"] = frame["survived"].map({0: "Died", 1: "Survived"})

    figure, axis = plt.subplots(figsize=(7, 4.5))
    sns.barplot(data=frame, x="sex", y="survived", hue="sex", errorbar=None, palette=["#b04a8b", "#2677a8"], legend=False, ax=axis)
    axis.set(title="Survival Rate by Gender", xlabel="Gender", ylabel="Survival rate", ylim=(0, 1))
    save_figure(figure, FIGURES / "survival_by_gender.png")
    plt.close(figure)

    figure, axis = plt.subplots(figsize=(7, 4.5))
    sns.barplot(data=frame, x="pclass", y="survived", errorbar=None, color="#247c91", ax=axis)
    axis.set(title="Survival Rate by Passenger Class", xlabel="Passenger class", ylabel="Survival rate", ylim=(0, 1))
    save_figure(figure, FIGURES / "survival_by_class.png")
    plt.close(figure)

    figure, axis = plt.subplots(figsize=(8, 4.8))
    sns.barplot(data=frame, x="pclass", y="survived", hue="sex", errorbar=None, ax=axis)
    axis.set(title="Survival Rate by Gender and Class", xlabel="Passenger class", ylabel="Survival rate", ylim=(0, 1))
    save_figure(figure, FIGURES / "survival_by_gender_class.png")
    plt.close(figure)

    figure, axis = plt.subplots(figsize=(8, 4.8))
    sns.histplot(data=frame, x="age", hue="survival_label", bins=30, element="step", palette=outcome_palette, ax=axis)
    axis.set(title="Passenger Age Distribution by Outcome", xlabel="Age", ylabel="Passenger count")
    save_figure(figure, FIGURES / "age_distribution.png")
    plt.close(figure)

    figure, axis = plt.subplots(figsize=(8, 6))
    sns.heatmap(correlation, annot=True, fmt=".2f", center=0, cmap="vlag", ax=axis)
    axis.set_title("Correlation Table Heatmap")
    save_figure(figure, FIGURES / "correlation_heatmap.png")
    plt.close(figure)

    figure, axis = plt.subplots(figsize=(6.4, 5))
    ConfusionMatrixDisplay(confusion_matrix(y_test, predictions), display_labels=["Died", "Survived"]).plot(
        ax=axis, cmap="Blues", colorbar=False
    )
    axis.set_title("Logistic Regression Confusion Matrix")
    save_figure(figure, FIGURES / "confusion_matrix.png")
    plt.close(figure)

    figure, axis = plt.subplots(figsize=(6.4, 5))
    RocCurveDisplay.from_predictions(y_test, probabilities, name="Logistic Regression", ax=axis)
    axis.plot([0, 1], [0, 1], linestyle="--", color="#64748b", label="Chance")
    axis.set_title("ROC Curve on Held-Out Kaggle Training Rows")
    axis.legend()
    save_figure(figure, FIGURES / "roc_curve.png")
    plt.close(figure)


def write_plot(figure, filename: str, margin: dict | None = None) -> None:
    figure.update_layout(font_family="Arial", margin=margin or dict(l=30, r=30, t=65, b=35))
    default_height = f"{figure.layout.height}px" if figure.layout.height else "100%"
    figure.write_html(
        INTERACTIVE / filename,
        include_plotlyjs="cdn",
        full_html=True,
        default_width="100%",
        default_height=default_height,
        config={"responsive": True, "displaylogo": False},
    )


def plot_interactive(frame: pd.DataFrame) -> None:
    report = add_reporting_features(frame).fillna({"age": report_age(frame), "fare": frame["fare"].median()})
    report["root_label"] = "Titanic Passengers"
    sunburst = px.sunburst(
        report,
        path=["root_label", "outcome", "sex_label", "class_label", "port_label"],
        title="Titanic Passengers: Outcome → Sex → Class → Port",
        custom_data=["survived"],
        color="outcome",
        color_discrete_map={"Survived": "#137f8b", "Died": "#c2415d"},
    )
    sunburst.update_traces(hovertemplate="%{label}<br>Passengers: %{value}<br>Share of parent: %{percentParent:.1%}<extra></extra>")
    write_plot(sunburst, "titanic_sunburst.html")

    flow = report.groupby(
        ["class_label", "sex_label", "port_label", "family_group", "outcome"], observed=True, dropna=False
    ).agg(count=("survived", "size"), survival_rate=("survived", "mean")).reset_index()
    dimensions = [
        go.parcats.Dimension(values=flow["class_label"], label="Class"),
        go.parcats.Dimension(values=flow["sex_label"], label="Sex"),
        go.parcats.Dimension(values=flow["port_label"], label="Port"),
        go.parcats.Dimension(values=flow["family_group"], label="Family"),
        go.parcats.Dimension(values=flow["outcome"], label="Outcome"),
    ]
    parcats = go.Figure(go.Parcats(dimensions=dimensions, counts=flow["count"], line={"color": flow["survival_rate"], "colorscale": "Tealrose", "cmin": 0, "cmax": 1, "colorbar": {"title": "Survival rate"}}, hoveron="color", hoverinfo="count+probability"))
    parcats.update_layout(
        title="Cleaned Passenger Flow: Class → Sex → Port → Family → Outcome",
        autosize=False,
        height=700,
        width=1300,
        font=dict(size=13),
    )
    parcats.add_annotation(text="Hover shows passenger count; line color and colorbar show survival rate.", x=0.5, y=-0.08, xref="paper", yref="paper", showarrow=False)
    write_plot(parcats, "parallel_categories.html", margin=dict(t=90, l=80, r=180, b=120))

    grouped = report.groupby(["class_label", "sex_label", "outcome"], observed=True).size().reset_index(name="count")
    rates = report.groupby(["class_label", "sex_label"], observed=True)["survived"].mean().reset_index(name="survival_rate")
    grouped = grouped.merge(rates, on=["class_label", "sex_label"])
    bars = px.bar(grouped, x="class_label", y="count", color="outcome", facet_col="sex_label", barmode="group", title="Clear View: Survival by Gender and Class", labels={"class_label": "Class", "count": "Count", "sex_label": "Sex", "survival_rate": "Survival rate"}, hover_data={"count": True, "survival_rate": ":.1%"})
    write_plot(bars, "survival_gender_class.html")

    scatter = px.scatter(report, x="age", y="fare", color="outcome", symbol="sex_label", facet_col="class_label", hover_data=["family_size", "port_label"], title="Fare vs Age by Class and Outcome", labels={"age": "Age", "fare": "Fare", "outcome": "Outcome"})
    write_plot(scatter, "fare_age_scatter.html")

    dashboard = px.scatter(report, x="age", y="fare", size="family_size", color="outcome", animation_frame="class_label", hover_data=["sex_label", "port_label"], title="Class / Fare / Age / Survival Explorer", labels={"age": "Age", "fare": "Fare"})
    write_plot(dashboard, "passenger_dashboard.html")


def report_age(frame: pd.DataFrame) -> float:
    return float(frame["age"].median())


def main() -> None:
    prepare_directories()
    raw, info = load_titanic_data()
    frame = normalize_columns(raw)
    cleaned_frame = clean_assignment_frame(raw)
    features, target = build_feature_frame(raw)
    x_train, x_test, y_train, y_test = train_test_split(
        features, target, test_size=0.2, stratify=target, random_state=RANDOM_STATE
    )
    model = build_logistic_pipeline()
    model.fit(x_train, y_train)
    predictions = model.predict(x_test)
    probabilities = model.predict_proba(x_test)[:, 1]

    comparison = pd.DataFrame(
        {
            "passenger_id": raw.loc[x_test.index, "PassengerId"].to_numpy()[:10],
            "actual": y_test.to_numpy()[:10],
            "predicted": predictions[:10],
            "survival_probability": probabilities[:10].round(4),
        }
    )
    correlation = save_tables(frame.copy(), cleaned_frame, comparison)
    metrics = classification_metrics(y_test, predictions, probabilities)
    metrics.update(
        {
            "dataset_source": info.source,
            "dataset_variant": info.variant,
            "dataset_row_count": info.row_count,
            "random_state": RANDOM_STATE,
            "validation_rows": len(y_test),
            "split": "stratified 80/20 holdout from kaggle/train.csv",
            "model": "LogisticRegression baseline",
            "features_used": list(features.columns),
            "generation_source": "scripts/generate_assignment_evidence.py",
            "leakage_columns_excluded": ["boat", "body"],
            "warning": "Do not mix Kaggle, Seaborn, and OpenML Titanic datasets blindly.",
        }
    )
    (METRICS / "model_metrics.json").write_text(json.dumps(metrics, indent=2) + "\n", encoding="utf-8")

    hypothesis = gender_survival_test(frame)
    hypothesis_text = [
        f"Dataset: {info.variant}",
        f"Source: {info.source}",
        f"Rows: {info.row_count}",
        "Question: Did women have a higher survival rate than men?",
        f"Test: {hypothesis['test_name']}",
        f"Alternative hypothesis: {hypothesis['alternative_hypothesis']}",
        f"Female survivors / total: {hypothesis['female_survivors']} / {hypothesis['female_total']}",
        f"Male survivors / total: {hypothesis['male_survivors']} / {hypothesis['male_total']}",
        f"Female survival rate: {hypothesis['female_survival_rate']:.4f}",
        f"Male survival rate: {hypothesis['male_survival_rate']:.4f}",
        f"Effect size (female - male rate): {hypothesis['rate_difference']:.4f}",
        f"Approximate 95% CI for rate difference: [{hypothesis['rate_difference_ci_95_low']:.4f}, {hypothesis['rate_difference_ci_95_high']:.4f}]",
        f"Odds ratio: {hypothesis['odds_ratio']:.4f}",
        f"p-value: {hypothesis['p_value']:.6e}",
        f"Alpha: {hypothesis['alpha']:.2f}",
        "Interpretation: reject equal-or-lower female survival when p < 0.05; the sample supports higher female survival.",
        "Assumptions: recorded passengers are treated as independent observations and category labels are accurate.",
        "Limitations: this observational historical dataset is not randomized; class, age, family structure, and evacuation policy may confound the association.",
        "The Wald confidence interval is descriptive; Fisher's exact test supplies the reported p-value.",
    ]
    (METRICS / "hypothesis_test_gender_survival.txt").write_text("\n".join(hypothesis_text) + "\n", encoding="utf-8")

    plot_static(frame, correlation, y_test, predictions, probabilities)
    plot_interactive(frame)
    mirror_report_tree(REPORTS, PUBLIC_REPORTS)
    print(f"Generated assignment evidence from {info.variant} ({info.row_count} rows).")
    print(f"Validation accuracy: {metrics['accuracy']:.4f}; ROC-AUC: {metrics['roc_auc']:.4f}")
    print("Reports: reports/")
    print("Web copies: public/reports/")


if __name__ == "__main__":
    main()
