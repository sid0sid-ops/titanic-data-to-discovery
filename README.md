# From Data to Discovery — Lessons from the Titanic Project

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/sid0sid-ops/titanic-data-to-discovery/blob/main/notebooks/Titanic_Data_to_Discovery.ipynb)

Live website: `https://sid0sid-ops.github.io/titanic-data-to-discovery/`

Notebook: `notebooks/Titanic_Data_to_Discovery.ipynb`

## Project Description

**From Data to Discovery — Lessons from the Titanic Project** is a Python data science case study that shows how raw historical passenger records can become insight, prediction, and communication.

Main message:

```text
Python transforms raw historical data into insight, prediction, and learning.
```

Core workflow:

```text
Load Data -> Clean Data -> Explore -> Visualize -> Model -> Predict -> Communicate
```

The project is designed for professor review, Python community review, GitHub portfolio presentation, and live website deployment.

## Validated Result

Using the OpenML Titanic dataset and a leakage-safe Scikit-Learn pipeline, the model achieved **84.73% test accuracy** in the current validated run.

```text
Test Accuracy: 0.8473
```

This value is the result of the current validated notebook execution. It is not a universal guaranteed value. Accuracy can change depending on dataset version, preprocessing, train-test split, random state, and feature engineering.

Do not fake any extra metrics. Only use metrics produced by the notebook.

## Dataset Source

The main machine learning notebook uses the **OpenML Titanic 1309-row dataset**:

```python
TITANIC_DATA_URL = "https://www.openml.org/data/get_csv/16826755/phpMYEkMl"
df = pd.read_csv(TITANIC_DATA_URL)
```

Optional comparison datasets:

- DataScienceDojo/Kaggle-style Titanic 891-row dataset.
- Seaborn Titanic 891-row dataset.

These datasets should not be mixed blindly. The validated model result above comes from the OpenML 1309-row dataset.

## Tools Used

- Python
- NumPy
- Pandas
- Matplotlib
- Seaborn
- Scikit-Learn
- Google Colab
- React
- Vite
- Framer Motion
- GitHub Pages

## Data Cleaning

The OpenML dataset marks some missing values with `?`. The notebook converts those placeholders into real missing values before analysis. It also coerces `age` and `fare` into numeric columns so visualizations and model preprocessing work correctly.

Cleaning steps include:

- Normalize column names.
- Convert `?` placeholders to missing values.
- Convert `age` and `fare` to numeric values.
- Create missing-value summary tables.
- Impute missing numeric values inside the Scikit-Learn pipeline.
- Impute missing categorical values inside the Scikit-Learn pipeline.

## Data Leakage Warning

The OpenML Titanic dataset includes post-disaster columns such as:

- `boat`
- `body`

These columns should **not** be used for prediction. They contain information that would only be known after the disaster. Using them would leak the answer into the model and produce misleading results.

The notebook excludes `boat`, `body`, direct `name`, direct `ticket`, direct `cabin`, and `passengerid` from model features.

## Machine Learning Model

The task is classification, not regression.

- Regression predicts continuous values.
- Classification predicts categories.
- Titanic target: `0 = Not Survived`, `1 = Survived`.

The notebook uses Logistic Regression inside a leakage-safe Scikit-Learn `Pipeline`.

Feature engineering:

- `family_size = sibsp + parch + 1`
- `is_alone`
- passenger `title` extracted from `name`
- `has_cabin`

Pipeline:

```text
Feature engineering -> train/test split -> preprocessing -> Logistic Regression -> prediction -> evaluation
```

## Advanced Professor-Review Modeling Section

The notebook also includes an optional advanced showcase section for academic review. It adds:

- Robust data ingestion with automatic source fallbacks.
- Interactive Scikit-Learn pipeline visualization with `set_config(display="diagram")`.
- A custom zero-leakage group median age imputer.
- A custom feature engineering transformer.
- Logistic Regression vs Random Forest comparison.
- `GridSearchCV` with stratified cross-validation.
- ROC-AUC diagnostics and ROC curve visualization.

This advanced section is separate from the validated baseline result. It may select a different best model and produce different metrics because it performs model comparison and hyperparameter search.

## Advanced ML Workflow on the Website

The live React website explains the advanced notebook workflow step by step:

```text
Robust Data Loading
-> Missing Value Handling
-> Leakage-Safe Feature Engineering
-> Train/Test Split
-> Pipeline + ColumnTransformer
-> Logistic Regression / Random Forest
-> GridSearchCV
-> Accuracy + ROC-AUC + Confusion Matrix
-> Prediction Simulation
```

It includes professional sections for:

- Bulletproof data ingestion with fallback sources.
- Zero-leakage preprocessing.
- Scikit-Learn Pipeline and ColumnTransformer.
- Interactive pipeline diagram concept from Colab.
- Logistic Regression baseline model.
- Random Forest comparison model.
- GridSearchCV hyperparameter optimization.
- Accuracy, confusion matrix, classification report, and ROC-AUC.
- Live passenger prediction simulation.

