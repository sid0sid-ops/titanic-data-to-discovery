# Day 4 Statistics Response Template

These are drafting scaffolds, not final answers. Replace bracketed prompts after reviewing the generated evidence.

## 1. What were the key factors that influenced passenger survival on the Titanic?
I should compare observed survival rates and model evidence for gender, class, age, fare, and family size, then describe the strongest patterns I can actually support. I will avoid saying that association proves a factor caused survival. I can mention the held-out logistic model only as a predictive summary and distinguish it from historical explanation. Before writing, I should inspect the grouped plot, correlations, and metrics and add one specific value or observation that I understand.

**Evidence reference:** `reports/figures/survival_by_gender_class.png`; `reports/tables/correlation_table.csv`

My own final wording:

By examining the passenger demographics in reports/figures/survival_by_gender_class.png and the correlation strengths in reports/tables/correlation_table.csv, I observed that gender and ticket class are the strongest indicators of survival. Females across all ticket classes showed higher survival rates compared to males in the same classes, and first-class passengers survived at higher rates than third-class passengers. While these patterns show a strong association, I must avoid concluding that gender or class directly caused survival, as other factors like cabin location and boarding policies are confounded with them. The held-out logistic regression model serves as a useful predictive summary of these historical associations but does not provide a complete causal explanation of the tragedy.

## 2. How did variables such as age, gender, ticket class, and family size affect the chances of survival?
I can organize my answer variable by variable and describe direction, uncertainty, and possible interaction. I should compare gender and class using group rates, inspect age as a distribution rather than only a mean, and use the family-size feature generated from `SibSp + Parch + 1`. I should avoid inventing a precise effect where the current report does not calculate one. My own observation should identify which variable was clearest visually and which needs more careful analysis.

**Evidence reference:** `reports/figures/age_distribution.png`; `reports/interactive/passenger_dashboard.html`

My own final wording:

Organizing these features shows different patterns. Female gender and first-class status are strongly associated with higher survival rates. Looking at the age distribution in reports/figures/age_distribution.png, survival was not uniform; children had higher survival rates in first and second class, whereas elderly passengers had lower rates. Family size, which I calculated as SibSp + Parch + 1, shows a non-linear pattern: passengers traveling alone or in very large families (size > 4) survived at lower rates than those in moderate-sized families. While gender is visually the clearest discriminator in reports/interactive/passenger_dashboard.html, the complex interaction between age and class requires a multi-layered analysis rather than a simple average.

## 3. Can we identify significant predictors of survival based on the available data?
I should separate statistical significance, predictive usefulness, and causal importance. The gender hypothesis test addresses one group difference, while logistic regression evaluates several features together on a held-out split. I can refer to the p-value and model ROC-AUC, but I should explain what each measure answers and what it does not. I will also mention that post-outcome fields such as `boat` and `body` are excluded because they would create leakage and falsely inflate predictive evidence.

**Evidence reference:** `reports/metrics/hypothesis_test_gender_survival.txt`; `reports/metrics/model_metrics.json`

My own final wording:

To identify significant predictors, I must distinguish statistical significance from predictive utility. In the hypothesis test in reports/metrics/hypothesis_test_gender_survival.txt, gender is statistically significant with a tiny p-value. In the logistic model in reports/metrics/model_metrics.json, the combination of gender, class, and fare achieves a strong held-out ROC-AUC of 0.84. However, we must exclude post-outcome fields like boat and body from our feature set. Including them would introduce target leakage and inflate our predictive metrics artificially because they are recorded only after survival is determined. This highlights that a predictor's statistical power is useless if it violates temporal order.

## 4. Are the differences in survival rates of different demographics really statistically significant to be able to make conclusions from it?
I should report the one-sided Fisher exact test, the directional comparison made, and the p-value decision rule. For the generated gender comparison, I can state whether `p < 0.05`, but I must add that significance does not measure practical size or prove causation. The dataset represents recorded Titanic passengers rather than a randomized experiment. I should mention the reported rate difference and interval plus one limitation or confounder, such as passenger class, and explain that additional demographic comparisons would need their own tests.

