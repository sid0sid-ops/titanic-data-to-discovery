# Day-wise Preparation

Each entry separates class material from project evidence. Personal notes remain intentionally editable.

## Day 1 — Introduction to AI & ML — 15th June 2026
- **What was learned:** Detailed notes will be added after class material is received.
- **Titanic project connection:** Identify survival prediction as a supervised classification problem.
- **Evidence generated:** Project workflow and dataset-source warning.
- **Evidence location:** `README.md`, `docs/dataset_sources.md`
- **My personal revision note:** [Add my revision note after class.]

## Day 2 — Python for Data Science — 16th June 2026
- **What was learned:** Python, NumPy, Pandas, Matplotlib, Seaborn, Scikit-Learn, and the load-to-communicate workflow.
- **Titanic project connection:** Load `train.csv`, inspect missing values, visualize outcomes, and train a baseline model.
- **Evidence generated:** Survival counts, missing-values table, pipeline metrics, predicted-vs-actual rows.
- **Evidence location:** `docs/day_02_python_for_data_science.md`, `reports/tables/`, `reports/metrics/`
- **My personal revision note:** [Write what I found difficult and what I can now explain.]

## Day 3 — Data Visualization — 17th June 2026
- **What was learned:** Chart choice, readable design, exploratory plots, and communication.
- **Titanic project connection:** Compare survival by gender/class and inspect age, fare, and passenger flows.
- **Evidence generated:** Static PNG figures and interactive Plotly views.
- **Evidence location:** `docs/day_03_data_visualization.md`, `reports/figures/`, `reports/interactive/`, Assignment page
- **My personal revision note:** [Add my observation after reviewing at least two plots.]

## Day 4 — Statistics for ML — 18th June 2026
- **What was learned:** Descriptive statistics, variance, correlation, hypothesis testing, and logistic regression.
- **Titanic project connection:** Test demographic survival differences and evaluate a leakage-safe classifier.
- **Evidence generated:** Statistics table, correlation table, hypothesis test, confusion matrix, ROC curve, model metrics.
- **Evidence location:** `docs/day_04_statistics_for_ml.md`, `reports/tables/`, `reports/metrics/`, `reports/figures/`
- **My personal revision note:** [State which result changed or confirmed my assumption.]

## Day 5 — Data Preprocessing — 19th June 2026
- **What was learned:** Detailed notes will be added after class material is received.
- **Titanic project connection:** Median/mode imputation and one-hot encoding inside a pipeline.
- **Evidence generated:** Missing-values table and preprocessing pipeline.
- **Evidence location:** `src/titanic_project/modeling.py`, `reports/tables/missing_values_after_cleaning.csv`
- **My personal revision note:** [Add after class.]

## Day 6 — Supervised Learning — 20th June 2026
- **What was learned:** Detailed notes will be added after class material is received.
- **Titanic project connection:** Binary survival classification with held-out validation.
- **Evidence generated:** Model metrics and prediction comparison.
- **Evidence location:** `reports/metrics/model_metrics.json`, `reports/tables/predicted_vs_actual_10.csv`
- **My personal revision note:** [Add after class.]

## Day 7 — Linear Regression — 22nd June 2026
- **What was learned:** Detailed notes will be added after class material is received.
- **Titanic project connection:** Contrast continuous prediction with the project’s binary logistic model.
- **Evidence generated:** No dedicated output yet.
- **Evidence location:** `reports/preparation_tracker.md`
- **My personal revision note:** [Add after class.]

## Day 8 — Logistic Regression — 23rd June 2026
- **What was learned:** Detailed notes will be added after class material is received.
- **Titanic project connection:** Leakage-safe logistic regression baseline.
- **Evidence generated:** Accuracy, precision, recall, F1, ROC-AUC, confusion matrix, ROC curve.
- **Evidence location:** `src/titanic_project/modeling.py`, `reports/metrics/model_metrics.json`
- **My personal revision note:** [Explain one coefficient or probability after class.]

## Day 9 — KNN Algorithm — 24th June 2026
- **What was learned:** Detailed notes will be added after class material is received.
- **Titanic project connection:** No dedicated KNN comparison has been generated.
- **Evidence generated:** No dedicated output yet.
- **Evidence location:** `reports/preparation_tracker.md`
- **My personal revision note:** [Add after class.]

