from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import confusion_matrix, roc_auc_score, roc_curve
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler


PROJECT_ROOT = Path(__file__).resolve().parents[1]
PLOT_DIR = PROJECT_ROOT / "public" / "assets" / "plots"
ZIP_PATH = PROJECT_ROOT / "public" / "assets" / "titanic_graphs.zip"
DATA_URL = "https://www.openml.org/data/get_csv/16826755/phpMYEkMl"


def save_current(name: str):
    PLOT_DIR.mkdir(parents=True, exist_ok=True)
    path = PLOT_DIR / name
    plt.tight_layout()
    plt.savefig(path, dpi=180, bbox_inches="tight", facecolor="white")
    plt.close()
    return path


def load_data():
    df = pd.read_csv(DATA_URL)
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


def build_model(df_model):
    features = [
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
    target = "survived"
    X = df_model[features].copy()
    y = df_model[target].astype(int)

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y,
    )

    numeric_features = ["age", "sibsp", "parch", "fare", "family_size"]
    categorical_features = ["pclass", "sex", "embarked", "is_alone", "title", "has_cabin"]

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
            ("num", numeric_pipeline, numeric_features),
            ("cat", categorical_pipeline, categorical_features),
        ]
    )
    model = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("classifier", LogisticRegression(max_iter=1000, solver="liblinear", random_state=42)),
        ]
    )
    model.fit(X_train, y_train)
    return y_test, model.predict(X_test), model.predict_proba(X_test)[:, 1]


def generate_plots(df):
    sns.set_theme(style="whitegrid", palette="deep")

    plt.figure(figsize=(8, 5))
    ax = sns.countplot(data=df, x="survived", hue="survived", palette=["#ef476f", "#118ab2"], legend=False)
    ax.set_title("Titanic Survival Count", fontweight="bold")
    ax.set_xlabel("Survival Outcome")
    ax.set_ylabel("Passenger Count")
    ax.set_xticks([0, 1])
    ax.set_xticklabels(["Not Survived", "Survived"])
    save_current("survival_count.png")

    plt.figure(figsize=(8, 5))
    ax = sns.countplot(data=df, x="sex", hue="survived", palette=["#ef476f", "#118ab2"])
    ax.set_title("Survival by Sex", fontweight="bold")
    ax.set_xlabel("Sex")
    ax.set_ylabel("Passenger Count")
    ax.legend(title="Survived", labels=["Not Survived", "Survived"])
    save_current("survival_by_sex.png")

    plt.figure(figsize=(8, 5))
    ax = sns.countplot(data=df, x="pclass", hue="survived", palette=["#ef476f", "#118ab2"])
    ax.set_title("Survival by Passenger Class", fontweight="bold")
    ax.set_xlabel("Passenger Class")
    ax.set_ylabel("Passenger Count")
    ax.legend(title="Survived", labels=["Not Survived", "Survived"])
    save_current("survival_by_class.png")

    g = sns.catplot(
        data=df,
        x="pclass",
        y="survived",
        hue="sex",
        kind="bar",
        errorbar=None,
        palette=["#118ab2", "#ef476f"],
        height=5,
        aspect=1.45,
    )
    g.set_axis_labels("Passenger Class", "Mean Survival Rate")
    g.fig.suptitle("Survival Rate by Sex and Passenger Class", y=1.03, fontweight="bold")
    save_current("survival_by_sex_and_class.png")

    plt.figure(figsize=(8, 5))
    ax = sns.kdeplot(
        data=df,
        x="age",
        hue="survived",
        fill=True,
        common_norm=False,
        alpha=0.35,
        palette=["#ef476f", "#118ab2"],
    )
    ax.set_title("Age Distribution by Survival", fontweight="bold")
    ax.set_xlabel("Age")
    save_current("age_distribution_by_survival.png")

    df_plot = df.copy()
    df_plot["fare_log1p"] = np.log1p(df_plot["fare"])
    plt.figure(figsize=(8, 5))
    ax = sns.boxplot(data=df_plot, x="survived", y="fare_log1p", hue="survived", palette=["#ef476f", "#118ab2"], legend=False)
    ax.set_title("Log Fare Distribution by Survival", fontweight="bold")
    ax.set_xlabel("Survival Outcome")
    ax.set_ylabel("log1p(Fare)")
    ax.set_xticks([0, 1])
    ax.set_xticklabels(["Not Survived", "Survived"])
    save_current("log_fare_by_survival.png")

    plt.figure(figsize=(8, 5))
    ax = sns.countplot(data=df, x="embarked", hue="survived", palette=["#ef476f", "#118ab2"])
    ax.set_title("Embarked Port vs Survival", fontweight="bold")
    ax.set_xlabel("Embarked")
    ax.set_ylabel("Passenger Count")
    ax.legend(title="Survived", labels=["Not Survived", "Survived"])
    save_current("embarked_survival.png")

    corr_df = df[["survived", "pclass", "sex", "age", "sibsp", "parch", "fare", "embarked"]].copy()
    corr_df["sex"] = corr_df["sex"].astype("category").cat.codes
    corr_df["embarked"] = corr_df["embarked"].astype("category").cat.codes
    corr = corr_df.corr(numeric_only=True)
    plt.figure(figsize=(8, 6))
    ax = sns.heatmap(corr, annot=True, cmap="coolwarm", center=0, fmt=".2f", square=True)
    ax.set_title("Titanic Feature Correlation Heatmap", fontweight="bold")
    save_current("correlation_heatmap.png")


def generate_confusion_matrix(df):
    y_test, y_pred, y_proba = build_model(engineer_features(df))
    cm = confusion_matrix(y_test, y_pred)
    cm_df = pd.DataFrame(
        cm,
        index=["Actual Not Survived", "Actual Survived"],
        columns=["Predicted Not Survived", "Predicted Survived"],
    )
    plt.figure(figsize=(7, 5))
    ax = sns.heatmap(cm_df, annot=True, fmt="d", cmap="Blues", cbar=False)
    ax.set_title("Confusion Matrix: Logistic Regression", fontweight="bold")
    ax.set_xlabel("Predicted Label")
    ax.set_ylabel("Actual Label")
    save_current("confusion_matrix.png")

    auc_value = roc_auc_score(y_test, y_proba)
    fpr, tpr, _ = roc_curve(y_test, y_proba)
    plt.figure(figsize=(7, 5))
    plt.plot(fpr, tpr, color="#f77f00", lw=2.4, label=f"ROC Curve (AUC = {auc_value:.3f})")
    plt.plot([0, 1], [0, 1], color="#1d3557", lw=1.5, linestyle="--", label="Chance")
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel("False Positive Rate")
    plt.ylabel("True Positive Rate")
    plt.title("ROC Curve: Logistic Regression", fontweight="bold")
    plt.legend(loc="lower right")
    save_current("roc_curve.png")


def write_zip():
    with ZipFile(ZIP_PATH, "w", ZIP_DEFLATED) as archive:
        for path in sorted(PLOT_DIR.glob("*.png")):
            archive.write(path, arcname=path.name)
    print(f"Created {ZIP_PATH}")


def main():
    df = load_data()
    generate_plots(df)
    generate_confusion_matrix(df)
    write_zip()
    print(f"Generated plots in {PLOT_DIR}")


if __name__ == "__main__":
    main()
