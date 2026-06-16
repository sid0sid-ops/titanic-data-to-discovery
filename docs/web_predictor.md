# Web Predictor

## Why Export the Model

GitHub Pages serves static files. It cannot run Python, Pandas, or Scikit-Learn on the server. To make the passenger predictor work in the browser, the trained Logistic Regression pipeline is exported into JSON.

The export script is:

```bash
python3 scripts/export_titanic_web_model.py
```

It writes:

```text
public/assets/model/titanic_logistic_model.json
public/assets/model/test_predictions.json
```

## What Is Exported

The JSON includes:

- Model metadata
- Input feature names
- Numeric imputer statistics
- Numeric scaler means and scales
- Categorical imputer values
- OneHotEncoder categories
- Encoded feature names
- Logistic Regression coefficients
- Logistic Regression intercept

## JavaScript Prediction

The browser utility `src/utils/titanicPredictor.js` reproduces the notebook preprocessing:

1. Fill missing numeric values.
2. Scale numeric values.
3. Fill missing categorical values.
4. One-hot encode categorical values with drop-first behavior.
5. Calculate the logistic score:

```text
z = intercept + sum(coefficient * encoded_feature)
```

6. Convert to probability:

```text
probability = 1 / (1 + exp(-z))
```

Prediction rule:

- `probability >= 0.5`: Survived
- `probability < 0.5`: Not Survived

## Leakage Safety

The web predictor uses the same model features as the notebook and excludes:

- `boat`
- `body`

Those are post-disaster columns. Using them would leak the answer and create misleading predictions.

## Copy to Colab

The website can copy the current passenger input as Python code. Open the notebook in Colab, then paste the copied passenger code after the model training cell.

The website does not automatically execute code in Colab.

## Educational Scope

The predictor is for learning and interpretation. It is not historical certainty. The model estimates survival probability from patterns learned in the OpenML Titanic dataset.
