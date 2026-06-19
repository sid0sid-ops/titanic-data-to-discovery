export const notebookSteps = [
  {
    id: 'setup',
    stepNumber: 1,
    title: 'Environment & Library Setup',
    subtitle: 'Initialize Python Data Science Stack',
    explanation: 'We load standard data science libraries (NumPy, Pandas, Matplotlib, Seaborn, Plotly) and Scikit-Learn estimators. For OpenML, we configure pipeline diagnostics and default figure sizes.',
    whyItMatters: 'Consolidating imports at the top of the notebook prevents runtime dependency issues and establishes reproducible random seeds.',
    codeSnippet: 'import os\nimport re\nimport numpy as np\nimport pandas as pd\nimport matplotlib.pyplot as plt\nimport seaborn as sns\nimport plotly.express as px\nimport plotly.graph_objects as go\n\nfrom sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV, StratifiedKFold\nfrom sklearn.base import BaseEstimator, TransformerMixin\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.compose import ColumnTransformer\nfrom sklearn.impute import SimpleImputer\nfrom sklearn.preprocessing import StandardScaler, OneHotEncoder\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.ensemble import RandomForestClassifier\nfrom sklearn.metrics import accuracy_score, confusion_matrix, classification_report, roc_auc_score, roc_curve\nfrom sklearn import set_config\n\nset_config(display="diagram")\nsns.set_theme(style="whitegrid")\nplt.rcParams["figure.figsize"] = (9, 6)\nplt.rcParams["figure.dpi"] = 120\n\nfilename_prefix = "openml_"\nprint("✓ Step 1: Libraries and environment successfully set up!")',
    outputSummary: '✓ Step 1: Libraries and environment successfully set up!',
    keyInsight: 'Using set_config(display="diagram") allows Scikit-Learn pipelines to render visually in Jupyter/Colab notebooks.'
  },
  {
    id: 'loading',
    stepNumber: 2,
    title: 'Data Ingestion',
    subtitle: 'Load OpenML Titanic3 Dataset (1,309 rows)',
    explanation: 'We load the complete combined OpenML Titanic dataset (1,309 rows) from a local directory or remote URL. This dataset gathers passengers from all classes in a single historical record.',
    whyItMatters: 'Using the unified historical record of 1,309 rows allows us to measure model generalization on a larger labeled cohort compared to the Kaggle split.',
    codeSnippet: 'import os\npossible_paths = ["../data/", "./data/", "/content/"]\ndf = None\nfor p in possible_paths:\n    f = os.path.join(p, "openml_titanic.csv")\n    if os.path.exists(f):\n        df = pd.read_csv(f)\n        print(f"✓ Loaded from local path: {f}")\n        break\n\nif df is None:\n    url = "https://www.openml.org/data/get_csv/16826755/phpMYEkMl"\n    df = pd.read_csv(url)\n    print("✓ Loaded Titanic dataset from OpenML URL!")\n\ntest = df.head(0).copy() # compatibility structure\ndisplay(df.head())\nprint("OpenML Dataset Shape:", df.shape)',
    outputSummary: 'OpenML Dataset Shape: (1309, 14)',
    keyInsight: 'The OpenML dataset combines all passenger records, which means we must construct a strict local train/test split to avoid label contamination.'
  },
  {
    id: 'cleaning',
    stepNumber: 3,
    title: 'Column Cleaning & Data Dictionary',
    subtitle: 'Clean periods, spaces, and handle raw NaNs',
    explanation: 'OpenML maps missing values to "?" characters, which we replace with NaN. Period-based column names (e.g. home.dest) are replaced with underscores, and fields like age and fare are coerced to floats.',
    whyItMatters: 'Normalizing column names and coercing variable types prevents preprocessing steps in ColumnTransformers from failing on unexpected strings.',
    codeSnippet: 'df = df.copy()\ndf.columns = df.columns.str.strip().str.lower().str.replace(".", "_", regex=False).str.replace(" ", "_", regex=False)\ndf = df.replace("?", np.nan)\nfor col in ["age", "fare"]:\n    if col in df.columns:\n        df[col] = pd.to_numeric(df[col], errors="coerce")\n\nif test is not None:\n    test = test.copy()\n    test.columns = test.columns.str.strip().str.lower().str.replace(".", "_", regex=False).str.replace(" ", "_", regex=False)\n    test = test.replace("?", np.nan)\n    for col in ["age", "fare"]:\n        if col in test.columns:\n            test[col] = pd.to_numeric(test[col], errors="coerce")',
    outputSummary: 'Columns cleaned: pclass, survived, name, sex, age, sibsp, parch, ticket, fare, cabin, embarked, boat, body, home_dest',
    keyInsight: 'The OpenML dataset contains post-disaster features (boat, body) which do not exist in the Kaggle train/test splits.',
    warningBox: {
      title: 'Data Leakage Alert!',
      text: 'Do not include post-disaster features (like "boat" or "body") in your feature subset. While they exist in OpenML records, they represent the outcome directly and will cause artificially perfect training validation while failing on real predictions.'
    }
  },
  {
    id: 'missing',
    stepNumber: 4,
    title: 'Missing Value Analysis',
    subtitle: 'Check missing values across variables',
    explanation: 'We audit null occurrences in the dataset. In the 1,309 records, cabin (77.47%), age (20.09%), and embarked (0.15%) show missingness, requiring robust imputation within our Pipeline.',
    whyItMatters: 'We cannot fit classification models on tables containing missing fields. Auditing missingness ensures we use leakage-safe imputation classes.',
    codeSnippet: 'missing = (\n    pd.DataFrame({\n        "missing_count": df.isna().sum(),\n        "missing_percent": (df.isna().mean() * 100).round(2),\n    })\n    .query("missing_count > 0")\n    .sort_values("missing_percent", ascending=False)\n)\ndisplay(missing)',
    outputSummary: 'cabin: 1014 missing (77.47%) | age: 263 missing (20.09%) | embarked: 2 missing (0.15%)',
    keyInsight: 'Age is missing in over 20% of passengers, highlighting the importance of using demographic-specific group medians.'
  },
  {
    id: 'eda',
    stepNumber: 5,
    title: 'Exploratory Data Analysis (EDA)',
    subtitle: 'Plot demographic and survival distributions',
    explanation: 'We analyze relationships between passenger variables. Below, browse the static Seaborn charts exported from the notebook using a color-blind-safe palette, illustrating survival rates across classes and ports.',
    whyItMatters: 'Plotting distributions helps identify correlations and outlier segments prior to fitting model parameters.',
    codeSnippet: '# 1. Survival Count Plot\nplt.figure(figsize=(6, 4))\nsns.countplot(data=df, x="survived", hue="survived", palette=["#D55E00", "#0072B2"], legend=False)\nplt.title("Survival Count")\nplt.show()',
    outputSummary: 'Generates 8 static Seaborn plots inside the notebook.',
    keyInsight: 'Class and sex are highly predictive features, reflecting historical lifeboat boarding priorities.',
    isGallery: true
  },
  {
    id: 'engineering',
    stepNumber: 6,
    title: 'Feature Engineering Transformer',
    subtitle: 'Create family size, titles, and cabin indicators',
    explanation: 'We build a custom transformer `TitanicFeatureEngineer`. It extracts social titles (Mr, Mrs, Miss, Master, Rare) from passenger names, calculates family size (sibsp + parch + 1), and maps cabin presence. It drops raw string and leakage fields.',
    whyItMatters: 'Chaining feature engineering within a class prevents data leakage by ensuring transformations are fit strictly on training splits.',
    codeSnippet: 'class TitanicFeatureEngineer(BaseEstimator, TransformerMixin):\n    def fit(self, X, y=None):\n        return self\n\n    def transform(self, X):\n        X_out = X.copy()\n        X_out["family_size"] = X_out["sibsp"] + X_out["parch"] + 1\n        X_out["is_alone"] = (X_out["family_size"] == 1).astype(int)\n\n        def extract_title(name):\n            if not isinstance(name, str):\n                return "Mr"\n            match = re.search(r",\\s*([^.]+)\\.", name)\n            return match.group(1).strip() if match else "Mr"\n\n        X_out["title"] = X_out["name"].apply(extract_title)\n        title_mapping = {"Mr": "Mr", "Mrs": "Mrs", "Miss": "Miss", "Master": "Master", "Mme": "Mrs", "Ms": "Miss", "Mlle": "Miss"}\n        X_out["title"] = X_out["title"].map(title_mapping).fillna("Rare")\n        X_out["has_cabin"] = X_out["cabin"].notna().astype(int)\n\n        leakage_or_raw = ["passengerid", "name", "ticket", "cabin", "boat", "body", "home_dest"]\n        return X_out.drop(columns=[col for col in leakage_or_raw if col in X_out.columns])',
    outputSummary: 'TitanicFeatureEngineer class defined and tested on OpenML DataFrame.',
    keyInsight: 'The title mapping handles French prefixes (e.g. Mlle, Mme) by normalizing them to Miss and Mrs.'
  },
  {
    id: 'imputation',
    stepNumber: 7,
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
    stepNumber: 8,
    title: 'Train/Test Split',
    subtitle: 'Perform 80/20 train/test stratification',
    explanation: 'We separate variables from target indicators. We perform an 80-20 train-test split using stratified partition (stratify=y) to guarantee that target proportions are identical in both folds, ensuring fair model evaluation.',
    whyItMatters: 'Stratified splits are crucial for classification tasks, keeping class ratios identical across training and testing sets.',
    codeSnippet: 'features = ["pclass", "sex", "age", "sibsp", "parch", "fare", "embarked", "cabin", "name"]\nX = df.drop(columns=["survived"])\ny = df["survived"].astype(int)\n\nX_train, X_test, y_train, y_test = train_test_split(\n    X, y, test_size=0.20, random_state=42, stratify=y\n)\nprint("Train shape:", X_train.shape, "| Test shape:", X_test.shape)',
    outputSummary: 'Train shape: (1047, 11) | Test shape: (262, 11)',
    keyInsight: 'Using a stratified split ensures that the validation results represent general passenger distributions.'
  },
  {
    id: 'pipeline',
    stepNumber: 9,
    title: 'Preprocessing Pipeline',
    subtitle: 'Build ColumnTransformers for numeric and categorical features',
    explanation: 'To prevent data leakage during scaling and imputation, we build a Scikit-Learn ColumnTransformer: Numeric columns are imputed with median and scaled; categorical columns are imputed with most_frequent and one-hot encoded.',
    whyItMatters: 'Using ColumnTransformers inside a scikit-learn Pipeline guarantees that transformers fit only on the training split, preventing leakage.',
    codeSnippet: 'numeric_features = ["age", "sibsp", "parch", "fare", "family_size"]\ncategorical_features = ["pclass", "sex", "embarked", "is_alone", "title", "has_cabin"]\n\nnumeric_pipeline = Pipeline(steps=[\n    ("imputer", SimpleImputer(strategy="median")),\n    ("scaler", StandardScaler())\n])\n\ncategorical_pipeline = Pipeline(steps=[\n    ("imputer", SimpleImputer(strategy="most_frequent")),\n    ("encoder", OneHotEncoder(handle_unknown="ignore", drop="first"))\n])\n\npreprocessor = ColumnTransformer(transformers=[\n    ("num", numeric_pipeline, numeric_features),\n    ("cat", categorical_pipeline, categorical_features)\n])',
    outputSummary: 'Scikit-Learn ColumnTransformer preprocessor defined.',
    keyInsight: 'Standardizing numerical scales prevents variables like Ticket Fare from drowning out continuous scales like SibSp or Age.'
  },
  {
    id: 'training',
    stepNumber: 10,
    title: 'GridSearchCV Model Search',
    subtitle: 'Optimize model parameters in a cross-validated loop',
    explanation: 'We perform a Grid Search (GridSearchCV) over regularized Logistic Regression parameter folds. We evaluate performance across a 5-fold cross-validation split.',
    whyItMatters: 'GridSearchCV optimizes hyperparameters in a cross-validated loop, avoiding overfitting and providing stable model configurations.',
    codeSnippet: 'base_pipeline = Pipeline(steps=[\n    ("group_age_imputer", GroupMedianAgeImputer()),\n    ("feature_engineer", TitanicFeatureEngineer()),\n    ("preprocess", preprocessor),\n    ("classifier", LogisticRegression(max_iter=1000, solver="liblinear", random_state=42))\n])\n\nparam_grid = {"classifier__C": [0.1, 1.0, 10.0]}\ncv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)\ngrid_search = GridSearchCV(estimator=base_pipeline, param_grid=param_grid, cv=cv, scoring="accuracy", n_jobs=-1)\ngrid_search.fit(X_train, y_train)\n\nprint("Best params:", grid_search.best_params_)\nprint(f"Best CV accuracy: {grid_search.best_score_:.4f}")',
    outputSummary: 'Best params: {\'classifier__C\': 10.0} | Best CV accuracy: 0.8042',
    keyInsight: 'Regularization parameter C=10.0 is selected as optimal for the OpenML reference model.'
  },
  {
    id: 'evaluation',
    stepNumber: 11,
    title: 'Model Evaluation & ROC Curve',
    subtitle: 'Holdout test evaluation and diagnostics',
    explanation: 'We calculate test split predictions and probability scores. We print the Confusion Matrix and ROC Curve to calculate holdout test accuracy (84.35%) and ROC-AUC (0.8872).',
    whyItMatters: 'Evaluating on the holdout test set provides a realistic estimate of model generalization on unseen passengers.',
    codeSnippet: 'best_pipeline = grid_search.best_estimator_\ny_pred = best_pipeline.predict(X_test)\ny_proba = best_pipeline.predict_proba(X_test)[:, 1]\n\nprint(f"Holdout Test Accuracy: {accuracy_score(y_test, y_pred):.4f}")\nprint(f"ROC-AUC score: {roc_auc_score(y_test, y_proba):.4f}")\nprint("\\nConfusion Matrix:\\n", confusion_matrix(y_test, y_pred))',
    outputSummary: 'Holdout Test Accuracy: 0.8435 | ROC-AUC score: 0.8872',
    keyInsight: 'The holdout accuracy (84.35%) on OpenML is slightly higher than the cross-validation score, indicating robust model generalization.'
  },
  {
    id: 'diagram',
    stepNumber: 12,
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
    stepNumber: 13,
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
    id: 'relevance',
    stepNumber: 14,
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
    stepNumber: 15,
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
    stepNumber: 16,
    title: 'Final Reflection',
    subtitle: 'Summary of Titanic project learnings',
    explanation: 'We summarize historical learnings. Social structures and class hierarchies directly shaped survival chances on the Titanic, which are captured clearly in demographic variables.',
    whyItMatters: 'Historical contexts must be respected. Models must be transparent and explainable so we respect human histories.',
    codeSnippet: '# No code cell - historical and ethical reflection.',
    outputSummary: 'Ethical review of machine learning applications.',
    keyInsight: 'Models reflect the historical biases of their training data. Responsible machine learning requires recognizing these structures.'
  },
  {
    id: 'predictor',
    stepNumber: 17,
    title: 'Sandbox Predictor',
    subtitle: 'Interactive local predictions dashboard',
    explanation: 'Test predictions using local passenger inputs. Modify variables in the sandbox below to observe survival probability calculations instantly.',
    whyItMatters: 'Connecting model parameters to an interactive workspace builds intuitive confidence in coefficients.',
    codeSnippet: '# Sandbox script to predict custom passenger profiles\nmodel = best_pipeline\ncustom_passengers = pd.DataFrame([\n    {"pclass": 3, "sex": "male", "age": 22.0, "sibsp": 0, "parch": 0, "fare": 7.25, "embarked": "S", "cabin": np.nan, "name": "Single, Mr. Third Class"},\n    {"pclass": 1, "sex": "female", "age": 38.0, "sibsp": 1, "parch": 0, "fare": 71.28, "embarked": "C", "cabin": "C85", "name": "Married, Mrs. First Class"}\n])\npredict_and_print(custom_passengers, model)',
    outputSummary: 'Single Mr: ~11.6% Survival probability | Married Mrs: ~97.1% Survival probability',
    keyInsight: 'Predicting individual profiles highlights the non-linear boundaries created by one-hot encoded categories.',
    isSandboxPredictor: true
  }
];
