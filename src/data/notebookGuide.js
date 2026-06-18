export const notebookGuide = [
  {
    id: "00_Titanic_Kaggle_Main_Workflow.ipynb",
    title: "00: Titanic Kaggle Main Workflow",
    purpose: "Main project notebook implementing standard data cleaning, full EDA, Plotly charts, classical models training, evaluation, and exporting final Kaggle submission CSV.",
    dataset: "Kaggle Dataset (kaggle/train.csv, kaggle/test.csv, kaggle/gender_submission.csv)",
    keyOutput: "submissions/submission_best_classical.csv",
    colabUrl: "https://colab.research.google.com/github/sid0sid-ops/titanic-data-to-discovery/blob/main/notebooks/00_Titanic_Kaggle_Main_Workflow.ipynb"
  },
  {
    id: "01_Titanic_TFDF_Advanced_Model.ipynb",
    title: "01: Titanic TF-DF Advanced Model",
    purpose: "Advanced machine learning showcase utilizing Google Colab-only TensorFlow Decision Forests (Gradient Boosted Trees Model, RandomSearch hyperparameter tuning).",
    dataset: "Kaggle Dataset (kaggle/train.csv, kaggle/test.csv)",
    keyOutput: "submissions/submission_tfdf_tuned.csv",
    colabUrl: "https://colab.research.google.com/github/sid0sid-ops/titanic-data-to-discovery/blob/main/notebooks/01_Titanic_TFDF_Advanced_Model.ipynb"
  },
  {
    id: "02_Titanic_OpenML_Reference_Workflow.ipynb",
    title: "02: Titanic OpenML Reference Workflow",
    purpose: "Reference comparison notebook showing how modeling works on the larger, unified OpenML dataset (1,309 rows) and highlighting why we keep it separate from Kaggle.",
    dataset: "OpenML Titanic Dataset (~1309 rows)",
    keyOutput: "openml_model_metrics.json (prefixed separately)",
    colabUrl: "https://colab.research.google.com/github/sid0sid-ops/titanic-data-to-discovery/blob/main/notebooks/02_Titanic_OpenML_Reference_Workflow.ipynb"
  }
];
