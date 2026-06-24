# ruff: noqa: E402 - Colab installs optional packages before importing them.
import importlib
import subprocess
import sys

REQUIRED_PACKAGES = {
    "ydf": "ydf",
    "xgboost": "xgboost",
    "lightgbm": "lightgbm",
    "catboost": "catboost",
    "tensorflow": "tensorflow",
}
for module_name, package_name in REQUIRED_PACKAGES.items():
    try:
        importlib.import_module(module_name)
    except ImportError:
        subprocess.check_call(
            [sys.executable, "-m", "pip", "install", "-q", package_name]
        )

import os
import random
import warnings

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
import tensorflow as tf
import ydf
from catboost import CatBoostClassifier
from IPython.display import display
from lightgbm import LGBMClassifier
from scipy.stats import chi2_contingency, pointbiserialr
from sklearn.base import BaseEstimator, TransformerMixin, clone
from sklearn.cluster import KMeans
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import (
    IsolationForest,
    RandomForestClassifier,
    VotingClassifier,
)
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.metrics import (
    ConfusionMatrixDisplay,
    RocCurveDisplay,
    accuracy_score,
    balanced_accuracy_score,
    f1_score,
    log_loss,
    mean_absolute_error,
    mean_squared_error,
    precision_score,
    r2_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import (
    GridSearchCV,
    StratifiedKFold,
    cross_val_score,
    train_test_split,
)
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.tree import DecisionTreeClassifier
from xgboost import XGBClassifier

warnings.filterwarnings("ignore")
RANDOM_STATE = 42
np.random.seed(RANDOM_STATE)
random.seed(RANDOM_STATE)
tf.keras.utils.set_random_seed(RANDOM_STATE)
tf.get_logger().setLevel("ERROR")
print("Environment ready.")

def load_kaggle_data():
    roots = [
        "../kaggle",
        "./kaggle",
        "../data",
        "./data",
        "/content",
        "/content/kaggle",
    ]
    for root in roots:
        train_path = os.path.join(root, "train.csv")
        test_path = os.path.join(root, "test.csv")
        if os.path.exists(train_path) and os.path.exists(test_path):
            return pd.read_csv(train_path), pd.read_csv(test_path)

    base = (
        "https://raw.githubusercontent.com/sid0sid-ops/"
        "titanic-data-to-discovery/main/kaggle"
    )
    return (
        pd.read_csv(f"{base}/train.csv"),
        pd.read_csv(f"{base}/test.csv"),
    )


train_df, test_df = load_kaggle_data()
required_train = {
    "PassengerId", "Survived", "Pclass", "Name", "Sex", "Age",
    "SibSp", "Parch", "Ticket", "Fare", "Cabin", "Embarked",
}
missing = required_train.difference(train_df.columns)
if missing:
    raise ValueError(f"Unexpected Kaggle schema; missing columns: {sorted(missing)}")
if "Survived" in test_df.columns:
    raise ValueError("The Kaggle test file must not contain the Survived target.")

audit = pd.DataFrame({
    "dtype": train_df.dtypes.astype(str),
    "missing": train_df.isna().sum(),
    "missing_pct": train_df.isna().mean().mul(100).round(2),
    "unique": train_df.nunique(dropna=True),
}).sort_values("missing_pct", ascending=False)
print("Train:", train_df.shape, "| Test:", test_df.shape)
display(audit)

fig, axes = plt.subplots(1, 3, figsize=(16, 4))
sns.countplot(data=train_df, x="Survived", ax=axes[0])
axes[0].set_title("Survival class balance")
sns.barplot(data=train_df, x="Sex", y="Survived", errorbar=("ci", 95), ax=axes[1])
axes[1].set_title("Survival rate by sex (95% CI)")
sns.barplot(data=train_df, x="Pclass", y="Survived", errorbar=("ci", 95), ax=axes[2])
axes[2].set_title("Survival rate by passenger class (95% CI)")
plt.tight_layout()
plt.show()

sex_table = pd.crosstab(train_df["Sex"], train_df["Survived"])
chi2, chi2_p, _, _ = chi2_contingency(sex_table)
age_rows = train_df[["Age", "Survived"]].dropna()
fare_rows = train_df[["Fare", "Survived"]].dropna()
age_r, age_p = pointbiserialr(age_rows["Survived"], age_rows["Age"])
fare_r, fare_p = pointbiserialr(fare_rows["Survived"], fare_rows["Fare"])

statistics_results = pd.DataFrame([
    {
        "test": "Chi-square: Sex vs Survived",
        "statistic": chi2,
        "p_value": chi2_p,
        "interpretation": "Evidence of association" if chi2_p < 0.05 else "No evidence",
    },
    {
        "test": "Point-biserial: Age vs Survived",
        "statistic": age_r,
        "p_value": age_p,
        "interpretation": "Linear association" if age_p < 0.05 else "No evidence",
    },
    {
        "test": "Point-biserial: Fare vs Survived",
        "statistic": fare_r,
        "p_value": fare_p,
        "interpretation": "Linear association" if fare_p < 0.05 else "No evidence",
    },
])
display(statistics_results.round(4))

TITLE_MAP = {
    "Mme": "Mrs", "Ms": "Miss", "Mlle": "Miss",
    "Dr": "Officer", "Rev": "Officer", "Col": "Officer",
    "Major": "Officer", "Capt": "Officer",
    "Lady": "Royalty", "the Countess": "Royalty",
    "Don": "Royalty", "Jonkheer": "Royalty",
    "Sir": "Royalty", "Dona": "Royalty",
}


def engineer_features(frame):
    result = frame.copy()
    result["FamilySize"] = result["SibSp"] + result["Parch"] + 1
    result["IsAlone"] = (result["FamilySize"] == 1).astype(int)
    result["Title"] = result["Name"].str.extract(r",\s*([^.]+)\.", expand=False)
    result["Title"] = result["Title"].replace(TITLE_MAP)
    common_titles = {"Mr", "Mrs", "Miss", "Master", "Officer", "Royalty"}
    result["Title"] = result["Title"].where(
        result["Title"].isin(common_titles), "Other"
    )
    result["Deck"] = result["Cabin"].str[0].fillna("Unknown")
    result["CabinKnown"] = result["Cabin"].notna().astype(int)
    result["TicketPrefix"] = (
        result["Ticket"]
        .str.replace(r"\d+", "", regex=True)
        .str.replace(r"[\s./]+", "", regex=True)
        .replace("", "NONE")
    )
    result["FarePerPerson"] = result["Fare"] / result["FamilySize"].clip(lower=1)
    return result


train_features = engineer_features(train_df)
test_features = engineer_features(test_df)
feature_columns = [
    "Pclass", "Sex", "Age", "SibSp", "Parch", "Fare", "Embarked",
    "FamilySize", "IsAlone", "Title", "Deck", "CabinKnown", "TicketPrefix",
    "FarePerPerson",
]
X = train_features[feature_columns]
y = train_features["Survived"].astype(int)
X_train, X_holdout, y_train, y_holdout = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=RANDOM_STATE,
    stratify=y,
)
print("Training:", X_train.shape, "| Untouched holdout:", X_holdout.shape)
print("Class rates:", y_train.mean().round(3), y_holdout.mean().round(3))

