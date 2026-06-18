export const tfdfSteps = [
  {
    id: 'setup',
    stepNumber: 1,
    title: 'Setup & Installation',
    subtitle: 'Prepare TensorFlow Decision Forests',
    explanation: 'We load tensorflow_decision_forests in Colab, installing it dynamically if it is not present in the runtime.',
    whyItMatters: 'TF-DF is extremely heavy and is kept Colab-only to maintain a lightweight website.',
    codeSnippet: '!pip install tensorflow_decision_forests\nimport tensorflow_decision_forests as tfdf',
    outputSummary: 'TensorFlow and TF-DF packages loaded successfully.',
    keyInsight: 'TensorFlow Decision Forests is not bundled in the web app dependencies.'
  },
  {
    id: 'features',
    stepNumber: 2,
    title: 'Advanced Preprocessing',
    subtitle: 'Extract name tokens and ticket info',
    explanation: 'We normalise name strings, split ticket codes into items and numbers, and prepare structured columns.',
    whyItMatters: 'More granular feature extractions allow the decision forests model to learn complex splits.',
    codeSnippet: 'df["Ticket_item"] = df["Ticket"].apply(extract_ticket_item)\ndf["Ticket_number"] = df["Ticket"].apply(extract_ticket_number)',
    outputSummary: 'Advanced feature columns appended successfully.',
    keyInsight: 'Tokenizing names with tf.strings helps model passenger titles automatically.'
  },
  {
    id: 'datasets',
    stepNumber: 3,
    title: 'Dataset Conversion',
    subtitle: 'Convert Pandas to TF datasets',
    explanation: 'We convert Pandas DataFrames into TensorFlow Dataset format using pd_dataframe_to_tf_dataset.',
    whyItMatters: 'TF-DF models consume tensorflow datasets directly for optimized tree searches.',
    codeSnippet: 'train_ds = tfdf.keras.pd_dataframe_to_tf_dataset(train_prep, label="Survived")',
    outputSummary: 'TF train and test datasets structured.',
    keyInsight: 'Excludes PassengerId and Ticket from input features to prevent leakage.'
  },
  {
    id: 'training',
    stepNumber: 4,
    title: 'Model Training',
    subtitle: 'Train Gradient Boosted Trees',
    explanation: 'We fit a Gradient Boosted Trees model (GradientBoostedTreesModel) on the training set, inspecting variable importances.',
    whyItMatters: 'Enables tree-based models to learn predictive pathways on continuous and categorical splits.',
    codeSnippet: 'model = tfdf.keras.GradientBoostedTreesModel()\nmodel.fit(train_ds)',
    outputSummary: 'Gradient Boosted Trees trained. Model summary printed.',
    keyInsight: 'Variables like Sex, Fare, and Ticket_number are top splits in tree nodes.'
  },
  {
    id: 'tuning',
    stepNumber: 5,
    title: 'Tuning & Submissions',
    subtitle: 'Tuning parameters and exporting predictions',
    explanation: 'We run RandomSearch parameter tuning to improve accuracy, generating submissions: submission_tfdf_default.csv and submission_tfdf_tuned.csv.',
    whyItMatters: 'Hyperparameter tuning controls tree depth and learning rates for better generalization.',
    codeSnippet: 'submission.to_csv("../submissions/submission_tfdf_tuned.csv", index=False)',
    outputSummary: 'submissions/submission_tfdf_tuned.csv exported successfully.',
    keyInsight: 'Decision Forest models are kept Colab-only due to size and build requirements.'
  }
];
