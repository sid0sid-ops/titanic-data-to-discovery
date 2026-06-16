# Data

This project uses public Titanic datasets loaded with `pd.read_csv()`.

## Main Dataset

The main machine learning notebook uses the OpenML Titanic 1309-row dataset:

```text
https://www.openml.org/data/get_csv/16826755/phpMYEkMl
```

This is the dataset used for the validated model result:

```text
Test Accuracy: 0.8473 / 84.73%
```

That value is specific to the current validated notebook run and may change with dataset version, preprocessing, train-test split, random state, and feature engineering.

## Optional Comparison Datasets

Optional comparison sources:

- DataScienceDojo/Kaggle-style Titanic 891-row dataset:
  `https://raw.githubusercontent.com/datasciencedojo/datasets/master/titanic.csv`
- Seaborn Titanic 891-row dataset:
  `https://raw.githubusercontent.com/mwaskom/seaborn-data/master/titanic.csv`

Do not mix these datasets blindly. They have different schemas and are useful for different teaching goals.

## Local Raw Files

Local downloads may be placed in:

```text
data/raw/
```

That folder is ignored by Git to keep the repository lightweight. The notebook should still use public URLs for reproducibility in Google Colab.
