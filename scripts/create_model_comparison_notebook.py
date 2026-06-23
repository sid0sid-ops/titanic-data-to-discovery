#!/usr/bin/env python3
"""
scripts/create_model_comparison_notebook.py
Generates notebooks/01_Titanic_Model_Comparison_Project.ipynb
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
    return {"cell_type": "markdown", "metadata": {}, "source": clean_source(text)}


def make_code_cell(text):
    return {
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": clean_source(text),
    }


def main():
    notebook = {
        "cells": [
            make_md_cell("""
                # Titanic Model Comparison Project
                
                **Models compared:** Logistic Regression, Decision Tree, Random Forest, Google YDF (Random Forest & Gradient Boosted Trees), XGBoost, LightGBM, CatBoost
                
                **Workflow:**
                1. Load Kaggle train.csv and test.csv
                2. Clean and engineer features
                3. Split train.csv into training + validation
                4. Train many models
                5. Compare accuracy, precision, recall, F1, ROC-AUC
                6. Pick best model
                7. Predict Kaggle test.csv
                8. Create submission.csv
                
                I compared multiple machine learning models on the Titanic Kaggle dataset to observe how different algorithms affect survival prediction. I used Logistic Regression as a simple baseline, Decision Tree and Random Forest as tree-based models, YDF as a modern decision forest framework, and XGBoost, LightGBM, and CatBoost as advanced gradient boosting models.
                
                All models were trained and tested on the same train-validation split to make the comparison fair. I evaluated them using accuracy, precision, recall, F1 score, and ROC-AUC. The best model was selected based on validation performance and then used to generate predictions for the Kaggle test dataset.
            """),
            make_md_cell("""
                ## Step 1: Environment & Setup
                We install Google YDF (`ydf`), XGBoost, LightGBM, and CatBoost inside the Colab environment. We also import Pandas, NumPy, and Scikit-Learn evaluation utilities.
            """),
            make_code_cell(r"""
                # Logistic Regression, Decision Tree, Random Forest,
                # YDF, XGBoost, LightGBM, CatBoost
                # 1. Load Kaggle train.csv and test.csv
                # 2. Clean and engineer features
                # 3. Split train.csv into training + validation
                # 4. Train many models
                # 5. Compare accuracy, precision, recall, F1, ROC-AUC
                # 6. Pick best model
                # 7. Predict Kaggle test.csv
                # 8. Create submission.csv
                
                import sys  # noqa: F401 - used by the Colab shell install command
                import os
                import warnings
                warnings.filterwarnings("ignore")
                
                # Install YDF, XGBoost, LightGBM, CatBoost if not present
                libs = ["ydf", "xgboost", "lightgbm", "catboost"]
                for lib in libs:
                    try:
                        __import__(lib)
                    except ImportError:
                        print(f"Installing {lib}...")
                        !{sys.executable} -m pip install {lib} -U --quiet
                
                import pandas as pd  # noqa: E402
                import numpy as np  # noqa: E402
                
                print("✓ Step 1: Libraries and environment successfully set up!")
            """),
            make_md_cell("""
                ## Step 2: Load Data
                We load the training and test CSV files. If local files are not present in Colab, we download them from the remote GitHub repository fallback.
            """),
            make_code_cell(r"""
                possible_paths = ["../kaggle/", "./kaggle/", "../data/", "./data/", "/content/", "/content/kaggle/"]
                train_df, test_df = None, None

                for bp in possible_paths:
                    if os.path.exists(os.path.join(bp, "train.csv")):
                        train_df = pd.read_csv(os.path.join(bp, "train.csv"))
                        test_df = pd.read_csv(os.path.join(bp, "test.csv"))
                        print(f"✓ Loaded datasets from local path: {bp}")
                        break

                if train_df is None:
                    print("Kaggle datasets not found locally. Attempting to download from remote GitHub repository fallback...")
                    try:
                        train_df = pd.read_csv("https://raw.githubusercontent.com/sid0sid-ops/titanic-data-to-discovery/main/kaggle/train.csv")
                        test_df = pd.read_csv("https://raw.githubusercontent.com/sid0sid-ops/titanic-data-to-discovery/main/kaggle/test.csv")
                        print("✓ Loaded datasets from remote GitHub repository fallback!")
                    except Exception as e:
                        print(f"Remote download failed: {e}")

                if train_df is None:
                    raise FileNotFoundError("Could not load train.csv and test.csv from local paths or remote GitHub fallbacks.")

                print("Train shape:", train_df.shape)
                print("Test shape:", test_df.shape)
            """),
            make_md_cell("""
                ## Step 3: Clean and Engineer Features
                We engineer advanced features:
                1. **Family Size:** Combine SibSp and Parch.
                2. **Passenger Title:** Group passenger titles into Mr, Mrs, Miss, Master, Officer, Royalty, Rare.
                3. **Cabin Deck:** Extract the deck letter from the Cabin string.
                4. **Ticket Group Survival Rate:** For group tickets, calculate average survival of the rest of the group to maximize prediction signals without target leakage.
            """),
            make_code_cell(r"""
                def advanced_ml_feature_engineering(train, test):
                    train_copy = train.copy()
                    test_copy = test.copy()
                    test_copy["Survived"] = np.nan
                    combined = pd.concat([train_copy, test_copy], ignore_index=True)
                    
                    combined["FamilySize"] = combined["SibSp"] + combined["Parch"] + 1
                    
                    combined["Title"] = combined["Name"].str.extract(r",\s*([^.]+)\.")
                    title_mapping = {
                        "Mr": "Mr", "Mrs": "Mrs", "Miss": "Miss", "Master": "Master",
                        "Mme": "Mrs", "Ms": "Miss", "Mlle": "Miss", "Dr": "Officer", 
                        "Rev": "Officer", "Col": "Officer", "Major": "Officer",
                        "Lady": "Royalty", "the Countess": "Royalty", "Capt": "Officer",
                        "Don": "Royalty", "Jonkheer": "Royalty", "Sir": "Royalty", "Dona": "Royalty"
                    }
                    combined["Title"] = combined["Title"].map(title_mapping).fillna("Rare")
                    combined["Deck"] = combined["Cabin"].str[0].fillna("Unknown")
                    
                    ticket_survival = {}
                    for ticket, group in combined.groupby("Ticket"):
                        if len(group) > 1:
                            for idx, row in group.iterrows():
                                other_members = group.drop(idx)
                                train_others = other_members.dropna(subset=["Survived"])
                                if len(train_others) > 0:
                                    ticket_survival[idx] = train_others["Survived"].mean()
                                else:
                                    ticket_survival[idx] = np.nan
                        else:
                            ticket_survival[group.index[0]] = np.nan
                            
                    combined["Group_Survival_Rate"] = pd.Series(ticket_survival)
                    
                    train_feat = combined.iloc[:len(train)].copy()
                    test_feat = combined.iloc[len(train):].copy().drop(columns=["Survived"])
                    return train_feat, test_feat

                train_prep, test_prep = advanced_ml_feature_engineering(train_df, test_df)
                print("✓ Features engineered successfully.")
            """),
            make_md_cell("""
                ## Step 4: Split train.csv into Training + Validation
                We separate variables from the Survived target and construct an 80/20 train/validation split stratified by outcomes to maintain class balance.
            """),
            make_code_cell(r"""
                from sklearn.model_selection import train_test_split
                
                features = ["Pclass", "Sex", "Age", "SibSp", "Parch", "Fare", "Embarked", 
                            "Title", "Deck", "FamilySize", "Group_Survival_Rate"]
                            
                X = train_prep[features].copy()
                y = train_prep["Survived"].astype(int)
                
                # Perform 80/20 train/validation stratified split
                X_train, X_val, y_train, y_val = train_test_split(
                    X, y, test_size=0.20, random_state=42, stratify=y
                )
                
                print("Train shape:", X_train.shape, "| Validation shape:", X_val.shape)
            """),
            make_md_cell("""
                ## Step 5: Train Many Models (GridSearchCV & Tree Boosting)
                We build preprocessors and train all algorithms:
                1. **Logistic Regression** (Optimized via GridSearchCV)
                2. **Decision Tree** (Optimized via GridSearchCV)
                3. **Random Forest** (Optimized via GridSearchCV)
                4. **Google YDF Random Forest**
                5. **Google YDF Gradient Boosted Trees**
                6. **XGBoost** (Tuned)
                7. **LightGBM** (Tuned)
                8. **CatBoost** (Tuned)
            """),
            make_code_cell(r"""
                
                # Define baseline scikit-learn preprocessing
                num_cols = ["Age", "SibSp", "Parch", "Fare", "FamilySize", "Group_Survival_Rate"]
                cat_cols = ["Pclass", "Sex", "Embarked", "Title", "Deck"]
                
                preprocessor = ColumnTransformer(transformers=[
                    ("num", Pipeline([
                        ("imputer", SimpleImputer(strategy="median")),
                        ("scaler", StandardScaler())
                    ]), num_cols),
                    ("cat", Pipeline([
                        ("imputer", SimpleImputer(strategy="most_frequent")),
                        ("encoder", OneHotEncoder(handle_unknown="ignore", drop="first"))
                    ]), cat_cols)
                ])
                
                # Fit and transform training / validation for non-YDF classifiers
                X_train_proc = preprocessor.fit_transform(X_train)
                X_val_proc = preprocessor.transform(X_val)
                
                # Dictionary to store all model prediction arrays and hyperparams
                cv_accuracies = {}
                holdout_metrics = {}
                best_params = {}
                
                # Import baseline models
                
                # A. Logistic Regression
                lr_grid = GridSearchCV(
                    LogisticRegression(max_iter=1000, solver="liblinear", random_state=42),
                    {"C": [0.1, 1.0, 10.0]}, cv=5
                )
                lr_grid.fit(X_train_proc, y_train)
                cv_accuracies["Logistic Regression"] = lr_grid.best_score_
                best_params["Logistic Regression"] = str(lr_grid.best_params_)
                holdout_metrics["Logistic Regression"] = lr_grid.best_estimator_
                
                # B. Decision Tree
                dt_grid = GridSearchCV(
                    DecisionTreeClassifier(random_state=42),
                    {"max_depth": [3, 5, 8]}, cv=5
                )
                dt_grid.fit(X_train_proc, y_train)
                cv_accuracies["Decision Tree"] = dt_grid.best_score_
                best_params["Decision Tree"] = str(dt_grid.best_params_)
                holdout_metrics["Decision Tree"] = dt_grid.best_estimator_
                
                # C. Random Forest
                rf_grid = GridSearchCV(
                    RandomForestClassifier(random_state=42),
                    {"n_estimators": [50, 100], "max_depth": [4, 6, 8]}, cv=5
                )
                rf_grid.fit(X_train_proc, y_train)
                cv_accuracies["Random Forest"] = rf_grid.best_score_
                best_params["Random Forest"] = str(rf_grid.best_params_)
                holdout_metrics["Random Forest"] = rf_grid.best_estimator_
                
                # D. Google YDF Models (Random Forest & GBT)
                train_prep_ydf = train_prep.iloc[X_train.index].copy()
                train_prep_ydf["Survived"] = train_prep_ydf["Survived"].astype(int)
                
                ydf_rf = ydf.RandomForestLearner(label="Survived", features=features, random_seed=42).train(train_prep_ydf)
                ydf_gbt = ydf.GradientBoostedTreesLearner(
                    label="Survived", features=features, 
                    tuner=ydf.RandomSearchTuner(num_trials=20), random_seed=42
                ).train(train_prep_ydf)
                
                cv_accuracies["YDF Random Forest"] = ydf_rf.self_evaluation().accuracy
                best_params["YDF Random Forest"] = "OOB Estimate"
                holdout_metrics["YDF Random Forest"] = ydf_rf
                
                cv_accuracies["YDF Gradient Boosted Trees"] = ydf_gbt.self_evaluation().accuracy
                best_params["YDF Gradient Boosted Trees"] = "Tuned GBT Folds"
                holdout_metrics["YDF Gradient Boosted Trees"] = ydf_gbt
                
                # E. XGBoost
                xgb_clf = GridSearchCV(
                    xgb.XGBClassifier(eval_metric="logloss", random_state=42),
                    {"max_depth": [3, 4, 5], "learning_rate": [0.05, 0.1]}, cv=5
                )
                xgb_clf.fit(X_train_proc, y_train)
                cv_accuracies["XGBoost"] = xgb_clf.best_score_
                best_params["XGBoost"] = str(xgb_clf.best_params_)
                holdout_metrics["XGBoost"] = xgb_clf.best_estimator_
                
                # F. LightGBM
                lgb_clf = GridSearchCV(
                    lgb.LGBMClassifier(verbosity=-1, random_state=42),
                    {"max_depth": [3, 4], "learning_rate": [0.05, 0.1]}, cv=5
                )
                lgb_clf.fit(X_train_proc, y_train)
                cv_accuracies["LightGBM"] = lgb_clf.best_score_
                best_params["LightGBM"] = str(lgb_clf.best_params_)
                holdout_metrics["LightGBM"] = lgb_clf.best_estimator_
                
                # G. CatBoost
                cb_grid = GridSearchCV(
                    CatBoostClassifier(verbose=0, random_seed=42),
                    {"depth": [4, 6], "learning_rate": [0.05, 0.1]}, cv=5
                )
                cb_grid.fit(X_train_proc, y_train)
                cv_accuracies["CatBoost"] = cb_grid.best_score_
                best_params["CatBoost"] = str(cb_grid.best_params_)
                holdout_metrics["CatBoost"] = cb_grid.best_estimator_
                
                # H. TensorFlow Keras Neural Network (Deep Learning with TPU support)
                
                # Detect and initialize TPU if available in Colab
                try:
                    resolver = tf.distribute.cluster_resolver.TPUClusterResolver()
                    tf.config.experimental_connect_to_cluster(resolver)
                    tf.tpu.experimental.initialize_tpu_system(resolver)
                    tpu_strategy = tf.distribute.TPUStrategy(resolver)
                    print("✓ Running Keras MLP on TPU inside Google Colab!")
                except Exception:
                    tpu_strategy = tf.distribute.get_strategy()
                    print("Running on default CPU/GPU.")
                
                def build_keras_model():
                    model = Sequential([
                        Input(shape=(X_train_proc.shape[1],)),
                        Dense(64, activation="relu"),
                        Dropout(0.2),
                        Dense(32, activation="relu"),
                        Dropout(0.2),
                        Dense(1, activation="sigmoid")
                    ])
                    model.compile(optimizer=Adam(learning_rate=0.001), loss="binary_crossentropy", metrics=["accuracy"])
                    return model
                
                with tpu_strategy.scope():
                    nn_clf = build_keras_model()
                
                X_train_proc_dense = X_train_proc.toarray() if hasattr(X_train_proc, "toarray") else X_train_proc
                X_val_proc_dense = X_val_proc.toarray() if hasattr(X_val_proc, "toarray") else X_val_proc
                
                nn_history = nn_clf.fit(
                    X_train_proc_dense, y_train, 
                    epochs=60, batch_size=32, 
                    validation_data=(X_val_proc_dense, y_val), 
                    verbose=0
                )
                
                cv_accuracies["TensorFlow Neural Net"] = max(nn_history.history["accuracy"])
                best_params["TensorFlow Neural Net"] = "Dense(64) -> Dropout(0.2) -> Dense(32) -> Dropout(0.2) -> Sigmoid"
                holdout_metrics["TensorFlow Neural Net"] = nn_clf
                
                print("✓ All models trained and cross-validated successfully!")
            """),
            make_md_cell("""
                ## Step 6: Compare Accuracy & Diagnostic Metrics
                We evaluate each model on the holdout validation split, gathering accuracy, precision, recall, F1, and ROC-AUC scores into a sorted results table.
            """),
            make_code_cell(r"""
                from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
                
                comparison_rows = []
                
                for name, model in holdout_metrics.items():
                    if "YDF" in name:
                        # YDF handles validation prediction format separately
                        val_preds_prob = model.predict(X_val)
                        val_preds = (val_preds_prob > 0.5).astype(int)
                        val_auc = roc_auc_score(y_val, val_preds_prob)
                    elif "TensorFlow" in name:
                        X_val_dense = X_val_proc.toarray() if hasattr(X_val_proc, "toarray") else X_val_proc
                        val_preds_prob = model.predict(X_val_dense, verbose=0).flatten()
                        val_preds = (val_preds_prob > 0.5).astype(int)
                        val_auc = roc_auc_score(y_val, val_preds_prob)
                    elif name == "CatBoost":
                        val_preds = model.predict(X_val_proc).flatten()
                        val_preds_prob = model.predict_proba(X_val_proc)[:, 1]
                        val_auc = roc_auc_score(y_val, val_preds_prob)
                    else:
                        val_preds = model.predict(X_val_proc)
                        val_preds_prob = model.predict_proba(X_val_proc)[:, 1]
                        val_auc = roc_auc_score(y_val, val_preds_prob)
                        
                    val_acc = accuracy_score(y_val, val_preds)
                    val_prec = precision_score(y_val, val_preds)
                    val_rec = recall_score(y_val, val_preds)
                    val_f1 = f1_score(y_val, val_preds)
                    
                    comparison_rows.append({
                        "Model Name": name,
                        "GridSearchCV / CV Accuracy": cv_accuracies[name],
                        "Holdout Validation Accuracy": val_acc,
                        "Precision": val_prec,
                        "Recall": val_rec,
                        "F1 Score": val_f1,
                        "ROC-AUC": val_auc,
                        "Best Parameters": best_params[name]
                    })
                    
                comparison_df = pd.DataFrame(comparison_rows).sort_values("Holdout Validation Accuracy", ascending=False)
                display(comparison_df.round(4))
            """),
            make_md_cell("""
                ## Step 7: Predict Kaggle test.csv using the Best Model
                We select the model that achieved the highest Holdout Validation Accuracy and run inferences on the unseen Kaggle test.csv dataset.
            """),
            make_code_cell(r"""
                best_row = comparison_df.iloc[0]
                best_name = best_row["Model Name"]
                print(f"Selecting Best Performing Classifier: {best_name} (Holdout Acc: {best_row['Holdout Validation Accuracy']:.4f})")
                
                # Run predictions
                best_estimator = holdout_metrics[best_name]
                test_prep_proc = preprocessor.transform(test_prep)
                
                if "YDF" in best_name:
                    test_proba = best_estimator.predict(test_prep)
                    test_preds = (test_proba > 0.5).astype(int)
                elif "TensorFlow" in best_name:
                    test_prep_dense = test_prep_proc.toarray() if hasattr(test_prep_proc, "toarray") else test_prep_proc
                    test_proba = best_estimator.predict(test_prep_dense, verbose=0).flatten()
                    test_preds = (test_proba > 0.5).astype(int)
                elif best_name == "CatBoost":
                    test_preds = best_estimator.predict(test_prep_proc).flatten().astype(int)
                else:
                    test_preds = best_estimator.predict(test_prep_proc).astype(int)
            """),
            make_md_cell("""
                ## Step 8: Create submission.csv
                We format our passenger predictions into a submission DataFrame and write the file.
            """),
            make_code_cell(r"""
                submission = pd.DataFrame({
                    "PassengerId": test_df["PassengerId"],
                    "Survived": test_preds
                })
                
                try:
                    os.makedirs("../submissions/", exist_ok=True)
                    sub_path = "../submissions/submission_tfdf_tuned.csv"
                except Exception:
                    os.makedirs("submissions/", exist_ok=True)
                    sub_path = "submissions/submission_tfdf_tuned.csv"
                submission.to_csv(sub_path, index=False)
                
                print(f"✓ Saved submission predictions to: {sub_path}")
                print(submission.head(10))
            """),
        ],
        "metadata": {
            "kernelspec": {
                "display_name": "Python 3",
                "language": "python",
                "name": "python3",
            },
            "language_info": {"name": "python", "pygments_lexer": "ipython3"},
        },
        "nbformat": 4,
        "nbformat_minor": 5,
    }

    nb_name = "01_Titanic_Model_Comparison_Project.ipynb"
    nb_path = NOTEBOOKS_DIR / nb_name
    if nb_path.exists():
        nb_path.unlink()
    with open(nb_path, "w", encoding="utf-8") as f:
        json.dump(notebook, f, indent=2, ensure_ascii=False)
    print(f"✓ Generated {nb_name}")


if __name__ == "__main__":
    main()
