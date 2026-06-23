# Day 2 — Python for Data Science

## Workflow

`Load Data → Clean Data → Explore Data → Visualize Data → Model → Predict → Communicate Results`

The project uses `pd.read_csv()` to load the local Kaggle 891-row training file. Missing values are handled inside a Scikit-Learn pipeline, categorical fields are one-hot encoded, and a logistic regression baseline is evaluated on a fixed held-out split.

## Generated Evidence

- Passenger and survival tables: `reports/tables/`
- Missing-value audits: `reports/tables/missing_values_before_cleaning.csv`, `reports/tables/missing_values_after_cleaning.csv`
- Model metrics: `reports/metrics/model_metrics.json`
- Ten held-out comparisons: `reports/tables/predicted_vs_actual_10.csv`
- Gender/class figures: `reports/figures/`

## Reflection

“Every dataset tells a story — Python helps us Listen, Learn, and Lead.”

My own class note: [Write what this workflow helped me understand.]
