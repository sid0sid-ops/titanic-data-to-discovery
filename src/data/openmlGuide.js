export const openmlGuide = {
  warning: "CRITICAL: Do not mix OpenML rows with Kaggle rows, and do not train a combined model. OpenML Titanic is a separate reference workflow, not part of the main Kaggle submission pipeline.",
  description: "The OpenML Titanic dataset contains a single unified set of 1,309 records. Because it is unified, it is commonly used for academic references, cross-validation studies, and feature behavior comparisons.",
  differences: [
    {
      aspect: "Row Count",
      kaggle: "891 (train) + 418 (test)",
      openml: "1309 (unified)"
    },
    {
      aspect: "Labels",
      kaggle: "Test labels are hidden from the user on Kaggle servers.",
      openml: "All 1309 passenger labels are open and public."
    },
    {
      aspect: "Columns",
      kaggle: "Standard 12 columns (survived, sex, pclass, age, sibsp, parch, fare, cabin, embarked, ticket, name, passengerid).",
      openml: "14 columns (includes boat, body, and home.dest post-disaster variables)."
    }
  ]
};
