#!/usr/bin/env python3
"""
scripts/create_kaggle_workflow_notebook.py
Generates notebooks/00_Titanic_Kaggle_Main_Workflow.ipynb
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

def main():
    cells = [
        make_md_cell("""
            # 00: Titanic Kaggle Main Workflow
            
            **Purpose:** Main workflow demonstrating data engineering and classical modelling on the Kaggle Titanic Competition dataset.
            
            This workflow is fully matched with the OpenML Reference Workflow, utilizing identical features, custom estimators, visualizations, and pipeline components.
            
            **Core workflow:**
            ```text
            Load Data → Clean Data → Explore → Feature Engineer → Custom Imputation → Split → Preprocessing Pipeline → GridSearchCV Model Search → Evaluation & ROC → Odds Coefficients → Predictions
            ```
        """),
        
        make_md_cell("""
            ## 1. Environment and Library Setup
            
            The notebook uses the standard Python data science stack: NumPy, Pandas, Matplotlib, Seaborn, and Scikit-Learn.
            All package imports (including regular expressions `re` for title parsing and cross-validated searches) are declared in this initial cell to prepare the notebook for running cleanly in local and Colab environments.
        """),
        
        make_code_cell(r"""
            import os
            import re
            import numpy as np
            import pandas as pd
            import matplotlib.pyplot as plt
            import seaborn as sns
            import plotly.express as px
            import plotly.graph_objects as go

            from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV, StratifiedKFold
            from sklearn.base import BaseEstimator, TransformerMixin
            from sklearn.pipeline import Pipeline
            from sklearn.compose import ColumnTransformer
            from sklearn.impute import SimpleImputer
            from sklearn.preprocessing import StandardScaler, OneHotEncoder
            from sklearn.linear_model import LogisticRegression
            from sklearn.ensemble import RandomForestClassifier
            from sklearn.metrics import accuracy_score, confusion_matrix, classification_report, roc_auc_score, roc_curve, precision_score, recall_score, f1_score, auc
            from sklearn import set_config

            set_config(display="diagram")
            sns.set_theme(style="whitegrid")
            plt.rcParams["figure.figsize"] = (9, 6)
            plt.rcParams["figure.dpi"] = 120
            
            filename_prefix = "kaggle_"
            print("✓ Step 1: Libraries and environment successfully set up!")
        """),
        
        make_md_cell("""
            ## 2. Dataset Ingestion
            
            We load our raw dataset. For the Kaggle Competition, we load `train.csv` and `test.csv`.
        """),
        
        make_code_cell(r"""
            import os

            possible_paths = [
                "../kaggle/",
                "./kaggle/",
                "../data/",
                "./data/",
                "/content/",
                "/content/kaggle/"
            ]

            train = None
            test = None

            for base_path in possible_paths:
                train_file = os.path.join(base_path, "train.csv")
                test_file = os.path.join(base_path, "test.csv")
                if os.path.exists(train_file) and os.path.exists(test_file):
                    train = pd.read_csv(train_file)
                    test = pd.read_csv(test_file)
                    print(f"✓ Kaggle datasets loaded successfully from local path: {base_path}")
                    break

            if train is None or test is None:
                print("Local Kaggle files not found. Attempting to download from remote GitHub repository fallback...")
                try:
                    train_url = "https://raw.githubusercontent.com/sid0sid-ops/titanic-data-to-discovery/main/kaggle/train.csv"
                    test_url = "https://raw.githubusercontent.com/sid0sid-ops/titanic-data-to-discovery/main/kaggle/test.csv"
                    train = pd.read_csv(train_url)
                    test = pd.read_csv(test_url)
                    print("✓ Kaggle datasets loaded successfully from remote GitHub repository fallback!")
                except Exception as e:
                    print(f"Remote download failed: {e}")

            if train is None or test is None:
                raise FileNotFoundError("Could not load train.csv and test.csv from local paths or remote GitHub fallbacks.")

            df = train.copy()
            display(df.head())
            print("Train Shape:", df.shape)
            print("Test Shape:", test.shape)
            df.info()
        """),
        
        make_md_cell("""
            ## 3. Column Cleaning and Data Dictionary
            
            Column names are normalized to lowercase and punctuation is simplified. Post-disaster fields (like `boat`, `body`, `home.dest`) are identified for removal to prevent **data leakage**.
        """),
        
        make_code_cell(r"""
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
                if numeric_column in df.columns:
                    df[numeric_column] = pd.to_numeric(df[numeric_column], errors="coerce")
                    
            if test is not None:
                test = test.copy()
                test.columns = (
                    test.columns
                    .str.strip()
                    .str.lower()
                    .str.replace(".", "_", regex=False)
                    .str.replace(" ", "_", regex=False)
                )
                test = test.replace("?", np.nan)
                for numeric_column in ["age", "fare"]:
                    if numeric_column in test.columns:
                        test[numeric_column] = pd.to_numeric(test[numeric_column], errors="coerce")

            display(pd.DataFrame({"cleaned_columns": df.columns}))
            display(df.head())
        """),
        
        make_md_cell("""
            ## 4. Missing Value Analysis
            
            Clean data is the foundation of reliable modeling. Missing values across key features are calculated and audited before visual modeling.
        """),
        
        make_code_cell(r"""
            missing = (
                pd.DataFrame({
                    "missing_count": df.isna().sum(),
                    "missing_percent": (df.isna().mean() * 100).round(2),
                })
                .query("missing_count > 0")
                .sort_values("missing_percent", ascending=False)
            )
            display(missing)
        """),
        
        make_md_cell("""
            ## 5. Exploratory Data Analysis (EDA)
            
            We conduct a complete, deep-dive EDA including the full gallery of 14 static plots and 4 interactive Plotly charts.
            This gives a thorough visual understanding of demographic splits, distributions, port impacts, and high-dimensional correlations.
        """),
        
        make_code_cell(r"""
            # 1. Survival Count Plot
            plt.figure(figsize=(6, 4))
            sns.countplot(data=df, x="survived", hue="survived", palette=["#D55E00", "#0072B2"], legend=False)
            plt.title("Survival Count")
            plt.xlabel("Survival Status")
            plt.ylabel("Passenger Count")
            plt.xticks([0, 1], ["Not Survived (0)", "Survived (1)"])

            export_path = "../public/assets/plots/" if os.path.exists("../public/") else "./plots/"
            os.makedirs(export_path, exist_ok=True)
            plt.savefig(os.path.join(export_path, f"{filename_prefix}survival_count.png"), dpi=150, bbox_inches="tight")
            plt.show()
        """),
        
        make_code_cell(r"""
            # 2. Sex Distribution
            plt.figure(figsize=(6, 4))
            sns.countplot(data=df, x="sex", hue="sex", palette=["#56B4E9", "#CC79A7"], legend=False)
            plt.title("Passenger Count by Gender")
            plt.xlabel("Gender")
            plt.ylabel("Count")

            plt.savefig(os.path.join(export_path, f"{filename_prefix}sex_count.png"), dpi=150, bbox_inches="tight")
            plt.show()
        """),
        
        make_code_cell(r"""
            # 3. Survival Rate by Gender
            plt.figure(figsize=(6, 4))
            sns.barplot(data=df, x="sex", y="survived", hue="sex", palette=["#56B4E9", "#CC79A7"], errorbar=None, legend=False)
            plt.title("Survival Rate by Gender")
            plt.xlabel("Gender")
            plt.ylabel("Survival Rate")

            plt.savefig(os.path.join(export_path, f"{filename_prefix}survival_rate_by_sex.png"), dpi=150, bbox_inches="tight")
            plt.show()
        """),
        
        make_code_cell(r"""
            # 4. Survival Rate by Passenger Class
            plt.figure(figsize=(6, 4))
            df_temp = df.copy()
            df_temp["pclass"] = df_temp["pclass"].map({1: "1st Class", 2: "2nd Class", 3: "3rd Class"})
            sns.barplot(data=df_temp, x="pclass", y="survived", hue="pclass", palette=["#009E73", "#E69F00", "#D55E00"], order=["1st Class", "2nd Class", "3rd Class"], errorbar=None, legend=False)
            plt.title("Survival Rate by Passenger Class")
            plt.xlabel("Passenger Class")
            plt.ylabel("Survival Rate")

            plt.savefig(os.path.join(export_path, f"{filename_prefix}survival_rate_by_class.png"), dpi=150, bbox_inches="tight")
            plt.show()
        """),
        
        make_code_cell(r"""
            # 5. Survival Rate Heatmap by Gender and Class
            plt.figure(figsize=(6, 4))
            pivot = df.pivot_table(index="sex", columns="pclass", values="survived", aggfunc="mean")
            pivot.columns = ["1st Class", "2nd Class", "3rd Class"]
            pivot.index = [idx.capitalize() for idx in pivot.index]
            sns.heatmap(pivot, annot=True, cmap="Blues", fmt=".2f", cbar_kws={'label': 'Survival Rate'}, vmin=0, vmax=1)
            plt.title("Survival Rate by Gender and Class")
            plt.xlabel("Passenger Class")
            plt.ylabel("Gender")

            plt.savefig(os.path.join(export_path, f"{filename_prefix}survival_by_sex_class_heatmap.png"), dpi=150, bbox_inches="tight")
            plt.show()
        """),
        
        make_code_cell(r"""
            # 5.5. Survival Rate Barplot by Gender and Class
            plt.figure(figsize=(8, 4.8))
            sns.barplot(data=df, x="pclass", y="survived", hue="sex", errorbar=None)
            plt.title("Survival Rate by Gender and Class (Barplot)")
            plt.xlabel("Passenger Class")
            plt.ylabel("Survival Rate")
            plt.ylim(0, 1)

            plt.savefig(os.path.join(export_path, f"{filename_prefix}survival_by_gender_class.png"), dpi=150, bbox_inches="tight")
            plt.show()
        """),

        make_code_cell(r"""
            # 6. Age Distribution by Survival Density
            plt.figure(figsize=(7, 4.5))
            sns.kdeplot(data=df[df["survived"] == 1], x="age", fill=True, color="#0072B2", label="Survived", alpha=0.5)
            sns.kdeplot(data=df[df["survived"] == 0], x="age", fill=True, color="#D55E00", label="Not Survived", alpha=0.5)
            plt.title("Age Distribution by Survival")
            plt.xlabel("Age")
            plt.ylabel("Density")
            plt.legend()

            plt.savefig(os.path.join(export_path, f"{filename_prefix}age_distribution_survival.png"), dpi=150, bbox_inches="tight")
            plt.show()
        """),
        
        make_code_cell(r"""
            # 6.5. Passenger Age Distribution Histogram by Outcome
            plt.figure(figsize=(8, 4.8))
            outcome_palette = ["#c2415d", "#137f8b"]
            df_temp = df.copy()
            df_temp["survival_label"] = df_temp["survived"].map({0: "Died", 1: "Survived"})
            sns.histplot(data=df_temp, x="age", hue="survival_label", bins=30, element="step", palette=outcome_palette)
            plt.title("Passenger Age Distribution by Outcome")
            plt.xlabel("Age")
            plt.ylabel("Passenger Count")

            plt.savefig(os.path.join(export_path, f"{filename_prefix}age_distribution.png"), dpi=150, bbox_inches="tight")
            plt.show()
        """),

        make_code_cell(r"""
            # 7. Survival Rate by Age Group
            plt.figure(figsize=(8, 4.5))
            df_temp = df.copy()
            bins = [0, 12, 18, 30, 50, 120]
            labels = ["Child", "Teenager", "Young Adult", "Adult", "Senior"]
            df_temp["age_group"] = pd.cut(df_temp["age"], bins=bins, labels=labels).astype(str)
            df_temp["age_group"] = df_temp["age_group"].fillna("Unknown")

            order = ["Child", "Teenager", "Young Adult", "Adult", "Senior", "Unknown"]
            sns.barplot(data=df_temp, x="age_group", y="survived", order=order, hue="age_group", palette="viridis", errorbar=None, legend=False)
            plt.title("Survival Rate by Age Group")
            plt.xlabel("Age Group")
            plt.ylabel("Survival Rate")

            plt.savefig(os.path.join(export_path, f"{filename_prefix}age_group_survival.png"), dpi=150, bbox_inches="tight")
            plt.show()
        """),
        
        make_code_cell(r"""
            # 8. Fare Distribution Histogram
            plt.figure(figsize=(7, 4.5))
            df_temp = df.copy()
            df_temp["Survival Status"] = df_temp["survived"].map({0: "Not Survived", 1: "Survived"})
            sns.histplot(data=df_temp, x="fare", hue="Survival Status", palette={"Not Survived": "#D55E00", "Survived": "#0072B2"}, kde=True, bins=30, alpha=0.5, multiple="stack")
            plt.title("Fare Distribution by Survival")
            plt.xlabel("Fare ($)")
            plt.ylabel("Passenger Count")

            plt.savefig(os.path.join(export_path, f"{filename_prefix}fare_distribution.png"), dpi=150, bbox_inches="tight")
            plt.show()
        """),
        
        make_code_cell(r"""
            # 9. Fare Boxplot (Identifying Outliers)
            plt.figure(figsize=(6, 4))
            df_temp = df.copy()
            df_temp["Survival Status"] = df_temp["survived"].map({0: "Not Survived", 1: "Survived"})
            sns.boxplot(data=df_temp, x="Survival Status", y="fare", hue="Survival Status", palette={"Not Survived": "#D55E00", "Survived": "#0072B2"}, legend=False)
            plt.title("Fare Boxplot (Identifying Outliers)")
            plt.xlabel("Survival Status")
            plt.ylabel("Fare ($)")

            plt.savefig(os.path.join(export_path, f"{filename_prefix}fare_outlier_boxplot.png"), dpi=150, bbox_inches="tight")
            plt.show()
        """),
        
        make_code_cell(r"""
            # 10. Age vs Fare Scatter Plot
            plt.figure(figsize=(8, 5))
            df_temp = df.copy()
            df_temp["Survival Status"] = df_temp["survived"].map({0: "Not Survived", 1: "Survived"})
            sns.scatterplot(data=df_temp, x="age", y="fare", hue="Survival Status", palette={"Not Survived": "#D55E00", "Survived": "#0072B2"}, alpha=0.7)
            plt.title("Age vs Fare Scatter Plot")
            plt.xlabel("Age")
            plt.ylabel("Fare ($)")
            plt.yscale("log")
            plt.legend(title="Survival Status")

            plt.savefig(os.path.join(export_path, f"{filename_prefix}age_fare_scatter.png"), dpi=150, bbox_inches="tight")
            plt.show()
        """),
        
        make_code_cell(r"""
            # 11. Survival Rate by Family Size
            plt.figure(figsize=(7, 4))
            df_temp = df.copy()
            df_temp["family_size"] = df_temp["sibsp"] + df_temp["parch"] + 1
            sns.barplot(data=df_temp, x="family_size", y="survived", hue="family_size", palette="Set2", errorbar=None, legend=False)
            plt.title("Survival Rate by Family Size")
            plt.xlabel("Family Size (SibSp + Parch + 1)")
            plt.ylabel("Survival Rate")

            plt.savefig(os.path.join(export_path, f"{filename_prefix}family_size_survival.png"), dpi=150, bbox_inches="tight")
            plt.show()
        """),
        
        make_code_cell(r"""
            # 12. Embarked Location Survival and Death Distribution
            plt.figure(figsize=(7, 4.5))
            df_emb = df.dropna(subset=["embarked"]).copy()
            df_emb["Survival Status"] = df_emb["survived"].map({0: "Not Survived", 1: "Survived"})
            df_emb["embarked"] = df_emb["embarked"].map({"C": "Cherbourg", "Q": "Queenstown", "S": "Southampton"})
            sns.countplot(data=df_emb, x="embarked", hue="Survival Status", palette={"Not Survived": "#D55E00", "Survived": "#0072B2"})
            plt.title("Embarked Port vs Survival Status")
            plt.xlabel("Port of Embarkation")
            plt.ylabel("Passenger Count")
            plt.legend(title="Survival Status")

            plt.savefig(os.path.join(export_path, f"{filename_prefix}embarked_survival.png"), dpi=150, bbox_inches="tight")
            plt.show()
        """),
        
        make_code_cell(r"""
            # 13. Survival Rate by Cabin Availability
            plt.figure(figsize=(6, 4))
            df_temp = df.copy()
            df_temp["cabin_known"] = df_temp["cabin"].notna().map({True: "Known / Recorded", False: "Missing / Unknown"})
            sns.barplot(data=df_temp, x="cabin_known", y="survived", hue="cabin_known", palette=["#D55E00", "#0072B2"], order=["Missing / Unknown", "Known / Recorded"], errorbar=None, legend=False)
            plt.title("Survival Rate by Cabin Availability")
            plt.xlabel("Cabin Location Recorded")
            plt.ylabel("Survival Rate")

            plt.savefig(os.path.join(export_path, f"{filename_prefix}cabin_known_survival.png"), dpi=150, bbox_inches="tight")
            plt.show()
        """),
        
        make_code_cell(r"""
            # 14. Title Groupings vs Survival
            plt.figure(figsize=(7, 4.5))
            df_temp = df.copy()
            def get_title(name):
                if not isinstance(name, str):
                    return "Mr"
                match = re.search(r",\s*([^.]+)\.", name)
                return match.group(1).strip() if match else "Mr"
            df_temp["title"] = df_temp["name"].apply(get_title)
            title_mapping = {
                "Mr": "Mr", "Mrs": "Mrs", "Miss": "Miss", "Master": "Master",
                "Mme": "Mrs", "Ms": "Miss", "Mlle": "Miss"
            }
            df_temp["title"] = df_temp["title"].map(title_mapping).fillna("Rare")

            sns.barplot(data=df_temp, x="title", y="survived", hue="title", palette="Set1", errorbar=None, legend=False)
            plt.title("Survival Rate by Passenger Title")
            plt.xlabel("Title")
            plt.ylabel("Survival Rate")

            plt.savefig(os.path.join(export_path, f"{filename_prefix}title_survival.png"), dpi=150, bbox_inches="tight")
            plt.show()
        """),
        
        make_md_cell("""
            ### Interactive Exploratory Plots
            Below we render four dynamic Plotly visualizations. These plots allow interactive panning, zooming, and hover annotations. Note that interactive Plotly plots require a running Python kernel (such as in Jupyter Notebook or Google Colab) to render dynamically.
        """),
        
        make_code_cell(r"""
            # 1. Interactive Sunburst (Ticket Class -> Sex -> Survival Status)
            vis_df = df.copy()
            vis_df["Survival Status"] = vis_df["survived"].map({0: "Died", 1: "Survived"})
            vis_df["Ticket Class"] = vis_df["pclass"].map({1: "1st Class", 2: "2nd Class", 3: "3rd Class"})

            fig_sunburst = px.sunburst(
                vis_df, 
                path=["Ticket Class", "sex", "Survival Status"], 
                title="Interactive Sunburst: Class -> Gender -> Survival Status",
                color="Survival Status",
                color_discrete_map={"Survived": "#2ca02c", "Died": "#d62728"}
            )
            fig_sunburst.update_layout(margin=dict(t=40, l=0, r=0, b=0))
            fig_sunburst.show()
        """),
        
        make_code_cell(r"""
            # 2. Interactive Scatter (Age vs. Fare)
            vis_df = df.copy()
            vis_df["Survival Status"] = vis_df["survived"].map({0: "Died", 1: "Survived"})
            vis_df["Ticket Class"] = vis_df["pclass"].map({1: "1st Class", 2: "2nd Class", 3: "3rd Class"})
            
            fig_scatter = px.scatter(
                vis_df.dropna(subset=["age", "fare"]), 
                x="age", 
                y="fare", 
                color="Survival Status",
                hover_name="name",
                log_y=True,
                color_discrete_map={"Survived": "#2678B2", "Died": "#FD7F28"},
                title="Interactive Scatter: Age vs. Fare (Log Scale, Color-coded by Survival)"
            )
            fig_scatter.update_layout(xaxis_title="Age (Years)", yaxis_title="Fare (GBP, Log Scale)")
            fig_scatter.show()
        """),
        
        make_code_cell(r"""
            # 3. Interactive 3D Scatter (Age vs. Fare vs. Pclass)
            vis_df = df.copy()
            vis_df["Survival Status"] = vis_df["survived"].map({0: "Died", 1: "Survived"})
            
            fig_3d = px.scatter_3d(
                vis_df.dropna(subset=["age", "fare"]), 
                x="age", 
                y="fare", 
                z="pclass", 
                color="Survival Status",
                log_y=True,
                hover_name="name",
                color_discrete_map={"Survived": "#2ca02c", "Died": "#d62728"},
                title="Interactive 3D Scatter: Age vs. Fare vs. Pclass"
            )
            fig_3d.show()
        """),
        
        make_code_cell(r"""
            # 4. Interactive Parallel Categories Flow
            vis_df = df.copy()
            vis_df["Survival Status"] = vis_df["survived"].map({0: "Died", 1: "Survived"})
            vis_df["Ticket Class"] = vis_df["pclass"].map({1: "1st Class", 2: "2nd Class", 3: "3rd Class"})
            
            fig_parcat = px.parallel_categories(
                vis_df.dropna(subset=["embarked", "sex", "Ticket Class", "Survival Status"]), 
                dimensions=["Ticket Class", "sex", "embarked", "Survival Status"],
                color="survived", 
                color_continuous_scale=px.colors.sequential.Viridis,
                title="Parallel Categories: Demographic Flow to Survival Outcome"
            )
            fig_parcat.show()
        """),
        
        make_md_cell("""
            ## 6. Feature Engineering Transformer
            
            We build a custom Scikit-Learn transformer class `TitanicFeatureEngineer` to perform feature engineering.
            This creates family features (`family_size`, `is_alone`), extracts passenger name prefixes to create a `title` group, and flags cabin indicators (`has_cabin`) while cleanly dropping leakage and string identifiers.
        """),
        
        make_code_cell(r"""
            class TitanicFeatureEngineer(BaseEstimator, TransformerMixin):
                def fit(self, X, y=None):
                    return self

                def transform(self, X):
                    X_out = X.copy()
                    X_out["family_size"] = X_out["sibsp"] + X_out["parch"] + 1
                    X_out["is_alone"] = (X_out["family_size"] == 1).astype(int)

                    def extract_title(name):
                        if not isinstance(name, str):
                            return "Mr"
                        match = re.search(r",\s*([^.]+)\.", name)
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
        """),
        
        make_md_cell("""
            ## 7. Custom Imputation (Leakage-Safe)
            
            Simple global median imputation ignores passenger demographics. We create a custom `GroupMedianAgeImputer` class that computes median age grouped by passenger class and gender, fitting only on the training folds during cross-validation to prevent data leakage.
        """),
        
        make_code_cell(r"""
            class GroupMedianAgeImputer(BaseEstimator, TransformerMixin):
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
        """),
        
        make_md_cell("""
            ## 8. Train/Test Split
            
            We perform a stratified 80-20 partition (`stratify=y`) to split feature attributes and survival targets.
        """),
        
        make_code_cell(r"""
            features = ["pclass", "sex", "age", "sibsp", "parch", "fare", "embarked", "cabin", "name"]
            X = df.drop(columns=["survived"])
            y = df["survived"].astype(int)

            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.20, random_state=42, stratify=y
            )
            print("Train shape:", X_train.shape, "| Test shape:", X_test.shape)
        """),
        
        make_md_cell("""
            ## 9. Preprocessing Pipeline
            
            We build a `ColumnTransformer` preprocessing pipeline mapping standard numeric and categorical features.
        """),
        
        make_code_cell(r"""
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
        """),
        
        make_md_cell("""
            ## 10. GridSearchCV Model Search
            
            We set up a grid search searching over Logistic Regression hyper-parameters to find the optimal C regularization parameter.
        """),
        
        make_code_cell(r"""
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
        """),
        
        make_md_cell("""
            ## 11. Model Evaluation & ROC Curve
            
            We predict outcomes on the holdout test set using the chosen optimal pipeline and generate accuracy metrics, classification reports, and the ROC curve.
        """),
        
        make_code_cell(r"""
            best_pipeline = grid_search.best_estimator_
            y_pred = best_pipeline.predict(X_test)
            y_proba = best_pipeline.predict_proba(X_test)[:, 1]

            print(f"Holdout Test Accuracy: {accuracy_score(y_test, y_pred):.4f}")
            print(f"ROC-AUC score: {roc_auc_score(y_test, y_proba):.4f}")
            print("\nConfusion Matrix:\n", confusion_matrix(y_test, y_pred))
            print("\nClassification Report:\n", classification_report(y_test, y_pred))

            # Export Plot 15: Confusion Matrix
            cm = confusion_matrix(y_test, y_pred)
            plt.figure(figsize=(6, 5))
            sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", 
                        xticklabels=["Died", "Survived"], yticklabels=["Died", "Survived"])
            plt.ylabel("Actual Status")
            plt.xlabel("Predicted Status")
            plt.title("Confusion Matrix (Logistic Regression)")
            plt.savefig(os.path.join(export_path, f"{filename_prefix}confusion_matrix.png"), bbox_inches="tight", dpi=150)
            plt.show()

            # Export Plot 16: ROC Curve
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
            plt.savefig(os.path.join(export_path, f"{filename_prefix}roc_curve.png"), bbox_inches="tight", dpi=150)
            plt.show()

            def predict_and_print(passenger_df, pipeline_model):
                prediction = pipeline_model.predict(passenger_df)
                probability = pipeline_model.predict_proba(passenger_df)[:, 1]
                
                for idx, row in passenger_df.iterrows():
                    outcome = "SURVIVES" if prediction[idx] == 1 else "NOT SURVIVED"
                    print(f"Passenger: {row['name']:<30} | Class: {row['pclass']} | Sex: {row['sex']:<6} | Probability: {probability[idx]:.4f} ({probability[idx]*100:.1f}%) | Prediction: {outcome}")
        """),
        
        make_md_cell("""
            ## 12. Pipeline Diagram
            
            Displaying the Scikit-Learn visual block diagram of the optimal pipeline.
        """),
        
        make_code_cell(r"""
            best_pipeline
        """),
        
        make_md_cell("""
            ## 13. Log-Odds Coefficients
            
            Displaying feature importances or logistic regression log-odds parameters mapping the direction of influence.
        """),
        
        make_code_cell(r"""
            preprocess_step = best_pipeline.named_steps["preprocess"]
            encoded_feature_names = preprocess_step.get_feature_names_out()
            classifier = best_pipeline.named_steps["classifier"]

            if isinstance(classifier, LogisticRegression):
                interpretation = pd.DataFrame({
                    "Feature": encoded_feature_names,
                    "Coefficient": classifier.coef_[0],
                    "Odds Ratio": np.exp(classifier.coef_[0]),
                }).sort_values("Coefficient", ascending=False)
                
                # Plot coefficients
                plt.figure(figsize=(10, 5))
                sns.barplot(data=interpretation, x="Coefficient", y="Feature", hue="Feature", palette="coolwarm", legend=False)
                plt.axvline(x=0, color="black", linestyle="--")
                plt.title("Feature Coefficients (Logistic Regression)")
                plt.xlabel("Log-Odds Coefficient")
                plt.savefig(os.path.join(export_path, f"{filename_prefix}feature_importance.png"), bbox_inches="tight", dpi=150)
                plt.show()
                
                display(interpretation)
            else:
                interpretation = pd.DataFrame({
                    "Feature": encoded_feature_names,
                    "Importance": classifier.feature_importances_
                }).sort_values("Importance", ascending=False)
                
                # Plot importances
                plt.figure(figsize=(10, 5))
                sns.barplot(data=interpretation, x="Importance", y="Feature", hue="Feature", palette="viridis", legend=False)
                plt.title("Feature Importances")
                plt.xlabel("Importance Score")
                plt.savefig(os.path.join(export_path, f"{filename_prefix}feature_importance.png"), bbox_inches="tight", dpi=150)
                plt.show()
                
                display(interpretation)
        """),
        
        make_md_cell("""
            ## 14. Economic and Real-World Relevance
            
            The Titanic classification problem serves as a proxy for safety engineering, risk profiling, and policy analysis in maritime operations, insurance, and medicine.
        """),
        
        make_md_cell("""
            ## 15. Data Science Mindset
            
            - **Be thorough:** Look for missingness and data anomalies early.
            - **Be leakage-aware:** Always impute and engineer features within the pipeline cross-validation folds.
            - **Be visual:** A single well-crafted plot carries more weight than dozens of printed statistics tables.
        """),
        
        make_md_cell("""
            ## 16. Final Reflection
            
            Data science is more than just parameter tuning. It is about understanding the human story beneath the rows, cleaning responsibly, and validating results against realistic baselines.
        """),
        
        make_md_cell("""
            ## 17. Passenger Predictions & Custom Colab Test Sandbox
            
            Evaluating custom passenger scenarios matching the Jupyter notebook showcase profiles.
            You can also copy the custom passenger Python script from the companion website sandbox and paste it into the code cell below to run predictions live!
        """),
        
        make_code_cell(r"""
            model = best_pipeline

            custom_passengers = pd.DataFrame([
                {"pclass": 3, "sex": "male", "age": 22.0, "sibsp": 0, "parch": 0, "fare": 7.25, "embarked": "S", "cabin": np.nan, "name": "Single, Mr. Third Class"},
                {"pclass": 1, "sex": "female", "age": 38.0, "sibsp": 1, "parch": 0, "fare": 71.28, "embarked": "C", "cabin": "C85", "name": "Married, Mrs. First Class"},
                {"pclass": 2, "sex": "male", "age": 6.0, "sibsp": 1, "parch": 1, "fare": 26.00, "embarked": "S", "cabin": np.nan, "name": "Child, Master. Second Class"}
            ])

            print("LIVE SIMULATION PREDICTIONS")
            print("=" * 60)
            predict_and_print(custom_passengers, model)
        """),
        
        make_md_cell("""
            ## 18. Hands-On Exercise: Exploring Statistics in the Titanic Dataset
            
            This section contains the hands-on statistics exercises matching your classroom curriculum for June 18, 2026.
            
            ### Part 2: Variance & Correlation
            We calculate the variance and standard deviation of passenger Fares, and visualize linear relationships using a correlation heatmap of selected features.
        """),
        
        make_code_cell(r"""
            # Calculate variance and standard deviation of Fare
            fare_var = df["fare"].var()
            fare_std = df["fare"].std()
            print(f"Fare Variance: {fare_var:.4f}")
            print(f"Fare Standard Deviation: {fare_std:.4f}")

            # Create correlation heatmap for selected features
            plt.figure(figsize=(6, 4))
            selected_features = df[["age", "fare", "pclass", "survived"]].copy()
            # Map sex to numeric for correlation
            selected_features["sex_code"] = df["sex"].map({"male": 0, "female": 1})
            sns.heatmap(selected_features.corr(), annot=True, cmap="coolwarm", fmt=".2f", vmin=-1, vmax=1)
            plt.title("Correlation Heatmap (Selected Features)")
            
            export_path = "../public/assets/plots/" if os.path.exists("../public/") else "./plots/"
            os.makedirs(export_path, exist_ok=True)
            plt.savefig(os.path.join(export_path, f"{filename_prefix}statistics_correlation.png"), bbox_inches="tight", dpi=150)
            plt.show()
        """),
        
        make_code_cell(r"""
            # Create correlation heatmap for raw and engineered demographic features (correlation_heatmap.png)
            plt.figure(figsize=(8, 6))
            correlation_source = df[["age", "fare", "sibsp", "parch", "pclass", "survived"]].copy()
            correlation_source["sex_female"] = (df["sex"] == "female").astype(int)
            correlation_source["family_size"] = df["sibsp"] + df["parch"] + 1
            correlation = correlation_source.corr(numeric_only=True)

            sns.heatmap(correlation, annot=True, fmt=".2f", center=0, cmap="vlag")
            plt.title("Correlation Table Heatmap")

            plt.savefig(os.path.join(export_path, f"{filename_prefix}correlation_heatmap.png"), bbox_inches="tight", dpi=150)
            plt.show()
        """),

        make_md_cell("""
            ### Part 3: Hypothesis Testing
            We run a two-sample independent Student's t-test to determine if the difference in survival rates between women and men is statistically significant.
        """),
        
        make_code_cell(r"""
            from scipy.stats import ttest_ind

            male = df[df["sex"] == "male"]["survived"]
            female = df[df["sex"] == "female"]["survived"]
            
            t_stat, p_val = ttest_ind(female, male)
            print("=== Student's t-Test Results ===")
            print(f"t-statistic : {t_stat:.6f}")
            print(f"p-value     : {p_val:.4e}")
            
            if p_val < 0.05:
                print("\nInterpretation: Since the p-value is less than 0.05, the difference is STATISTICALLY SIGNIFICANT.")
                print("We reject the null hypothesis; women had a significantly higher survival rate than men.")
            else:
                print("\nInterpretation: Since the p-value is greater than 0.05, the difference is NOT statistically significant.")
        """),
        
        make_md_cell("""
            ### Part 4: Regression
            We construct a simple Logistic Regression classifier using Age, Fare, and Pclass to estimate the survival probability of a hypothetical passenger.
        """),
        
        make_code_cell(r"""
            from sklearn.linear_model import LogisticRegression

            # Prepare data
            X_simple = df[["age", "fare", "pclass"]].copy()
            y_simple = df["survived"]

            # Impute missing values using the mean
            X_simple = X_simple.fillna(X_simple.mean())

            # Train simple model
            simple_model = LogisticRegression(solver="liblinear", random_state=42)
            simple_model.fit(X_simple, y_simple)

            # Predict survival for a custom passenger: Age=25, Fare=50, Pclass=2
            custom_test = pd.DataFrame([[25.0, 50.0, 2]], columns=X_simple.columns)
            pred_survival = simple_model.predict(custom_test)[0]
            pred_prob = simple_model.predict_proba(custom_test)[0, 1]

            print("=== Simple Logistic Regression Predictor ===")
            print("Passenger Profile  : Age=25, Fare=50, Pclass=2")
            print(f"Survival Probability: {pred_prob*100:.2f}%")
            print(f"Prediction Outcome : {'SURVIVES' if pred_survival == 1 else 'DECEASED'}")
        """),
        
        make_md_cell("""
            ### Part 5: Classroom Reflection & Discussion
            
            1. **Which statistical measure gave the most insight?**
               Comparing passenger survival rates by gender and class (descriptive stats) along with the correlation heatmap reveals that gender (`sex_code`) is the strongest linear predictor of survival.
               
            2. **How did hypothesis testing validate your assumptions?**
               The t-test result ($p < 0.01$) statistically validated our qualitative observation that women survived at significantly higher rates, confirming it was not a random sampling anomaly.
               
            3. **How does regression connect statistics to ML prediction?**
               Regression transforms descriptive parameters into a linear equation that maps attributes to log-odds ratios, showing how statistical coefficients parameterize classification models.
        """),
        
        make_md_cell("""
            ## 19. Export Kaggle Submission
            
            Lastly, we fit our best parameter pipeline on the *complete* training dataset (to maximize model exposure) and generate predictions on Kaggle's unseen `test` profiles.
        """),
        
        make_code_cell(r"""
            # Fit the optimal pipeline on the full training set (X, y)
            final_pipeline = Pipeline(steps=[
                ("group_age_imputer", GroupMedianAgeImputer()),
                ("feature_engineer", TitanicFeatureEngineer()),
                ("preprocess", preprocessor),
                ("classifier", LogisticRegression(C=grid_search.best_params_["classifier__C"], max_iter=1000, solver="liblinear", random_state=42))
            ])
            final_pipeline.fit(X, y)

            # Run predictions on clean Kaggle test set
            test_preds = final_pipeline.predict(test)

            # Format submission layout
            submission = pd.DataFrame({
                "PassengerId": test["passengerid"],
                "Survived": test_preds
            })

            submission.columns = ["PassengerId", "Survived"]

            # Export to CSV
            try:
                os.makedirs("../submissions/", exist_ok=True)
                sub_path = "../submissions/submission_best_classical.csv"
            except Exception:
                os.makedirs("submissions/", exist_ok=True)
                sub_path = "submissions/submission_best_classical.csv"
            submission.to_csv(sub_path, index=False)

            print(f"✓ Saved Kaggle predictions to: {sub_path}")
            print(submission.head(10))
        """),

        make_md_cell("""
            # Professor Questions and Evidence

            ## Day 2 — Python for Data Science
            Review the load, clean, explore, visualize, model, predict, and communicate workflow above.

            ## Day 3 — Data Visualization
            Review the generated gender/class plots and interactive exploratory views.

            ## Day 4 — Statistics for ML
            Review descriptive statistics, the gender-survival hypothesis test, and held-out model evaluation.

            ## Assignment Evidence Generated from Code
            The next cell runs the shared evidence generator. Exact professor questions and editable response scaffolds are maintained in `docs/` and `reports/` rather than answered here.
        """),

        make_code_cell("""
            # Generate and inspect assignment evidence; values are not pasted manually.
            import importlib.util
            import json
            import os
            import subprocess
            import sys
            from pathlib import Path

            repo_url = 'https://github.com/sid0sid-ops/titanic-data-to-discovery.git'
            in_colab = 'COLAB_RELEASE_TAG' in os.environ
            if in_colab:
                project_root = Path('/content/titanic-data-to-discovery')
                if not (project_root / 'scripts' / 'generate_assignment_evidence.py').exists():
                    subprocess.run(['git', 'clone', repo_url, str(project_root)], check=True)
            else:
                candidates = [Path.cwd(), Path.cwd().parent]
                project_root = next((path for path in candidates if (path / 'scripts' / 'generate_assignment_evidence.py').exists()), None)

            if project_root is None:
                raise FileNotFoundError('Open this notebook from the repository root or clone the repository first.')
            else:
                required = {'pandas': 'pandas', 'matplotlib': 'matplotlib', 'seaborn': 'seaborn', 'sklearn': 'scikit-learn', 'scipy': 'scipy', 'plotly': 'plotly'}
                missing = [package for module, package in required.items() if importlib.util.find_spec(module) is None]
                if missing:
                    subprocess.run([sys.executable, '-m', 'pip', 'install', *missing], check=True)
                evidence_script = project_root / 'scripts' / 'generate_assignment_evidence.py'
                subprocess.run([sys.executable, str(evidence_script)], cwd=project_root, check=True)
                metrics_path = project_root / 'reports' / 'metrics' / 'model_metrics.json'
                evidence_metrics = json.loads(metrics_path.read_text())
                display(pd.DataFrame([evidence_metrics]).T.rename(columns={0: 'value'}))
                print('Evidence tables: reports/tables/')
                print('Evidence figures: reports/figures/')
                print('Evidence metrics: reports/metrics/')
        """)
    ]
    
    for index, cell in enumerate(cells):
        cell["id"] = f"cell-{index:03d}"

    notebook = {
        "cells": cells,
        "metadata": {
            "kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"},
            "language_info": {"name": "python", "pygments_lexer": "ipython3"}
        },
        "nbformat": 4,
        "nbformat_minor": 5
    }
    
    nb_name = "00_Titanic_Kaggle_Main_Workflow.ipynb"
    nb_path = NOTEBOOKS_DIR / nb_name
    if nb_path.exists():
        nb_path.unlink()
    with open(nb_path, "w", encoding="utf-8") as f:
        json.dump(notebook, f, indent=2, ensure_ascii=False)

    code_export = "\n\n# %%\n\n".join(
        "".join(cell["source"]) for cell in cells if cell["cell_type"] == "code"
    ) + "\n"
    for suffix in (".py", ".txt"):
        (NOTEBOOKS_DIR / f"00_Titanic_Kaggle_Main_Workflow{suffix}").write_text(code_export, encoding="utf-8")
    print(f"✓ Generated {nb_name} and synchronized .py/.txt code exports")

if __name__ == "__main__":
    main()
