# Dataset Sources

This project documents three public Titanic dataset sources.

## 1. OpenML Titanic Dataset

```text
https://www.openml.org/data/get_csv/16826755/phpMYEkMl
```

- Approximate rows: 1309
- Purpose: main serious machine learning dataset
- Used for the validated notebook result
- Includes fields such as `boat`, `body`, and `home.dest`

Important: `boat` and `body` are post-disaster fields and must not be used as prediction features.

## 2. DataScienceDojo / Kaggle-Style Titanic Dataset

```text
https://raw.githubusercontent.com/datasciencedojo/datasets/master/titanic.csv
```

- Rows: 891
- Purpose: beginner-friendly reproducibility and Kaggle-style demonstrations
- Useful for simple introductory examples

## 3. Seaborn Titanic Dataset

```text
https://raw.githubusercontent.com/mwaskom/seaborn-data/master/titanic.csv
```

- Rows: 891
- Purpose: quick visualization and comparison
- Useful for Seaborn plotting examples

## Project Policy

The main model result is based on the OpenML 1309-row dataset. Do not mix rows or schemas from different sources unless the notebook explicitly explains and validates that comparison.

Local downloads may be stored in `data/raw/`, but that folder is ignored by Git. Colab should load datasets from public URLs for reproducibility.
