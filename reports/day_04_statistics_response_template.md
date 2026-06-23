# Day 4 Statistics Response Template

These are drafting scaffolds, not final answers. Replace bracketed prompts after reviewing the generated evidence.

## 1. What were the key factors that influenced passenger survival on the Titanic?
I should compare observed survival rates and model evidence for gender, class, age, fare, and family size, then describe the strongest patterns I can actually support. I will avoid saying that association proves a factor caused survival. I can mention the held-out logistic model only as a predictive summary and distinguish it from historical explanation. Before writing, I should inspect the grouped plot, correlations, and metrics and add one specific value or observation that I understand.

**Evidence reference:** `reports/figures/survival_by_gender_class.png`; `reports/tables/correlation_table.csv`

My own final wording:

[Write my final answer here after reviewing the evidence.]

## 2. How did variables such as age, gender, ticket class, and family size affect the chances of survival?
I can organize my answer variable by variable and describe direction, uncertainty, and possible interaction. I should compare gender and class using group rates, inspect age as a distribution rather than only a mean, and use the family-size feature generated from `SibSp + Parch + 1`. I should avoid inventing a precise effect where the current report does not calculate one. My own observation should identify which variable was clearest visually and which needs more careful analysis.

**Evidence reference:** `reports/figures/age_distribution.png`; `reports/interactive/passenger_dashboard.html`

My own final wording:

[Write my final answer here after reviewing the evidence.]

## 3. Can we identify significant predictors of survival based on the available data?
I should separate statistical significance, predictive usefulness, and causal importance. The gender hypothesis test addresses one group difference, while logistic regression evaluates several features together on a held-out split. I can refer to the p-value and model ROC-AUC, but I should explain what each measure answers and what it does not. I will also mention that post-outcome fields such as `boat` and `body` are excluded because they would create leakage and falsely inflate predictive evidence.

**Evidence reference:** `reports/metrics/hypothesis_test_gender_survival.txt`; `reports/metrics/model_metrics.json`

My own final wording:

[Write my final answer here after reviewing the evidence.]

## 4. Are the differences in survival rates of different demographics really statistically significant to be able to make conclusions from it?
I should report the one-sided Fisher exact test, the directional comparison made, and the p-value decision rule. For the generated gender comparison, I can state whether `p < 0.05`, but I must add that significance does not measure practical size or prove causation. The dataset represents recorded Titanic passengers rather than a randomized experiment. I should mention the reported rate difference and interval plus one limitation or confounder, such as passenger class, and explain that additional demographic comparisons would need their own tests.

**Evidence reference:** `reports/metrics/hypothesis_test_gender_survival.txt`

My own final wording:

[Write my final answer here after reviewing the evidence.]

## 5. Which statistical measure gave the most insight?
I should choose one measure after comparing the survival rate, group differences, correlation values, and spread of age or fare. My answer needs to explain why that measure helped with this question, not simply call it the largest number. I can pair the measure with a plot to show how numerical and visual evidence support each other. I should also name one limitation, such as correlation missing nonlinear patterns or a mean being sensitive to skewed fares.

**Evidence reference:** `reports/tables/descriptive_statistics.csv`; `reports/figures/correlation_heatmap.png`

My own final wording:

[Write my final answer here after reviewing the evidence.]

## 6. How did hypothesis testing validate your assumptions?
I should first write my original assumption in plain language, then state the null comparison and the decision rule. I can use the generated one-sided Fisher exact result to decide whether the observed female survival rate is higher than the male rate under the test assumptions. I should not describe this as absolute proof. My answer should include the counts, rate difference, p-value, a sentence about statistical significance, and a separate sentence about practical interpretation or confounding.

**Evidence reference:** `reports/metrics/hypothesis_test_gender_survival.txt`

My own final wording:

[Write my final answer here after reviewing the evidence.]

## 7. How does regression connect statistics to ML prediction?
I can explain that logistic regression estimates weights that connect passenger features to log-odds and then converts them into survival probabilities. The Scikit-Learn pipeline also learns imputation and encoding only from training rows, which is part of valid statistical estimation. I should refer to held-out accuracy and ROC-AUC rather than training performance. My reflection should say what the model helps predict, what an error metric reveals, and why a probability is not a guaranteed outcome.

**Evidence reference:** `src/titanic_project/modeling.py`; `reports/metrics/model_metrics.json`

My own final wording:

[Write my final answer here after reviewing the evidence.]

