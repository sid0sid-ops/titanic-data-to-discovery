export const tfdfSteps = [
  {
    id: 'setup',
    stepNumber: 1,
    title: 'Setup & Environment',
    subtitle: 'Prepare Classifiers and Libraries',
    explanation: 'We install and import Scikit-Learn, Google YDF, XGBoost, LightGBM, and CatBoost. We also load standard mathematical and preprocessing utilities.',
    whyItMatters: 'Preparing a unified environment ensures reproducible comparison across traditional, tree-based, and gradient boosting implementations.',
    codeSnippet: '# Install and import libraries\nimport sys\nlibs = ["ydf", "xgboost", "lightgbm", "catboost"]\nfor lib in libs:\n    try:\n        __import__(lib)\n    except ImportError:\n        !{sys.executable} -m pip install {lib} -U --quiet\n\nimport pandas as pd\nimport numpy as np\nimport matplotlib.pyplot as plt\nimport seaborn as sns\nprint("✓ Environment set up successfully!")',
    outputSummary: '✓ Environment set up successfully!',
    keyInsight: 'Including YDF, XGBoost, LightGBM, and CatBoost gives us a diverse set of modern tabular learning algorithms.'
  },
  {
    id: 'loading',
    stepNumber: 2,
    title: 'Data Ingestion',
    subtitle: 'Load Kaggle CSV splits',
    explanation: 'We load the train.csv and test.csv from local directories, falling back to downloading from the GitHub remote repository if running on Google Colab.',
    whyItMatters: 'Starting with identical files ensures the comparison between baseline and advanced boosting models is completely fair.',
    codeSnippet: 'possible_paths = ["../kaggle/", "./kaggle/", "../data/", "./data/", "/content/"]\ntrain_df, test_df = None, None\nfor bp in possible_paths:\n    if os.path.exists(os.path.join(bp, "train.csv")):\n        train_df = pd.read_csv(os.path.join(bp, "train.csv"))\n        test_df = pd.read_csv(os.path.join(bp, "test.csv"))\n        break\nprint("Loaded Train shape:", train_df.shape)',
    outputSummary: 'Loaded Train shape: (891, 12) | Test shape: (418, 11)',
    keyInsight: 'Using local path resolution ensures compatibility between local Jupyter environments and Colab runtimes.'
  },
  {
    id: 'features',
    stepNumber: 3,
    title: 'Clean and Engineer Features',
    subtitle: 'Extract titles, cabin decks, and group survival rates',
    explanation: 'We create custom features: FamilySize, passenger Deck, Name Title (Mr, Mrs, Miss, Master, Officer, Royalty, Rare), and calculate the Group_Survival_Rate for shared ticket holders.',
    whyItMatters: 'Calculating group survival rates helps capture boarding group outcomes without causing future target leakage.',
    codeSnippet: 'def advanced_ml_feature_engineering(train, test):\n    # Extract FamilySize, Title, Deck, and Group_Survival_Rate\n    # returns train_prep, test_prep\n    ...\ntrain_prep, test_prep = advanced_ml_feature_engineering(train_df, test_df)',
    outputSummary: '✓ Features engineered successfully.',
    keyInsight: 'Adding group survival rate provides a strong signal since family or friends traveling on the same ticket often survived or perished together.'
  },
  {
    id: 'splitting',
    stepNumber: 4,
    title: 'Train / Test Split',
    subtitle: 'Stratify train-validation folds',
    explanation: 'We split our train.csv dataset into an 80/20 train/validation holdout set, stratifying by the target label to maintain class balance.',
    whyItMatters: 'Stratified splitting ensures that survival ratios are preserved across both subsets, avoiding biased validation results.',
    codeSnippet: 'from sklearn.model_selection import train_test_split\nfeatures = ["Pclass", "Sex", "Age", "SibSp", "Parch", "Fare", "Embarked", "Title", "Deck", "FamilySize", "Group_Survival_Rate"]\nX = train_prep[features]\ny = train_prep["Survived"].astype(int)\nX_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.20, random_state=42, stratify=y)',
    outputSummary: 'Train shape: (712, 11) | Validation shape: (179, 11)',
    keyInsight: 'Validating on a fixed holdout partition provides a stable test metric for our algorithm comparison.'
  },
  {
    id: 'comparison',
    stepNumber: 5,
    title: 'Model Comparison & Search Accuracy',
    subtitle: 'Train and evaluate 9 machine learning models',
    explanation: 'We fit Scikit-Learn pipelines (Logistic Regression, Decision Tree, Random Forest) with GridSearchCV, train Google YDF trees (Random Forest, Gradient Boosted Trees), tune XGBoost, LightGBM, and CatBoost, and compile a TensorFlow Keras MLP deep neural network under a TPU strategy scope. We test all models on the holdout validation split.',
    whyItMatters: 'Evaluating multiple paradigms helps identify the exact benefits of hyperparameter tuning, modern gradient boosting, and deep learning neural nets.',
    codeSnippet: '# Train LR, DT, RF, YDF RF, YDF GBT, XGBoost, LightGBM, CatBoost, Keras MLP\n# Evaluate and sort by holdout validation accuracy\ncomparison_df = pd.DataFrame(comparison_rows).sort_values("Holdout Validation Accuracy", ascending=False)\ndisplay(comparison_df.round(4))',
    outputSummary: 'CatBoost: CV 85.50% | Holdout 83.24%\nTensorFlow NN: CV 84.90% | Holdout 81.01%\nYDF GBT: CV 85.20% | Holdout 82.68%\nXGBoost: CV 84.80% | Holdout 82.12%',
    keyInsight: 'CatBoost achieves the highest holdout accuracy of 83.24% by leveraging symmetric trees and optimized categorical feature split algorithms.',
    isComparisonTable: true
  },
  {
    id: 'export',
    stepNumber: 6,
    title: 'Export Submission Predictions',
    subtitle: 'Predict test outcomes using the best model',
    explanation: 'We select the top-performing model (CatBoost) and run inferences on the unseen Kaggle test.csv. We format the predictions and save them to submissions/submission_tfdf_tuned.csv.',
    whyItMatters: 'Using holdout metrics to pick the best estimator ensures that our final leaderboard submission uses our most generalization-stable model.',
    codeSnippet: 'best_row = comparison_df.iloc[0]\nbest_name = best_row["Model Name"]\nbest_estimator = holdout_metrics[best_name]\ntest_preds = best_estimator.predict(test_prep_proc)\nsubmission = pd.DataFrame({"PassengerId": test_df["PassengerId"], "Survived": test_preds})\nsubmission.to_csv("../submissions/submission_tfdf_tuned.csv", index=False)',
    outputSummary: '✓ Saved predictions to ../submissions/submission_tfdf_tuned.csv (418 rows)',
    keyInsight: 'Submitting predictions from our best advanced model yields improved performance on the public leaderboard.'
  }
];
