# Data

This project uses public Titanic datasets loaded with `pd.read_csv()`.

## Reference Dataset in This Folder

`data/openml_titanic.csv` is a separate 1309-row reference dataset:

```text
https://www.openml.org/data/get_csv/16826755/phpMYEkMl
```

Assignment evidence uses `kaggle/train.csv` (891 labeled rows), not this OpenML file. Do not combine the rows or transfer metrics between variants.

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
