export const kaggleSteps = [
  {
    id: 'intro',
    stepNumber: 1,
    title: 'Project Introduction',
    subtitle: 'Understand the Kaggle Titanic Competition',
    explanation: 'The Kaggle Titanic challenge is a machine learning competition where we predict passenger survival. The training set is used for learning, and the test set is used to evaluate submission performance on Kaggle.',
    whyItMatters: 'Validation must be calculated from train.csv only, because test.csv does not contain ground truth labels.',
    codeSnippet: '# Kaggle dataset split:\n# train.csv -> labels present\n# test.csv -> labels hidden',
    outputSummary: 'Overview of competition guidelines loaded.',
    keyInsight: 'Do not treat gender_submission.csv as actual truth; it is only a baseline benchmark.'
  },
  {
    id: 'loading',
    stepNumber: 2,
    title: 'Dataset Loading & Audit',
    subtitle: 'Verify file shapes and columns',
    explanation: 'We programmatically load local Kaggle CSV files (train.csv, test.csv, gender_submission.csv) and run structural checks to verify column alignments.',
    whyItMatters: 'Verifying schemas early prevents parsing errors during feature processing.',
    codeSnippet: 'train = pd.read_csv("../titanic/train.csv")\ntest = pd.read_csv("../titanic/test.csv")\nassert "Survived" in train.columns',
    outputSummary: 'Loaded train.csv (891 rows) and test.csv (418 rows). Shapes are validated.',
    keyInsight: 'train.csv contains the Survived label; test.csv does not.'
  },
  {
    id: 'questions',
    stepNumber: 3,
    title: 'Basic Titanic Questions',
    subtitle: 'Explore passenger ratios with Pandas',
    explanation: 'We run basic queries to identify passenger counts, gender distributions, and survival ratios across demographics.',
    whyItMatters: 'Basic stats establish strong baseline expectations before modeling.',
    codeSnippet: 'train.groupby("Sex")["Survived"].mean()',
    outputSummary: 'Female survival rate: ~74.2%, Male survival rate: ~18.9%.',
    keyInsight: 'Gender is one of the strongest individual predictors in the dataset.'
  },
  {
    id: 'interactive-eda',
    stepNumber: 4,
    title: 'Interactive EDA',
    subtitle: 'Render Plotly charts in Colab',
    explanation: 'We create interactive Plotly visualizations (like Sunburst Pclass → Sex → Survived flows) to interactively drill down into demographic subsets.',
    whyItMatters: 'Interactive charts are useful during notebook presentations to analyze specific outliers.',
    codeSnippet: 'fig = px.sunburst(train, path=["Pclass", "Sex", "Survived"])',
    outputSummary: 'Renders nested sunbursts and sankey charts inside the notebook runtime.',
    keyInsight: 'Upper-class females show near-perfect survival, while lower-class males show high casualty rates.'
  },
  {
    id: 'plots-gallery',
    stepNumber: 5,
    title: 'Static Plot Gallery',
    subtitle: 'Browse Kaggle static visualizations',
    explanation: 'View the static plots exported from the main Kaggle notebook dataset using the color-blind-safe palette.',
    whyItMatters: 'Static plots are saved to public/assets/plots/ for lightweight website presentation.',
    codeSnippet: 'plt.savefig("../public/assets/plots/survival_count.png", dpi=150)',
    outputSummary: '16 high-fidelity PNG plots generated and saved successfully.',
    keyInsight: 'Color-blind-safe hex values ensure accessibility for review.',
    isGallery: true
  },
  {
    id: 'feature-engineering',
    stepNumber: 6,
    title: 'Feature Engineering',
    subtitle: 'Extract family, alone, and title indicators',
    explanation: 'We create new columns like family_size, alone status, cabin indicators, and extract prefixes from passenger names.',
    whyItMatters: 'Signal amplification helps classical models capture complex relationships.',
    codeSnippet: 'df["family_size"] = df["sibsp"] + df["parch"] + 1\ndf["title"] = df["name"].apply(extract_title)',
    outputSummary: 'New columns successfully appended and formatted.',
    keyInsight: 'Titles map social status and serve as a proxy for age groups.'
  },
  {
    id: 'classical-models',
    stepNumber: 7,
    title: 'Classical Model Training',
    subtitle: 'Fit estimators with Scikit-Learn pipelines',
    explanation: 'We build ColumnTransformers and pipelines to train Logistic Regression, Decision Trees, Random Forests, and Gradient Boosting models.',
    whyItMatters: 'Pipelines prevent data leakage by fitting transformers strictly on training folds.',
    codeSnippet: 'pipe = Pipeline([("preprocess", preprocessor), ("classifier", clf)])\npipe.fit(X_train, y_train)',
    outputSummary: 'All models trained and cross-validated.',
    keyInsight: 'Logistic Regression and Random Forest show high stability across folds.'
  },
  {
    id: 'evaluation',
    stepNumber: 8,
    title: 'Model Evaluation',
    subtitle: 'Review confusion matrix & metrics',
    explanation: 'We compute accuracy, precision, recall, F1, and ROC-AUC for all models against the validation fold.',
    whyItMatters: 'Detailed diagnostics highlight whether a model is over-predicting specific outcomes.',
    codeSnippet: 'confusion_matrix(y_val, y_pred)',
    outputSummary: 'Selected model accuracy: ~81.56% on validation set.',
    keyInsight: 'Confusion matrix shows correct identification of survivors.'
  },
  {
    id: 'model-comparison',
    stepNumber: 9,
    title: 'Model Comparison',
    subtitle: 'Compare validation results',
    explanation: 'We compare classical model metrics in a clear comparison table to select the best submission candidate.',
    whyItMatters: 'Enables structured model selection based on cross-validation scores.',
    codeSnippet: '# Evaluated on 80/20 train/validation split',
    outputSummary: 'Model comparison table loaded dynamically.',
    keyInsight: 'Logistic Regression yields strong baseline results with coefficients odds ratios.',
    isComparisonTable: true
  },
  {
    id: 'submission',
    stepNumber: 10,
    title: 'Kaggle Submission',
    subtitle: 'Generate final predictions on test.csv',
    explanation: 'The chosen best classical model predicts survival labels for the unseen test set, exporting a CSV file.',
    whyItMatters: 'The submission file must match PassengerId and Survived format guidelines.',
    codeSnippet: 'submission.to_csv("../submissions/submission_best_classical.csv", index=False)',
    outputSummary: 'Exported submissions/submission_best_classical.csv successfully.',
    keyInsight: 'Never calculate accuracy or validation metrics against the hidden test dataset.'
  }
];