class GroupedAgeImputer(BaseEstimator, TransformerMixin):
    def fit(self, X, y=None):
        frame = X.copy()
        self.group_medians_ = frame.groupby(
            ["Pclass", "Sex"], observed=True
        )["Age"].median()
        self.global_median_ = frame["Age"].median()
        return self

    def transform(self, X):
        frame = X.copy()
        missing_age = frame["Age"].isna()
        group_keys = pd.MultiIndex.from_frame(
            frame.loc[missing_age, ["Pclass", "Sex"]]
        )
        grouped_values = self.group_medians_.reindex(group_keys).to_numpy()
        frame.loc[missing_age, "Age"] = pd.Series(
            grouped_values,
            index=frame.index[missing_age],
        ).fillna(self.global_median_)
        return frame


numeric_features = [
    "Age", "SibSp", "Parch", "Fare", "FamilySize", "IsAlone",
    "CabinKnown", "FarePerPerson",
]
categorical_features = [
    "Pclass", "Sex", "Embarked", "Title", "Deck", "TicketPrefix",
]
preprocessor = ColumnTransformer([
    (
        "numeric",
        Pipeline([
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
        ]),
        numeric_features,
    ),
    (
        "categorical",
        Pipeline([
            ("imputer", SimpleImputer(strategy="most_frequent")),
            (
                "encoder",
                OneHotEncoder(handle_unknown="ignore", sparse_output=False),
            ),
        ]),
        categorical_features,
    ),
])
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)