## Day 10 — Decision Trees & Random Forest — 25th June 2026
- **What was learned:** Decision tree splits (Entropy/Information Gain vs. Gini Impurity), recursive splitting stopping criteria, pruning (pre-pruning vs. post-pruning), and Random Forest ensembles (bagging, feature randomness, majority voting). Also learned tree-based data cleansing techniques like surrogate splits, feature importance, and outlier detection.
- **Titanic project connection:** Evaluated tree-based classifiers (Decision Trees, Random Forest, XGBoost, LightGBM, CatBoost) in the model comparison notebook.
- **Evidence generated:** Model metrics and comparisons in the companion app.
- **Evidence location:** `notebooks/01_Titanic_Model_Comparison_Project.ipynb`, `src/components/AssignmentPage.jsx`
- **My personal revision note:** I now understand how a Random Forest reduces the variance of individual decision trees by averaging uncorrelated models. The metaphor 'A Decision Tree is one expert; a Random Forest is a panel of experts voting together' makes the concept of ensemble learning very clear.

## Day 11 — Unsupervised Learning — 26th June 2026
- **What was learned:** Unsupervised learning concepts, clustering similar data points without labels, and K-Means clustering.
- **Titanic project connection:** Compared supervised Logistic Regression with unsupervised K-Means clustering (using Age, Fare, and Pclass) to group passengers.
- **Evidence generated:** Supervised vs. unsupervised notebook exercise.
- **Evidence location:** `notebooks/03_Titanic_Dynamics_Submission.ipynb`, `reports/preparation_tracker.md`
- **My personal revision note:** K-Means clustering grouped Titanic passengers into natural segments like 'Luxury Travelers' and 'Families in Steerage' without using survival labels, which matches passenger structures.

## Day 12 — Neural Networks — 27th June 2026
- **What was learned:** Perceptron architecture (inputs, weights, bias, activation functions), decision boundaries, limitations of single-layer perceptrons, Multi-Layer Perceptrons (MLPs), non-linear activation functions (ReLU, Sigmoid, Tanh), and Gradient Descent with Backpropagation.
- **Titanic project connection:** Compared a single-layer classifier with a deep neural network representation using multi-layered feature representations.
- **Evidence generated:** Neural Network training configuration and assignment response.
- **Evidence location:** `src/components/AssignmentPage.jsx`
- **My personal revision note:** A single perceptron can only draw a straight line, which is why it fails on non-linear interactions. A deep network captures complex feature crossings (like age, class, and sex together) by stacking layers and applying non-linear activations.

## Day 13 — Model Evaluation — 29th June 2026
- **What was learned:** Model evaluation strategies (train/test split, k-fold cross-validation, bootstrapping), evaluation dimensions (correctness, robustness, efficiency, fairness, interpretability), confusion matrix, accuracy, precision, recall (sensitivity), F1-score, and the ROC curve.
- **Titanic project connection:** Evaluated classification performance on held-out test data using accuracy, precision, recall, and F1 metrics.
- **Evidence generated:** Confusion matrix predictions and rescue-prediction trade-off response.
- **Evidence location:** `reports/metrics/model_metrics.json`, `src/components/AssignmentPage.jsx`
- **My personal revision note:** I learned that in life-critical systems, recall is much more important than precision. If we are predicting who needs rescue, missing a survivor (false negative) is much worse than sending a team to someone who is safe (false positive).


## Day 14 — Mini Project — 30th June 2026
- **What was learned:** Detailed notes will be added after class material is received.
- **Titanic project connection:** Integrate data, evidence, notebook, website, and reflection workbook.
- **Evidence generated:** Assignment page and complete report tree.
- **Evidence location:** Website Assignment view, `reports/assignment_workbook.md`
- **My personal revision note:** [Add project review after class.]

## Day 15 — Cyber Security using AI & ML — 01st July 2026
- **What was learned:** Detailed notes will be added after class material is received.
- **Titanic project connection:** No cybersecurity analysis has been added.
- **Evidence generated:** No dedicated output yet.
- **Evidence location:** `reports/preparation_tracker.md`
- **My personal revision note:** [Add after class.]
