# Notebooks

Main notebook:

```text
notebooks/Titanic_Data_to_Discovery.ipynb
```

## Open in Colab

Replace `sid0sid-ops` with your GitHub username:

```text
https://colab.research.google.com/github/sid0sid-ops/titanic-data-to-discovery/blob/main/notebooks/Titanic_Data_to_Discovery.ipynb
```

## Validated Result

The current validated notebook run produced:

```text
Test Accuracy: 0.8473 / 84.73%
```

This is not a universal guaranteed score. Accuracy can change with dataset version, preprocessing, train-test split, random state, and feature engineering.

## Notebook Readiness

The notebook is Google Colab-ready and follows this workflow:

```text
Load Data -> Clean Data -> Explore -> Visualize -> Model -> Predict -> Communicate
```

It uses the OpenML Titanic 1309-row dataset as the main model dataset. It handles OpenML `?` missing-value placeholders, converts `age` and `fare` to numeric values, and excludes leakage-prone post-disaster columns such as `boat` and `body`.

## Regenerate Notebook

The notebook is generated with `nbformat` from:

```bash
python3 scripts/create_titanic_notebook.py
```

Run the notebook in Colab with **Runtime -> Run all** to reproduce the accuracy, confusion matrix, classification report, odds ratios, and prediction examples.
