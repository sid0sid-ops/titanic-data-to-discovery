# Titanic Data to Discovery: ML Companion

This repository contains a modern data science case study and a clean learning workflow using the Titanic dataset.

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/sid0sid-ops/titanic-data-to-discovery/blob/main/public/notebooks/00_Titanic_Kaggle_Main_Workflow.ipynb)

* **Companion Website:** `https://sid0sid-ops.github.io/titanic-data-to-discovery/`
* **Jupyter/Colab Notebooks:** `notebooks/`

---

## 1. Project Architecture & Notebook Structure

The project is structured into exactly three Jupyter/Colab notebooks:

1. **[00_Titanic_Kaggle_Main_Workflow.ipynb](file:///Users/sid_mac/Documents/GitHub/titanic-data-to-discovery/notebooks/00_Titanic_Kaggle_Main_Workflow.ipynb)**:
   * **Purpose:** The main, most important notebook. Houses the complete Kaggle Titanic workflow.
   * **Workflow:** Data loading, data audit, EDA (with static & interactive Plotly charts), feature engineering, classical ML model training, cross-validation, and submission export.
2. **[01_Titanic_TFDF_Advanced_Model.ipynb](file:///Users/sid_mac/Documents/GitHub/titanic-data-to-discovery/notebooks/01_Titanic_TFDF_Advanced_Model.ipynb)**:
   * **Purpose:** Advanced, Colab-only TensorFlow Decision Forests (TF-DF) notebook.
   * **Workflow:** Normalizing names, extracting ticket numbers, tokenizing names using `tf.strings.split`, converting pandas to TF datasets, training default/tuned Gradient Boosted Trees models, and exporting predictions.
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