def make_model_pipeline(estimator, selected_preprocessor=None):
    return Pipeline([
        ("grouped_age", GroupedAgeImputer()),
        (
            "preprocessor",
            clone(selected_preprocessor or preprocessor),
        ),
        ("model", estimator),
    ])


baseline_columns = ["Pclass", "Sex", "Age", "Fare", "Embarked"]
baseline_numeric = ["Age", "Fare"]
baseline_categorical = ["Pclass", "Sex", "Embarked"]
baseline_preprocessor = ColumnTransformer([
    (
        "numeric",
        Pipeline([
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
        ]),
        baseline_numeric,
    ),
    (
        "categorical",
        Pipeline([
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
        ]),
        baseline_categorical,
    ),
])
basic_pipeline = Pipeline([
    ("preprocessor", clone(baseline_preprocessor)),
    ("model", LogisticRegression(max_iter=2000, random_state=RANDOM_STATE)),
])
grouped_age_pipeline = Pipeline([
    ("grouped_age", GroupedAgeImputer()),
    ("preprocessor", clone(baseline_preprocessor)),
    ("model", LogisticRegression(max_iter=2000, random_state=RANDOM_STATE)),
])
enhanced_pipeline = make_model_pipeline(
    LogisticRegression(max_iter=2000, random_state=RANDOM_STATE)
)
impact_rows = []
for stage, pipeline, stage_X in [
    ("Basic median preprocessing", basic_pipeline, X_train[baseline_columns]),
    (
        "Grouped Age by Pclass + Sex",
        grouped_age_pipeline,
        X_train[baseline_columns],
    ),
    ("Full feature engineering", enhanced_pipeline, X_train),
]:
    accuracy_scores = cross_val_score(
        pipeline, stage_X, y_train, scoring="accuracy", cv=cv, n_jobs=-1
    )
    auc_scores = cross_val_score(
        pipeline, stage_X, y_train, scoring="roc_auc", cv=cv, n_jobs=-1
    )
    impact_rows.append({
        "Stage": stage,
        "Mean CV Accuracy": accuracy_scores.mean(),
        "Accuracy Change": accuracy_scores.mean(),
        "Mean CV ROC-AUC": auc_scores.mean(),
        "ROC-AUC Change": auc_scores.mean(),
    })
impact_df = pd.DataFrame(impact_rows)
impact_df["Accuracy Change"] -= impact_df.loc[0, "Mean CV Accuracy"]
impact_df["ROC-AUC Change"] -= impact_df.loc[0, "Mean CV ROC-AUC"]
display(impact_df.round(4))

fig, axes = plt.subplots(1, 2, figsize=(13, 4))
sns.barplot(data=impact_df, x="Mean CV Accuracy", y="Stage", ax=axes[0])
axes[0].set_title("Accuracy change by preprocessing stage")
sns.barplot(data=impact_df, x="Mean CV ROC-AUC", y="Stage", ax=axes[1])
axes[1].set_title("ROC-AUC change by preprocessing stage")
plt.tight_layout()
plt.show()

