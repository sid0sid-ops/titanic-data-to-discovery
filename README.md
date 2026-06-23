# From Data to Discovery — Lessons from the Titanic Project

This repository contains a modern data science case study and a clean learning workflow using the Titanic dataset.

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/sid0sid-ops/titanic-data-to-discovery/blob/main/notebooks/00_Titanic_Kaggle_Main_Workflow.ipynb)

* **Companion Website:** `https://sid0sid-ops.github.io/titanic-data-to-discovery/`
* **Assignment Page:** `https://sid0sid-ops.github.io/titanic-data-to-discovery/#assignment`
* **Jupyter/Colab Notebooks:** `notebooks/`

## Why This Project Matters

This academic project connects class questions to reproducible evidence. It keeps the exact professor questions, day-wise preparation, generated plots/tables/metrics, a leakage-safe baseline, and blank student reflection areas in one reviewable repository.

## Professor Questions Covered

Day 2 covers the Python data-science workflow, Day 3 covers visual design and communication, and Day 4 covers descriptive statistics, hypothesis testing, regression, fairness, traceability, and documentation. Exact wording is preserved in `docs/professor_questions.md`.

## Day-wise Learning Map and Class Schedule

| Days | Focus | Project evidence |
| --- | --- | --- |
| 1–4 | AI/ML, Python, visualization, statistics | Questions, plots, tables, hypothesis test |
| 5–10 | Preprocessing and supervised models | Pipeline, logistic baseline, model comparison |
| 11–15 | Later workshop topics and mini project | Placeholders until class material is received |

The full 15-day schedule is in `docs/class_schedule.md`; preparation status is in `docs/day_wise_preparation.md` and `reports/preparation_tracker.md`.

## Dataset Source and Leakage Warning

Assignment evidence uses only local `kaggle/train.csv` (891 labeled rows). Kaggle, Seaborn, and OpenML Titanic variants have different schemas and must not be mixed blindly. `boat` and `body` are post-outcome leakage fields in OpenML and are explicitly excluded from model features.

## Evidence Workflow

`Local data → schema/source check → clean categories → feature construction → stratified split → ColumnTransformer → imputation/encoding → Logistic Regression → metrics/tables/figures → GitHub Pages assets`

## Visualizations and Statistics

Static evidence includes survival by gender/class, age distribution, correlation heatmap, confusion matrix, and ROC curve. Interactive evidence includes a sunburst, cleaned parallel-categories flow, grouped clear view, fare-vs-age scatter, and passenger dashboard. Statistical evidence includes descriptive measures, correlation, a documented gender survival test, and held-out classification metrics.

---

## 1. Project Architecture & Notebook Structure

The project is structured into exactly three Jupyter/Colab notebooks:

1. **[00_Titanic_Kaggle_Main_Workflow.ipynb](notebooks/00_Titanic_Kaggle_Main_Workflow.ipynb)**:
   * **Purpose:** The main, most important notebook. Houses the complete Kaggle Titanic workflow.
   * **Workflow:** Data loading, data audit, EDA (with static & interactive Plotly charts), feature engineering, classical ML model training, cross-validation, and submission export.
2. **[01_Titanic_Model_Comparison_Project.ipynb](notebooks/01_Titanic_Model_Comparison_Project.ipynb)**:
   * **Purpose:** Comparative machine learning project evaluating multiple algorithms on the Kaggle dataset.
   * **Workflow:** Ingests train/test datasets, performs data cleaning and title engineering, partitions train/validation folds, trains and compares multiple models (Logistic Regression, Decision Tree, Random Forest, YDF, XGBoost, LightGBM, CatBoost), and evaluates metrics to export the best model submission CSV.
3. **[02_Titanic_OpenML_Reference_Workflow.ipynb](notebooks/02_Titanic_OpenML_Reference_Workflow.ipynb)**:
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

### Regenerate Assignment Reports

```bash
python3 scripts/generate_assignment_evidence.py
```

This writes matching evidence trees under `reports/` and `public/reports/`.

The Day 3 null check is documented separately before and after assignment cleaning in `reports/tables/missing_values_before_cleaning.csv` and `reports/tables/missing_values_after_cleaning.csv`.

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

Below is a retained Kaggle model-comparison result from `notebooks/01_Titanic_Model_Comparison_Project.ipynb`. It is separate from the generated assignment baseline.

**Metric provenance:** Kaggle `train.csv`, 891 rows; engineered title/family/cabin and standard passenger features; shared stratified 80/20 holdout; `random_state=42`; model-specific CV/tuning shown below; generated by the model-comparison notebook. These values must not be combined with OpenML or `scripts/generate_assignment_evidence.py` results.

