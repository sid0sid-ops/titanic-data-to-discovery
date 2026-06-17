export const links = {
  github: 'https://github.com/sid0sid-ops/titanic-data-to-discovery',
  notebook: 'https://github.com/sid0sid-ops/titanic-data-to-discovery/blob/main/notebooks/Titanic_Data_to_Discovery.ipynb',
  colab: 'https://colab.research.google.com/github/sid0sid-ops/titanic-data-to-discovery/blob/main/notebooks/Titanic_Data_to_Discovery.ipynb',
  live: 'https://sid0sid-ops.github.io/titanic-data-to-discovery/',
};

export const badges = ['Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'Scikit-Learn', 'Google Colab'];

export const workflow = ['Load', 'Clean', 'Explore', 'Visualize', 'Model', 'Predict', 'Communicate'];

export const validatedResult = {
  testAccuracy: '0.8435',
  testAccuracyPercent: '84.35%',
  source: 'current validated notebook run',
  note: 'The validated notebook run achieved 84.35% test accuracy using the OpenML Titanic dataset and a leakage-safe Scikit-Learn pipeline.',
  caveat: 'This value is computed live in the notebook and may vary with preprocessing choices, random state, dataset version, and feature engineering.',
  metricPolicy: 'Do not fake any extra metrics. Only use metrics present in the notebook.',
};

export const datasetSources = [
  {
    name: 'OpenML Titanic',
    rows: '1309',
    purpose: 'Main serious ML dataset',
    url: 'https://www.openml.org/data/get_csv/16826755/phpMYEkMl',
  },
  {
    name: 'DataScienceDojo / Kaggle-style',
    rows: '891',
    purpose: 'Beginner reproducibility',
    url: 'https://raw.githubusercontent.com/datasciencedojo/datasets/master/titanic.csv',
  },
  {
    name: 'Seaborn Titanic',
    rows: '891',
    purpose: 'Quick visualization comparison',
    url: 'https://raw.githubusercontent.com/mwaskom/seaborn-data/master/titanic.csv',
  },
];

export const libraries = [
  {
    name: 'NumPy',
    role: 'Numerical computation',
    detail: 'Provides vectorized operations and array-based thinking for feature transformations.',
  },
  {
    name: 'Pandas',
    role: 'Data loading and cleaning',
    detail: 'Reads the public CSV, inspects missingness, organizes columns, and prepares DataFrames.',
  },
  {
    name: 'Matplotlib',
    role: 'Foundational plotting',
    detail: 'Controls figure layout, titles, axes, labels, and export-ready chart formatting.',
  },
  {
    name: 'Seaborn',
    role: 'Statistical visualization',
    detail: 'Creates clearer visual comparisons for survival by class, gender, fare, age, and embarkation.',
  },
  {
    name: 'Scikit-Learn',
    role: 'Modeling pipeline',
    detail: 'Handles train-test splitting, preprocessing, ColumnTransformer, Logistic Regression, and evaluation.',
  },
];

export const columns = [
  ['survived', 'Target variable: 0 = not survived, 1 = survived.'],
  ['pclass', 'Passenger class and proxy for socio-economic position.'],
  ['name', 'Passenger name, used only for title extraction.'],
  ['sex', 'Categorical feature used in survival analysis.'],
  ['age', 'Numeric feature with missing values requiring careful imputation.'],
  ['sibsp', 'Number of siblings or spouses aboard.'],
  ['parch', 'Number of parents or children aboard.'],
  ['ticket', 'High-cardinality identifier excluded from the model.'],
  ['fare', 'Ticket price, coerced to numeric before modeling.'],
  ['cabin', 'Sparse raw field converted to has_cabin.'],
  ['embarked', 'Port of embarkation.'],
  ['boat/body', 'Post-disaster leakage fields excluded from prediction.'],
];

export const cleaningSteps = [
  'Split data before fitting preprocessors to avoid leakage.',
  'Convert OpenML "?" placeholders into real missing values.',
  'Coerce age and fare into numeric columns.',
  'Exclude boat and body because they are post-disaster leakage fields.',
  'Encode categorical features and scale numerical features inside a Pipeline.',
];

export const edaPlots = [
  ['Survival count', 'Baseline view of survived vs did-not-survive passengers.'],
  ['Survival by gender', 'Female passengers had higher survival rates in the historical data.'],
  ['Survival by passenger class', 'First-class passengers had higher survival rates than third-class passengers.'],
  ['Gender and class interaction', 'Gender and class jointly shaped survival patterns.'],
  ['Age distribution by survival', 'Children show a distinct survival pattern in the analysis.'],
  ['Log fare distribution', 'Fare is skewed; log transformation makes comparison clearer.'],
  ['Embarked vs survival', 'Embarkation patterns reflect class composition and confounding.'],
  ['Correlation heatmap', 'Numerical relationships summarize broad survival associations.'],
];

export const features = ['Pclass', 'Sex', 'Age', 'SibSp', 'Parch', 'Fare', 'Embarked', 'FamilySize', 'IsAlone', 'Title'];

export const predictionExamples = [
  {
    profile: 'Young third-class male passenger',
    interpretation: 'Example interpretation: lower survival probability because class and gender were historically strong risk signals.',
  },
  {
    profile: 'First-class female passenger',
    interpretation: 'Example interpretation: higher survival probability because gender and first-class status were associated with better outcomes.',
  },
  {
    profile: 'Child passenger',
    interpretation: 'Example interpretation: survival probability is influenced by age, title, and family context rather than age alone.',
  },
];

export const economicDomains = [
  ['Financial risk', 'Default vs non-default', 'Improves credit underwriting and portfolio risk control.'],
  ['Disaster response', 'High-risk vs lower-risk location', 'Prioritizes emergency planning, retrofits, and resource allocation.'],
  ['Insurance analytics', 'Claim vs no claim', 'Supports pricing, loss-ratio control, and claims automation.'],
  ['Healthcare triage', 'High-risk vs stable patient', 'Helps identify patients needing urgent intervention.'],
  ['Education analytics', 'Student attrition vs retained', 'Targets academic support and improves retention strategy.'],
  ['Space mission analytics', 'Subsystem failure vs operational', 'Supports predictive maintenance and mission reliability.'],
];

export const mindset = [
  'Ask the right questions before coding.',
  'Clean data is the foundation of truth.',
  'Visualize to understand.',
  'Model to predict.',
  'Communicate to inspire.',
];