searches = {
    "Logistic Regression": (
        LogisticRegression(max_iter=2000, random_state=RANDOM_STATE),
        {"model__C": [0.1, 1.0, 10.0]},
    ),
    "KNN": (
        KNeighborsClassifier(),
        {"model__n_neighbors": [5, 9, 15], "model__weights": ["uniform", "distance"]},
    ),
    "Decision Tree": (
        DecisionTreeClassifier(random_state=RANDOM_STATE),
        {
            "model__max_depth": [3, 5, 8, None],
            "model__min_samples_leaf": [1, 5, 10],
        },
    ),
    "Random Forest": (
        RandomForestClassifier(
            n_estimators=300,
            random_state=RANDOM_STATE,
            n_jobs=-1,
        ),
        {
            "model__max_depth": [5, 8, None],
            "model__min_samples_leaf": [1, 3, 5],
        },
    ),
    "XGBoost": (
        XGBClassifier(
            n_estimators=300,
            eval_metric="logloss",
            random_state=RANDOM_STATE,
            n_jobs=-1,
        ),
        {
            "model__max_depth": [3, 5],
            "model__learning_rate": [0.03, 0.1],
        },
    ),
    "LightGBM": (
        LGBMClassifier(
            n_estimators=300,
            verbosity=-1,
            random_state=RANDOM_STATE,
            n_jobs=-1,
        ),
        {
            "model__num_leaves": [15, 31],
            "model__learning_rate": [0.03, 0.1],
        },
    ),
    "CatBoost": (
        CatBoostClassifier(
            iterations=300,
            verbose=0,
            random_seed=RANDOM_STATE,
        ),
        {
            "model__depth": [4, 6],
            "model__learning_rate": [0.03, 0.1],
        },
    ),
}

fitted_models = {}
cv_scores = {}
best_parameters = {}
for name, (estimator, grid) in searches.items():
    search = GridSearchCV(
        make_model_pipeline(estimator),
        grid,
        scoring="roc_auc",
        cv=cv,
        n_jobs=-1,
        refit=True,
    )
    search.fit(X_train, y_train)
    fitted_models[name] = search.best_estimator_
    cv_scores[name] = search.best_score_
    best_parameters[name] = search.best_params_
    print(f"{name}: CV ROC-AUC={search.best_score_:.4f}")

ensemble_candidates = sorted(
    searches,
    key=lambda model_name: cv_scores[model_name],
    reverse=True,
)[:3]
ensemble = VotingClassifier(
    estimators=[
        (
            f"model_{index}",
            clone(fitted_models[model_name]),
        )
        for index, model_name in enumerate(ensemble_candidates)
    ],
    voting="soft",
    n_jobs=-1,
)
cv_scores["Soft Voting Ensemble"] = cross_val_score(
    ensemble,
    X_train,
    y_train,
    scoring="roc_auc",
    cv=cv,
    n_jobs=-1,
).mean()
ensemble.fit(X_train, y_train)
fitted_models["Soft Voting Ensemble"] = ensemble
best_parameters["Soft Voting Ensemble"] = {
    "members": ensemble_candidates,
    "voting": "soft",
}
print(
    "Soft Voting Ensemble:",
    ensemble_candidates,
    f"CV ROC-AUC={cv_scores['Soft Voting Ensemble']:.4f}",
)

def prepare_ydf_frame(frame, target=None):
    result = frame.copy()
    for column in categorical_features:
        result[column] = result[column].astype("string").fillna("Unknown")
    result["Pclass"] = "Class_" + result["Pclass"]
    if target is not None:
        result["Survived"] = np.asarray(target, dtype=int)
    return result


def ydf_cross_validated_auc(learner_factory):
    fold_scores = []
    for train_idx, valid_idx in cv.split(X_train, y_train):
        fold_age_imputer = GroupedAgeImputer().fit(X_train.iloc[train_idx])
        fold_train_features = fold_age_imputer.transform(
            X_train.iloc[train_idx]
        )
        fold_valid_features = fold_age_imputer.transform(
            X_train.iloc[valid_idx]
        )
        fold_train = prepare_ydf_frame(
            fold_train_features,
            y_train.iloc[train_idx],
        )
        fold_valid = prepare_ydf_frame(fold_valid_features)
        fold_model = learner_factory().train(fold_train)
        fold_probability = fold_model.predict(fold_valid)
        fold_scores.append(
            roc_auc_score(y_train.iloc[valid_idx], fold_probability)
        )
    return float(np.mean(fold_scores))


