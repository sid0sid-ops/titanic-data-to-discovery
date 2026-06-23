export const kaggleSteps = [
  {
    id: 'setup',
    stepNumber: 1,
    title: 'Environment & Library Setup',
    subtitle: 'Initialize Python Data Science Stack',
    explanation: 'We load standard data science libraries (NumPy, Pandas, Matplotlib, Seaborn, Plotly) and Scikit-Learn estimators. For Kaggle, we ensure the plotting style and display configuration are set up for Google Colab runtimes.',
    whyItMatters: 'Consolidating imports at the top of the notebook prevents runtime dependency issues and establishes reproducible random seeds.',
    codeSnippet: 'import os\nimport re\nimport numpy as np\nimport pandas as pd\nimport matplotlib.pyplot as plt\nimport seaborn as sns\nimport plotly.express as px\nimport plotly.graph_objects as go\n\nfrom sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV, StratifiedKFold\nfrom sklearn.base import BaseEstimator, TransformerMixin\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.compose import ColumnTransformer\nfrom sklearn.impute import SimpleImputer\nfrom sklearn.preprocessing import StandardScaler, OneHotEncoder\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.ensemble import RandomForestClassifier\nfrom sklearn.metrics import accuracy_score, confusion_matrix, classification_report, roc_auc_score, roc_curve\nfrom sklearn import set_config\n\nset_config(display="diagram")\nsns.set_theme(style="whitegrid")\nplt.rcParams["figure.figsize"] = (9, 6)\nplt.rcParams["figure.dpi"] = 120\n\nfilename_prefix = ""\nprint("✓ Step 1: Libraries and environment successfully set up!")',
    outputSummary: '✓ Step 1: Libraries and environment successfully set up!',
    keyInsight: 'Using set_config(display="diagram") allows Scikit-Learn pipelines to render visually in Jupyter/Colab notebooks.'
  },
  {
    id: 'loading',
    stepNumber: 2,
    title: 'Data Ingestion',
    subtitle: 'Load train.csv and test.csv',
    explanation: 'We load train.csv (labeled dataset) and test.csv (unlabeled evaluation dataset) locally. If local files are not present in Colab, we download them from the remote GitHub repository fallback.',
    whyItMatters: 'The split between train and test datasets is set by Kaggle. We must learn from train.csv and only predict on test.csv.',
    codeSnippet: 'import os\npossible_paths = ["../kaggle/", "./kaggle/", "../data/", "./data/"]\ntrain, test = None, None\nfor p in possible_paths:\n    tr = os.path.join(p, "train.csv")\n    te = os.path.join(p, "test.csv")\n    if os.path.exists(tr) and os.path.exists(te):\n        train = pd.read_csv(tr)\n        test = pd.read_csv(te)\n        print(f"✓ Loaded from local path: {p}")\n        break\n\nif train is None:\n    train = pd.read_csv("https://raw.githubusercontent.com/sid0sid-ops/titanic-data-to-discovery/main/kaggle/train.csv")\n    test = pd.read_csv("https://raw.githubusercontent.com/sid0sid-ops/titanic-data-to-discovery/main/kaggle/test.csv")\n\ndf = train.copy()\nprint("Train shape:", train.shape)\nprint("Test shape:", test.shape)',
    outputSummary: 'Train shape: (891, 12) | Test shape: (418, 11)',
    keyInsight: 'Unlike academic datasets, the Kaggle test set is missing the target label (Survived) entirely. We must build our own local validation strategy.'
  },
  {
    id: 'cleaning',
    stepNumber: 3,
    title: 'Column Cleaning & Data Dictionary',
    subtitle: 'Normalize column names and schemas',
    explanation: 'Column names are stripped, lowercased, and periods or spaces are replaced with underscores to prevent parsing errors. We convert the numeric fields (age, fare) to floats, replacing invalid strings with NaN.',
    whyItMatters: 'Applying column normalization to both train and test splits prevents downstream mapping errors in the sklearn ColumnTransformer.',
    codeSnippet: 'df = df.copy()\ndf.columns = df.columns.str.strip().str.lower().str.replace(".", "_", regex=False).str.replace(" ", "_", regex=False)\ndf = df.replace("?", np.nan)\nfor col in ["age", "fare"]:\n    if col in df.columns:\n        df[col] = pd.to_numeric(df[col], errors="coerce")\n\nif test is not None:\n    test = test.copy()\n    test.columns = test.columns.str.strip().str.lower().str.replace(".", "_", regex=False).str.replace(" ", "_", regex=False)\n    test = test.replace("?", np.nan)\n    for col in ["age", "fare"]:\n        if col in test.columns:\n            test[col] = pd.to_numeric(test[col], errors="coerce")',
    outputSummary: 'Columns cleaned: passengerid, survived, pclass, name, sex, age, sibsp, parch, ticket, fare, cabin, embarked',
    keyInsight: 'Standardizing both training and testing datasets in parallel avoids code breaks during feature transformations.',
    warningBox: {
      title: 'Data Leakage Alert!',
      text: 'Do not include post-disaster features (like cabin rescue lists, lifeboat numbers, or body tracking IDs) in your feature subset. While they may exist in combined historical records, they are not available at time of prediction and will corrupt model evaluation.'
    }
  },
  {
    id: 'missing',
    stepNumber: 4,
    title: 'Missing Value Analysis',
    subtitle: 'Identify empty entries across features',
    explanation: 'We programmatically check columns for missing values (NaN) to formulate a reliable imputation strategy. We observe that age (19.87%), cabin (77.10%), and embarked (0.22%) contain null entries in train.csv.',
    whyItMatters: 'We cannot fit scikit-learn models on datasets containing missing values. Understanding missingness ensures we use leakage-safe custom group imputers.',
    codeSnippet: 'missing = (\n    pd.DataFrame({\n        "missing_count": df.isna().sum(),\n        "missing_percent": (df.isna().mean() * 100).round(2),\n    })\n    .query("missing_count > 0")\n    .sort_values("missing_percent", ascending=False)\n)\ndisplay(missing)',
    outputSummary: 'cabin: 687 missing (77.10%) | age: 177 missing (19.87%) | embarked: 2 missing (0.22%)',
    keyInsight: 'Cabin information is extremely sparse, which is why we will engineer a binary indicator (has_cabin) rather than encoding all cabin locations.'
  },
  {
    id: 'eda',
    stepNumber: 5,
    title: 'Exploratory Data Analysis (EDA)',
    subtitle: 'Visualize survival counts and demographic relationships',
    explanation: 'We analyze survival distributions across categories. Below, browse the static Seaborn charts exported from the notebook using a color-blind-safe palette, and review demographic patterns like survival rates by gender and class.',
    whyItMatters: 'Plotting is critical to test historical assumptions. For example, female survival (74.2%) is significantly higher than male survival (18.9%).',
    codeSnippet: '# 1. Survival Count Plot\nplt.figure(figsize=(6, 4))\nsns.countplot(data=df, x="survived", hue="survived", palette=["#D55E00", "#0072B2"], legend=False)\nplt.title("Survival Count")\nplt.show()',
    outputSummary: 'Generates 16 static plots and 4 interactive Plotly charts inside the notebook.',
    keyInsight: 'Upper-class female passengers represent the highest survival cohort, indicating strong social class priorities during evacuation.',
    isGallery: true
  },
  {
    id: 'statistics',
    stepNumber: 6,
    title: 'Hands-On Statistics Exercise',
    subtitle: 'Descriptive statistics, variance, correlation, hypothesis testing, and regression',
    explanation: 'This section mirrors the notebook classroom exercise. It first calculates mean, median, and survival rate, then measures Fare variance and standard deviation, creates one consolidated correlation heatmap, runs a t-test comparing female and male survival rates, and finishes with a small logistic regression example.',
    whyItMatters: 'These statistics explain why the later machine-learning pipeline is reasonable: correlation highlights survival-related variables, the t-test checks whether gender survival differences are statistically significant, and logistic regression connects statistics to classification.',
    codeSnippet: `# Part 1: Descriptive statistics
age_mean = df["age"].mean()
age_median = df["age"].median()
fare_mean = df["fare"].mean()
fare_median = df["fare"].median()
survival_rate = df["survived"].mean()

# Part 2: variance and one consolidated correlation heatmap
fare_var = df["fare"].var()
fare_std = df["fare"].std()
correlation_source = df[["age", "fare", "pclass", "sibsp", "parch", "survived"]].copy()
correlation_source["sex_female"] = (df["sex"] == "female").astype(int)
correlation_source["family_size"] = df["sibsp"] + df["parch"] + 1
sns.heatmap(correlation_source.corr(numeric_only=True), annot=True, fmt=".2f", center=0, cmap="coolwarm", vmin=-1, vmax=1)

# Part 3: hypothesis testing
from scipy.stats import ttest_ind
male = df[df["sex"] == "male"]["survived"]
female = df[df["sex"] == "female"]["survived"]
t_stat, p_val = ttest_ind(female, male)

# Part 4: simple logistic regression
X_simple = df[["age", "fare", "pclass"]].fillna(df[["age", "fare", "pclass"]].mean())
y_simple = df["survived"]
simple_model = LogisticRegression(solver="liblinear", random_state=42)
simple_model.fit(X_simple, y_simple)`,
    outputSummary: 'Part 1 prints Age/Fare mean and median plus survival rate. Part 2 prints Fare variance/std and renders one correlation heatmap. Part 3 reports a statistically significant gender survival difference. Part 4 trains a simple Logistic Regression example.',
    keyInsight: 'The t-test validates that gender survival differences are not just visual noise, while the heatmap and regression show how statistical relationships become machine-learning features.'
  },
  {
    id: 'engineering',
    stepNumber: 7,
    title: 'Feature Engineering Transformer',
    subtitle: 'Create family size, titles, and cabin indicators',
    explanation: 'We build a scikit-learn compatible transformer `TitanicFeatureEngineer`. It extracts social titles (Mr, Mrs, Miss, Master, Rare) from passenger names, calculates family size (sibsp + parch + 1), and maps cabin presence. It drops high-cardinality/leakage columns.',
    whyItMatters: 'Performing feature transformations inside a class makes it reusable for pipeline fits and prevents training info from leaking into testing folds.',
    codeSnippet: 'class TitanicFeatureEngineer(BaseEstimator, TransformerMixin):\n    def fit(self, X, y=None):\n        return self\n\n    def transform(self, X):\n        X_out = X.copy()\n        X_out["family_size"] = X_out["sibsp"] + X_out["parch"] + 1\n        X_out["is_alone"] = (X_out["family_size"] == 1).astype(int)\n\n        def extract_title(name):\n            if not isinstance(name, str):\n                return "Mr"\n            match = re.search(r",\\s*([^.]+)\\.", name)\n            return match.group(1).strip() if match else "Mr"\n\n        X_out["title"] = X_out["name"].apply(extract_title)\n        title_mapping = {"Mr": "Mr", "Mrs": "Mrs", "Miss": "Miss", "Master": "Master", "Mme": "Mrs", "Ms": "Miss", "Mlle": "Miss"}\n        X_out["title"] = X_out["title"].map(title_mapping).fillna("Rare")\n        X_out["has_cabin"] = X_out["cabin"].notna().astype(int)\n\n        leakage_or_raw = ["passengerid", "name", "ticket", "cabin", "boat", "body", "home_dest"]\n        return X_out.drop(columns=[col for col in leakage_or_raw if col in X_out.columns])',
    outputSummary: 'TitanicFeatureEngineer class defined and tested on train DataFrame.',
    keyInsight: 'The extraction of passenger title operates as a strong proxy for age (e.g. Master represents young boys) and social status.'
  },
  {
    id: 'imputation',
    stepNumber: 8,
    title: 'Custom Imputation (Leakage-Safe)',
    subtitle: 'Group median age imputation class',
    explanation: 'Instead of filling missing ages with a global median, we write a custom `GroupMedianAgeImputer` that groups passengers by class and gender, computing medians on the training split only.',
    whyItMatters: 'Using global values causes leakage and ignores demographic context (first-class passengers are generally older than third-class passengers).',
    codeSnippet: 'class GroupMedianAgeImputer(BaseEstimator, TransformerMixin):\n    def __init__(self, age_col="age", group_cols=("pclass", "sex")):\n        self.age_col = age_col\n        self.group_cols = group_cols\n        self.group_medians_ = {}\n        self.global_median_ = None\n\n    def fit(self, X, y=None):\n        X_fit = X.copy()\n        self.global_median_ = X_fit[self.age_col].median()\n        medians = X_fit.groupby(list(self.group_cols), dropna=False)[self.age_col].median()\n        self.group_medians_ = medians.to_dict()\n        return self\n\n    def transform(self, X):\n        X_out = X.copy()\n        def fill_age(row):\n            if pd.isna(row[self.age_col]):\n                key = tuple(row[col] for col in self.group_cols)\n                return self.group_medians_.get(key, self.global_median_)\n            return row[self.age_col]\n        X_out[self.age_col] = X_out.apply(fill_age, axis=1)\n        return X_out',
    outputSummary: 'GroupMedianAgeImputer class defined, fitting on demographic subgroups.',
    keyInsight: 'Using grouped demographics ensures imputed values represent realistic passenger age bounds.'
  },
  {
    id: 'split',
    stepNumber: 9,
    title: 'Train/Test Split',
    subtitle: 'Split train.csv into training and validation folds',
    explanation: 'Since the Kaggle test set does not contain Ground Truth labels, we split the 891 training rows into an 80/20 train/validation split. We stratify by survived to maintain outcome proportions.',
    whyItMatters: 'Holdout validation is the only way to evaluate model metrics before submitting to Kaggle servers.',
    codeSnippet: 'features = ["pclass", "sex", "age", "sibsp", "parch", "fare", "embarked", "cabin", "name"]\nX = df.drop(columns=["survived"])\ny = df["survived"].astype(int)\n\nX_train, X_val, y_train, y_val = train_test_split(\n    X, y, test_size=0.20, random_state=42, stratify=y\n)\nprint("Train shape:", X_train.shape, "| Validation shape:", X_val.shape)',
    outputSummary: 'Train shape: (712, 11) | Validation shape: (179, 11)',
    keyInsight: 'Stratified splits are crucial for classification tasks, keeping class ratios identical across training and validation sets.'
  },
  {
    id: 'pipeline',
    stepNumber: 10,
    title: 'Preprocessing Pipeline',
    subtitle: 'Build Scikit-Learn preprocessors',
    explanation: 'We partition columns into numeric and categorical types. Numeric columns are scaled using StandardScaler; categorical features are one-hot encoded using OneHotEncoder, dropping the first category to prevent collinearity.',
    whyItMatters: 'Using ColumnTransformers inside a scikit-learn Pipeline guarantees that transformers fit only on the training split, preventing leakages.',
    codeSnippet: 'numeric_features = ["age", "sibsp", "parch", "fare", "family_size"]\ncategorical_features = ["pclass", "sex", "embarked", "is_alone", "title", "has_cabin"]\n\nnumeric_pipeline = Pipeline(steps=[\n    ("imputer", SimpleImputer(strategy="median")),\n    ("scaler", StandardScaler())\n])\n\ncategorical_pipeline = Pipeline(steps=[\n    ("imputer", SimpleImputer(strategy="most_frequent")),\n    ("encoder", OneHotEncoder(handle_unknown="ignore", drop="first"))\n])\n\npreprocessor = ColumnTransformer(transformers=[\n    ("num", numeric_pipeline, numeric_features),\n    ("cat", categorical_pipeline, categorical_features)\n])',
    outputSummary: 'Scikit-Learn ColumnTransformer preprocessor defined.',
    keyInsight: 'Standardizing numerical scales prevents variables like Ticket Fare from drowning out continuous scales like SibSp or Age.'
  },
  {
    id: 'training',
    stepNumber: 11,
    title: 'GridSearchCV Model Search',
    subtitle: 'Optimize model parameters and search pipelines',
    explanation: 'We perform a Grid Search (GridSearchCV) over Logistic Regression hyperparameters (C regularization). We evaluate performance across a 5-fold cross-validation split.',
    whyItMatters: 'GridSearchCV optimizes hyperparameters in a cross-validated loop, avoiding overfitting and providing stable model configurations.',
    codeSnippet: 'base_pipeline = Pipeline(steps=[\n    ("group_age_imputer", GroupMedianAgeImputer()),\n    ("feature_engineer", TitanicFeatureEngineer()),\n    ("preprocess", preprocessor),\n    ("classifier", LogisticRegression(max_iter=1000, solver="liblinear", random_state=42))\n])\n\nparam_grid = {"classifier__C": [0.1, 1.0, 10.0]}\ncv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)\ngrid_search = GridSearchCV(estimator=base_pipeline, param_grid=param_grid, cv=cv, scoring="accuracy", n_jobs=-1)\ngrid_search.fit(X_train, y_train)\n\nprint("Best params:", grid_search.best_params_)\nprint(f"Best CV accuracy: {grid_search.best_score_:.4f}")',
    outputSummary: 'Best params: {\'classifier__C\': 1.0} | Best CV accuracy: 0.8301',
    keyInsight: 'Regularization parameter C=1.0 balances model simplicity and accuracy, preventing high coefficient weights from overfitting.'
  },
  {
    id: 'evaluation',
    stepNumber: 12,
    title: 'Model Evaluation & ROC Curve',
    subtitle: 'Review confusion matrix & model parameters',
    explanation: 'We predict outcomes on the unseen validation fold. We plot the Confusion Matrix and ROC Curve to calculate accuracy (81.56%) and ROC-AUC (0.8659).',
    whyItMatters: 'Accuracy alone does not explain misclassifications. True Positive vs False Positive metrics are critical during tuning.',
    codeSnippet: 'best_pipeline = grid_search.best_estimator_\ny_pred = best_pipeline.predict(X_val)\ny_proba = best_pipeline.predict_proba(X_val)[:, 1]\n\nprint(f"Holdout Validation Accuracy: {accuracy_score(y_val, y_pred):.4f}")\nprint(f"ROC-AUC score: {roc_auc_score(y_val, y_proba):.4f}")\nprint("\\nConfusion Matrix:\\n", confusion_matrix(y_val, y_pred))',
    outputSummary: 'Holdout Validation Accuracy: 0.8156 | ROC-AUC score: 0.8659',
    keyInsight: 'The ROC-AUC of 0.8659 indicates high model diagnostic performance in separating survivors and casualties.'
  },
  {
    id: 'diagram',
    stepNumber: 13,
    title: 'Pipeline Diagram',
    subtitle: 'Visualize fitted pipeline nodes',
    explanation: 'We review the visual diagram of our optimal fitted pipeline model, illustrating how inputs pass through engineering, median imputers, preprocessors, and logistic regression.',
    whyItMatters: 'A visual diagram confirms the data flow, verifying that preprocessing elements are chained safely in the correct order.',
    codeSnippet: '# Render the pipeline structure\nbest_pipeline',
    outputSummary: 'Pipeline(steps=[(\'group_age_imputer\', GroupMedianAgeImputer()), ...])',
    keyInsight: 'Visual diagrams help explain machine learning pipelines to non-technical stakeholders.',
    isPipelineDiagram: true
  },
  {
    id: 'odds',
    stepNumber: 14,
    title: 'Log-Odds Coefficients',
    subtitle: 'Extract weights of model predictors',
    explanation: 'We extract the model coefficients to evaluate the influence of engineered parameters. Female sex and high-class titles increase survival odds, whereas third-class passenger status strongly depresses survival.',
    whyItMatters: 'Coefficients establish a transparent model explanation, showing why specific predictions are generated.',
    codeSnippet: 'preprocess_step = best_pipeline.named_steps["preprocess"]\nencoded_feature_names = preprocess_step.get_feature_names_out()\nclassifier = best_pipeline.named_steps["classifier"]\n\ninterpretation = pd.DataFrame({\n    "Feature": encoded_feature_names,\n    "Coefficient": classifier.coef_[0],\n    "Odds Ratio": np.exp(classifier.coef_[0]),\n}).sort_values("Coefficient", ascending=False)\ndisplay(interpretation)',
    outputSummary: 'Coefficients table displayed in notebook.',
    keyInsight: 'Logistic regression weights correspond directly to log-odds changes, which can be exponentiated into intuitive Odds Ratios.',
    isCoefficientsTable: true
  },
  {
    id: 'submission',
    stepNumber: 15,
    title: 'Kaggle Submission',
    subtitle: 'Generate predictions on test.csv and export CSV',
    explanation: 'We fit our tuned pipeline on the entire train.csv dataset (all 891 rows) to capture maximum signals. We then run predictions on the unseen test.csv, saving results to submissions/submission_best_classical.csv.',
    whyItMatters: 'Kaggle evaluates submissions on unseen test cases. Refitting on the full training set maximizes accuracy on Kaggle leaderboard evaluations.',
    codeSnippet: '# Refit model on full training set and export test predictions\nfinal_pipeline = Pipeline(steps=[\n    ("group_age_imputer", GroupMedianAgeImputer()),\n    ("feature_engineer", TitanicFeatureEngineer()),\n    ("preprocess", preprocessor),\n    ("classifier", LogisticRegression(C=grid_search.best_params_["classifier__C"], max_iter=1000, solver="liblinear", random_state=42))\n])\nfinal_pipeline.fit(X, y)\ntest_preds = final_pipeline.predict(test)\n\nsubmission = pd.DataFrame({\n    "PassengerId": test["passengerid"],\n    "Survived": test_preds\n})\nsubmission.to_csv("submissions/submission_best_classical.csv", index=False)\nprint("✓ submissions/submission_best_classical.csv exported successfully!")',
    outputSummary: '✓ submissions/submission_best_classical.csv exported successfully! Shape: (418, 2)',
    keyInsight: 'Always fit on 100% of training data before final submission, as additional data points improve generalizability on the test set.'
  },
  {
    id: 'relevance',
    stepNumber: 16,
    title: 'Economic & Real-World Relevance',
    subtitle: 'Translate machine learning tasks to industry domains',
    explanation: 'We detail how the binary classification pipeline applies directly to real-world industrial tasks like financial credit scoring, insurance risk underwriting, and healthcare triage.',
    whyItMatters: 'Translating models to real-world economic impacts turns a data science exercise into a valuable business solution.',
    codeSnippet: '# No code cell - conceptual mapping in Jupyter markdown.',
    outputSummary: 'Conceptual mapping of binary classifiers across finance, disaster planning, and medicine.',
    keyInsight: 'Every dataset can be reframed into business insights, where passenger survival translates to client defaults or claim likelihoods.'
  },
  {
    id: 'mindset',
    stepNumber: 17,
    title: 'Data Science Mindset',
    subtitle: 'A checklist of rigorous analytical steps',
    explanation: 'We review the core values of high-quality data science projects: ask questions, verify data quality, plot distributions, measure realistic performance, and communicate clearly.',
    whyItMatters: 'Adhering to professional project guidelines prevents common errors and ensures modeling outcomes are ethically valid.',
    codeSnippet: '# No code cell - methodological checklist.',
    outputSummary: 'Structured checklist of research standards.',
    keyInsight: 'Data science is not just about model complexity, but about rigorous, reproducible research standards.'
  },
  {
    id: 'reflection',
    stepNumber: 18,
    title: 'Final Reflection',
    subtitle: 'Summary of Titanic project learnings',
    explanation: 'We summarize historical learnings. Social structures and class hierarchies directly shaped survival chances on the Titanic, which are captured clearly in demographic variables.',
    whyItMatters: 'Historical contexts must be respected. Models must be transparent and explainable so we respect human histories.',
    codeSnippet: '# No code cell - historical and ethical reflection.',
    outputSummary: 'Ethical review of machine learning applications.',
    keyInsight: 'Models reflect the historical biases of their training data. Responsible machine learning requires recognizing these structures.'
  },
];
