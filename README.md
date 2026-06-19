# Titanic Data to Discovery: ML Companion

This repository contains a modern data science case study and a clean learning workflow using the Titanic dataset.

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/sid0sid-ops/titanic-data-to-discovery/blob/main/notebooks/00_Titanic_Kaggle_Main_Workflow.ipynb)

* **Companion Website:** `https://sid0sid-ops.github.io/titanic-data-to-discovery/`
* **Jupyter/Colab Notebooks:** `notebooks/`

---

## 1. Project Architecture & Notebook Structure

The project is structured into exactly three Jupyter/Colab notebooks:

1. **[00_Titanic_Kaggle_Main_Workflow.ipynb](file:///Users/sid_mac/Documents/GitHub/titanic-data-to-discovery/notebooks/00_Titanic_Kaggle_Main_Workflow.ipynb)**:
   * **Purpose:** The main, most important notebook. Houses the complete Kaggle Titanic workflow.
   * **Workflow:** Data loading, data audit, EDA (with static & interactive Plotly charts), feature engineering, classical ML model training, cross-validation, and submission export.
2. **[01_Titanic_Model_Comparison_Project.ipynb](file:///Users/sid_mac/Documents/GitHub/titanic-data-to-discovery/notebooks/01_Titanic_Model_Comparison_Project.ipynb)**:
   * **Purpose:** Comparative machine learning project evaluating multiple algorithms on the Kaggle dataset.
   * **Workflow:** Ingests train/test datasets, performs data cleaning and title engineering, partitions train/validation folds, trains and compares multiple models (Logistic Regression, Decision Tree, Random Forest, YDF, XGBoost, LightGBM, CatBoost), and evaluates metrics to export the best model submission CSV.
3. **[02_Titanic_OpenML_Reference_Workflow.ipynb](file:///Users/sid_mac/Documents/GitHub/titanic-data-to-discovery/notebooks/02_Titanic_OpenML_Reference_Workflow.ipynb)**:
   * **Purpose:** A separate reference comparison workflow utilizing the larger OpenML Titanic dataset.
   * **Workflow:** Ingestion from OpenML, separate EDA, baseline classical modeling, and validation.

---

## 2. Kaggle Local Dataset (Default Workflow)

The Kaggle local dataset is the default and main project dataset. It resides in the `kaggle/` directory:

* `train.csv` (891 rows): Contains labels (`Survived`) and is used for EDA, training, and validation.
* `test.csv` (418 rows): Contains passenger profiles with **hidden labels** (no `Survived` column). Used only for final predictions.
* `gender_submission.csv` (418 rows): Example template submission representing a gender heuristic baseline.

### Essential Rules:
1. **No Test Accuracy:** `test.csv` has hidden labels. Do not attempt to compute accuracy on `test.csv`.
2. **Heuristic Baseline:** Do not treat `gender_submission.csv` as ground-truth labels.
3. **Validation Fold:** All validation accuracy, cross-validation, and diagnostic metrics must be calculated purely from splits of `train.csv`.

---

## 3. OpenML Reference Workflow (Separate)

OpenML Titanic is a separate reference workflow. The dataset commonly contains around 1,309 records with additional columns like `boat`, `body`, and `home.dest`.

### Essential Rules:
* **Zero Mixing:** Never mix Kaggle and OpenML rows together.
* **No Joint Training:** Do not train models using a combination of both datasets.
* **Fair Comparisons:** Do not compare OpenML metrics directly with Kaggle validation without explaining the structure differences.
* **No Kaggle Submissions:** OpenML data is unified and public; it is not used to generate Kaggle submission entries.

---

## 4. Website vs. Colab Role

* **Google Colab Notebooks:** The real analysis, interactive plotting, model training, hyperparameter grid search (GridSearchCV), TensorFlow Decision Forests modeling, and submission exports happen exclusively in the Jupyter notebooks.
* **React Web Companion:** The frontend website acts strictly as a polished, lightweight, static visualization showcase, chart dictionary, and Colab workflow guide. It runs no heavy library operations (like TensorFlow) and does not train models in the browser.

---

## 5. Running the Project Locally

### Running the Python Pipelines
1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Validate Kaggle dataset files:
   ```bash
   python scripts/validate_kaggle_dataset.py
   ```
3. Generate Kaggle visualizations and model metrics:
   ```bash
   python scripts/generate_kaggle_visuals.py
   ```
4. Generate OpenML reference visualizations and metrics:
   ```bash
   python scripts/generate_openml_reference.py
   ```

### Running the React Web App
1. Install node packages:
   ```bash
   npm install
   ```
2. Start local Vite development server:
   ```bash
   npm run dev
   ```
3. Build for static deployment:
   ```bash
   npm run build
   ```

---

## 6. Running on Google Colab using the Colab CLI

You can run your local Python files and notebook pipelines directly inside Google Colab from your terminal using the `google-colab-cli` tool.

### Install on Mac
First, install `uv` (recommended):
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

### Basic CLI Commands
* **Create a Colab runtime:**
  ```bash
  colab new
  ```
* **Create a GPU runtime (T4):**
  ```bash
  colab new --gpu T4
  ```
* **Run a local Python file on Colab:**
  ```bash
  colab exec -f scripts/create_model_comparison_notebook.py
  ```
* **Open an interactive Python REPL on Colab:**
  ```bash
  colab repl
  ```
* **Open a remote terminal/console session:**
  ```bash
  colab console
  ```
* **List active Colab runtime sessions:**
  ```bash
  colab sessions
  ```
* **Stop the Colab runtime:**
  ```bash
  colab stop
  ```

---

## 7. Model Comparison Leaderboard & Results

Below is the verified model comparison table from the Google Colab execution:

| Rank | Model Name | GridSearchCV / CV Accuracy | Holdout Validation Accuracy | Precision | Recall | F1 Score | ROC-AUC | Best Parameters / Settings |
|:---:|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| 1 | **YDF Random Forest** | 0.8638 | **0.8212** | 0.8136 | 0.6957 | 0.7500 | 0.8426 | OOB Estimate |
| 2 | **YDF Gradient Boosted Trees** | 0.8537 | 0.8156 | 0.8214 | 0.6667 | 0.7360 | 0.8440 | Tuned GBT Folds |
| 3 | **Random Forest** | 0.8470 | 0.8156 | 0.8000 | 0.6957 | 0.7442 | 0.8486 | `{'max_depth': 8, 'n_estimators': 50}` |
| 4 | **LightGBM** | 0.8512 | 0.8045 | 0.7931 | 0.6667 | 0.7244 | 0.8356 | `{'learning_rate': 0.05, 'max_depth': 4}` |
| 5 | **Decision Tree** | 0.8385 | 0.8045 | 0.7833 | 0.6812 | 0.7287 | 0.7999 | `{'max_depth': 3}` |
| 6 | **TensorFlow Neural Net** | 0.8947 | 0.8045 | 0.7656 | 0.7101 | 0.7368 | 0.8327 | Dense(64) -> Dropout(0.2) -> Dense(32) -> ... |
| 7 | **XGBoost** | 0.8442 | 0.7989 | 0.7619 | 0.6957 | 0.7273 | 0.8271 | `{'learning_rate': 0.1, 'max_depth': 3}` |
| 8 | **CatBoost** | 0.8400 | 0.7933 | 0.7667 | 0.6667 | 0.7132 | 0.8373 | `{'depth': 4, 'learning_rate': 0.05}` |
| 9 | **Logistic Regression** | 0.8428 | 0.7765 | 0.7302 | 0.6667 | 0.6970 | 0.8458 | `{'C': 0.1}` |

### Key Findings & Insights:
* **Best Overall Model:** **YDF Random Forest** has the highest **Holdout Validation Accuracy = 0.8212**, meaning around **82.12% correct predictions** on unseen validation data, and the highest **F1 Score of 0.7500**.
* **Best Class Separation:** **Random Forest** achieved the highest **ROC-AUC of 0.8486**, closely followed by Logistic Regression (`0.8458`) and YDF GBT (`0.8440`).
* **Overfitting in Deep Learning:** The **TensorFlow Neural Net** achieved a high CV accuracy (`0.8947`), but its holdout validation accuracy fell to `0.8045`, indicating overfitting on the training data.
* **Tabular Performance Advantage:** Tree-based ensemble structures generally outperform baseline linear algorithms or high-parameter neural layers on small tabular datasets with rich categorical attributes (such as passenger gender, class groups, ticket groups, and cabin decks).
