import re

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

try:
    from IPython.display import display
except Exception:
    def display(value):
        print(value)

from sklearn import set_config
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    roc_auc_score,
    roc_curve,
)
from sklearn.model_selection import GridSearchCV, StratifiedKFold, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler


set_config(display="diagram")
sns.set_theme(style="whitegrid", palette="muted")
plt.rcParams["figure.figsize"] = (10, 6)
plt.rcParams["figure.dpi"] = 120

OPENML_URL = "https://www.openml.org/data/get_csv/16826755/phpMYEkMl"
DATASCIENCE_DOJO_URL = "https://raw.githubusercontent.com/datasciencedojo/datasets/master/titanic.csv"
SEABORN_URL = "https://raw.githubusercontent.com/mwaskom/seaborn-data/master/titanic.csv"


def normalize_columns(df):
    df = df.copy()
    df.columns = (
        df.columns
        .str.strip()
        .str.lower()
        .str.replace(".", "_", regex=False)
        .str.replace(" ", "_", regex=False)
    )
    return df


def load_titanic_data():
    sources = [
        ("OpenML Titanic 1309-row dataset", OPENML_URL),
        ("DataScienceDojo/Kaggle-style Titanic 891-row dataset", DATASCIENCE_DOJO_URL),
        ("Seaborn Titanic 891-row dataset", SEABORN_URL),
    ]

    for label, url in sources:
        try:
            print(f"Attempting to load: {label}")
            df_loaded = normalize_columns(pd.read_csv(url))
            print(f"Loaded {label}: {df_loaded.shape}")
            return df_loaded, label
        except Exception as exc:
            print(f"Source failed: {label}. Reason: {exc}")

    print("All remote sources failed. Falling back to sns.load_dataset('titanic').")
    df_loaded = normalize_columns(sns.load_dataset("titanic"))
    return df_loaded, "Seaborn local fallback"


df_raw, dataset_label = load_titanic_data()
df_raw = df_raw.replace("?", np.nan)

for numeric_column in ["age", "fare"]:
    if numeric_column in df_raw.columns:
        df_raw[numeric_column] = pd.to_numeric(df_raw[numeric_column], errors="coerce")

required_columns = ["survived", "pclass", "sex", "age", "sibsp", "parch", "fare", "embarked"]
missing_required = [column for column in required_columns if column not in df_raw.columns]
if missing_required:
    raise ValueError(f"Dataset is missing required columns: {missing_required}")

if "name" not in df_raw.columns:
    df_raw["name"] = "Unknown, Mr. Passenger"
if "cabin" not in df_raw.columns:
    df_raw["cabin"] = np.nan

display(df_raw.head())
print(f"Dataset used for advanced showcase: {dataset_label}")


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
                key = tuple(row[column] for column in self.group_cols)
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

        leakage_or_raw_columns = [
            "passengerid",
            "name",
            "ticket",
            "cabin",
            "boat",
            "body",
            "home_dest",
        ]
        return X_out.drop(columns=[col for col in leakage_or_raw_columns if col in X_out.columns])


X = df_raw.drop(columns=["survived"])
y = df_raw["survived"].astype(int)

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y,
)

numeric_features = ["age", "sibsp", "parch", "fare", "family_size"]
categorical_features = ["pclass", "sex", "embarked", "is_alone", "title", "has_cabin"]

numeric_transformer = Pipeline(
    steps=[
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
    ]
)

categorical_transformer = Pipeline(
    steps=[
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("encoder", OneHotEncoder(handle_unknown="ignore", drop="first")),
    ]
)