ydf_factories = {
    "YDF Random Forest": lambda: ydf.RandomForestLearner(
        label="Survived",
        num_trees=300,
        random_seed=RANDOM_STATE,
    ),
    "YDF Gradient Boosted Trees": lambda: ydf.GradientBoostedTreesLearner(
        label="Survived",
        num_trees=300,
        max_depth=4,
        shrinkage=0.05,
        random_seed=RANDOM_STATE,
    ),
}
for name, factory in ydf_factories.items():
    cv_scores[name] = ydf_cross_validated_auc(factory)
    ydf_age_imputer = GroupedAgeImputer().fit(X_train)
    ydf_train = ydf_age_imputer.transform(X_train)
    ydf_model = factory().train(prepare_ydf_frame(ydf_train, y_train))
    fitted_models[name] = (ydf_age_imputer, ydf_model)
    best_parameters[name] = {"protocol": "fixed reproducible configuration"}
    print(f"{name}: CV ROC-AUC={cv_scores[name]:.4f}")

def build_neural_network(input_width):
    model = tf.keras.Sequential([
        tf.keras.layers.Input(shape=(input_width,)),
        tf.keras.layers.Dense(64, activation="relu"),
        tf.keras.layers.Dropout(0.25),
        tf.keras.layers.Dense(32, activation="relu"),
        tf.keras.layers.Dropout(0.20),
        tf.keras.layers.Dense(1, activation="sigmoid"),
    ])
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
        loss="binary_crossentropy",
        metrics=[tf.keras.metrics.AUC(name="auc")],
    )
    return model


nn_fold_scores = []
for fold_number, (train_idx, valid_idx) in enumerate(cv.split(X_train, y_train), 1):
    fold_age_imputer = GroupedAgeImputer().fit(X_train.iloc[train_idx])
    fold_train_features = fold_age_imputer.transform(
        X_train.iloc[train_idx]
    )
    fold_valid_features = fold_age_imputer.transform(
        X_train.iloc[valid_idx]
    )
    fold_preprocessor = clone(preprocessor)
    fold_X_train = fold_preprocessor.fit_transform(fold_train_features)
    fold_X_valid = fold_preprocessor.transform(fold_valid_features)
    tf.keras.backend.clear_session()
    tf.keras.utils.set_random_seed(RANDOM_STATE + fold_number)
    fold_model = build_neural_network(fold_X_train.shape[1])
    fold_model.fit(
        fold_X_train,
        y_train.iloc[train_idx],
        validation_data=(fold_X_valid, y_train.iloc[valid_idx]),
        epochs=100,
        batch_size=32,
        callbacks=[
            tf.keras.callbacks.EarlyStopping(
                monitor="val_loss",
                patience=10,
                restore_best_weights=True,
            )
        ],
        verbose=0,
    )
    fold_probability = fold_model.predict(fold_X_valid, verbose=0).ravel()
    nn_fold_scores.append(
        roc_auc_score(y_train.iloc[valid_idx], fold_probability)
    )

nn_age_imputer = GroupedAgeImputer().fit(X_train)
nn_train_features = nn_age_imputer.transform(X_train)
nn_holdout_features = nn_age_imputer.transform(X_holdout)
nn_preprocessor = clone(preprocessor)
nn_X_train = nn_preprocessor.fit_transform(nn_train_features)
nn_X_holdout = nn_preprocessor.transform(nn_holdout_features)
tf.keras.backend.clear_session()
tf.keras.utils.set_random_seed(RANDOM_STATE)
nn_model = build_neural_network(nn_X_train.shape[1])
nn_history = nn_model.fit(
    nn_X_train,
    y_train,
    validation_split=0.15,
    epochs=100,
    batch_size=32,
    callbacks=[
        tf.keras.callbacks.EarlyStopping(
            monitor="val_loss",
            patience=10,
            restore_best_weights=True,
        )
    ],
    verbose=0,
)
cv_scores["TensorFlow Neural Net"] = float(np.mean(nn_fold_scores))
fitted_models["TensorFlow Neural Net"] = (
    nn_age_imputer,
    nn_preprocessor,
    nn_model,
)
best_parameters["TensorFlow Neural Net"] = {
    "architecture": "Dense(64)-Dropout-Dense(32)-Dropout-Sigmoid",
    "early_stopping": True,
}
print(f"TensorFlow Neural Net: CV ROC-AUC={np.mean(nn_fold_scores):.4f}")