| Rank | Model Name | GridSearchCV / CV Accuracy | Holdout Validation Accuracy | Precision | Recall | F1 Score | ROC-AUC | Best Parameters / Settings |
|:---:|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| 1 | **YDF Random Forest** | 0.8638 | **0.8212** | 0.8136 | 0.6957 | 0.7500 | 0.8426 | OOB Estimate |
| 2 | **YDF Gradient Boosted Trees** | 0.8537 | 0.8156 | 0.8214 | 0.6667 | 0.7360 | 0.8440 | Tuned GBT Folds |
| 3 | **Random Forest** | 0.8470 | 0.8156 | 0.8000 | 0.6957 | 0.7442 | 0.8486 | `{'max_depth': 8, 'n_estimators': 50}` |
| 4 | **LightGBM** | 0.8512 | 0.8045 | 0.7931 | 0.6667 | 0.7244 | 0.8356 | `{'learning_rate': 0.05, 'max_depth': 4}` |
| 5 | **Decision Tree** | 0.8385 | 0.8045 | 0.7833 | 0.6812 | 0.7287 | 0.7999 | `{'max_depth': 3}` |
| 6 | **XGBoost** | 0.8442 | 0.7989 | 0.7619 | 0.6957 | 0.7273 | 0.8271 | `{'learning_rate': 0.1, 'max_depth': 3}` |
| 7 | **CatBoost** | 0.8400 | 0.7933 | 0.7667 | 0.6667 | 0.7132 | 0.8373 | `{'depth': 4, 'learning_rate': 0.05}` |
| 8 | **TensorFlow Neural Net** | 0.8975 | 0.7933 | 0.7500 | 0.6957 | 0.7218 | 0.8560 | Dense(64) -> Dropout(0.2) -> Dense(32) -> ... |
| 9 | **Logistic Regression** | 0.8428 | 0.7765 | 0.7302 | 0.6667 | 0.6970 | 0.8458 | `{'C': 0.1}` |

### Key Findings & Insights:
* **Best model within this comparison run:** **YDF Random Forest** has the highest **Holdout Validation Accuracy = 0.8212**, meaning around **82.12% correct predictions** on its unseen validation fold, and the highest **F1 Score of 0.7500**.
* **Best Class Separation:** **Random Forest** achieved the highest **ROC-AUC of 0.8486**, closely followed by Logistic Regression (`0.8458`) and YDF GBT (`0.8440`).
* **Overfitting in Deep Learning:** The **TensorFlow Neural Net** achieved a high CV accuracy (`0.8975`), but its holdout validation accuracy fell to `0.7933`, indicating overfitting on the training data.
* **Tabular Performance Advantage:** Tree-based ensemble structures generally outperform baseline linear algorithms or high-parameter neural layers on small tabular datasets with rich categorical attributes (such as passenger gender, class groups, ticket groups, and cabin decks).

---

## 8. Regenerate Website Graphs and Model Export

Generate graph images:

```bash
python3 scripts/generate_titanic_figures.py
```

Generate the static model JSON used by the browser predictor:

```bash
python3 scripts/export_titanic_web_model.py
```

The graph script writes PNG files to `public/assets/plots/` and creates:

```text
public/assets/titanic_graphs.zip
```

---

## 9. Deploy to GitHub Pages

Before deploying, replace `sid0sid-ops` placeholders in:

- `README.md`
- `package.json`
- `src/data/projectContent.js`
- `docs/deployment.md`

GitHub Actions deployment:

1. Push the repository to GitHub.
2. Open **Settings -> Pages**.
3. Set **Build and deployment** source to **GitHub Actions**.
4. Push to `main`.
5. Wait for the deploy workflow to finish.

Manual deployment with `gh-pages`:

```bash
npm run build
npm run deploy
```

The live website will be:

```text
https://sid0sid-ops.github.io/titanic-data-to-discovery/
```

---

## Results Summary

The assignment baseline is generated from a fixed 80/20 stratified split of the Kaggle 891-row training set with `RANDOM_STATE = 42`. Current values are stored in `reports/metrics/model_metrics.json`; rerun the generator rather than copying metrics into documentation.

**Current generated baseline result:** Kaggle `train.csv`; 891 rows; Logistic Regression; features `pclass`, `sex`, `age`, `sibsp`, `parch`, `fare`, `embarked`, `family_size`, `is_alone`; stratified 80/20 holdout (179 validation rows); `random_state=42`; accuracy `0.8156`; ROC-AUC `0.8499`; source `scripts/generate_assignment_evidence.py`.

## Academic Honesty

The repository contains evidence, explanations, and editable learning scaffolds. Final submitted answers should be reviewed and written by the student.

## Acknowledgement

This project was inspired by **Ashok Gopalakrishnan** during a lecture under the **IICT Summer Internship Program in AI & Machine Learning (2026)**. His discussion on using historical events as a foundation for data analysis encouraged me to explore the Titanic dataset as my first structured data science project.

Through this work, I tried to connect history with Python-based data analysis, visualization, machine learning, and clear project communication. I also acknowledge the learning support of AI tools, which helped me structure, refine, and improve the project while understanding the workflow step by step.

## Credits

- OpenML Titanic dataset.
- DataScienceDojo Titanic dataset.
- Seaborn Titanic dataset.
- Scikit-Learn documentation for Pipeline and ColumnTransformer.
- Project blueprint: `docs/Titanic Data Science Blueprint.docx`.
