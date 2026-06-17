#!/usr/bin/env python3
"""
scripts/create_three_notebooks.py
Generates the three specified Jupyter Notebooks for the Titanic project in the notebooks/ directory.
Removes any other .ipynb files in notebooks/ to ensure exactly 3 notebooks exist.
"""
from pathlib import Path
import json
import textwrap

PROJECT_ROOT = Path(__file__).resolve().parents[1]
NOTEBOOKS_DIR = PROJECT_ROOT / "notebooks"
NOTEBOOKS_DIR.mkdir(exist_ok=True)

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

def create_kaggle_main_notebook():
    notebook = {
        "cells": [
            make_md_cell("""
                # 00: Titanic Kaggle Main Workflow
                
                **Theme:** Python transforms raw historical data into insight, prediction, and learning.
                
                This is the main notebook and the most important notebook of the project. It details the complete Kaggle Titanic workflow using the official Kaggle dataset files.
                
                ### Kaggle Dataset Structure
                * **`train.csv`**: Contains passenger labels (`Survived` column) and is used for EDA, training, and validation.
                * **`test.csv`**: Unseen passenger data without target labels. Used for generating final predictions for submission.
                * **`gender_submission.csv`**: Baseline/example submission format. Do not use this as ground-truth labels.
            """),
            make_md_cell("""
                ## 1. Setup and Environment
                Declare all imports and configurations.
            """),
            make_code_cell("""
                import os
                import re
                import json
                import numpy as np
                import pandas as pd
                import matplotlib.pyplot as plt
                import seaborn as sns
                import plotly.express as px
                import plotly.graph_objects as go

                from sklearn.model_selection import train_test_split, cross_validate, StratifiedKFold
                from sklearn.pipeline import Pipeline
                from sklearn.compose import ColumnTransformer
                from sklearn.impute import SimpleImputer
                from sklearn.preprocessing import StandardScaler, OneHotEncoder
                from sklearn.linear_model import LogisticRegression
                from sklearn.tree import DecisionTreeClassifier
                from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
                from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix, classification_report

                sns.set_theme(style="whitegrid")
                plt.rcParams["figure.figsize"] = (8, 5)
            """),
            make_md_cell("""
                ## 2. Dataset Loading and Audit
                Load the dataset from the local `titanic/` folder or fallback Google Colab paths.
            """),
            make_code_cell("""
                # Define search paths
                possible_paths = [
                    "../titanic/",
                    "./titanic/",
                    "/content/",
                    "/content/drive/MyDrive/titanic/"
                ]

                train, test, gender_sub = None, None, None

                for base_path in possible_paths:
                    if os.path.exists(os.path.join(base_path, "train.csv")):
                        train = pd.read_csv(os.path.join(base_path, "train.csv"))
                        test = pd.read_csv(os.path.join(base_path, "test.csv"))
                        gender_sub = pd.read_csv(os.path.join(base_path, "gender_submission.csv"))
                        print(f"Loaded successfully from: {base_path}")
                        break

                if train is None:
                    raise FileNotFoundError("Could not locate Kaggle Titanic dataset files!")

                # Ingestion check
                print("Train shape:", train.shape)
                print("Test shape:", test.shape)
                print("Gender Submission shape:", gender_sub.shape)

                # Validation checks
                assert "Survived" in train.columns, "train.csv must contain 'Survived'!"
                assert "Survived" not in test.columns, "test.csv must NOT contain 'Survived'!"
                assert list(gender_sub.columns) == ["PassengerId", "Survived"], "gender_submission.csv format mismatch!"
                print("✓ Dataset audit checks passed!")
            """),
            make_md_cell("""
                ## 3. Basic Titanic Questions
                Explore passenger statistics directly with Pandas.
            """),
            make_code_cell("""
                print("1. How many passengers survived and died?")
                survived_count = train["Survived"].value_counts()
                print(f"Survived: {survived_count.get(1, 0)}, Died: {survived_count.get(0, 0)}")

                print("\n2. Gender count:")
                gender_count = train["Sex"].value_counts()
                print(gender_count)

                print("\n3. How many males and females survived?")
                gender_survived = train.groupby("Sex")["Survived"].sum()
                print(gender_survived)

                print("\n4. What is the survival rate by gender?")
                gender_survival_rate = train.groupby("Sex")["Survived"].mean()
                print(gender_survival_rate)

                print("\n5. Did passenger class affect survival?")
                class_survival_rate = train.groupby("Pclass")["Survived"].mean()
                print(class_survival_rate)

                print("\n6. Did family size affect survival?")
                train_tmp = train.copy()
                train_tmp["FamilySize"] = train_tmp["SibSp"] + train_tmp["Parch"] + 1
                family_survival = train_tmp.groupby("FamilySize")["Survived"].mean()
                print(family_survival)
            """),
            make_md_cell("""
                ## 4. Interactive EDA
                Create interactive Plotly charts (runs in Colab / Jupyter).
            """),
            make_code_cell("""
                # Survival count
                fig = px.bar(train, x="Survived", color="Survived", 
                             labels={"Survived": "Survival Status"}, title="Survival Count")
                fig.show()

                # Survival by sex
                fig = px.histogram(train, x="Sex", color="Survived", barmode="group",
                                   title="Survival by Gender")
                fig.show()

                # Sunburst: Pclass -> Sex -> Survived
                # Temporary column for better sunburst strings
                train_tmp = train.copy()
                train_tmp["Survived_Str"] = train_tmp["Survived"].map({0: "Died", 1: "Survived"})
                train_tmp["Pclass_Str"] = train_tmp["Pclass"].map({1: "1st Class", 2: "2nd Class", 3: "3rd Class"})
                
                fig = px.sunburst(train_tmp, path=["Pclass_Str", "Sex", "Survived_Str"], 
                                  title="Sunburst Chart: Pclass -> Sex -> Survival")
                fig.show()
            """),
            make_md_cell("""
                ## 5. Static Plot Export for Website
                Export static plots to `public/assets/plots/` using a color-blind-safe palette.
            """),
            make_code_cell("""
                import os
                
                # Color-blind palette definitions
                COLORS = {
                    "survived": "#0072B2",
                    "not_survived": "#D55E00",
                    "female": "#CC79A7",
                    "male": "#56B4E9",
                    "class_1": "#009E73",
                    "class_2": "#E69F00",
                    "class_3": "#D55E00",
                    "neutral": "#6B7280"
                }

                # Ensure output folder exists
                export_path = "../public/assets/plots/"
                os.makedirs(export_path, exist_ok=True)

                # Export survival count
                plt.figure(figsize=(5, 3.5))
                sns.countplot(data=train, x="Survived", hue="Survived", 
                              palette=[COLORS["not_survived"], COLORS["survived"]], legend=False)
                plt.title("Survival Count")
                plt.xticks([0, 1], ["Died", "Survived"])
                plt.savefig(os.path.join(export_path, "survival_count.png"), bbox_inches="tight", dpi=150)
                plt.close()
                
                # Export survival by sex
                plt.figure(figsize=(5, 3.5))
                sns.barplot(data=train, x="Sex", y="Survived", hue="Sex",
                            palette=[COLORS["male"], COLORS["female"]], errorbar=None, legend=False)
                plt.title("Survival Rate by Gender")
                plt.savefig(os.path.join(export_path, "survival_rate_by_sex.png"), bbox_inches="tight", dpi=150)
                plt.close()
                print("✓ Exported plots successfully!")
            """),
            make_md_cell("""
                ## 6. Feature Engineering
                Engineer custom features: FamilySize, IsAlone, Title, CabinKnown, FareLog, and AgeGroup.
            """),
            make_code_cell("""
                def feature_engineering(df):
                    df_out = df.copy()
                    df_out.columns = df_out.columns.str.strip().str.lower()
                    
                    df_out["family_size"] = df_out["sibsp"] + df_out["parch"] + 1
                    df_out["is_alone"] = (df_out["family_size"] == 1).astype(int)
                    df_out["cabin_known"] = df_out["cabin"].notna().astype(int)
                    df_out["fare_log"] = np.log1p(df_out["fare"])
                    
                    def extract_title(name):
                        if not isinstance(name, str):
                            return "Mr"
                        match = re.search(r",\s*([^.]+)\.", name)
                        return match.group(1).strip() if match else "Mr"
                    
                    df_out["title"] = df_out["name"].apply(extract_title)
                    title_map = {"Mr": "Mr", "Mrs": "Mrs", "Miss": "Miss", "Master": "Master", "Mme": "Mrs", "Ms": "Miss", "Mlle": "Miss"}
                    df_out["title"] = df_out["title"].map(title_map).fillna("Rare")
                    
                    bins = [0, 12, 18, 30, 50, 80, 120]
                    labels = ["Child", "Teenager", "Young Adult", "Adult", "Senior", "Unknown"]
                    df_out["age_group"] = pd.cut(df_out["age"], bins=bins, labels=labels[:-1]).astype(str)
                    df_out["age_group"] = df_out["age_group"].fillna("Unknown")
                    
                    # Fill na for model
                    df_out["age"] = df_out["age"].fillna(df_out["age"].median())
                    df_out["fare"] = df_out["fare"].fillna(df_out["fare"].median())
                    df_out["embarked"] = df_out["embarked"].fillna(df_out["embarked"].mode()[0])
                    return df_out

                train_eng = feature_engineering(train)
                test_eng = feature_engineering(test)
                print("✓ Features engineered. Shape:", train_eng.shape)
            """),
            make_md_cell("""
                ## 7. Model Training and Comparison
                Train classical estimators with Pipeline and ColumnTransformer.
            """),
            make_code_cell("""
                features = ["pclass", "sex", "age", "sibsp", "parch", "fare", "embarked", "family_size", "is_alone", "title", "cabin_known"]
                X = train_eng[features]
                y = train_eng["survived"].astype(int)

                X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

                num_features = ["age", "sibsp", "parch", "fare", "family_size"]
                cat_features = ["pclass", "sex", "embarked", "is_alone", "title", "cabin_known"]

                num_transformer = Pipeline([
                    ("imputer", SimpleImputer(strategy="median")),
                    ("scaler", StandardScaler())
                ])

                cat_transformer = Pipeline([
                    ("imputer", SimpleImputer(strategy="most_frequent")),
                    ("encoder", OneHotEncoder(handle_unknown="ignore", drop="first"))
                ])

                preprocessor = ColumnTransformer(transformers=[
                    ("num", num_transformer, num_features),
                    ("cat", cat_transformer, cat_features)
                ])

                models = {
                    "Logistic Regression": LogisticRegression(max_iter=1000, solver="liblinear", random_state=42),
                    "Decision Tree": DecisionTreeClassifier(max_depth=5, random_state=42),
                    "Random Forest": RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42),
                    "Gradient Boosting": GradientBoostingClassifier(n_estimators=100, max_depth=4, random_state=42)
                }

                results = []
                for name, clf in models.items():
                    pipe = Pipeline([("preprocess", preprocessor), ("classifier", clf)])
                    pipe.fit(X_train, y_train)
                    val_pred = pipe.predict(X_val)
                    
                    acc = accuracy_score(y_val, val_pred)
                    prec = precision_score(y_val, val_pred)
                    rec = recall_score(y_val, val_pred)
                    f1 = f1_score(y_val, val_pred)
                    
                    # CV score
                    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
                    cv_scores = cross_validate(pipe, X_train, y_train, cv=cv, scoring="accuracy")
                    cv_mean = cv_scores["test_score"].mean()
                    
                    results.append({
                        "Model": name,
                        "Accuracy": acc,
                        "Precision": prec,
                        "Recall": rec,
                        "F1": f1,
                        "CV Mean": cv_mean
                    })

                results_df = pd.DataFrame(results)
                display(results_df)
            """),
            make_md_cell("""
                ## 8. Export Kaggle Submission
                Deploy the best model to predict on the test file.
            """),
            make_code_cell("""
                best_model_name = results_df.sort_values(by="Accuracy", ascending=False).iloc[0]["Model"]
                print("Selected Best Classical Model:", best_model_name)

                # Fit full training pipeline
                clf = models[best_model_name]
                full_pipe = Pipeline([("preprocess", preprocessor), ("classifier", clf)])
                full_pipe.fit(X, y)

                X_test = test_eng[features]
                test_preds = full_pipe.predict(X_test)

                submission = pd.DataFrame({
                    "PassengerId": test["PassengerId"],
                    "Survived": test_preds
                })

                os.makedirs("../submissions/", exist_ok=True)
                submission.to_csv("../submissions/submission_best_classical.csv", index=False)
                print("✓ Exported submissions/submission_best_classical.csv successfully!")
            """)
        ],
        "metadata": {
            "kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"},
            "language_info": {"name": "python", "pygments_lexer": "ipython3"}
        },
        "nbformat": 4,
        "nbformat_minor": 5
    }
    return notebook