def probability_for(name, model, frame):
    if name.startswith("YDF"):
        fitted_age_imputer, fitted_ydf = model
        imputed_frame = fitted_age_imputer.transform(frame)
        return fitted_ydf.predict(prepare_ydf_frame(imputed_frame))
    if name == "TensorFlow Neural Net":
        fitted_age_imputer, fitted_preprocessor, fitted_network = model
        imputed_frame = fitted_age_imputer.transform(frame)
        matrix = fitted_preprocessor.transform(imputed_frame)
        return fitted_network.predict(matrix, verbose=0).ravel()
    return model.predict_proba(frame)[:, 1]


comparison_rows = []
holdout_probabilities = {}
for name, model in fitted_models.items():
    probability = np.asarray(probability_for(name, model, X_holdout))
    prediction = (probability >= 0.5).astype(int)
    holdout_probabilities[name] = probability
    comparison_rows.append({
        "Model": name,
        "CV ROC-AUC": cv_scores[name],
        "Holdout Accuracy": accuracy_score(y_holdout, prediction),
        "Balanced Accuracy": balanced_accuracy_score(y_holdout, prediction),
        "Precision": precision_score(y_holdout, prediction, zero_division=0),
        "Recall": recall_score(y_holdout, prediction, zero_division=0),
        "F1": f1_score(y_holdout, prediction, zero_division=0),
        "Holdout ROC-AUC": roc_auc_score(y_holdout, probability),
        "Log Loss": log_loss(y_holdout, probability),
        "Parameters": best_parameters[name],
    })

comparison_df = (
    pd.DataFrame(comparison_rows)
    .sort_values("CV ROC-AUC", ascending=False)
    .reset_index(drop=True)
)
display(comparison_df.round(4))

fig, axes = plt.subplots(1, 2, figsize=(16, 6))
sns.barplot(
    data=comparison_df,
    y="Model",
    x="CV ROC-AUC",
    color="#2563eb",
    ax=axes[0],
)
axes[0].set_xlim(0.5, 1.0)
axes[0].set_title("Mean 5-fold training CV ROC-AUC")
for name, probability in holdout_probabilities.items():
    RocCurveDisplay.from_predictions(
        y_holdout,
        probability,
        name=name,
        ax=axes[1],
    )
axes[1].plot([0, 1], [0, 1], "k--", alpha=0.5)
axes[1].set_title("Untouched holdout ROC curves")
plt.tight_layout()
plt.show()

selected_name = comparison_df.iloc[0]["Model"]
selected_probability = holdout_probabilities[selected_name]
selected_prediction = (selected_probability >= 0.5).astype(int)
ConfusionMatrixDisplay.from_predictions(
    y_holdout,
    selected_prediction,
    display_labels=["Died", "Survived"],
    cmap="Blues",
)
plt.title(f"Holdout confusion matrix: {selected_name}")
plt.show()
print("Selected by CV ROC-AUC:", selected_name)

regression_rows = train_features[["Age", "Pclass", "SibSp", "Parch", "Fare"]].dropna()
reg_X = regression_rows[["Age", "Pclass", "SibSp", "Parch"]]
reg_y = np.log1p(regression_rows["Fare"])
reg_X_train, reg_X_test, reg_y_train, reg_y_test = train_test_split(
    reg_X,
    reg_y,
    test_size=0.20,
    random_state=RANDOM_STATE,
)
fare_regression = Pipeline([
    ("imputer", SimpleImputer(strategy="median")),
    ("scaler", StandardScaler()),
    ("model", LinearRegression()),
])
fare_regression.fit(reg_X_train, reg_y_train)
reg_prediction = fare_regression.predict(reg_X_test)
print("Log-fare MAE:", round(mean_absolute_error(reg_y_test, reg_prediction), 4))
print("Log-fare RMSE:", round(mean_squared_error(reg_y_test, reg_prediction) ** 0.5, 4))
print("Log-fare R2:", round(r2_score(reg_y_test, reg_prediction), 4))

