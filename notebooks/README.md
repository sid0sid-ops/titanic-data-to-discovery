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

### 2. Model Comparison Project
* **File:** [01_Titanic_Model_Comparison_Project.ipynb](file:///Users/sid_mac/Documents/GitHub/titanic-data-to-discovery/notebooks/01_Titanic_Model_Comparison_Project.ipynb)
* **Purpose:** Implements a comparative machine learning study evaluating multiple classification algorithms on the Titanic dataset:
  * Ingests local train/test CSV splits and constructs validation partitions
  * Engineers custom demographic and family features
  * Trains and evaluates Logistic Regression, Decision Tree, Random Forest, Google YDF, XGBoost, LightGBM, and CatBoost
  * Selects the optimal model based on accuracy, precision, recall, F1, and ROC-AUC, exporting test predictions to `submissions/submission_tfdf_tuned.csv`.

## Reference Notebooks

### 3. OpenML Reference Workflow
* **File:** [02_Titanic_OpenML_Reference_Workflow.ipynb](file:///Users/sid_mac/Documents/GitHub/titanic-data-to-discovery/notebooks/02_Titanic_OpenML_Reference_Workflow.ipynb)
* **Purpose:** The original 1,309-row combined historical dataset model. Safe preprocessing and Logistic Regression serve as the foundational learning guide.

---

## Run in Google Colab

### Standard Browser Launch
Click on the tabs in the [Titanic Companion Web Interface](https://sid0sid-ops.github.io/titanic-data-to-discovery/) to launch these notebooks directly inside a Google Colab session with a single click.

### Alternative Launch using Colab CLI
If you prefer running workflows directly from the terminal or console, you can install the `google-colab-cli` tool.

#### Install on Mac:
First install `uv` (recommended):
```bash
brew install uv
```
Then install the Colab CLI:
```bash
uv tool install google-colab-cli
```
*Alternative install using pip:*
```bash
pip install google-colab-cli
```

#### Basic CLI Commands:
* Create a standard runtime:
  ```bash
  colab new
  ```
* Create a GPU runtime (T4):
  ```bash
  colab new --gpu T4
  ```
* Run a local Python script on Colab:
  ```bash
  colab exec -f scripts/create_model_comparison_notebook.py
  ```
* Open interactive Python REPL on Colab:
  ```bash
  colab repl
  ```
* Open remote terminal/console session:
  ```bash
  colab console
  ```
* List active Colab sessions:
  ```bash
  colab sessions
  ```
* Stop the Colab runtime:
  ```bash
  colab stop
  ```
