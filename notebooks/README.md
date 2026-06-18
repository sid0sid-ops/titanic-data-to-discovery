# Titanic Jupyter Notebooks

This directory contains the Google Colab-ready notebooks for the Titanic Data Science Project. 

## Primary Notebooks

### 1. Kaggle Main Workflow
* **File:** [00_Titanic_Kaggle_Main_Workflow.ipynb](file:///Users/sid_mac/Documents/GitHub/titanic-data-to-discovery/notebooks/00_Titanic_Kaggle_Main_Workflow.ipynb)
* **Purpose:** Contains the complete classical machine learning pipeline for the Kaggle Titanic Competition:
  * Local Kaggle files ingestion (`train.csv`, `test.csv`, `gender_submission.csv`)
  * Exploratory Data Analysis (EDA) with Plotly (interactive charts) and Seaborn (static plots)
  * Data leakage audits
  * Safe preprocessing (ColumnTransformers, custom group median age imputers)
  * Hyperparameter tuning (GridSearchCV) on Logistic Regression, Decision Trees, and Random Forests
  * Holdout validation, classification diagnostics, and Kaggle-compliant submission export (`submissions/submission_best_classical.csv`).

### 2. Advanced TF-DF Model
* **File:** [01_Titanic_TFDF_Advanced_Model.ipynb](file:///Users/sid_mac/Documents/GitHub/titanic-data-to-discovery/notebooks/01_Titanic_TFDF_Advanced_Model.ipynb)
* **Purpose:** Implements an advanced, high-performance model utilizing TensorFlow Decision Forests (TF-DF) Gradient Boosted Trees:
  * Neural features tokenization (handling ticket indicators, cabin codes, passenger titles)
  * Dataset conversion from Pandas DataFrames to TensorFlow Datasets (`tf.data.Dataset`)
  * Model fitting, out-of-bag accuracy auditing, and tree node split analysis
  * Predictions export (`submissions/submission_tfdf_tuned.csv`).

## Reference Notebooks

### 3. OpenML Reference Workflow
* **File:** [02_Titanic_OpenML_Reference_Workflow.ipynb](file:///Users/sid_mac/Documents/GitHub/titanic-data-to-discovery/notebooks/02_Titanic_OpenML_Reference_Workflow.ipynb)
* **Purpose:** The original 1,309-row combined historical dataset model. Safe preprocessing and Logistic Regression serve as the foundational learning guide.

---

## Run in Google Colab

Click on the tabs in the [Titanic Companion Web Interface](https://sid0sid-ops.github.io/titanic-data-to-discovery/) to launch these notebooks directly inside a Google Colab session with a single click.