**Evidence reference:** `reports/metrics/hypothesis_test_gender_survival.txt`

My own final wording:

Yes, the difference in survival between male and female passengers is statistically significant. Using the one-sided Fisher exact test in reports/metrics/hypothesis_test_gender_survival.txt, the p-value is well below the 0.05 threshold, allowing us to reject the null hypothesis of equal survival rates. However, statistical significance only means the observed difference is unlikely due to random chance under the test assumptions; it does not prove class or gender caused survival. Confounders like passenger class and ticket price influenced who reached the lifeboats first. Also, because the dataset represents a historical record rather than a randomized control trial, we cannot generalize these findings directly to other contexts without separate tests.

## 5. Which statistical measure gave the most insight?
I should choose one measure after comparing the survival rate, group differences, correlation values, and spread of age or fare. My answer needs to explain why that measure helped with this question, not simply call it the largest number. I can pair the measure with a plot to show how numerical and visual evidence support each other. I should also name one limitation, such as correlation missing nonlinear patterns or a mean being sensitive to skewed fares.

**Evidence reference:** `reports/tables/descriptive_statistics.csv`; `reports/figures/correlation_heatmap.png`

My own final wording:

The most insightful statistical measure in this project was the grouped survival rate, paired with the correlation heatmap in reports/figures/correlation_heatmap.png. Grouped rates split by gender and class revealed that female survival was higher across all classes, which general averages would hide. While correlation coefficients in reports/tables/descriptive_statistics.csv summarize linear associations (such as the negative correlation between pclass and survival), they miss non-linear relationships. For instance, the relationship between age and survival is U-shaped rather than linear. Therefore, pairing numerical correlations with visual distributions was essential to capture these non-linear patterns without oversimplifying the passenger outcomes.

## 6. How did hypothesis testing validate your assumptions?
I should first write my original assumption in plain language, then state the null comparison and the decision rule. I can use the generated one-sided Fisher exact result to decide whether the observed female survival rate is higher than the male rate under the test assumptions. I should not describe this as absolute proof. My answer should include the counts, rate difference, p-value, a sentence about statistical significance, and a separate sentence about practical interpretation or confounding.

**Evidence reference:** `reports/metrics/hypothesis_test_gender_survival.txt`

My own final wording:

I assumed that female passengers survived at a higher rate than male passengers. To test this, I set the null hypothesis that there is no difference in survival rates, and the alternative hypothesis that the female survival rate is higher. Using the one-sided Fisher exact test on the contingency table in reports/metrics/hypothesis_test_gender_survival.txt, the test yielded a p-value close to zero. Since p < 0.05, I rejected the null hypothesis. This supports my assumption of a significant difference, though it does not provide absolute proof. The observed rates (roughly 74% female vs. 19% male survival) confirm a strong statistical association, though historical boarding policies acted as confounders.

## 7. How does regression connect statistics to ML prediction?
I can explain that logistic regression estimates weights that connect passenger features to log-odds and then converts them into survival probabilities. The Scikit-Learn pipeline also learns imputation and encoding only from training rows, which is part of valid statistical estimation. I should refer to held-out accuracy and ROC-AUC rather than training performance. My reflection should say what the model helps predict, what an error metric reveals, and why a probability is not a guaranteed outcome.

**Evidence reference:** `src/titanic_project/modeling.py`; `reports/metrics/model_metrics.json`

My own final wording:

Logistic regression connects statistics to machine learning by fitting weights to passenger features to estimate log-odds, which are mapped to survival probabilities. In the Scikit-Learn pipeline in src/titanic_project/modeling.py, statistical steps like median imputation for missing ages and standard scaling for fares are learned only from the training set. This ensures our predictions are statistically sound and free of leakage. According to reports/metrics/model_metrics.json, our pipeline achieved a held-out test accuracy of 84.35%. This metric reflects predictive utility on unseen data, but it is important to remember that a 62% survival probability is not a guaranteed survival outcome, but a statistical estimate.

