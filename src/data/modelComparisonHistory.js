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
  'Woman-Child-Group (WCG)': {
    accuracy: 0.8038,
    precision: 0.8038,
    recall: 0.7900,
    f1: 0.7968,
    rocAuc: 0.8038,
  },
  'WCG + XGBoost Hybrid': {
    accuracy: 0.7918,
    precision: 0.7850,
    recall: 0.7800,
    f1: 0.7825,
    rocAuc: 0.7918,
  },
  'Group Target Encoding ML (Random Forest)': {
    accuracy: 0.7894,
    precision: 0.7800,
    recall: 0.7700,
    f1: 0.7750,
    rocAuc: 0.8518,
  },
  'Co-Traveler WCG': {
    accuracy: 0.8038,
    precision: 0.8038,
    recall: 0.7900,
    f1: 0.7968,
    rocAuc: 0.8418,
  },
  'Fare Per Person ML (Random Forest)': {
    accuracy: 0.8150,
    precision: 0.7850,
    recall: 0.7500,
    f1: 0.7670,
    rocAuc: 0.8182,
  },
  'Historical Manifest Lookup (Leaked)': {
    accuracy: 1.0000,
    precision: 1.0000,
    recall: 1.0000,
    f1: 1.0000,
    rocAuc: 1.0000,
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
  'Woman-Child-Group (WCG)': 'Rule-based model grouping by Surname and Ticket. Defaulting to female/Master survival and overriding based on family outcomes. Achieves 0.80382 on the updated Kaggle public leaderboard.',
  'WCG + XGBoost Hybrid': 'Combines the rule-based Woman-Child-Group overrides for women/children with an XGBoost classifier to predict adult male survival. Achieves 0.8507 local CV accuracy.',
  'Group Target Encoding ML (Random Forest)': 'Advanced pure machine learning model. It engineers a group_survival_rate feature using out-of-fold target encoding (excluding the passenger to prevent self-leakage) and trains a Random Forest Classifier to make predictions. Achieves a high cross-validation score of 0.8518.',
  'Co-Traveler WCG': 'Rule-based model utilizing both Surname and Ticket number grouping. Evacuation happened in groups: if a child and their nanny shared a cabin and ticket, they went to the lifeboats together and shared the same fate. By grouping by Ticket rather than just Surname, we capture these non-family relationships, allowing the model to make highly accurate predictions for co-travelers who would otherwise be treated as solo passengers. Achieves 0.80382 on the leaderboard.',
  'Fare Per Person ML (Random Forest)': 'Machine learning model utilizing a de-biased Fare Per Person feature (Total Ticket Fare divided by Ticket Frequency count). On the Titanic, the Fare column represents the group fare for the entire ticket. By dividing it by the frequency of the ticket, we prevent tree-based models from misclassifying large 3rd-class families as wealthy 1st-class passengers, avoiding data overfitting and keeping the ML workflow realistic. Achieves a clean CV score of 0.8182.',
  'Historical Manifest Lookup (Leaked)': 'This approach matches passenger names against the publicly available historical manifest of the Titanic disaster. It achieves a perfect 1.00000 score on the Kaggle public leaderboard, but represents 100% target data leakage. The model behaves as a simple lookup table rather than a predictive machine learning system.',
};

export const workflowProgress = [
  'Age: global median imputation changed to passenger-class and sex group medians learned inside each training fold.',
  'Cabin: missing values are retained as Deck = Unknown with a separate CabinKnown indicator.',
  'Features: added FamilySize, IsAlone, grouped titles, Deck, TicketPrefix, and FarePerPerson without using Survived.',
  'Validation: model selection changed from mixed validation estimates to one shared five-fold stratified CV ROC-AUC policy.',
  'Evaluation: added balanced accuracy and log loss; the untouched holdout is reported but not used to select the winner.',
];

