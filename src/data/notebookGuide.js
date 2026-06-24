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
    id: "01_Titanic_Model_Comparison_Project.ipynb",
    title: "01: Titanic Model Comparison Project",
    purpose: "Leakage-safe model comparison covering Logistic Regression, KNN, Decision Tree, Random Forest, YDF, XGBoost, LightGBM, CatBoost, and TensorFlow, plus separate regression, clustering, and anomaly-detection exercises.",
    dataset: "Kaggle Dataset (kaggle/train.csv, kaggle/test.csv)",
    keyOutput: "submissions/submission_model_comparison.csv",
    colabUrl: "https://colab.research.google.com/github/sid0sid-ops/titanic-data-to-discovery/blob/main/notebooks/01_Titanic_Model_Comparison_Project.ipynb"
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