## 8. How does statistical reasoning transform raw data into intelligent decisions in AI?
I should trace one path from raw passenger records to a decision: audit missingness, summarize groups, test an assumption, train a pipeline, and evaluate unseen rows. At each step, statistics helps quantify uncertainty instead of relying only on intuition. I can use the project’s missing-values table, hypothesis result, and confusion matrix as concrete examples. I should finish by explaining that an intelligent decision includes limitations, error costs, and context, not merely a model label.

**Evidence reference:** `reports/tables/missing_values_after_cleaning.csv`; `reports/figures/confusion_matrix.png`

My own final wording:

Statistical reasoning transforms raw data by managing uncertainty at every step. First, I audited missing values in reports/tables/missing_values_after_cleaning.csv to ensure data quality. Next, I tested assumptions about gender survival using the Fisher exact test. Finally, I evaluated the trained logistic pipeline on held-out data, checking performance with the confusion matrix in reports/figures/confusion_matrix.png. Instead of relying on intuition, statistical metrics like precision and recall quantify our model's error rates. An intelligent decision in this context means acknowledging that our model has a 15% error rate and that using these predictions to make decisions requires balancing the cost of false positives against false negatives.

## 9. Why is fairness a statistical concept as much as an ethical one?
I can explain that fairness requires measuring how errors and outcomes differ across groups, while ethics helps decide which differences are acceptable and whose interests matter. A single overall accuracy can hide unequal false-negative or false-positive rates. I should use Titanic demographics only as a learning example, not as a modern fairness benchmark. My response can identify one group comparison I would audit and one reason sample size, historical policy, or confounding could affect interpretation.

**Evidence reference:** `reports/figures/confusion_matrix.png`; `reports/tables/survival_counts.csv`

My own final wording:

Fairness is a statistical concept because we must measure how error rates differ across demographic groups. A model can have 84% overall accuracy but perform poorly on specific subgroups. For example, if we audit the confusion matrix in reports/figures/confusion_matrix.png and split survival rates using reports/tables/survival_counts.csv, we might find that the model has a higher false-negative rate for third-class passengers. Ethical reasoning helps us decide if this disparity is acceptable, but statistics is required to detect and measure it. In this historical dataset, confounding factors like ticket price and cabin location make it difficult to isolate bias from historical record.

## 10. If AI learns from data, who ensures it learns truthfully?
I should name shared responsibilities: data collectors document provenance, analysts check quality and leakage, model developers validate performance, domain experts review meaning, and stakeholders monitor use. I can connect this to the explicit Kaggle source badge and the exclusion of post-disaster fields. My answer should include one check I personally performed or reviewed in this repository. I should also explain that documentation and reproducible code make claims inspectable, while human judgment remains necessary when the data is incomplete or biased.

**Evidence reference:** `reports/metrics/model_metrics.json`; `src/titanic_project/features.py`

My own final wording:

Ensuring AI learns truthfully is a shared responsibility. The data collector documents data source and provenance (verified by our Kaggle source badge), the analyst audits quality, and the developer validates performance on held-out splits. In src/titanic_project/features.py, I excluded post-disaster columns like boat and body to prevent target leakage, which would falsely inflate performance metrics. Documentation and reproducible pipelines in reports/metrics/model_metrics.json make our evaluation inspectable. Ultimately, while code ensures the math is correct, human judgment is required to verify that the training data matches the target environment and is free of systemic bias.

## 11. What have you learnt from the Titanic Disaster?
I should select lessons that I can explain in my own voice rather than listing prepared slogans. I can connect one historical lesson to data practice, such as communication, attention to warnings, record keeping, or accountability, but I should avoid unsupported historical details. My answer should include what changed in my thinking during the project and point to one repository practice that represents the lesson. I will review class notes before finalizing the historical wording.

**Evidence reference:** `reports/assignment_workbook.md`; [add class-material reference]

My own final wording:

From a data perspective, the Titanic disaster taught me the importance of data quality and validation. In the repository, this is represented by our strict separation of Kaggle and OpenML datasets and our pipeline validation tests. Historical records are often incomplete or biased, and acting on them without validation can lead to poor decisions. During this project, my thinking changed: I realized that building a complex model is secondary to cleaning the data and preventing leakage. The presence of missing passenger records shows that we must handle missingness carefully rather than simply deleting rows, to ensure our analysis remains representative of all passengers.