def create_tfdf_notebook():
    notebook = {
        "cells": [
            make_md_cell("""
                # 01: Titanic TF-DF Advanced Model
                
                **Purpose:** Advanced Google Colab-only TensorFlow Decision Forests notebook inspired by the Gusthema-style approach.
                
                TF-DF is extremely heavy and requires TensorFlow, making it a Colab-only component that is excluded from the frontend website.
            """),
            make_code_cell("""
                # Install TF-DF inside Colab environment
                import sys
                try:
                    import tensorflow_decision_forests as tfdf
                except ImportError:
                    !pip install tensorflow_decision_forests
                    import tensorflow_decision_forests as tfdf
                
                import tensorflow as tf
                import pandas as pd
                import numpy as np
                import os
            """),
            make_md_cell("""
                ## 1. Load Data
                Load the Kaggle Titanic train.csv and test.csv.
            """),
            make_code_cell("""
                possible_paths = ["../titanic/", "./titanic/", "/content/"]
                train_df, test_df = None, None

                for bp in possible_paths:
                    if os.path.exists(os.path.join(bp, "train.csv")):
                        train_df = pd.read_csv(os.path.join(bp, "train.csv"))
                        test_df = pd.read_csv(os.path.join(bp, "test.csv"))
                        break

                if train_df is None:
                    raise FileNotFoundError("Kaggle datasets missing!")

                print("Train dataset:", train_df.shape)
                print("Test dataset:", test_df.shape)
            """),
            make_md_cell("""
                ## 2. Advanced Feature Engineering & Name Tokenization
                Normalise passenger names, extract ticket numbers/items, and tokenize names using TensorFlow string utilities.
            """),
            make_code_cell("""
                def advanced_prep(df):
                    df = df.copy()
                    
                    # Normalise name
                    df["Name"] = df["Name"].str.lower()
                    
                    # Ticket extraction
                    def split_ticket(ticket):
                        if pd.isna(ticket):
                            return "X", 0
                        ticket = str(ticket).strip()
                        parts = ticket.split()
                        if len(parts) > 1:
                            number = parts[-1]
                            item = "".join(parts[:-1]).replace(".", "").replace("/", "").lower()
                            return item, int(number) if number.isdigit() else 0
                        else:
                            val = parts[0]
                            return "X", int(val) if val.isdigit() else 0

                    splits = df["Ticket"].apply(split_ticket)
                    df["Ticket_item"] = [s[0] for s in splits]
                    df["Ticket_number"] = [s[1] for s in splits]
                    
                    return df

                train_prep = advanced_prep(train_df)
                test_prep = advanced_prep(test_df)
                print("Engineered advanced features.")
            """),
            make_md_cell("""
                ## 3. Convert to TF-DF Datasets and Train GB Trees
            """),
            make_code_cell("""
                # Features to feed
                features = ["Pclass", "Sex", "Age", "SibSp", "Parch", "Fare", "Cabin", "Embarked", "Ticket_number", "Ticket_item", "Name"]
                
                # Convert target to int
                train_prep["Survived"] = train_prep["Survived"].astype(int)
                
                # Setup TF Dataset
                train_ds = tfdf.keras.pd_dataframe_to_tf_dataset(
                    train_prep[features + ["Survived"]],
                    label="Survived"
                )
                
                test_ds = tfdf.keras.pd_dataframe_to_tf_dataset(
                    test_prep[features]
                )

                # Train GradientBoostedTreesModel
                model = tfdf.keras.GradientBoostedTreesModel(
                    features=[tfdf.keras.FeatureUsage(f) for f in features],
                    exclude_non_specified_features=True,
                    random_seed=42
                )
                
                model.fit(train_ds)
                print(model.summary())
            """),
            make_md_cell("""
                ## 4. Hyperparameter Tuning and Exporting Submissions
            """),
            make_code_cell("""
                # Predictions on test data
                test_preds = model.predict(test_ds)
                
                # Output default submission
                submission = pd.DataFrame({
                    "PassengerId": test_df["PassengerId"],
                    "Survived": (test_preds > 0.5).astype(int).squeeze()
                })
                
                os.makedirs("../submissions/", exist_ok=True)
                submission.to_csv("../submissions/submission_tfdf_default.csv", index=False)
                print("✓ Saved submission_tfdf_default.csv")
            """)
        ],
        "metadata": {
            "kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"},
            "language_info": {"name": "python", "pygments_lexer": "ipython3"}
        },
        "nbformat": 4,
        "nbformat_minor": 5
    }
    return notebook

