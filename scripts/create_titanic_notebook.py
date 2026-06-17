from pathlib import Path
import json
import textwrap

PROJECT_ROOT = Path(__file__).resolve().parents[1]
NOTEBOOK_PATH = PROJECT_ROOT / "notebooks" / "Titanic_Data_to_Discovery.ipynb"
PUBLIC_NOTEBOOK_PATH = PROJECT_ROOT / "public" / "notebooks" / "Titanic_Data_to_Discovery.ipynb"

def clean_source(text):
    dedented = textwrap.dedent(text).strip()
    lines = dedented.splitlines()
    return [line + "\n" for line in lines]

def make_md_cell(text):
    return {
        "cell_type": "markdown",
        "metadata": {},
        "source": clean_source(text)
    }

def make_code_cell(text):
    return {
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": clean_source(text)
    }

def build_notebook():
    notebook = {
        "cells": [
            make_md_cell(
                """
                # From Data to Discovery — Lessons from the Titanic Project

                **Main theme:** Python transforms raw historical data into insight, prediction, and learning.

                This notebook presents a systematic data science case study using the Titanic passenger dataset. The Titanic is a historical dataset and a strong learning case because it combines human context, incomplete records, social structure, and a clear predictive classification question.

                **Core workflow:**
                ```text
                Load Data → Clean Data → Explore → Feature Engineer → Custom Imputation → Split → Preprocessing Pipeline → GridSearchCV Model Search → Evaluation & ROC → Odds Coefficients → Predictions
                ```
                """
            ),
            make_md_cell(
                """
                ## 1. Environment and Library Setup

                The notebook uses the standard Python data science stack: NumPy, Pandas, Matplotlib, Seaborn, and Scikit-Learn.
                All package imports (including regular expressions `re` for title parsing and cross-validated searches) are declared in this initial cell to prepare the notebook for running in Google Colab cleanly.
                """
            ),
            make_code_cell(
                """
                import re
                import numpy as np
                import pandas as pd
                import matplotlib.pyplot as plt
                import seaborn as sns

                from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV, StratifiedKFold
                from sklearn.base import BaseEstimator, TransformerMixin
                from sklearn.pipeline import Pipeline
                from sklearn.compose import ColumnTransformer
                from sklearn.impute import SimpleImputer
                from sklearn.preprocessing import StandardScaler, OneHotEncoder
                from sklearn.linear_model import LogisticRegression
                from sklearn.ensemble import RandomForestClassifier
                from sklearn.metrics import accuracy_score, confusion_matrix, classification_report, roc_auc_score, roc_curve
                from sklearn import set_config

                set_config(display="diagram")
                sns.set_theme(style="whitegrid")
                plt.rcParams["figure.figsize"] = (10, 6)
                plt.rcParams["figure.dpi"] = 120
                """
            ),
            make_md_cell(
                """
                ## 2. Dataset Ingestion

                This notebook uses the complete OpenML Titanic dataset with 1,309 rows as the main dataset.
                """
            ),
            make_code_cell(
                """
                url = "https://www.openml.org/data/get_csv/16826755/phpMYEkMl"
                df = pd.read_csv(url)

                display(df.head())
                print("Shape:", df.shape)
                df.info()
                """
            ),
            make_md_cell(
                """
                ## 3. Column Cleaning and Data Dictionary

                Column names are normalized to lowercase and punctuation is simplified. OpenML stores some missing values as `?`, so those placeholders are converted to real missing values before analysis.

                **Leakage warning:** Do not use `boat` or `body` as model features. They are post-disaster indicators and would leak the target class, causing overfitting and model failure.
                """
            ),
            make_code_cell(
                """
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
                    df[numeric_column] = pd.to_numeric(df[numeric_column], errors="coerce")

                display(pd.DataFrame({"columns": df.columns}))
                display(df.head())
                """
            ),
            make_md_cell(
                """
                ## 4. Missing Value Analysis

                Clean data is the foundation of truth. Missing `age`, `cabin`, `embarked`, and `fare` values must be handled carefully.
                """
            ),
            make_code_cell(
                """
                missing = (
                    pd.DataFrame({
                        "missing_count": df.isna().sum(),
                        "missing_percent": (df.isna().mean() * 100).round(2),
                    })
                    .query("missing_count > 0")
                    .sort_values("missing_percent", ascending=False)
                )

                display(missing)
                """
            ),
            make_md_cell("## 5. Exploratory Data Analysis"),
            make_md_cell("### Survival Count"),
            make_code_cell(
                """
                ax = sns.countplot(data=df, x="survived", hue="survived", palette=["#8b1e3f", "#1877f2"], legend=False)
                ax.set_title("Survival Count")
                ax.set_xlabel("Survived")
                ax.set_ylabel("Passenger Count")
                ax.set_xticks([0, 1])
                ax.set_xticklabels(["Not Survived (0)", "Survived (1)"])
                plt.show()
                """
            ),
            make_md_cell("### Survival by Sex"),
            make_code_cell(
                """
                ax = sns.countplot(data=df, x="sex", hue="survived", palette=["#8b1e3f", "#1877f2"])
                ax.set_title("Survival by Sex")
                ax.set_xlabel("Sex")
                ax.set_ylabel("Passenger Count")
                ax.legend(title="Survived", labels=["Not Survived", "Survived"])
                plt.show()
                """
            ),
            make_md_cell("### Survival by Passenger Class"),
            make_code_cell(
                """
                ax = sns.countplot(data=df, x="pclass", hue="survived", palette=["#8b1e3f", "#1877f2"])
                ax.set_title("Survival by Passenger Class")
                ax.set_xlabel("Passenger Class")
                ax.set_ylabel("Passenger Count")
                ax.legend(title="Survived", labels=["Not Survived", "Survived"])
                plt.show()
                """
            ),
            make_md_cell("### Survival by Sex and Passenger Class"),
            make_code_cell(
                """
                ax = sns.catplot(
                    data=df,
                    x="pclass",
                    y="survived",
                    hue="sex",
                    kind="bar",
                    errorbar=None,
                    palette=["#1877f2", "#8b1e3f"],
                    height=5,
                    aspect=1.5,
                )
                ax.set_axis_labels("Passenger Class", "Mean Survival Rate")
                ax.fig.suptitle("Survival Rate by Sex and Passenger Class", y=1.03)
                plt.show()
                """
            ),
            make_md_cell("### Age Distribution by Survival"),
            make_code_cell(
                """
                ax = sns.kdeplot(
                    data=df,
                    x="age",
                    hue="survived",
                    fill=True,
                    common_norm=False,
                    alpha=0.35,
                    palette=["#8b1e3f", "#1877f2"],
                )
                ax.set_title("Age Distribution by Survival")
                ax.set_xlabel("Age")
                plt.show()
                """
            ),
            make_md_cell("### Fare Distribution by Survival"),
            make_code_cell(
                """
                df_plot = df.copy()
                df_plot["fare_log1p"] = np.log1p(df_plot["fare"])

                ax = sns.boxplot(data=df_plot, x="survived", y="fare_log1p", hue="survived", palette=["#8b1e3f", "#1877f2"], legend=False)
                ax.set_title("Log-Transformed Fare Distribution by Survival")
                ax.set_xlabel("Survived")
                ax.set_ylabel("log1p(Fare)")
                ax.set_xticks([0, 1])
                ax.set_xticklabels(["Not Survived (0)", "Survived (1)"])
                plt.show()
                """
            ),
            make_md_cell("### Embarked vs Survival"),
            make_code_cell(
                """
                ax = sns.countplot(data=df, x="embarked", hue="survived", palette=["#8b1e3f", "#1877f2"])
                ax.set_title("Embarked vs Survival")
                ax.set_xlabel("Embarked")
                ax.set_ylabel("Passenger Count")
                ax.legend(title="Survived", labels=["Not Survived", "Survived"])
                plt.show()
                """
            ),
            make_md_cell("### Correlation Heatmap"),
            make_code_cell(
                """
                corr_df = df[["survived", "pclass", "sex", "age", "sibsp", "parch", "fare", "embarked"]].copy()
                corr_df["sex"] = corr_df["sex"].astype("category").cat.codes
                corr_df["embarked"] = corr_df["embarked"].astype("category").cat.codes

                corr = corr_df.corr(numeric_only=True)

                ax = sns.heatmap(corr, annot=True, cmap="coolwarm", center=0, fmt=".2f", square=True)
                ax.set_title("Correlation Heatmap")
                plt.show()
                """
            ),
            make_md_cell(
                """
                ## 6. Feature Engineering Transformer

                We build a custom Scikit-Learn transformer class `TitanicFeatureEngineer` to perform feature engineering.
                This creates family features (`family_size`, `is_alone`), extracts names `title` using regular expressions, and sets cabin indicators (`has_cabin`) while cleanly dropping leakage and string variables.
                """
            ),
            make_code_cell(
                """
                class TitanicFeatureEngineer(BaseEstimator, TransformerMixin):
                    \"\"\"Create leakage-safe Titanic model features inside the pipeline.\"\"\"
                    def fit(self, X, y=None):
                        return self

                    def transform(self, X):
                        X_out = X.copy()
                        X_out["family_size"] = X_out["sibsp"] + X_out["parch"] + 1
                        X_out["is_alone"] = (X_out["family_size"] == 1).astype(int)

                        def extract_title(name):
                            if not isinstance(name, str):
                                return "Mr"
                            match = re.search(r",\\s*([^\\.]+)\\.", name)
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
                """
            ),
            make_md_cell(
                """
                ## 7. Custom Imputation (Leakage-Safe)

                Simple global median imputation ignores passenger demographics. We create a custom `GroupMedianAgeImputer` class that computes median age grouped by passenger class and gender, fitting only on the training folds during cross-validation to prevent data leakage.
                """
            ),
            make_code_cell(
                """
                class GroupMedianAgeImputer(BaseEstimator, TransformerMixin):
                    \"\"\"Impute missing age from training-fold medians grouped by pclass and sex.\"\"\"
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
                """
            ),
            make_md_cell(
                """
                ## 8. Train/Test Split

                We perform a stratified 80-20 partition (`stratify=y`) to split feature attributes and survival targets.
                """
            ),
            make_code_cell(
                """
                features = ["pclass", "sex", "age", "sibsp", "parch", "fare", "embarked", "cabin", "name"]
                X = df.drop(columns=["survived"])
                y = df["survived"].astype(int)

                X_train, X_test, y_train, y_test = train_test_split(
                    X, y, test_size=0.20, random_state=42, stratify=y
                )
                print("Train shape:", X_train.shape, "| Test shape:", X_test.shape)
                """
            ),
            make_md_cell(
                """
                ## 9. Preprocessing Pipeline

                We build a `ColumnTransformer` preprocessing pipeline mapping standard numeric and categorical features.
                """
            ),
            make_code_cell(
                """
                numeric_features = ["age", "sibsp", "parch", "fare", "family_size"]
                categorical_features = ["pclass", "sex", "embarked", "is_alone", "title", "has_cabin"]

                numeric_pipeline = Pipeline(steps=[
                    ("imputer", SimpleImputer(strategy="median")),
                    ("scaler", StandardScaler())
                ])

                categorical_pipeline = Pipeline(steps=[
                    ("imputer", SimpleImputer(strategy="most_frequent")),
                    ("encoder", OneHotEncoder(handle_unknown="ignore", drop="first"))
                ])

                preprocessor = ColumnTransformer(transformers=[
                    ("num", numeric_pipeline, numeric_features),
                    ("cat", categorical_pipeline, categorical_features)
                ])
                """
            ),
            make_md_cell(
                """
                ## 10. GridSearchCV Model Search

                We set up a grid search searching over Logistic Regression hyper-parameters to find the optimal C regularization parameter.
                """
            ),
            make_code_cell(
                """
                base_pipeline = Pipeline(steps=[
                    ("group_age_imputer", GroupMedianAgeImputer()),
                    ("feature_engineer", TitanicFeatureEngineer()),
                    ("preprocess", preprocessor),
                    ("classifier", LogisticRegression(max_iter=1000, solver="liblinear", random_state=42))
                ])

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

                print("GridSearchCV model search complete.")
                print("Best params:", grid_search.best_params_)
                print(f"Best cross-validation accuracy: {grid_search.best_score_:.4f}")
                """
            ),
            make_md_cell(
                """
                ## 11. Model Evaluation & ROC Curve

                We predict outcomes on the holdout test set using the chosen optimal pipeline and generate accuracy metrics, classification reports, and the ROC curve.
                """
            ),
            make_code_cell(
                """
                best_pipeline = grid_search.best_estimator_
                y_pred = best_pipeline.predict(X_test)
                y_proba = best_pipeline.predict_proba(X_test)[:, 1]

                print(f"Holdout Test Accuracy: {accuracy_score(y_test, y_pred):.4f}")
                print(f"ROC-AUC score: {roc_auc_score(y_test, y_proba):.4f}")
                print("\\nConfusion Matrix:\\n", confusion_matrix(y_test, y_pred))
                print("\\nClassification Report:\\n", classification_report(y_test, y_pred))

                fpr, tpr, _ = roc_curve(y_test, y_proba)
                plt.figure(figsize=(7, 5))
                plt.plot(fpr, tpr, color="darkorange", lw=2, label=f"ROC Curve (AUC = {roc_auc_score(y_test, y_proba):.3f})")
                plt.plot([0, 1], [0, 1], color="navy", lw=1.5, linestyle="--")
                plt.xlim([0.0, 1.0])
                plt.ylim([0.0, 1.05])
                plt.xlabel("False Positive Rate")
                plt.ylabel("True Positive Rate")
                plt.title("Receiver Operating Characteristic (ROC) Curve")
                plt.legend(loc="lower right")
                plt.show()

                def predict_and_print(passenger_df, pipeline_model):
                    \"\"\"Predict survival outcome and probability for passenger scenarios and print in tabular format.\"\"\"
                    prediction = pipeline_model.predict(passenger_df)
                    probability = pipeline_model.predict_proba(passenger_df)[:, 1]
                    
                    for idx, row in passenger_df.iterrows():
                        outcome = "SURVIVES" if prediction[idx] == 1 else "NOT SURVIVED"
                        print(f"Passenger: {row['name']:<30} | Class: {row['pclass']} | Sex: {row['sex']:<6} | Probability: {probability[idx]:.4f} ({probability[idx]*100:.1f}%) | Prediction: {outcome}")
                """
            ),
            make_md_cell(
                """
                ## 12. Pipeline Diagram

                Displaying the Scikit-Learn visual block diagram of the optimal pipeline.
                """
            ),
            make_code_cell(
                """
                best_pipeline
                """
            ),
            make_md_cell(
                """
                ## 13. Log-Odds Coefficients

                Displaying feature importances or logistic regression log-odds parameters mapping the direction of influence.
                """
            ),
            make_code_cell(
                """
                preprocess_step = best_pipeline.named_steps["preprocess"]
                encoded_feature_names = preprocess_step.get_feature_names_out()
                classifier = best_pipeline.named_steps["classifier"]

                if isinstance(classifier, LogisticRegression):
                    interpretation = pd.DataFrame({
                        "Feature": encoded_feature_names,
                        "Coefficient": classifier.coef_[0],
                        "Odds Ratio": np.exp(classifier.coef_[0]),
                    }).sort_values("Coefficient", ascending=False)
                    display(interpretation)
                else:
                    interpretation = pd.DataFrame({
                        "Feature": encoded_feature_names,
                        "Importance": classifier.feature_importances_
                    }).sort_values("Importance", ascending=False)
                    display(interpretation)
                """
            ),
            make_md_cell(
                """
                ## 14. Economic and Real-World Relevance

                The Titanic workflow is universal and applies to modern business categorization needs:
                - **Financial risk:** default vs non-default credit underwriting.
                - **Disaster response:** locating high-risk zones.
                - **Insurance analytics:** evaluating claims.
                - **Healthcare triage:** prioritizing patient support.
                """
            ),
            make_md_cell(
                """
                ## 15. Data Science Mindset

                - Ask the right questions before coding.
                - Clean data is the foundation of truth.
                - Visualize to understand.
                - Model to predict.
                - Communicate to inspire.
                """
            ),
            make_md_cell(
                """
                ## 16. Final Reflection

                The Titanic dataset shows that data represents human stories, social structures, and survival outcomes.
                Data science is not only coding — it is about asking questions, cleaning carefully, modeling responsibly, and communicating insight.
                """
            ),
            make_md_cell(
                """
                ## 17. Passenger Predictions & Custom Colab Test Sandbox

                Evaluating custom passenger scenarios matching the Jupyter notebook showcase profiles.
                You can also copy the custom passenger Python script from the companion website sandbox and paste it into the code cell below to run predictions live!
                """
            ),
            make_code_cell(
                """
                # Setup model variable so copied code runs out-of-the-box
                model = best_pipeline

                custom_passengers = pd.DataFrame([
                    {"pclass": 3, "sex": "male", "age": 22.0, "sibsp": 0, "parch": 0, "fare": 7.25, "embarked": "S", "cabin": np.nan, "name": "Single, Mr. Third Class"},
                    {"pclass": 1, "sex": "female", "age": 38.0, "sibsp": 1, "parch": 0, "fare": 71.28, "embarked": "C", "cabin": "C85", "name": "Married, Mrs. First Class"},
                    {"pclass": 2, "sex": "male", "age": 6.0, "sibsp": 1, "parch": 1, "fare": 26.00, "embarked": "S", "cabin": np.nan, "name": "Child, Master. Second Class"}
                ])

                print("LIVE SIMULATION PREDICTIONS")
                print("=" * 60)
                predict_and_print(custom_passengers, model)

                # ==============================================================================
                # CUSTOM COLAB SANDBOX
                # Paste the custom passenger script copied from the website sandbox below:
                # ==============================================================================
                
                """
            ),
        ],
        "metadata": {
            "kernelspec": {
                "display_name": "Python 3",
                "language": "python",
                "name": "python3"
            },
            "language_info": {
                "name": "python",
                "pygments_lexer": "ipython3"
            },
            "colab": {
                "name": "Titanic_Data_to_Discovery.ipynb",
                "provenance": []
            }
        },
        "nbformat": 4,
        "nbformat_minor": 5
    }
    return notebook

def main():
    NOTEBOOK_PATH.parent.mkdir(parents=True, exist_ok=True)
    PUBLIC_NOTEBOOK_PATH.parent.mkdir(parents=True, exist_ok=True)
    notebook = build_notebook()
    
    with open(NOTEBOOK_PATH, "w", encoding="utf-8") as f:
        json.dump(notebook, f, indent=1, ensure_ascii=False)
    print(f"Notebook created at: {NOTEBOOK_PATH}")

    with open(PUBLIC_NOTEBOOK_PATH, "w", encoding="utf-8") as f:
        json.dump(notebook, f, indent=1, ensure_ascii=False)
    print(f"Notebook created at: {PUBLIC_NOTEBOOK_PATH}")

if __name__ == "__main__":
    main()