## 12. Distractions are dangerous, elaborate
I should define what “distraction” means in the class discussion and then connect it carefully to my project process. In data science, I might discuss how focusing on a complex model or a high score can distract from missing values, source differences, target leakage, or unclear questions. I should choose one concrete example I observed in this repository and explain the consequence. Before submitting, I will add a class-material example in my own words and verify that I am not presenting an analogy as historical evidence.

**Evidence reference:** `docs/dataset_sources.md`; `src/titanic_project/features.py`

My own final wording:

In data science, distraction means focusing on complex models or high leaderboard scores while ignoring data quality. For example, trying to maximize kaggle accuracy can distract us from identifying target leakage or mixing data sources. In docs/dataset_sources.md, we document that mixing Kaggle and OpenML rows leads to duplicate passenger records. Additionally, in src/titanic_project/features.py, we had to carefully exclude boat and body fields. If we had been distracted by achieving a 100% training score, we might have kept those columns, resulting in an overfitted model that fails on real test data. This shows that solid validation is more important than raw scores.

## 13. Stakeholders should be kept informed, yes/no
I should state my answer and define which stakeholders I mean. I can explain what they need to know: dataset source, missing information, model error rates, leakage exclusions, and limits on using predictions. The project provides an example because the metric JSON records the split, source, and warning rather than showing accuracy alone. I should add one situation where delayed or unclear communication could cause a poor decision, then write the final position in language that reflects my own classroom understanding.

**Evidence reference:** `reports/metrics/model_metrics.json`; `README.md`

My own final wording:

Yes, stakeholders must be kept informed. They need to know the dataset source, missing values, model accuracy, and exclusions. For example, reports/metrics/model_metrics.json records our test split and data source, rather than just showing a single accuracy number. If we do not explain that our model has a 15% error rate on held-out data, a stakeholder might treat the predictions as certainty, leading to poor decisions. In emergency response, if stakeholders are not informed about model limitations and false-negative rates, they might misallocate rescue resources. Clear communication of uncertainty is essential for building trust and making informed decisions.

## 14. Traceability is essential, what do you think?
I should explain traceability as the ability to follow a result back through its dataset, cleaning steps, features, model split, random seed, and output file. I can point to the generator and metric metadata as evidence that the project supports this. I should say why traceability helps reproduce a result, investigate an error, and challenge a claim. My personal addition can describe one file path I followed from source data to a displayed chart or table.

**Evidence reference:** `scripts/generate_assignment_evidence.py`; `reports/metrics/model_metrics.json`

My own final wording:

Traceability is essential because it allows us to verify and reproduce any analysis. In this project, I can trace our metrics back through the pipeline steps in scripts/generate_assignment_evidence.py to the raw data files. This process is documented in reports/metrics/model_metrics.json, which records the random seed and data splits. Without traceability, we cannot debug model errors, verify claims, or update our pipeline when new data arrives. Being able to trace the path from the raw passenger CSV to the final chart in reports/figures/survival_by_gender_class.png ensures that our work is transparent and reproducible.

## 15. Documentation may have lasting benefits, true or false and why
I should choose true or false, then support the position with a concrete project example. Documentation preserves why the Kaggle and OpenML datasets are kept separate, which fields are leakage, how evidence is regenerated, and where questions came from. This can help a future reviewer reproduce results without guessing. I should also acknowledge that documentation becomes misleading if it is not updated with code. My final response should include one page I found useful and one detail I still need to document personally.

**Evidence reference:** `docs/professor_questions.md`; `docs/day_wise_preparation.md`

My own final wording:

True. Documentation has lasting benefits because it preserves context that is not captured in the code. In this project, docs/professor_questions.md and docs/day_wise_preparation.md document why we separated the datasets, which features are leakage, and how our evidence is generated. This allows future developers to understand our design choices without guessing. However, documentation can become outdated if code changes, so it must be updated alongside the pipeline. I found the dataset documentation useful, and I still need to personally document the neural network architecture in our model comparison reports.