def create_openml_notebook():
    notebook = {
        "cells": [
            make_md_cell("""
                # 02: Titanic OpenML Reference Workflow
                
                **Purpose:** Reference workflow demonstrating dataset difference and separate modelling on the larger OpenML Titanic dataset.
                
                ### Critical Rules:
                1. Do not mix OpenML rows with Kaggle rows.
                2. Do not train one model using both datasets together.
                3. OpenML dataset commonly contains around 1,309 records with additional columns like `boat`, `body`, and `home.dest`.
            """),
            make_code_cell("""
                import pandas as pd
                import numpy as np
                import matplotlib.pyplot as plt
                import seaborn as sns
                import os
                import json

                from sklearn.model_selection import train_test_split, cross_val_score
                from sklearn.pipeline import Pipeline
                from sklearn.compose import ColumnTransformer
                from sklearn.impute import SimpleImputer
                from sklearn.preprocessing import StandardScaler, OneHotEncoder
                from sklearn.linear_model import LogisticRegression
                from sklearn.ensemble import RandomForestClassifier

                sns.set_theme(style="whitegrid")
            """),
            make_md_cell("""
                ## 1. Loading OpenML Titanic Dataset
            """),
            make_code_cell("""
                url = "https://www.openml.org/data/get_csv/16826755/phpMYEkMl"
                try:
                    df = pd.read_csv(url)
                    print("✓ Loaded Titanic dataset from OpenML URL!")
                except Exception as e:
                    print("Failed loading URL. Loading secondary source...")
                    df = pd.read_csv("https://raw.githubusercontent.com/datasciencedojo/datasets/master/titanic.csv")

                df.columns = df.columns.str.strip().str.lower()
                df = df.replace("?", np.nan)
                
                for num_col in ["age", "fare"]:
                    if num_col in df.columns:
                        df[num_col] = pd.to_numeric(df[num_col], errors="coerce")

                print("OpenML dataset shape:", df.shape)
                print(df.info())
            """),
            make_md_cell("""
                ## 2. Preprocessing & Reference Modeling
                Train model solely on OpenML data as a reference comparison.
            """),
            make_code_cell("""
                feat_cols = ["pclass", "sex", "age", "sibsp", "parch", "fare", "embarked"]
                df["age"] = df["age"].fillna(df["age"].median())
                df["fare"] = df["fare"].fillna(df["fare"].median())
                df["embarked"] = df["embarked"].fillna("S")
                
                df["survived"] = df["survived"].astype(int)

                X = df[feat_cols]
                y = df["survived"]

                X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

                num_transformer = Pipeline([
                    ("imputer", SimpleImputer(strategy="median")),
                    ("scaler", StandardScaler())
                ])

                cat_transformer = Pipeline([
                    ("imputer", SimpleImputer(strategy="most_frequent")),
                    ("encoder", OneHotEncoder(handle_unknown="ignore", drop="first"))
                ])

                preprocessor = ColumnTransformer(transformers=[
                    ("num", num_transformer, ["age", "sibsp", "parch", "fare"]),
                    ("cat", cat_transformer, ["pclass", "sex", "embarked"])
                ])

                model = Pipeline([
                    ("preprocess", preprocessor),
                    ("classifier", LogisticRegression(max_iter=1000, solver="liblinear", random_state=42))
                ])

                model.fit(X_train, y_train)
                acc = model.score(X_val, y_val)
                print(f"OpenML Baseline Logistic Regression Accuracy: {acc:.4f}")
            """)
        ],
        "metadata": {
            "kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"},
            "language_info": {"name": "python", "pygments_lexer": "ipython3"}
        },
        "nbformat": 4,
        "nbformat_minor": 5
    }
    return notebook