## 8. How does statistical reasoning transform raw data into intelligent decisions in AI?
I should trace one path from raw passenger records to a decision: audit missingness, summarize groups, test an assumption, train a pipeline, and evaluate unseen rows. At each step, statistics helps quantify uncertainty instead of relying only on intuition. I can use the project’s missing-values table, hypothesis result, and confusion matrix as concrete examples. I should finish by explaining that an intelligent decision includes limitations, error costs, and context, not merely a model label.

**Evidence reference:** `reports/tables/missing_values_after_cleaning.csv`; `reports/figures/confusion_matrix.png`

My own final wording:

[Write my final answer here after reviewing the evidence.]

## 9. Why is fairness a statistical concept as much as an ethical one?
I can explain that fairness requires measuring how errors and outcomes differ across groups, while ethics helps decide which differences are acceptable and whose interests matter. A single overall accuracy can hide unequal false-negative or false-positive rates. I should use Titanic demographics only as a learning example, not as a modern fairness benchmark. My response can identify one group comparison I would audit and one reason sample size, historical policy, or confounding could affect interpretation.

**Evidence reference:** `reports/figures/confusion_matrix.png`; `reports/tables/survival_counts.csv`

My own final wording:

[Write my final answer here after reviewing the evidence.]

## 10. If AI learns from data, who ensures it learns truthfully?
I should name shared responsibilities: data collectors document provenance, analysts check quality and leakage, model developers validate performance, domain experts review meaning, and stakeholders monitor use. I can connect this to the explicit Kaggle source badge and the exclusion of post-disaster fields. My answer should include one check I personally performed or reviewed in this repository. I should also explain that documentation and reproducible code make claims inspectable, while human judgment remains necessary when the data is incomplete or biased.

**Evidence reference:** `reports/metrics/model_metrics.json`; `src/titanic_project/features.py`

My own final wording:

[Write my final answer here after reviewing the evidence.]

## 11. What have you learnt from the Titanic Disaster?
I should select lessons that I can explain in my own voice rather than listing prepared slogans. I can connect one historical lesson to data practice, such as communication, attention to warnings, record keeping, or accountability, but I should avoid unsupported historical details. My answer should include what changed in my thinking during the project and point to one repository practice that represents the lesson. I will review class notes before finalizing the historical wording.

**Evidence reference:** `reports/assignment_workbook.md`; [add class-material reference]

My own final wording:

[Write my final answer here after reviewing the evidence.]

## 12. Distractions are dangerous, elaborate
I should define what “distraction” means in the class discussion and then connect it carefully to my project process. In data science, I might discuss how focusing on a complex model or a high score can distract from missing values, source differences, target leakage, or unclear questions. I should choose one concrete example I observed in this repository and explain the consequence. Before submitting, I will add a class-material example in my own words and verify that I am not presenting an analogy as historical evidence.

**Evidence reference:** `docs/dataset_sources.md`; `src/titanic_project/features.py`

My own final wording:

[Write my final answer here after reviewing the evidence.]

## 13. Stakeholders should be kept informed, yes/no
I should state my answer and define which stakeholders I mean. I can explain what they need to know: dataset source, missing information, model error rates, leakage exclusions, and limits on using predictions. The project provides an example because the metric JSON records the split, source, and warning rather than showing accuracy alone. I should add one situation where delayed or unclear communication could cause a poor decision, then write the final position in language that reflects my own classroom understanding.

**Evidence reference:** `reports/metrics/model_metrics.json`; `README.md`

My own final wording:

[Write my final answer here after reviewing the evidence.]

## 14. Traceability is essential, what do you think?
I should explain traceability as the ability to follow a result back through its dataset, cleaning steps, features, model split, random seed, and output file. I can point to the generator and metric metadata as evidence that the project supports this. I should say why traceability helps reproduce a result, investigate an error, and challenge a claim. My personal addition can describe one file path I followed from source data to a displayed chart or table.

**Evidence reference:** `scripts/generate_assignment_evidence.py`; `reports/metrics/model_metrics.json`

My own final wording:

[Write my final answer here after reviewing the evidence.]

## 15. Documentation may have lasting benefits, true or false and why
I should choose true or false, then support the position with a concrete project example. Documentation preserves why the Kaggle and OpenML datasets are kept separate, which fields are leakage, how evidence is regenerated, and where questions came from. This can help a future reviewer reproduce results without guessing. I should also acknowledge that documentation becomes misleading if it is not updated with code. My final response should include one page I found useful and one detail I still need to document personally.

**Evidence reference:** `docs/professor_questions.md`; `docs/day_wise_preparation.md`

My own final wording:

[Write my final answer here after reviewing the evidence.]