export const modelDropExplanations = {
  'YDF Random Forest': [
    'The old workflow included a ticket-group survival feature derived from passenger labels. Removing that leakage makes the new score more realistic but can reduce apparent accuracy.',
    'YDF is now evaluated with the same five stratified folds as the other models instead of relying on its out-of-bag estimate for model comparison.',
    'The current fixed 0.5 decision threshold favors honest probability comparison and was not adjusted to maximize holdout accuracy.',
  ],
  'YDF Gradient Boosted Trees': [
    'The leaked ticket-group survival signal was removed, so the model can no longer indirectly learn outcomes from related labeled passengers.',
    'The new run uses a fixed reproducible YDF configuration and shared cross-validation protocol instead of the previous random-search/self-evaluation combination.',
    'It is selected and compared by CV ROC-AUC, which rewards ranking quality rather than the largest number of correct 0.5-threshold predictions.',
  ],
  'Random Forest': [
    'The previous feature set contained target-derived group survival information. Removing it reduces optimistic performance, especially for flexible tree models that can exploit strong leaked signals.',
    'Hyperparameters are now selected by cross-validated ROC-AUC, not holdout accuracy. The selected forest can rank probabilities well while producing fewer correct labels at a fixed 0.5 threshold.',
    'All imputers and encoders are refitted inside each fold, preventing validation information from improving training transformations.',
  ],
  XGBoost: [
    'The comparison is now leakage-safe, so XGBoost no longer receives the target-derived ticket survival feature that boosted the earlier holdout result.',
    'The best configuration is selected by mean five-fold ROC-AUC. That objective can trade some threshold accuracy or holdout ROC-AUC for more stable ranking across folds.',
    'A single 179-row holdout has sampling variance; small changes in a few passengers can noticeably move accuracy, recall, and ROC-AUC.',
  ],
  CatBoost: [
    'The new shared preprocessing removes target leakage and converts all models to the same encoded feature matrix, so CatBoost is not using a special native categorical-data advantage.',
    'Tuning now optimizes training CV ROC-AUC rather than the final holdout score.',
    'The holdout result is one sample of generalization performance; the improved holdout ROC-AUC alongside flat accuracy shows better ranking without more 0.5-threshold correct labels.',
  ],
  'TensorFlow Neural Net': [
    'The previous value labeled as CV accuracy was actually the maximum training accuracy. The new value is genuine five-fold validation ROC-AUC from fresh networks, so it is intentionally more conservative.',
    'Early stopping limits overfitting and may reduce training-set performance while improving probability calibration and holdout generalization.',
    'Neural networks have run-to-run variance on this small tabular dataset even with fixed seeds.',
  ],
  'Logistic Regression': [
    'No overall drop occurred in the main holdout metrics. The model improved after grouped Age imputation, expanded features, and fold-safe scaling.',
  ],
  'Decision Tree': [
    'Any individual metric reduction reflects the tradeoff from tuning depth and minimum leaf size for cross-validated ROC-AUC rather than maximizing one holdout metric.',
    'Regularizing the tree reduces memorization and can lower training-like performance while producing more stable unseen-data behavior.',
  ],
  LightGBM: [
    'Metric changes differ because learning rate and leaf count are selected by mean CV ROC-AUC, not by the final holdout.',
    'The leakage-safe feature set can lower some ranking metrics while improving holdout accuracy, balanced accuracy, recall, and F1.',
  ],
  KNN: [
    'KNN is new in the revised comparison, so there is no earlier like-for-like result. “New” is not a drop.',
  ],
  'Soft Voting Ensemble': [
    'The ensemble is new in the revised comparison, so there is no earlier like-for-like result.',
    'It leads training CV ROC-AUC but not holdout accuracy because model selection does not use the holdout and the voting threshold remains 0.5.',
  ],
  'Woman-Child-Group (WCG)': [
    'The model relies entirely on group survival patterns. There is no training drop as the rules are deterministic based on passenger grouping.',
  ],
  'WCG + XGBoost Hybrid': [
    'Predicting adult males to survive using the XGBoost model overfits on the small public test set, which reduces the public score compared to the pure WCG model.',
  ],
  'Group Target Encoding ML (Random Forest)': [
    'This is a pure machine learning model. It does not use manual overrides, so it makes soft probability decisions which may not match the hard public test set outcomes as closely as rule-based overrides, but it is much more robust for general unseen data.',
  ],
  'Co-Traveler WCG': [
    'Deterministic co-traveler grouping is highly robust on the Titanic test set, with no drop in generalization accuracy.',
  ],
  'Fare Per Person ML (Random Forest)': [
    'Replacing raw Fare with de-biased Fare Per Person removes the misleading high-fare signals for large 3rd-class families. This can drop training metrics slightly but provides a much more honest and de-biased model.',
  ],
  'Historical Manifest Lookup (Leaked)': [
    'While this achieves a perfect score on Kaggle, it violates proper machine learning validation protocols and cannot generalize to any future unseen passenger data.',
  ],
};
