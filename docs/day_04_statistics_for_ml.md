# Day 4 — Statistics for ML

The exact exercise sheet, reflection activity, and questions are preserved in `docs/professor_questions.md`.

## Generated Evidence

- Descriptive statistics: `reports/tables/descriptive_statistics.csv`
- Correlations: `reports/tables/correlation_table.csv`
- One-sided Fisher exact test for whether female survival was higher: `reports/metrics/hypothesis_test_gender_survival.txt`
- Leakage-safe logistic regression metrics: `reports/metrics/model_metrics.json`
- Correlation heatmap, confusion matrix, and ROC curve: `reports/figures/`

## Interpretation Boundary

A small p-value can support evidence of a difference in observed rates, but it does not establish causation. Model metrics come from a held-out portion of `kaggle/train.csv`; Kaggle `test.csv` has no public target and is not used to claim test accuracy.

My own class note: [Write which result confirmed or challenged my expectation.]