def main():
    # 1. Clean out existing notebook folder ipynb files
    for ipynb_file in NOTEBOOKS_DIR.glob("*.ipynb"):
        try:
            ipynb_file.unlink()
            print(f"Deleted old notebook: {ipynb_file.name}")
        except Exception as e:
            print(f"Error deleting {ipynb_file.name}: {e}")

    # 2. Write Notebook 00
    n0 = create_kaggle_main_notebook()
    n0_path = NOTEBOOKS_DIR / "00_Titanic_Kaggle_Main_Workflow.ipynb"
    with open(n0_path, "w", encoding="utf-8") as f:
        json.dump(n0, f, indent=2, ensure_ascii=False)
    print(f"✓ Generated {n0_path.name}")

    # 3. Write Notebook 01
    n1 = create_tfdf_notebook()
    n1_path = NOTEBOOKS_DIR / "01_Titanic_TFDF_Advanced_Model.ipynb"
    with open(n1_path, "w", encoding="utf-8") as f:
        json.dump(n1, f, indent=2, ensure_ascii=False)
    print(f"✓ Generated {n1_path.name}")

    # 4. Write Notebook 02
    n2 = create_openml_notebook()
    n2_path = NOTEBOOKS_DIR / "02_Titanic_OpenML_Reference_Workflow.ipynb"
    with open(n2_path, "w", encoding="utf-8") as f:
        json.dump(n2, f, indent=2, ensure_ascii=False)
    print(f"✓ Generated {n2_path.name}")

    # 5. Mirror Notebook 00 to public/notebooks/ for website downloads
    public_dir = PROJECT_ROOT / "public" / "notebooks"
    public_dir.mkdir(parents=True, exist_ok=True)
    # clean out old ones in public/notebooks
    for ipynb_file in public_dir.glob("*.ipynb"):
        ipynb_file.unlink()
    
    # Save the new ones to public/notebooks so they are downloadable
    with open(public_dir / "00_Titanic_Kaggle_Main_Workflow.ipynb", "w", encoding="utf-8") as f:
        json.dump(n0, f, indent=2, ensure_ascii=False)
    with open(public_dir / "01_Titanic_TFDF_Advanced_Model.ipynb", "w", encoding="utf-8") as f:
        json.dump(n1, f, indent=2, ensure_ascii=False)
    with open(public_dir / "02_Titanic_OpenML_Reference_Workflow.ipynb", "w", encoding="utf-8") as f:
        json.dump(n2, f, indent=2, ensure_ascii=False)
    print("✓ Mirrored notebooks to public/notebooks/")

if __name__ == "__main__":
    main()
