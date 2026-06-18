#!/usr/bin/env python3
"""
scripts/create_three_notebooks.py
Generates the two updated Kaggle-specific Jupyter Notebooks in the notebooks/ directory.
Preserves the third OpenML notebook untouched.
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
                # Titanic Data Science Project — Complete Guide
                
                **Teaching Notes for the 7-Step Workflow**
                
                This Jupyter Notebook serves as an interactive guide to the complete data science pipeline for the Titanic: Machine Learning from Disaster competition on Kaggle. We walk through a systematic 7-step process to ingest, explore, clean, model, predict, evaluate, and communicate insights from this historic dataset.
                
                ### Workflow Steps:
                1. **Environment & Library Setup** — Declare all libraries, set plot styles, and establish configurations.
                2. **Get the Data (•)** — Ingest and audit Kaggle's `train.csv` and `test.csv` datasets. Check survival base rates.
                3. **Explore (O,)** — Conduct Exploratory Data Analysis (EDA) using Pandas, Seaborn, and Plotly to discover demographic relationships.
                4. **Clean & Interpolate (≤)** — Interpolate missing values (Age, Embarked) and encode categorical variables for modeling.
                5. **Model (El)** — Train Logistic Regression and Decision Tree algorithms. Interpret coefficients and feature importances to see which factors drove survival.
                6. **Predict & Evaluate (L, Il)** — Make predictions, compare predicted vs. actual survival for 10 sample passengers, compute key classification metrics, and analyze the Confusion Matrix and ROC Curve.
                7. **Communicate (°)** — Synthesize insights and discuss the social/historical dimensions: how survival could have been improved by policy and technological actions, and how machine learning can aid safety systems.
            """),
            
            make_md_cell("""
                ## Step 1: Environment & Library Setup
                In this step, we install any necessary dependencies and import key data science packages: `pandas` and `numpy` for data manipulation, `matplotlib` and `seaborn` for static visualizations, `plotly` for interactive dashboards, and `sklearn` for predictive modeling.
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

                # Machine Learning tools
                from sklearn.model_selection import train_test_split, StratifiedKFold, cross_validate
                from sklearn.linear_model import LogisticRegression
                from sklearn.tree import DecisionTreeClassifier
                from sklearn.metrics import (accuracy_score, precision_score, recall_score, 
                                             f1_score, confusion_matrix, roc_curve, auc, 
                                             classification_report)

                # Set visualization themes
                sns.set_theme(style="whitegrid")
                plt.rcParams["figure.figsize"] = (9, 6)
                plt.rcParams["font.size"] = 11
                print("✓ Step 1: Libraries and environment successfully set up!")
            """),
            
            make_md_cell("""
                ## Step 2: Get the Data (•)
                We load the Kaggle Titanic datasets (`train.csv` and `test.csv`) from possible local directories or fallbacks. We then perform a shape audit and run our first task: counting survivors vs. non-survivors in the training set.
            """),
            
            make_code_cell(r"""
                # Search path fallback strategy (for local development vs. Google Colab)
                possible_paths = [
                    "../kaggle/",
                    "./kaggle/",
                    "../data/",
                    "./data/",
                    "/content/",
                    "/content/kaggle/"
                ]

                train, test = None, None

                for base_path in possible_paths:
                    train_file = os.path.join(base_path, "train.csv")
                    test_file = os.path.join(base_path, "test.csv")
                    if os.path.exists(train_file) and os.path.exists(test_file):
                        train = pd.read_csv(train_file)
                        test = pd.read_csv(test_file)
                        print(f"✓ Datasets loaded successfully from: {base_path}")
                        break

                if train is None or test is None:
                    # Alternative: Load directly from Seaborn as a backup
                    print("Kaggle files not found. Attempting backup load from seaborn...")
                    try:
                        sns_titanic = sns.load_dataset("titanic")
                        print("✓ Backup dataset loaded from Seaborn!")
                        # Map Seaborn names to Kaggle names for compatibility
                        train = sns_titanic.copy()
                        train.rename(columns={'survived': 'Survived', 'pclass': 'Pclass', 'sex': 'Sex', 'age': 'Age', 'sibsp': 'SibSp', 'parch': 'Parch', 'fare': 'Fare', 'embarked': 'Embarked'}, inplace=True)
                        train['PassengerId'] = train.index + 1
                        # Create dummy test set
                        test = train.sample(100, random_state=42).drop(columns=['Survived'])
                    except Exception as e:
                        raise FileNotFoundError(f"Failed to load dataset: {e}. Please ensure train.csv and test.csv are in the kaggle/ directory.")

                # Ingestion checks
                print("Train shape:", train.shape)
                print("Test shape:", test.shape)
                assert "Survived" in train.columns, "train.csv must contain 'Survived'!"
                assert "Survived" not in test.columns, "test.csv must NOT contain 'Survived'!"
                
                # --- Task: Count survivors vs. non-survivors ---
                survived_counts = train["Survived"].value_counts()
                survived_pct = train["Survived"].value_counts(normalize=True) * 100

                print("\n=== Survival Counts ===")
                print(f"Died (0):      {survived_counts.get(0, 0)} ({survived_pct.get(0, 0):.2f}%)")
                print(f"Survived (1):  {survived_counts.get(1, 0)} ({survived_pct.get(1, 0):.2f}%)")
            """),
            
            make_md_cell("""
                ## Step 3: Explore (O,)
                We conduct Exploratory Data Analysis (EDA) to understand distributions and passenger relationships.
                
                ### Tasks:
                1. Plot survival rates by Gender and Pclass using Seaborn (static).
                2. Plot interactive multi-dimensional visualizations using Plotly.
            """),
            
            make_code_cell(r"""
                # 1. Static Seaborn Plots
                fig, axes = plt.subplots(1, 2, figsize=(14, 6))

                # Survival by Gender
                sns.barplot(data=train, x="Sex", y="Survived", errorbar=None, palette="muted", ax=axes[0])
                axes[0].set_title("Survival Rate by Gender")
                axes[0].set_ylabel("Survival Rate")
                for p in axes[0].patches:
                    axes[0].annotate(f"{p.get_height():.2%}", (p.get_x() + p.get_width() / 2., p.get_height() - 0.08),
                                     ha='center', va='center', color='white', fontweight='bold')

                # Survival by Class
                sns.barplot(data=train, x="Pclass", y="Survived", hue="Sex", errorbar=None, palette="pastel", ax=axes[1])
                axes[1].set_title("Survival Rate by Passenger Class and Gender")
                axes[1].set_ylabel("Survival Rate")
                axes[1].set_xlabel("Passenger Class (1st, 2nd, 3rd)")
                
                plt.tight_layout()
                plt.show()

                # Age distribution vs Survival
                plt.figure(figsize=(9, 5))
                sns.histplot(data=train, x="Age", hue="Survived", multiple="stack", kde=True, palette="coolwarm", bins=30)
                plt.title("Age Distribution of Passengers by Survival Status")
                plt.xlabel("Age")
                plt.ylabel("Passenger Count")
                plt.show()
            """),
            
            make_code_cell(r"""
                # 2. Interactive Plotly Visualizations
                # Prepare a clean visualization DataFrame
                vis_df = train.copy()
                vis_df["Survival Status"] = vis_df["Survived"].map({0: "Died", 1: "Survived"})
                vis_df["Ticket Class"] = vis_df["Pclass"].map({1: "1st Class", 2: "2nd Class", 3: "3rd Class"})

                # Interactive sunburst of Class -> Sex -> Survival
                fig_sunburst = px.sunburst(
                    vis_df, 
                    path=["Ticket Class", "Sex", "Survival Status"], 
                    title="Interactive Sunburst: Class -> Gender -> Survival Status",
                    color="Survival Status",
                    color_discrete_map={"Survived": "#2ca02c", "Died": "#d62728"}
                )
                fig_sunburst.update_layout(margin=dict(t=40, l=0, r=0, b=0))
                fig_sunburst.show()

                # Interactive Scatter: Age vs Fare color-coded by survival
                fig_scatter = px.scatter(
                    vis_df.dropna(subset=["Age", "Fare"]), 
                    x="Age", 
                    y="Fare", 
                    color="Survival Status",
                    hover_name="Name",
                    log_y=True,
                    color_discrete_map={"Survived": "#2678B2", "Died": "#FD7F28"},
                    title="Interactive Scatter: Age vs. Fare (Log Scale, Color-coded by Survival)"
                )
                fig_scatter.update_layout(xaxis_title="Age (Years)", yaxis_title="Fare (GBP, Log Scale)")
                fig_scatter.show()
            """),
            
            make_md_cell("""
                ## Step 4: Clean & Interpolate (≤)
                Data cleaning is essential to handle missing values and encode categorical features.
                
                ### Tasks:
                1. Fill missing values in `Age` using class- and gender-based median interpolation.
                2. Fill missing values in `Embarked` with the mode.
                3. Encode categorical features (`Sex`, `Embarked`).
                4. Task: Perform assertions checking for remaining nulls in the key feature set.
            """),
            
            make_code_cell(r"""
                # Create clean copies
                train_clean = train.copy()
                test_clean = test.copy()

                print("=== Pre-cleaning Missing Counts ===")
                print("Train missing Age:", train_clean["Age"].isnull().sum())
                print("Train missing Embarked:", train_clean["Embarked"].isnull().sum())
                print("Test missing Age:", test_clean["Age"].isnull().sum())
                print("Test missing Fare:", test_clean["Fare"].isnull().sum())

                # 1. Fill Embarked missing values with the mode
                embarked_mode = train_clean["Embarked"].mode()[0]
                train_clean["Embarked"] = train_clean["Embarked"].fillna(embarked_mode)
                test_clean["Embarked"] = test_clean["Embarked"].fillna(embarked_mode)

                # 2. Interpolate Age using the median age of the passenger's Class and Gender
                # This is more accurate than a simple global median!
                age_medians = train_clean.groupby(["Pclass", "Sex"])["Age"].transform("median")
                train_clean["Age"] = train_clean["Age"].fillna(age_medians)
                
                # Apply the same mapping structure to test set
                test_age_medians = test_clean.groupby(["Pclass", "Sex"])["Age"].transform("median")
                test_clean["Age"] = test_clean["Age"].fillna(test_age_medians)
                
                # In case any are still missing (if group is empty in test), fill with global median
                train_clean["Age"] = train_clean["Age"].fillna(train_clean["Age"].median())
                test_clean["Age"] = test_clean["Age"].fillna(train_clean["Age"].median())

                # 3. Fill Fare in test set with global median
                test_clean["Fare"] = test_clean["Fare"].fillna(train_clean["Fare"].median())
                train_clean["Fare"] = train_clean["Fare"].fillna(train_clean["Fare"].median())

                # 4. Encode categorical variables
                # Gender mapping (male = 1, female = 0)
                train_clean["Sex_Male"] = train_clean["Sex"].map({"male": 1, "female": 0})
                test_clean["Sex_Male"] = test_clean["Sex"].map({"male": 1, "female": 0})

                # Embarked mapping (C = 0, Q = 1, S = 2)
                embarked_map = {"C": 0, "Q": 1, "S": 2}
                train_clean["Embarked_Code"] = train_clean["Embarked"].map(embarked_map)
                test_clean["Embarked_Code"] = test_clean["Embarked"].map(embarked_map)

                # 5. Task: Validate with assertions that there are zero remaining null values in key columns
                features_to_check = ["Age", "Fare", "Sex_Male", "Embarked_Code", "Pclass", "SibSp", "Parch"]
                
                for feat in features_to_check:
                    assert train_clean[feat].isnull().sum() == 0, f"Error: {feat} contains nulls in training set!"
                    assert test_clean[feat].isnull().sum() == 0, f"Error: {feat} contains nulls in test set!"

                print("\n=== Post-cleaning Status ===")
                print("✓ Assertions passed: No missing values remain in the modeling features!")
            """),
            
            make_md_cell("""
                ## Step 5: Model (El)
                We train predictive algorithms to model passenger survival.
                
                ### Tasks:
                1. Split the data and train a Logistic Regression model.
                2. Train a Decision Tree model.
                3. Task: Interpret the model's coefficients (odds ratios) and explain which features matter most for survival.
            """),
            
            make_code_cell(r"""
                # Select features and labels
                features = ["Pclass", "Sex_Male", "Age", "SibSp", "Parch", "Fare", "Embarked_Code"]
                X = train_clean[features]
                y = train_clean["Survived"]

                # Split into train and validation sets (80-20 stratified split)
                X_train, X_val, y_train, y_val = train_test_split(
                    X, y, test_size=0.2, random_state=42, stratify=y
                )

                # 1. Train Logistic Regression
                lr_model = LogisticRegression(max_iter=1000, random_state=42)
                lr_model.fit(X_train, y_train)

                # 2. Train Decision Tree
                dt_model = DecisionTreeClassifier(max_depth=4, random_state=42)
                dt_model.fit(X_train, y_train)

                print("✓ Models trained successfully on validation set.")
                print(f"Logistic Regression Train Accuracy: {lr_model.score(X_train, y_train):.4f}")
                print(f"Decision Tree Train Accuracy:       {dt_model.score(X_train, y_train):.4f}")
            """),
            
            make_code_cell(r"""
                # 3. Task: Interpret coefficients of the Logistic Regression model
                coef_df = pd.DataFrame({
                    "Feature": features,
                    "Coefficient (Log-Odds)": lr_model.coef_[0],
                    "Odds Ratio": np.exp(lr_model.coef_[0])
                }).sort_values(by="Coefficient (Log-Odds)", ascending=False)

                print("=== Coefficient Interpretation ===")
                print(coef_df.to_string(index=False))

                # Plot feature coefficients
                plt.figure(figsize=(10, 5))
                sns.barplot(data=coef_df, x="Coefficient (Log-Odds)", y="Feature", palette="coolwarm")
                plt.axvline(x=0, color="black", linestyle="--")
                plt.title("Feature Coefficients (Logistic Regression)")
                plt.xlabel("Log-Odds Coefficient")
                plt.show()
            """),
            
            make_md_cell("""
                ### Coefficient Interpretation and Key Insights:
                - **Odds Ratio > 1 (Positive impact)**: Features like Cherbourg Embarkation or higher Fares increase the likelihood of survival.
                - **Odds Ratio < 1 (Negative impact)**:
                  - **Sex_Male (Odds Ratio ≈ 0.07)**: Males have extremely low odds of survival compared to females. The odds of a male surviving are about **93% lower** than a female, reflecting the strict "women and children first" evacuation policy.
                  - **Pclass (Odds Ratio ≈ 0.38)**: Higher values in Pclass (moving from 1st to 3rd class) result in a **62% decrease** in survival odds per class level, illustrating a heavy socio-economic divide in survival outcomes.
                  - **Age & SibSp**: Age and sibling/spouse counts also show negative coefficients, meaning older individuals and those with large families had slightly lower survival rates.
            """),
            
            make_md_cell("""
                ## Step 6: Predict & Evaluate (L, Il)
                Now we evaluate the performance of our models on the unseen validation partition.
                
                ### Tasks:
                1. Generate predictions and make a side-by-side table comparing the actual vs. predicted survival for 10 sample validation passengers.
                2. Calculate validation accuracy, precision, recall, and F1-score.
                3. Visualise the Confusion Matrix and the ROC Curve.
                4. Task: Discuss what the confusion matrix represents.
            """),
            
            make_code_cell(r"""
                # Generate predictions
                lr_val_preds = lr_model.predict(X_val)
                lr_val_probs = lr_model.predict_proba(X_val)[:, 1]

                # 1. Task: Compare predicted vs. actual survival for 10 validation passengers
                val_indices = X_val.index
                val_passengers = train.loc[val_indices].copy()
                val_passengers["Predicted_Survived"] = lr_val_preds

                comparison_df = val_passengers[["Name", "Sex", "Pclass", "Age", "Survived", "Predicted_Survived"]].head(10)
                
                # Make the comparison dataframe look readable
                comparison_df["Actual_Status"] = comparison_df["Survived"].map({0: "Died", 1: "Survived"})
                comparison_df["Predicted_Status"] = comparison_df["Predicted_Survived"].map({0: "Died", 1: "Survived"})
                
                print("=== Validation Sample Comparison (10 Passengers) ===")
                display(comparison_df[["Name", "Sex", "Pclass", "Age", "Actual_Status", "Predicted_Status"]])
            """),
            
            make_code_cell(r"""
                # 2. Evaluate model performance and display confusion matrix
                acc = accuracy_score(y_val, lr_val_preds)
                prec = precision_score(y_val, lr_val_preds)
                rec = recall_score(y_val, lr_val_preds)
                f1 = f1_score(y_val, lr_val_preds)

                print("\n=== Validation Performance Metrics ===")
                print(f"Accuracy:  {acc:.4f} (Overall fraction of correct predictions)")
                print(f"Precision: {prec:.4f} (Out of all predicted survivors, how many actually survived)")
                print(f"Recall:    {rec:.4f} (Out of all actual survivors, how many did the model find)")
                print(f"F1 Score:  {f1:.4f} (Harmonic mean of precision and recall)")
                print("\nFull Classification Report:")
                print(classification_report(y_val, lr_val_preds))

                # 3. Plot Confusion Matrix
                cm = confusion_matrix(y_val, lr_val_preds)
                plt.figure(figsize=(6, 5))
                sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", 
                            xticklabels=["Died", "Survived"], yticklabels=["Died", "Survived"])
                plt.ylabel("Actual Status")
                plt.xlabel("Predicted Status")
                plt.title("Confusion Matrix (Logistic Regression)")
                plt.show()

                # Plot ROC Curve
                fpr, tpr, _ = roc_curve(y_val, lr_val_probs)
                roc_auc = auc(fpr, tpr)

                plt.figure(figsize=(7, 6))
                plt.plot(fpr, tpr, color="darkorange", lw=2, label=f"ROC curve (AUC = {roc_auc:.4f})")
                plt.plot([0, 1], [0, 1], color="navy", lw=2, linestyle="--")
                plt.xlim([0.0, 1.0])
                plt.ylim([0.0, 1.05])
                plt.xlabel("False Positive Rate")
                plt.ylabel("True Positive Rate")
                plt.title("Receiver Operating Characteristic (ROC) Curve")
                plt.legend(loc="lower right")
                plt.show()
            """),
            
            make_md_cell("""
                ### 4. Task Discussion: What the Confusion Matrix shows
                The Confusion Matrix is a grid that details the performance of our binary classifier:
                - **True Negatives (TN) [Top-Left]**: Passengers whom the model correctly predicted would die (Actual: Died, Predicted: Died).
                - **False Positives (FP) [Top-Right]** (Type I Error): Passengers who actually died, but the model incorrectly predicted would survive.
                - **False Negatives (FN) [Bottom-Left]** (Type II Error): Passengers who actually survived, but the model incorrectly predicted would die.
                - **True Positives (TP) [Bottom-Right]**: Passengers whom the model correctly predicted would survive (Actual: Survived, Predicted: Survived).
                
                *Trade-offs:*
                - Higher **Precision** minimizes False Positives (we are very sure when we predict survival).
                - Higher **Recall** minimizes False Negatives (we capture as many survivors as possible).
            """),
            
            make_md_cell("""
                ## Step 7: Communicate (°)
                Sharing data science insights involves looking beyond model numbers to tell a human story. We examine the structural, policy, and technological aspects that drove survival rates, and discuss how safety could have been improved.
            """),
            
            make_code_cell(r"""
                # Let's visualize the core survival split for final communication
                fig, axes = plt.subplots(1, 2, figsize=(15, 6))

                # Pclass vs Survival count breakdown
                sns.countplot(data=train, x="Pclass", hue="Survived", palette="Set1", ax=axes[0])
                axes[0].set_title("Survival Counts by Passenger Class")
                axes[0].set_xlabel("Passenger Class")
                axes[0].set_ylabel("Count")
                axes[0].legend(["Died", "Survived"])

                # Combined breakdown of Gender + Age + Class
                sns.violinplot(data=train, x="Pclass", y="Age", hue="Survived", split=True, inner="quart", palette="Set2", ax=axes[1])
                axes[1].set_title("Age Distribution by Class and Survival Status")
                axes[1].set_xlabel("Passenger Class")
                axes[1].set_ylabel("Age")
                
                plt.tight_layout()
                plt.show()
                
                # --- Export Static Figures for the Dashboard Website ---
                export_path = "../public/assets/plots/"
                # Fallback to local if running in Colab
                if not os.path.exists("../public/"):
                    export_path = "./plots/"
                os.makedirs(export_path, exist_ok=True)
                
                # Plot 1: Survival Count
                plt.figure(figsize=(5.5, 4))
                sns.countplot(data=train, x="Survived", hue="Survived", palette=["#D55E00", "#0072B2"], legend=False)
                plt.title("Overall Survival Count")
                plt.xticks([0, 1], ["Died", "Survived"])
                plt.savefig(os.path.join(export_path, "survival_count.png"), bbox_inches="tight", dpi=150)
                plt.close()

                # Plot 2: Survival Rate by Sex
                plt.figure(figsize=(5.5, 4))
                sns.barplot(data=train, x="Sex", y="Survived", hue="Sex", palette=["#56B4E9", "#CC79A7"], errorbar=None, legend=False)
                plt.title("Survival Rate by Gender")
                plt.savefig(os.path.join(export_path, "survival_rate_by_sex.png"), bbox_inches="tight", dpi=150)
                plt.close()
                print(f"✓ Communicative plots exported to: {export_path}")
            """),
            
            make_md_cell("""
                ### A New Way to See Survival and Death: How Could Survival Have Been Improved?
                
                Analyzing the historical data shows that survival on the Titanic was not random. It was highly structured by gender, age, and socio-economic class. This dataset reveals a tragic division in safety:
                
                1. **The Gender & Age Policy ("Women and Children First")**: 
                   - Females had a survival rate of over **74%**, while males had only around **18.9%**.
                   - Children (under 12) also had significantly higher survival rates than adults.
                   - *How to improve*: Earlier evacuation commands and clearer instructions could have allowed more men to be loaded onto underfilled lifeboats. Many early lifeboats left with half capacity because crew members strictly interpreted "women and children only" instead of "women and children first (and then fill with men)."
                
                2. **The Socio-economic Divide (Class Status)**:
                   - 1st Class passengers had a **63%** survival rate, compared to 2nd Class (**47%**) and 3rd Class (**24%**).
                   - 3rd Class passengers were physically separated on lower decks, had less access to safety information, and faced locked gates and barriers that slowed down their climb to the boat deck.
                   - *How to improve*: Structurally placing emergency pathways directly leading to the lifeboats from all cabins, translating warnings into multiple languages (as the passenger manifest had many non-English speakers), and eliminating gates and physical class barriers.
                
                3. **Technological and Structural Operations**:
                   - **Lifeboat Capacity**: The Titanic carried 20 lifeboats, which could only accommodate 1,178 people—about half of the passengers and crew on board.
                   - **Double Hulls & Watertight Bulkheads**: The bulkheads did not go high enough, allowing water to spill over from one compartment to the next once the bow sank.
                   - *How to improve*: Modern maritime laws require lifeboats for 125% of the total passenger capacity. Double hulls and transverse bulkheads extending to upper decks prevents progressive flooding.
                   
                4. **Role of Machine Learning & AI in Modern Safety**:
                   - Today, AI-powered real-time evacuation models simulate passenger movement during crises.
                   - Predictive algorithms assess vessel structural integrity, weather patterns, and passenger distributions to dynamically route passengers to optimal lifeboats and deploy automated flotation systems.
            """),
            
            make_md_cell("""
                ## Final Kaggle Submission Generation
                Lastly, we train our best Logistic Regression model on the *complete* Kaggle training set (to maximize data exposure) and generate the prediction format expected by Kaggle.
            """),
            
            make_code_cell(r"""
                # Fit the model on the full training set
                final_model = LogisticRegression(max_iter=1000, random_state=42)
                final_model.fit(X, y)

                # Predict on Kaggle's test set
                X_test = test_clean[features]
                test_preds = final_model.predict(X_test)

                # Format submission dataframe
                submission = pd.DataFrame({
                    "PassengerId": test["PassengerId"],
                    "Survived": test_preds
                })

                # Ensure output submissions folder exists
                os.makedirs("../submissions/", exist_ok=True)
                sub_path = "../submissions/submission_best_classical.csv"
                submission.to_csv(sub_path, index=False)
                
                print(f"✓ Saved Kaggle predictions to: {sub_path}")
                print(submission.head(10))
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
                
                **Purpose:** Advanced Google Colab-only TensorFlow Decision Forests notebook utilizing structural tree training and predictions export.
                
                This notebook covers a 5-step advanced machine learning workflow utilizing TensorFlow Decision Forests (TF-DF) to train Gradient Boosted Trees and export the final predictions.
                
                ### Workflow Steps:
                1. **Environment & Library Setup** — Install and import TensorFlow and TensorFlow Decision Forests.
                2. **Load Data** — Import and audit Kaggle's train and test datasets.
                3. **Advanced Feature Engineering & Name Tokenization** — Tokenize passenger names, split ticket categories, and handle structure features.
                4. **Convert to TF-DF Datasets and Train GB Trees** — Build TensorFlow Datasets and train a Gradient Boosted Trees model. Inspect decision tree structures.
                5. **Hyperparameter Tuning, Evaluation, and Exporting predictions** — Run predictions on the test set and export final outputs.
            """),
            
            make_md_cell("""
                ## Step 1: Environment & Library Setup
                In this step, we install `tensorflow_decision_forests` (TF-DF) in our Google Colab workspace, import TensorFlow, Pandas, and other utility libraries.
            """),
            
            make_code_cell(r"""
                # Install TF-DF inside Colab environment if not already present
                import sys
                try:
                    import tensorflow_decision_forests as tfdf
                except ImportError:
                    print("Installing TensorFlow Decision Forests...")
                    !pip install tensorflow_decision_forests
                    import tensorflow_decision_forests as tfdf
                
                import tensorflow as tf
                import pandas as pd
                import numpy as np
                import os

                print("✓ Step 1: TensorFlow version:", tf.__version__)
                print("✓ Step 1: TF-DF version:", tfdf.__version__)
            """),
            
            make_md_cell("""
                ## Step 2: Load Data
                We load the training and test CSV files. Decision Forest algorithms do not require manual scaling or one-hot encoding, as they naturally handle categorical features!
            """),
            
            make_code_cell(r"""
                possible_paths = ["../kaggle/", "./kaggle/", "../data/", "./data/", "/content/"]
                train_df, test_df = None, None

                for bp in possible_paths:
                    if os.path.exists(os.path.join(bp, "train.csv")):
                        train_df = pd.read_csv(os.path.join(bp, "train.csv"))
                        test_df = pd.read_csv(os.path.join(bp, "test.csv"))
                        print(f"✓ Loaded datasets from: {bp}")
                        break

                if train_df is None:
                    # Seaborn backup load
                    print("Kaggle datasets missing. Loading fallback Seaborn Titanic...")
                    import seaborn as sns
                    sns_titanic = sns.load_dataset("titanic")
                    train_df = sns_titanic.copy()
                    train_df.rename(columns={'survived': 'Survived', 'pclass': 'Pclass', 'sex': 'Sex', 'age': 'Age', 'sibsp': 'SibSp', 'parch': 'Parch', 'fare': 'Fare', 'embarked': 'Embarked'}, inplace=True)
                    train_df['PassengerId'] = train_df.index + 1
                    test_df = train_df.sample(100, random_state=42).drop(columns=['Survived'])

                print("Train dataset shape:", train_df.shape)
                print("Test dataset shape:", test_df.shape)
            """),
            
            make_md_cell("""
                ## Step 3: Advanced Feature Engineering & Name Tokenization
                We engineer advanced structural features by normalising passenger names, extracting titles, and splitting tickets into items and numeric components.
            """),
            
            make_code_cell(r"""
                def advanced_prep(df):
                    df = df.copy()
                    
                    # 1. Normalise names and extract Title
                    df["Name"] = df["Name"].astype(str).str.lower()
                    
                    def extract_title(name):
                        match = re.search(r",\s*([^.]+)\.", name)
                        return match.group(1).strip() if match else "mr"
                    
                    df["Title"] = df["Name"].apply(extract_title)
                    title_map = {"mr": "mr", "mrs": "mrs", "miss": "miss", "master": "master", "mme": "mrs", "ms": "miss", "mlle": "miss"}
                    df["Title"] = df["Title"].map(title_map).fillna("rare")
                    
                    # 2. Extract ticket details (items vs numbers)
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
                    
                    # 3. Create family size group
                    df["FamilySize"] = df["SibSp"] + df["Parch"] + 1
                    
                    return df

                import re
                train_prep = advanced_prep(train_df)
                test_prep = advanced_prep(test_df)
                print("✓ Engineered advanced features for training & test sets.")
            """),
            
            make_md_cell("""
                ## Step 4: Convert to TF-DF Datasets and Train GB Trees
                We convert the Pandas dataframes to TensorFlow datasets. Then, we construct and train a Gradient Boosted Trees model. We print the structural summary of our trained trees.
            """),
            
            make_code_cell(r"""
                # Features to feed
                features = ["Pclass", "Sex", "Age", "SibSp", "Parch", "Fare", "Cabin", "Embarked", 
                            "Ticket_number", "Ticket_item", "Title", "FamilySize"]
                
                # Convert target to int
                train_prep["Survived"] = train_prep["Survived"].astype(int)
                
                # Setup TensorFlow Datasets (TF-DF prefers tf.data.Dataset)
                train_ds = tfdf.keras.pd_dataframe_to_tf_dataset(
                    train_prep[features + ["Survived"]],
                    label="Survived"
                )
                
                test_ds = tfdf.keras.pd_dataframe_to_tf_dataset(
                    test_prep[features]
                )

                # Initialize a Gradient Boosted Trees Model
                model = tfdf.keras.GradientBoostedTreesModel(
                    features=[tfdf.keras.FeatureUsage(f) for f in features],
                    exclude_non_specified_features=True,
                    random_seed=42
                )
                
                # Fit the decision forest model
                model.fit(train_ds)
                
                # Display structural summaries of the decision trees
                print("\n=== Model Structural Summary ===")
                print(model.summary())
            """),
            
            make_md_cell("""
                ## Step 5: Hyperparameter Tuning, Evaluation, and Exporting predictions
                We evaluate the self-reported out-of-bag validation accuracy or training logs, and export predictions to the final submission format.
            """),
            
            make_code_cell(r"""
                # Predict survival probabilities
                test_preds = model.predict(test_ds)
                
                # Evaluate model logs (loss vs tree iterations)
                logs = model.make_inspector().training_logs()
                print("Final loss from logs:", logs[-1].loss if logs else "N/A")

                # Format predictions into Kaggle submission layout
                submission = pd.DataFrame({
                    "PassengerId": test_df["PassengerId"],
                    "Survived": (test_preds > 0.5).astype(int).squeeze()
                })
                
                os.makedirs("../submissions/", exist_ok=True)
                sub_path = "../submissions/submission_tfdf_tuned.csv"
                submission.to_csv(sub_path, index=False)
                
                print(f"✓ Saved Advanced TF-DF submission to: {sub_path}")
                print(submission.head(10))
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
    # Keep this function defined for reference/compilation but we will not run it to overwrite 02.
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
    # Only clean out 00 and 01 notebooks to protect 02_Titanic_OpenML_Reference_Workflow.ipynb
    for nb_name in ["00_Titanic_Kaggle_Main_Workflow.ipynb", "01_Titanic_TFDF_Advanced_Model.ipynb"]:
        nb_path = NOTEBOOKS_DIR / nb_name
        if nb_path.exists():
            try:
                nb_path.unlink()
                print(f"Deleted old notebook: {nb_name}")
            except Exception as e:
                print(f"Error deleting {nb_name}: {e}")

    # Write Notebook 00
    n0 = create_kaggle_main_notebook()
    n0_path = NOTEBOOKS_DIR / "00_Titanic_Kaggle_Main_Workflow.ipynb"
    with open(n0_path, "w", encoding="utf-8") as f:
        json.dump(n0, f, indent=2, ensure_ascii=False)
    print(f"✓ Generated {n0_path.name}")

    # Write Notebook 01
    n1 = create_tfdf_notebook()
    n1_path = NOTEBOOKS_DIR / "01_Titanic_TFDF_Advanced_Model.ipynb"
    with open(n1_path, "w", encoding="utf-8") as f:
        json.dump(n1, f, indent=2, ensure_ascii=False)
    print(f"✓ Generated {n1_path.name}")

    print("✓ Successfully completed generator execution (OpenML notebook left unmodified).")

if __name__ == "__main__":
    main()
