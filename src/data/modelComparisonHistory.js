export const previousModelMetrics = {
  'YDF Random Forest': {
    accuracy: 0.8212,
    precision: 0.8136,
    recall: 0.6957,
    f1: 0.7500,
    rocAuc: 0.8426,
  },
  'YDF Gradient Boosted Trees': {
    accuracy: 0.8156,
    precision: 0.8214,
    recall: 0.6667,
    f1: 0.7360,
    rocAuc: 0.8440,
  },
  'Random Forest': {
    accuracy: 0.8156,
    precision: 0.8000,
    recall: 0.6957,
    f1: 0.7442,
    rocAuc: 0.8486,
  },
  LightGBM: {
    accuracy: 0.8045,
    precision: 0.7931,
    recall: 0.6667,
    f1: 0.7244,
    rocAuc: 0.8356,
  },
  'Decision Tree': {
    accuracy: 0.8045,
    precision: 0.7833,
    recall: 0.6812,
    f1: 0.7287,
    rocAuc: 0.7999,
  },
  XGBoost: {
    accuracy: 0.7989,
    precision: 0.7619,
    recall: 0.6957,
    f1: 0.7273,
    rocAuc: 0.8271,
  },
  CatBoost: {
    accuracy: 0.7933,
    precision: 0.7667,
    recall: 0.6667,
    f1: 0.7132,
    rocAuc: 0.8373,
  },
  'TensorFlow Neural Net': {
    accuracy: 0.7933,
    precision: 0.7500,
    recall: 0.6957,
    f1: 0.7218,
    rocAuc: 0.8560,
  },
  'Logistic Regression': {
    accuracy: 0.7765,
    precision: 0.7302,
    recall: 0.6667,
    f1: 0.6970,
    rocAuc: 0.8458,
  },
};

export const modelProgressNotes = {
  'Soft Voting Ensemble': 'New model. It combines the three strongest training-CV pipelines: XGBoost, CatBoost, and Random Forest.',
  XGBoost: 'Now uses fold-fitted grouped Age imputation, expanded leakage-safe features, and GridSearchCV-selected depth and learning rate.',
  CatBoost: 'Now receives the same fold-safe transformed feature matrix and is tuned under the shared five-fold ROC-AUC protocol.',
  'YDF Gradient Boosted Trees': 'Now uses the same stratified folds as every other model instead of a different self-evaluation estimate.',
  'Random Forest': 'Now tunes tree depth and minimum leaf size with preprocessing refitted independently inside every fold.',
  LightGBM: 'Now tunes learning rate and leaf count using the shared CV policy and the expanded feature set.',
  'YDF Random Forest': 'Now uses manual five-fold ROC-AUC evaluation and grouped Age values learned only from each training fold.',
  'TensorFlow Neural Net': 'Training accuracy is no longer reported as CV accuracy. A fresh network and preprocessor are fitted per fold with early stopping.',
  'Logistic Regression': 'Now uses grouped Age imputation, standardized numeric features, expanded categorical features, and tuned regularization.',
  'Decision Tree': 'Now tunes maximum depth and minimum leaf size under the same fold-safe preprocessing and validation policy.',
  KNN: 'New supervised benchmark. Neighbor count and weighting are tuned after numeric scaling and categorical encoding.',
};

export const workflowProgress = [
  'Age: global median imputation changed to passenger-class and sex group medians learned inside each training fold.',
  'Cabin: missing values are retained as Deck = Unknown with a separate CabinKnown indicator.',
  'Features: added FamilySize, IsAlone, grouped titles, Deck, TicketPrefix, and FarePerPerson without using Survived.',
  'Validation: model selection changed from mixed validation estimates to one shared five-fold stratified CV ROC-AUC policy.',
  'Evaluation: added balanced accuracy and log loss; the untouched holdout is reported but not used to select the winner.',
];
