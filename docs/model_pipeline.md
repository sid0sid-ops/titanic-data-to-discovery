# Model Pipeline

## Objective

The Titanic project predicts passenger survival as a binary classification task:

- `0`: Not Survived
- `1`: Survived

This is classification, not regression, because the model predicts categories rather than continuous values.

## Dataset

The notebook uses the OpenML Titanic 1309-row dataset:

```text
https://www.openml.org/data/get_csv/16826755/phpMYEkMl
```

Alternative public datasets are documented in the notebook, including the DataScienceDojo/Kaggle-style 891-row CSV and the Seaborn Titanic CSV.

## Leakage Prevention

The model does not use post-disaster fields such as:

- `boat`
- `body`

These fields reveal information that would only be known after the disaster and would create data leakage.

The model also avoids direct use of:

- `passengerid`
- `name`
- `ticket`
- `cabin`

Instead, the notebook engineers safer features such as title, family size, alone status, and cabin-recorded status.

## Feature Engineering

Engineered features:

- `family_size = sibsp + parch + 1`
- `is_alone = 1` when `family_size == 1`
- `title` extracted from passenger names and grouped into `Mr`, `Mrs`, `Miss`, `Master`, and `Rare`
- `has_cabin = 1` when a cabin value is recorded

## Model Features

```python
features = [
    "pclass",
    "sex",
    "age",
    "sibsp",
    "parch",
    "fare",
    "embarked",
    "family_size",
    "is_alone",
    "title",
    "has_cabin",
]
```

## Train/Test Split

The notebook uses:

```python
train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y,
)
```

Stratification preserves the survival class distribution across training and testing sets.

## Preprocessing

Numeric features:

- `age`
- `sibsp`
- `parch`
- `fare`
- `family_size`

Numeric pipeline:

- `SimpleImputer(strategy="median")`
- `StandardScaler()`

Categorical features:

- `pclass`
- `sex`
- `embarked`
- `is_alone`
- `title`
- `has_cabin`

Categorical pipeline:

- `SimpleImputer(strategy="most_frequent")`
- `OneHotEncoder(handle_unknown="ignore", drop="first")`

The notebook combines these with `ColumnTransformer`.

## Classifier

The classifier is:

```python
LogisticRegression(max_iter=1000, solver="liblinear", random_state=42)
```

The full model is a Scikit-Learn `Pipeline` containing preprocessing and classification.

## Evaluation

The notebook reports actual computed values for:

- Accuracy
- Confusion matrix
- Classification report
- 5-fold cross-validation accuracy

An archived OpenML reference run reported:

```text
Test Accuracy: 0.8473 / 84.73%
```

**Metric provenance:** OpenML Titanic, 1,309 rows; Logistic Regression; numeric features `age`, `sibsp`, `parch`, `fare`, `family_size`; categorical features `pclass`, `sex`, `embarked`, `is_alone`, `title`, `has_cabin`; stratified 80/20 holdout; `random_state=42`; source `notebooks/02_Titanic_OpenML_Reference_Workflow.ipynb`. It is not the current Kaggle assignment baseline.

Do not fake any extra metrics. The confusion matrix, classification report, and cross-validation scores should be read from the executed notebook outputs.

## Advanced Modeling Showcase

The notebook includes an optional advanced section for academic review. It demonstrates:

- Robust data ingestion with fallbacks.
- Interactive pipeline display with `set_config(display="diagram")`.
- Custom Scikit-Learn transformers using `BaseEstimator` and `TransformerMixin`.
- A zero-leakage group median age imputer fit only on training folds.
- Logistic Regression vs Random Forest model comparison.
- `GridSearchCV` with stratified cross-validation.
- ROC-AUC and ROC curve diagnostics.

This section is intentionally separate from the validated baseline result because model comparison can select a different estimator and produce different metrics.