cluster_features = train_features[["Age", "Fare", "Pclass", "FamilySize"]]
cluster_pipeline = Pipeline([
    ("imputer", SimpleImputer(strategy="median")),
    ("scaler", StandardScaler()),
    ("kmeans", KMeans(n_clusters=3, random_state=RANDOM_STATE, n_init=20)),
])
passenger_clusters = cluster_pipeline.fit_predict(cluster_features)
cluster_summary = (
    train_features.assign(Cluster=passenger_clusters)
    .groupby("Cluster")[["Age", "Fare", "Pclass", "FamilySize", "Survived"]]
    .mean()
    .round(3)
)
display(cluster_summary)

anomaly_features = train_features[["Age", "Fare", "FamilySize", "Pclass"]]
anomaly_preprocessor = Pipeline([
    ("imputer", SimpleImputer(strategy="median")),
    ("scaler", StandardScaler()),
])
anomaly_matrix = anomaly_preprocessor.fit_transform(anomaly_features)
detector = IsolationForest(
    n_estimators=300,
    contamination=0.03,
    random_state=RANDOM_STATE,
)
anomaly_flag = detector.fit_predict(anomaly_matrix)
anomaly_score = -detector.score_samples(anomaly_matrix)
anomaly_report = train_df[["PassengerId", "Pclass", "Age", "Fare"]].copy()
anomaly_report["AnomalyScore"] = anomaly_score
anomaly_report["Flagged"] = anomaly_flag == -1
display(anomaly_report.sort_values("AnomalyScore", ascending=False).head(10))

print("Security checklist:")
print("- prevent target and future-data leakage")
print("- validate inputs and preserve data lineage")
print("- evaluate false positives and false negatives")
print("- monitor drift, abuse, and adversarial manipulation")
print("- keep a human review path for high-impact alerts")

X_all = train_features[feature_columns]
y_all = train_features["Survived"].astype(int)
X_kaggle_test = test_features[feature_columns]

if selected_name.startswith("YDF"):
    selected_factory = ydf_factories[selected_name]
    final_age_imputer = GroupedAgeImputer().fit(X_all)
    final_train = final_age_imputer.transform(X_all)
    final_test = final_age_imputer.transform(X_kaggle_test)
    final_model = selected_factory().train(
        prepare_ydf_frame(final_train, y_all)
    )
    test_probability = final_model.predict(prepare_ydf_frame(final_test))
elif selected_name == "TensorFlow Neural Net":
    final_age_imputer = GroupedAgeImputer().fit(X_all)
    final_train = final_age_imputer.transform(X_all)
    final_test = final_age_imputer.transform(X_kaggle_test)
    final_preprocessor = clone(preprocessor)
    final_X = final_preprocessor.fit_transform(final_train)
    final_test_X = final_preprocessor.transform(final_test)
    tf.keras.backend.clear_session()
    tf.keras.utils.set_random_seed(RANDOM_STATE)
    final_model = build_neural_network(final_X.shape[1])
    final_model.fit(
        final_X,
        y_all,
        validation_split=0.15,
        epochs=100,
        batch_size=32,
        callbacks=[
            tf.keras.callbacks.EarlyStopping(
                monitor="val_loss",
                patience=10,
                restore_best_weights=True,
            )
        ],
        verbose=0,
    )
    test_probability = final_model.predict(final_test_X, verbose=0).ravel()
else:
    final_model = clone(fitted_models[selected_name])
    final_model.fit(X_all, y_all)
    test_probability = final_model.predict_proba(X_kaggle_test)[:, 1]

submission = pd.DataFrame({
    "PassengerId": test_df["PassengerId"],
    "Survived": (np.asarray(test_probability) >= 0.5).astype(int),
})
output_dir = "../submissions" if os.path.isdir("../kaggle") else "submissions"
os.makedirs(output_dir, exist_ok=True)
submission_path = os.path.join(output_dir, "submission_model_comparison.csv")
submission.to_csv(submission_path, index=False)
comparison_df.to_json(
    os.path.join(output_dir, "model_comparison_metrics.json"),
    orient="records",
    indent=2,
)
print("Saved:", submission_path)
display(submission.head())