preprocessor = ColumnTransformer(
    transformers=[
        ("num", numeric_transformer, numeric_features),
        ("cat", categorical_transformer, categorical_features),
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

param_grid = [
    {
        "classifier": [LogisticRegression(max_iter=1000, solver="liblinear", random_state=42)],
        "classifier__C": [0.1, 1.0, 10.0],
    },
    {
        "classifier": [RandomForestClassifier(random_state=42, n_jobs=-1)],
        "classifier__n_estimators": [100],
        "classifier__max_depth": [3, 5],
        "classifier__min_samples_leaf": [1, 3],
    },
]

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
grid_search = GridSearchCV(
    estimator=base_pipeline,
    param_grid=param_grid,
    cv=cv,
    scoring="accuracy",
    n_jobs=-1,
)

print("Executing GridSearchCV model comparison...")
grid_search.fit(X_train, y_train)

best_pipeline = grid_search.best_estimator_
print("Best parameters:")
print(grid_search.best_params_)
print(f"Best cross-validation accuracy: {grid_search.best_score_:.4f}")

y_pred = best_pipeline.predict(X_test)
y_proba = best_pipeline.predict_proba(X_test)[:, 1]

test_accuracy = accuracy_score(y_test, y_pred)
auc_value = roc_auc_score(y_test, y_proba)
conf_matrix = confusion_matrix(y_test, y_pred)

print("\nTEST EVALUATION METRICS")
print("=" * 40)
print(f"Holdout Test Accuracy: {test_accuracy:.4f}")
print(f"ROC-AUC: {auc_value:.4f}")
print("\nConfusion Matrix:")
print(conf_matrix)
print("\nClassification Report:")
print(classification_report(y_test, y_pred))

fpr, tpr, _ = roc_curve(y_test, y_proba)
plt.figure(figsize=(7, 5))
plt.plot(fpr, tpr, color="darkorange", lw=2, label=f"ROC Curve (AUC = {auc_value:.3f})")
plt.plot([0, 1], [0, 1], color="navy", lw=1.5, linestyle="--")
plt.xlim([0.0, 1.0])
plt.ylim([0.0, 1.05])
plt.xlabel("False Positive Rate")
plt.ylabel("True Positive Rate")
plt.title("Receiver Operating Characteristic (ROC) Curve")
plt.legend(loc="lower right")
plt.tight_layout()
plt.show()

feature_engineered_train = best_pipeline.named_steps["feature_engineer"].transform(
    best_pipeline.named_steps["group_age_imputer"].transform(X_train)
)
preprocess_step = best_pipeline.named_steps["preprocess"]
encoded_feature_names = preprocess_step.get_feature_names_out()
classifier = best_pipeline.named_steps["classifier"]

if isinstance(classifier, LogisticRegression):
    interpretation = pd.DataFrame(
        {
            "Feature": encoded_feature_names,
            "Coefficient": classifier.coef_[0],
            "Odds Ratio": np.exp(classifier.coef_[0]),
        }
    ).sort_values("Coefficient", ascending=False)
    print("\nLOGISTIC REGRESSION ODDS RATIOS")
    display(interpretation)
else:
    interpretation = pd.DataFrame(
        {
            "Feature": encoded_feature_names,
            "Importance": classifier.feature_importances_,
        }
    ).sort_values("Importance", ascending=False)
    print("\nRANDOM FOREST FEATURE IMPORTANCES")
    display(interpretation)

custom_scenarios = pd.DataFrame(
    [
        {
            "pclass": 3,
            "name": "Practice, Mr. Third Class",
            "sex": "male",
            "age": 25,
            "sibsp": 0,
            "parch": 0,
            "fare": 7.25,
            "embarked": "S",
            "cabin": np.nan,
        },
        {
            "pclass": 1,
            "name": "Practice, Mrs. First Class",
            "sex": "female",
            "age": 38,
            "sibsp": 1,
            "parch": 0,
            "fare": 71.28,
            "embarked": "C",
            "cabin": "C85",
        },
        {
            "pclass": 2,
            "name": "Practice, Master. Child",
            "sex": "male",
            "age": 6,
            "sibsp": 1,
            "parch": 1,
            "fare": 26.0,
            "embarked": "S",
            "cabin": np.nan,
        },
    ]
)

simulated_predictions = best_pipeline.predict(custom_scenarios)
simulated_probabilities = best_pipeline.predict_proba(custom_scenarios)[:, 1]

print("\nLIVE SIMULATION PREDICTIONS")
print("=" * 40)
for idx, row in custom_scenarios.iterrows():
    outcome = "SURVIVES" if simulated_predictions[idx] == 1 else "NOT SURVIVED"
    print(
        f"Passenger: {row['name']:<32} | Class: {row['pclass']} | "
        f"Sex: {row['sex']:<6} | Probability: {simulated_probabilities[idx]:.4f} | "
        f"Prediction: {outcome}"
    )

print("\nInteractive diagram of the optimal pipeline:")
best_pipeline