## Model Comparison and GridSearchCV

Logistic Regression is the interpretable baseline. Random Forest is a non-linear comparison model. `GridSearchCV` compares model settings through stratified cross-validation:

```text
Candidate models -> Cross-validation folds -> Best parameters -> Final test evaluation
```

The website does not fake Random Forest results. The advanced notebook section computes model comparison results when it is executed.

## ROC-AUC and ROC Curve

The website includes a generated ROC curve:

```text
public/assets/plots/roc_curve.png
```

Regenerate it with:

```bash
python3 scripts/generate_titanic_figures.py
```

## Confusion Matrix and Classification Report

The notebook generates:

- Test accuracy
- Confusion matrix
- Classification report
- 5-fold cross-validation scores
- Feature coefficients and odds ratios

Only the validated test accuracy is summarized in this README. The confusion matrix and classification report should be read directly from the executed notebook so the repository does not copy stale or unverified metrics.

## Live Passenger Survival Predictor

The React website includes a browser-based Passenger Survival Predictor.

Because GitHub Pages is static and cannot run Python or Scikit-Learn directly, the trained Logistic Regression pipeline is exported to JSON:

```bash
python3 scripts/export_titanic_web_model.py
```

The website predictor:

- Uses exported Logistic Regression parameters from the validated notebook pipeline.
- Reproduces numeric imputation, scaling, categorical imputation, one-hot encoding, and logistic probability calculation in JavaScript.
- Does not use `boat` or `body` leakage columns.
- Gives instant educational predictions for user-entered passenger details.
- Can copy the passenger input as Colab-ready Python code.

The prediction is for learning and interpretation only. It is not historical certainty.

Website model export files:

```text
public/assets/model/titanic_logistic_model.json
public/assets/model/test_predictions.json
```

Validation notes:

```text
scripts/validate_web_predictor_notes.md
```

## Economic and Real-World Relevance

The Titanic workflow maps to modern classification problems:

- Financial risk: default vs non-default.
- Disaster response: high-risk vs lower-risk locations.
- Insurance analytics: claim vs no claim.
- Healthcare triage: high-risk vs stable patient.
- Educational analytics: student attrition vs retained.
- Aerospace and space mission analytics: subsystem failure vs operational status.

From Titanic survival prediction to space-mission analytics, the workflow is universal.

## What I Learned

- Ask the right questions before coding.
- Clean data is the foundation of truth.
- Visualize to understand.
- Model to predict.
- Communicate to inspire.
- Avoid data leakage before trusting model results.
- Treat historical data as human context, not just numbers.

## Future Improvements

- Add exported plot images from the final Colab run.
- Compare Logistic Regression with Random Forest and Gradient Boosting.
- Add model calibration and threshold analysis.
- Add cross-validation discussion in the website.
- Add a presentation deck in `presentation/`.
- Replace username placeholders after the GitHub remote is configured.

## Repository Structure

```text
titanic-data-to-discovery/
├── .github/workflows/deploy.yml
├── data/
│   └── README.md
├── docs/
│   ├── Titanic Data Science Blueprint.docx
│   ├── dataset_sources.md
│   ├── deployment.md
│   ├── model_pipeline.md
│   └── research-summary.md
├── images/
│   └── README.md
├── notebooks/
│   ├── README.md
│   └── Titanic_Data_to_Discovery.ipynb
├── public/assets/
├── scripts/
│   └── create_titanic_notebook.py
├── src/
│   ├── components/
│   ├── data/projectContent.js
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css
├── .gitignore
├── index.html
├── package.json
├── requirements.txt
└── vite.config.js
```

## Run the Notebook in Colab

1. Replace `sid0sid-ops` in the Colab badge URL with your GitHub username.
2. Open the notebook from the badge or this URL:

```text
https://colab.research.google.com/github/sid0sid-ops/titanic-data-to-discovery/blob/main/notebooks/Titanic_Data_to_Discovery.ipynb
```

3. In Colab, choose **Runtime -> Run all**.
4. Read the generated accuracy, confusion matrix, classification report, and prediction examples from the notebook outputs.

## Regenerate the Notebook

The notebook is generated with `nbformat`:

```bash
python3 scripts/create_titanic_notebook.py
```

## Run the React Website Locally

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite.

## Build the React Website

```bash
npm run build
npm run preview
```

## Regenerate Website Graphs and Model Export

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

## Deploy to GitHub Pages

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

## Credits

- OpenML Titanic dataset.
- DataScienceDojo Titanic dataset.
- Seaborn Titanic dataset.
- Scikit-Learn documentation for Pipeline and ColumnTransformer.
- Project blueprint: `docs/Titanic Data Science Blueprint.docx`.
# titanic-data-to-discovery
