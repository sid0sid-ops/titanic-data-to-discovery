export const tfdfSteps = [
  {
    id: 'setup',
    stepNumber: 1,
    title: 'Python Environment and Data Audit',
    subtitle: 'Reproducible imports, schema validation, and missing-value inspection',
    explanation: 'The notebook installs and imports Scikit-Learn, Google YDF, XGBoost, LightGBM, CatBoost, and TensorFlow, fixes random seeds, loads the official Kaggle train/test files, and validates their schemas before modeling.',
    whyItMatters: 'A model comparison is trustworthy only when every algorithm receives the intended dataset and the run can be reproduced.',
    codeSnippet: 'RANDOM_STATE = 42\nnp.random.seed(RANDOM_STATE)\ntf.keras.utils.set_random_seed(RANDOM_STATE)\n\ntrain_df, test_df = load_kaggle_data()\nassert "Survived" in train_df\nassert "Survived" not in test_df',
    outputSummary: 'Kaggle train: 891 labeled rows | Kaggle test: 418 unlabeled rows',
    keyInsight: 'Python, Pandas, and explicit schema checks establish the data-science foundation before any estimator is trained.'
  },
  {
    id: 'exploration',
    stepNumber: 2,
    title: 'Visualization and Statistics for ML',
    subtitle: 'Class balance, confidence intervals, and association tests',
    explanation: 'Seaborn charts examine survival balance and survival rates by sex and passenger class. Chi-square and point-biserial tests quantify associations between candidate predictors and the target.',
    whyItMatters: 'Visual and statistical evidence helps identify useful relationships, data quality problems, and assumptions without treating correlation as causation.',
    codeSnippet: 'sns.barplot(data=train_df, x="Sex", y="Survived", errorbar=("ci", 95))\nchi2, p_value, _, _ = chi2_contingency(pd.crosstab(train_df["Sex"], train_df["Survived"]))\nage_r, age_p = pointbiserialr(age_rows["Survived"], age_rows["Age"])',
    outputSummary: 'Charts and statistical test table are generated from the labeled Kaggle training data.',
    keyInsight: 'Statistics supports feature understanding; it does not replace out-of-sample model evaluation.'
  },
  {
    id: 'features',
    stepNumber: 3,
    title: 'Leakage-Safe Data Preprocessing',
    subtitle: 'Label-free features and fold-fitted transformations',
    explanation: 'Age is imputed from passenger-class and sex medians learned inside each training fold. Family size, traveling-alone status, title, cabin-known status, deck, ticket prefix, and fare per person are derived without using Survived. Numeric features are standardized; categorical features are one-hot encoded inside each model Pipeline.',
    whyItMatters: 'The previous ticket survival-rate feature used labels before validation and could inflate results. Pipeline-contained preprocessing ensures validation folds cannot influence fitted imputers, scalers, or encoders.',
    codeSnippet: 'age_medians = X.groupby(["Pclass", "Sex"])["Age"].median()\nresult["FamilySize"] = result["SibSp"] + result["Parch"] + 1\nresult["IsAlone"] = (result["FamilySize"] == 1).astype(int)\nresult["Deck"] = result["Cabin"].str[0].fillna("Unknown")',
    outputSummary: '14 predictors | Grouped Age imputation | Unknown cabin category | No target-derived features',
    keyInsight: 'Leakage prevention is more important than gaining a few optimistic percentage points.'
  },
  {
    id: 'validation',
    stepNumber: 4,
    title: 'Fair Validation Design',
    subtitle: 'Stratified cross-validation plus one untouched holdout',
    explanation: 'The notebook creates an 80/20 stratified holdout and performs shuffled five-fold stratified cross-validation only on the training partition. Mean CV ROC-AUC selects the final algorithm family.',
    whyItMatters: 'Using holdout accuracy to choose a model would tune decisions to the test set. Selecting by training CV keeps the holdout useful as a final generalization check.',
    codeSnippet: 'X_train, X_holdout, y_train, y_holdout = train_test_split(\n    X, y, test_size=0.20, stratify=y, random_state=42\n)\ncv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)',
    outputSummary: '712 training rows | 179 untouched holdout rows | 5 stratified training folds',
    keyInsight: 'All model-selection decisions are made without inspecting holdout performance.'
  },
  {
    id: 'training',
    stepNumber: 5,
    title: 'Supervised Model Training',
    subtitle: 'Linear, neighbor, tree, boosting, forest, and neural models',
    explanation: 'Logistic Regression, KNN, Decision Tree, Random Forest, XGBoost, LightGBM, and CatBoost use fold-safe Scikit-Learn pipelines. YDF models use the same stratified folds through manual CV. TensorFlow fits a fresh preprocessor and network per fold with early stopping. A soft-voting ensemble combines the three strongest Scikit-Learn candidates by training CV ROC-AUC.',
    whyItMatters: 'The comparison covers interpretable baselines, local-distance methods, bagging, boosting, native decision forests, and neural networks under one evaluation policy.',
    codeSnippet: '# Requested classifier families\n# Logistic Regression, KNN, Decision Tree, Random Forest\n# YDF RF/GBT, XGBoost, LightGBM, CatBoost, TensorFlow NN\nsearch = GridSearchCV(pipeline, grid, scoring="roc_auc", cv=cv, refit=True)\nensemble = VotingClassifier(estimators=top_three, voting="soft")',
    outputSummary: 'Every classifier reports mean five-fold CV ROC-AUC; neural training accuracy is not presented as CV accuracy.',
    keyInsight: 'A more complex model is useful only when its out-of-sample results justify the added cost and reduced interpretability.'
  },
  {
    id: 'evaluation',
    stepNumber: 6,
    title: 'Model Evaluation and Visualization',
    subtitle: 'Class-sensitive metrics, ROC curves, and confusion matrix',
    explanation: 'A preprocessing-impact table first shows how mean CV accuracy and ROC-AUC change from basic median preprocessing to grouped Age imputation and then full feature engineering. The final model table reports CV ROC-AUC, holdout accuracy, balanced accuracy, precision, recall, F1, holdout ROC-AUC, and log loss.',
    whyItMatters: 'Accuracy alone can conceal class imbalance and probability quality. Recall, precision, F1, ROC-AUC, and log loss answer different operational questions.',
    codeSnippet: 'comparison_df = pd.DataFrame(comparison_rows).sort_values(\n    "CV ROC-AUC", ascending=False\n)\nselected_name = comparison_df.iloc[0]["Model"]',
    outputSummary: 'Colab run: basic CV accuracy 79.36%; grouped-Age 79.50%; full features 82.87%. Soft voting led CV ROC-AUC at 0.8986; Logistic Regression led holdout accuracy at 83.24%.',
    keyInsight: 'The final Kaggle algorithm is selected by training CV ROC-AUC, not by whichever model looks best on the holdout.',
    isComparisonTable: true
  },
  {
    id: 'extensions',
    stepNumber: 7,
    title: 'Regression, Clustering, and Cyber-Security Concepts',
    subtitle: 'Separate exercises with targets and claims appropriate to each task',
    explanation: 'Linear Regression predicts continuous log-fare, K-Means creates unlabeled passenger segments, and Isolation Forest demonstrates anomaly ranking. The security section explains leakage, false-alert costs, drift, adversarial manipulation, and human review.',
    whyItMatters: 'Supervised classification, supervised regression, unsupervised clustering, and anomaly detection solve different problems and require different evaluation claims.',
    codeSnippet: 'fare_regression = LinearRegression()       # continuous target\nclusters = KMeans(n_clusters=3).fit_predict(X)  # no target\nalerts = IsolationForest(contamination=0.03).fit_predict(X)  # anomalies',
    outputSummary: 'Auxiliary learning exercises are kept outside the survival leaderboard.',
    keyInsight: 'Titanic data demonstrates the algorithms; a real cyber-security system must use security telemetry and domain-specific labels.'
  },
  {
    id: 'export',
    stepNumber: 8,
    title: 'Refit and Export',
    subtitle: 'Train on all labeled rows after selection and write Kaggle predictions',
    explanation: 'After the algorithm family is selected by cross-validation, the notebook refits it on all 891 labeled rows and writes predictions for the 418-row official Kaggle test set. It also exports the computed comparison metrics.',
    whyItMatters: 'Refitting uses all available labeled evidence while preserving the official test file as genuinely unlabeled competition data.',
    codeSnippet: 'final_model.fit(X_all, y_all)\nsubmission = pd.DataFrame({\n    "PassengerId": test_df["PassengerId"],\n    "Survived": test_predictions,\n})\nsubmission.to_csv("submissions/submission_model_comparison.csv", index=False)',
    outputSummary: 'submission_model_comparison.csv | model_comparison_metrics.json',
    keyInsight: 'The notebook output, not hard-coded website copy, is the source of truth for a new run.'
  }
];
