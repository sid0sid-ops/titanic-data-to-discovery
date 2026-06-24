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
   * **Workflow:** Uses grouped age imputation, explicit missing-cabin features, title/family engineering, fold-fitted preprocessing, five-fold CV, and an untouched holdout to compare Logistic Regression, KNN, Decision Tree, Random Forest, YDF, XGBoost, LightGBM, CatBoost, TensorFlow, and a soft-voting ensemble.
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

Below is the Kaggle model-comparison result produced through Google Colab CLI on **June 24, 2026** from `notebooks/01_Titanic_Model_Comparison_Project.py`.

**Metric provenance:** Kaggle `train.csv`, 891 rows; grouped Age imputation by `Pclass` and `Sex`; explicit unknown cabin handling; title, family, alone, ticket-prefix, deck, and fare-per-person features; stratified 80/20 holdout; five-fold stratified training CV; `random_state=42`. Models are ranked only by training CV ROC-AUC.

| Rank | Model Name | CV ROC-AUC | Holdout Accuracy | Balanced Accuracy | F1 | Holdout ROC-AUC | Log Loss |
|:---:|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| 1 | **Soft Voting Ensemble** | **0.8986** | 0.7989 | 0.7850 | 0.7353 | 0.8620 | 0.4437 |
| 2 | **XGBoost** | 0.8979 | 0.7933 | 0.7751 | 0.7218 | 0.8385 | 0.4975 |
| 3 | **CatBoost** | 0.8931 | 0.7989 | 0.7850 | 0.7353 | 0.8636 | 0.4623 |
| 4 | **YDF Gradient Boosted Trees** | 0.8880 | 0.7821 | 0.7552 | 0.6929 | 0.8432 | 0.4466 |
| 5 | **Random Forest** | 0.8872 | 0.7877 | 0.7625 | 0.7031 | 0.8431 | 0.4504 |
| 6 | **LightGBM** | 0.8863 | 0.8268 | 0.8132 | 0.7704 | 0.8479 | 0.4813 |
| 7 | **YDF Random Forest** | 0.8836 | 0.8045 | 0.7815 | 0.7287 | 0.8540 | 0.6141 |
| 8 | **TensorFlow Neural Net** | 0.8829 | 0.8156 | 0.7987 | 0.7519 | 0.8643 | 0.4330 |
| 9 | **Logistic Regression** | 0.8739 | **0.8324** | **0.8177** | **0.7761** | **0.8697** | **0.4245** |
| 10 | **Decision Tree** | 0.8723 | 0.8101 | 0.7995 | 0.7536 | 0.8650 | 0.8051 |
| 11 | **KNN** | 0.8608 | 0.7877 | 0.7706 | 0.7164 | 0.8553 | 0.8148 |

### Key Findings & Insights:
* **Accuracy impact:** Basic preprocessing produced `0.7936` mean CV accuracy. Grouped Age imputation increased it to `0.7950`, and full leakage-safe feature engineering increased it to `0.8287`.
* **Selection result:** The XGBoost/CatBoost/Random Forest soft-voting ensemble had the highest training CV ROC-AUC (`0.8986`) and generated `submissions/submission_model_comparison.csv`.
* **Holdout result:** Logistic Regression produced the strongest single holdout results, including accuracy `0.8324`, F1 `0.7761`, ROC-AUC `0.8697`, and log loss `0.4245`.
* **Interpretation:** CV and one holdout can rank models differently. The workflow selects by training CV to avoid tuning decisions against the final holdout.

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
