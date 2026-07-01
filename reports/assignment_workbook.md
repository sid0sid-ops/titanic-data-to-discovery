# Assignment Workbook

## Before Writing

- [x] Confirm the exact question in `docs/professor_questions.md`.
- [x] Run `python3 scripts/generate_assignment_evidence.py`.
- [x] Confirm the dataset badge says Kaggle 891-row training dataset.
- [x] Review at least one cited table/metric and one plot.
- [x] Add personal class notes where requested.
- [x] Rewrite each final response in my own voice.

## Day 2 Evidence Record

- Dataset rows observed: 891 rows (Kaggle dataset).
- Missing columns noticed: Age, Cabin, and Embarked have missing values.
- Baseline validation result: 81.56% validation accuracy and 0.85 ROC-AUC on a stratified 80/20 holdout split of 179 validation rows.
- What I learned from the pipeline: I learned that we must build preprocessors (like imputers and scalers) inside a `Pipeline` to prevent target leakage, and that post-disaster fields like `boat` and `body` must be excluded.

## Day 3 Response Workbook

Complete the five scaffolds in `reports/day_03_visualization_response_template.md`.

My strongest visualization observation: Female passengers had higher survival rates than male passengers across all ticket classes, and first-class passengers had higher survival rates than third-class passengers.

My own final wording:

To compare passenger survival rates across demographic groups, a grouped or faceted bar chart is the most effective choice. In this project, I used a bar chart with passenger class on the x-axis, survival rate on the y-axis, and gender represented by color. This layout displays survival rates across different subgroups on a single, shared scale, making direct comparisons straightforward. A pie chart or stacked bar chart would be less effective because they make it harder to compare the heights of individual categories. By looking at reports/figures/survival_by_gender_class.png, I observed that females in first class had the highest survival rate, while males in third class had the lowest. This chart highlights a strong association between demographics and survival, though it does not imply that class or gender directly caused a passenger's survival.

## Day 4 Response Workbook

Complete the fifteen scaffolds in `reports/day_04_statistics_response_template.md`.

The statistic I can explain confidently: The grouped survival rate, which highlights the correlation of gender and class with passenger survival.

The limitation I must mention: The dataset represents a historical record rather than a randomized experiment, meaning the associations we find are observational and do not imply direct causation.

My own final wording:

By examining the passenger demographics in reports/figures/survival_by_gender_class.png and the correlation strengths in reports/tables/correlation_table.csv, I observed that gender and ticket class are the strongest indicators of survival. Females across all ticket classes showed higher survival rates compared to males in the same classes, and first-class passengers survived at higher rates than third-class passengers. While these patterns show a strong association, I must avoid concluding that gender or class directly caused survival, as other factors like cabin location and boarding policies are confounded with them. The held-out logistic regression model serves as a useful predictive summary of these historical associations but does not provide a complete causal explanation of the tragedy.

## Submission Review

- [x] Each answer is 80–150 words where requested.
- [x] Every numerical claim matches generated evidence.
- [x] No result from OpenML is presented as a Kaggle result.
- [x] No Kaggle test accuracy is claimed.
- [x] Final wording sounds like my own understanding.
