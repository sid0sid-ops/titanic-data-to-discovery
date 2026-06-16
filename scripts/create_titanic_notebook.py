from pathlib import Path
import textwrap

import nbformat as nbf


PROJECT_ROOT = Path(__file__).resolve().parents[1]
NOTEBOOK_PATH = PROJECT_ROOT / "notebooks" / "Titanic_Data_to_Discovery.ipynb"
ADVANCED_SCRIPT_PATH = PROJECT_ROOT / "scripts" / "advanced_titanic_colab_showcase.py"


def md(source: str):
    return nbf.v4.new_markdown_cell(textwrap.dedent(source).strip())


def code(source: str):
    return nbf.v4.new_code_cell(textwrap.dedent(source).strip())


def build_notebook():
    nb = nbf.v4.new_notebook()
    nb["metadata"] = {
        "kernelspec": {
            "display_name": "Python 3",
            "language": "python",
            "name": "python3",
        },
        "language_info": {
            "name": "python",
            "pygments_lexer": "ipython3",
        },
        "colab": {
            "name": "Titanic_Data_to_Discovery.ipynb",
            "provenance": [],
        },
    }

    cells = [
        md(
            """
            # From Data to Discovery — Lessons from the Titanic Project

            ## Project Introduction

            **Main theme:** Python transforms raw historical data into insight, prediction, and learning.

            This notebook presents an academic-style data science case study using the Titanic passenger dataset. The Titanic is a historical dataset and a strong learning case because it combines human context, incomplete records, social structure, and a clear predictive question.

            The task is **classification, not regression**:

            - `Survived = 0` means **Not Survived**
            - `Survived = 1` means **Survived**

            Regression predicts continuous numerical values. Classification predicts categories or labels. In this project, the model predicts whether a passenger belonged to the survived or not-survived class.

            **Core workflow:**

            ```text
            Load Data → Clean Data → Explore → Visualize → Model → Predict → Communicate
            ```

            This case study shows how Python libraries integrate seamlessly — from raw CSVs to predictive models — turning history into a learning tool.
            """
        ),
        md(
            """
            ## 1. Environment and Library Setup

            The notebook uses the standard Python data science stack: NumPy, Pandas, Matplotlib, Seaborn, and Scikit-Learn.
            """
        ),
        code(
            """
            import numpy as np
            import pandas as pd
            import matplotlib.pyplot as plt
            import seaborn as sns

            from sklearn.model_selection import train_test_split, cross_val_score
            from sklearn.pipeline import Pipeline
            from sklearn.compose import ColumnTransformer
            from sklearn.impute import SimpleImputer
            from sklearn.preprocessing import StandardScaler, OneHotEncoder
            from sklearn.linear_model import LogisticRegression
            from sklearn.metrics import accuracy_score, confusion_matrix, classification_report

            sns.set_theme(style="whitegrid")
            plt.rcParams["figure.figsize"] = (10, 6)
            plt.rcParams["figure.dpi"] = 120
            """
        ),
        md(
            """
            ## 2. Dataset Loading

            This notebook uses the more complete OpenML Titanic dataset with 1,309 rows as the main dataset.

            Main dataset:

            ```text
            https://www.openml.org/data/get_csv/16826755/phpMYEkMl
            ```

            Alternative datasets:

            - DataScienceDojo/Kaggle-style 891-row CSV: `https://raw.githubusercontent.com/datasciencedojo/datasets/master/titanic.csv`
            - Seaborn Titanic 891-row CSV: `https://raw.githubusercontent.com/mwaskom/seaborn-data/master/titanic.csv`
            """
        ),
        code(
            """
            url = "https://www.openml.org/data/get_csv/16826755/phpMYEkMl"
            df = pd.read_csv(url)

            display(df.head())
            print("Shape:", df.shape)
            df.info()
            """
        ),
        md(
            """
            ## 3. Column Cleaning and Data Dictionary

            Column names are normalized to lowercase and punctuation is simplified. OpenML stores some missing values as `?`, so those placeholders are converted to real missing values before analysis.

            Important columns:

            - `survived`: target variable; 0 = not survived, 1 = survived.
            - `pclass`: passenger class.
            - `name`: passenger name; useful for title extraction.
            - `sex`: passenger sex.
            - `age`: passenger age.
            - `sibsp`: number of siblings or spouses aboard.
            - `parch`: number of parents or children aboard.
            - `ticket`: ticket identifier.
            - `fare`: passenger fare.
            - `cabin`: cabin information.
            - `embarked`: port of embarkation.
            - `boat`: lifeboat information.
            - `body`: recovered body identifier.
            - `home_dest`: home or destination field.

            **Leakage warning:** Do not use `boat` or `body` as model features. They are post-disaster information and would leak the answer into the model.
            """
        ),
        code(
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
        md(
            """
            ## 4. Missing Value Analysis

            Clean data is the foundation of truth. Missing `age`, `cabin`, `embarked`, and `fare` values must be handled carefully because careless imputation can distort model behavior.
            """
        ),
        code(
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
        md("## 5. Exploratory Data Analysis"),
        md("### Survival Count"),
        code(
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
        md("The survival count gives the baseline distribution of the target classes before modeling."),
        md("### Survival by Sex"),
        code(
            """
            ax = sns.countplot(data=df, x="sex", hue="survived", palette=["#8b1e3f", "#1877f2"])
            ax.set_title("Survival by Sex")
            ax.set_xlabel("Sex")
            ax.set_ylabel("Passenger Count")
            ax.legend(title="Survived", labels=["Not Survived", "Survived"])
            plt.show()
            """
        ),
        md("Female passengers had higher survival rates in the Titanic data."),
        md("### Survival by Passenger Class"),
        code(
            """
            ax = sns.countplot(data=df, x="pclass", hue="survived", palette=["#8b1e3f", "#1877f2"])
            ax.set_title("Survival by Passenger Class")
            ax.set_xlabel("Passenger Class")
            ax.set_ylabel("Passenger Count")
            ax.legend(title="Survived", labels=["Not Survived", "Survived"])
            plt.show()
            """
        ),
        md("First-class passengers had higher survival rates, showing the importance of class and access."),
        md("### Survival by Sex and Passenger Class"),
        code(
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
        md("Gender and class strongly influenced survival, and their interaction is important for interpretation."),
        md("### Age Distribution by Survival"),
        code(
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
        md("Age helps reveal human patterns, including the different survival context of children and older passengers."),
        md("### Fare Distribution by Survival"),
        code(
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
        md("Fare is skewed, so `log1p` makes the distribution easier to compare. Fare also reflects economic structure."),
        md("### Embarked vs Survival"),
        code(
            """
            ax = sns.countplot(data=df, x="embarked", hue="survived", palette=["#8b1e3f", "#1877f2"])
            ax.set_title("Embarked vs Survival")
            ax.set_xlabel("Embarked")
            ax.set_ylabel("Passenger Count")
            ax.legend(title="Survived", labels=["Not Survived", "Survived"])
            plt.show()
            """
        ),
        md("Embarkation patterns can reflect class composition and other social factors rather than geography alone."),
        md("### Correlation Heatmap"),
        code(
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
        md("The heatmap summarizes broad numerical associations. Data reveals human stories behind numbers, but correlations still require careful interpretation."),
        md(
            """
            ## 6. Feature Engineering

            Feature engineering turns raw fields into cleaner signals for modeling:

            - `family_size = sibsp + parch + 1`
            - `is_alone = 1` when the passenger traveled alone
            - `title` extracted from `name`
            - `has_cabin = 1` when a cabin was recorded
            """
        ),
        code(
            """
            df_model = df.copy()

            df_model["family_size"] = df_model["sibsp"] + df_model["parch"] + 1
            df_model["is_alone"] = np.where(df_model["family_size"] == 1, 1, 0)

            df_model["title"] = df_model["name"].str.extract(r",\\s*([^\\.]+)\\.", expand=False).str.strip()

            title_replacements = {
                "Mlle": "Miss",
                "Ms": "Miss",
                "Mme": "Mrs",
            }
            df_model["title"] = df_model["title"].replace(title_replacements)
            common_titles = ["Mr", "Mrs", "Miss", "Master"]
            df_model["title"] = np.where(df_model["title"].isin(common_titles), df_model["title"], "Rare")

            df_model["has_cabin"] = np.where(df_model["cabin"].notna(), 1, 0)

            display(df_model[["name", "title", "sibsp", "parch", "family_size", "is_alone", "cabin", "has_cabin"]].head())
            display(df_model["title"].value_counts())
            """
        ),
        md(
            """
            ## 7. Feature Selection

            The model uses pre-disaster passenger attributes and engineered features. It intentionally excludes leakage-prone and high-cardinality fields.

            Do **not** include:

            - `boat`
            - `body`
            - survived-derived features
            - `passengerid`
            - `name` directly
            - `ticket` directly
            - `cabin` directly
            """
        ),
        code(
            """
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

            display(X.head())
            display(y.value_counts(normalize=True).rename("class_proportion"))
            """
        ),
        md(
            """
            ## 8. Train/Test Split

            `stratify=y` preserves the survival class distribution in both the training and testing sets. This makes evaluation more reliable.
            """
        ),
        code(
            """
            X_train, X_test, y_train, y_test = train_test_split(
                X,
                y,
                test_size=0.20,
                random_state=42,
                stratify=y,
            )

            print("Training shape:", X_train.shape)
            print("Testing shape:", X_test.shape)
            print("\\nTraining class distribution:")
            display(y_train.value_counts(normalize=True).rename("train_proportion"))
            print("\\nTesting class distribution:")
            display(y_test.value_counts(normalize=True).rename("test_proportion"))
            """
        ),
        md("## 9. Scikit-Learn Preprocessing Pipeline"),
        code(
            """
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

            preprocessor
            """
        ),
        md("## 10. Logistic Regression Model"),
        code(
            """
            classifier = LogisticRegression(max_iter=1000, solver="liblinear", random_state=42)

            model = Pipeline(
                steps=[
                    ("preprocessor", preprocessor),
                    ("classifier", classifier),
                ]
            )

            model.fit(X_train, y_train)
            print("Model training complete.")
            """
        ),
        md(
            """
            ## 11. Prediction and Evaluation

            The following cells print the actual score produced by this notebook. No fixed accuracy is assumed in advance.
            """
        ),
        code(
            """
            y_pred = model.predict(X_test)
            y_prob = model.predict_proba(X_test)[:, 1]

            accuracy = accuracy_score(y_test, y_pred)
            cm = confusion_matrix(y_test, y_pred)
            report = classification_report(y_test, y_pred)
            cv_scores = cross_val_score(model, X, y, cv=5, scoring="accuracy")

            print(f"Test Accuracy: {accuracy:.4f}")
            print("\\nConfusion Matrix:")
            print(cm)
            print("\\nClassification Report:")
            print(report)
            print(f"5-Fold CV Accuracy Scores: {np.round(cv_scores, 4)}")
            print(f"Mean CV Accuracy: {cv_scores.mean():.4f}")
            print(f"CV Standard Deviation: {cv_scores.std():.4f}")
            """
        ),
        md(
            """
            A proper Titanic Logistic Regression pipeline commonly produces around **80–82% accuracy**, depending on dataset version, preprocessing, feature engineering, and random state.

            The value above is the actual score from this notebook run.
            """
        ),
        md("## 12. Confusion Matrix Visualization"),
        code(
            """
            cm_df = pd.DataFrame(
                cm,
                index=["Actual Not Survived", "Actual Survived"],
                columns=["Predicted Not Survived", "Predicted Survived"],
            )

            ax = sns.heatmap(cm_df, annot=True, fmt="d", cmap="Blues", cbar=False)
            ax.set_title("Confusion Matrix")
            ax.set_xlabel("Predicted Label")
            ax.set_ylabel("Actual Label")
            plt.show()
            """
        ),
        md(
            """
            ## 13. Feature Influence and Odds Ratios

            Logistic Regression coefficients can be transformed into odds ratios:

            - Positive coefficients increase survival odds.
            - Negative coefficients decrease survival odds.
            """
        ),
        code(
            """
            feature_names = model.named_steps["preprocessor"].get_feature_names_out()
            coefficients = model.named_steps["classifier"].coef_[0]

            odds_df = (
                pd.DataFrame({
                    "Feature": feature_names,
                    "Coefficient": coefficients,
                    "Odds Ratio": np.exp(coefficients),
                })
                .sort_values("Coefficient")
                .reset_index(drop=True)
            )

            display(odds_df)
            """
        ),
        md("## 14. Example Passenger Predictions"),
        code(
            """
            example_passengers = pd.DataFrame(
                [
                    {
                        "profile": "Young third-class male passenger",
                        "pclass": 3,
                        "sex": "male",
                        "age": 22,
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

            example_X = example_passengers[features]
            example_passengers["predicted_class"] = model.predict(example_X)
            example_passengers["survival_probability"] = model.predict_proba(example_X)[:, 1]
            example_passengers["human_readable_result"] = np.where(
                example_passengers["predicted_class"] == 1,
                "Predicted Survived",
                "Predicted Not Survived",
            )

            display(
                example_passengers[
                    ["profile", "predicted_class", "survival_probability", "human_readable_result"]
                ]
            )
            """
        ),
        md(
            """
            ## 15. Economic and Real-World Relevance

            The Titanic workflow is not limited to history. The same process applies to modern classification problems:

            - **Financial risk:** default vs non-default credit outcomes.
            - **Disaster response:** high-risk vs lower-risk zones or structures.
            - **Insurance analytics:** claim vs no-claim prediction.
            - **Healthcare triage:** high-risk vs stable patient classification.
            - **Educational analytics:** student attrition vs retention.
            - **Aerospace / space mission analytics:** subsystem failure vs operational status.

            From Titanic survival prediction to space-mission analytics, the workflow is universal.
            """
        ),
        md(
            """
            ## 16. Advanced Professor-Review Modeling Showcase

            This optional advanced section demonstrates stronger machine learning engineering practices:

            - Robust data ingestion with automatic fallbacks.
            - Interactive Scikit-Learn pipeline visualization with `set_config(display="diagram")`.
            - A custom zero-leakage group median age imputer.
            - A custom feature engineering transformer.
            - Logistic Regression vs Random Forest model comparison.
            - Hyperparameter optimization with `GridSearchCV`.
            - ROC-AUC diagnostics and ROC curve visualization.

            This section is intentionally separate from the validated baseline result. It may select a different best model and produce different metrics because it performs model comparison and hyperparameter search.
            """
        ),
        code(ADVANCED_SCRIPT_PATH.read_text(encoding="utf-8")),
        md(
            """
            ## 17. Data Science Mindset

            - Ask the right questions before coding.
            - Clean data is the foundation of truth.
            - Visualize to understand.
            - Model to predict.
            - Communicate to inspire.
            """
        ),
        md(
            """
            ## 18. Final Reflection

            Python transforms raw data into meaningful insight.

            The Titanic dataset shows that data is not just numbers; it reflects human stories, social structures, and survival patterns.

            Data science is not only coding — it is about asking questions, cleaning carefully, visualizing clearly, modeling responsibly, and communicating insight.

            Every dataset can be reframed into opportunity and foresight.

            Lessons from history can guide us toward future exploration.

            With science as our compass, the future is brighter, bolder, and boundless.
            """
        ),
    ]

    nb["cells"] = cells
    return nb


def main():
    NOTEBOOK_PATH.parent.mkdir(parents=True, exist_ok=True)
    notebook = build_notebook()
    nbf.write(notebook, NOTEBOOK_PATH)
    print(f"Created notebook: {NOTEBOOK_PATH}")


if __name__ == "__main__":
    main()
