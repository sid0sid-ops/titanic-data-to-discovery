export const chartGuide = [
  {
    type: "Bar Chart",
    description: "Used to compare categorical variables. In the Titanic project, this displays counts of survival, counts of passengers by gender, and survival rates across classes or embarked locations.",
    keyInsight: "Shows that female survival rates (~74%) were significantly higher than male survival rates (~19%)."
  },
  {
    type: "Histogram",
    description: "Visualizes the distribution of continuous numeric data. In our project, it plots passenger fares and age values, showing frequency patterns.",
    keyInsight: "Fares are extremely right-skewed, showing that the majority of passengers bought cheap tickets."
  },
  {
    type: "Scatter Plot",
    description: "Displays relationships between two continuous variables. Here we plot Age vs. Fare, with points colored by survival status to detect trends and outliers.",
    keyInsight: "Higher fare passengers clustered at the top of the plot have higher densities of blue dots (Survived)."
  },
  {
    type: "Heatmap",
    description: "Displays matrices of numbers using colors. Used to draw correlation matrices of features and survival rates across both Sex and Class dimensions.",
    keyInsight: "Class 1 females have the highest survival rate (~96.8%), while Class 3 males have the lowest (~13.5%)."
  },
  {
    type: "Boxplot",
    description: "Shows distributions using quartiles, medians, and whiskers. Excellent for detecting outliers in continuous variables like Fares.",
    keyInsight: "Identifies extreme outliers, including passengers who paid over $500 (e.g., Cardeza and Astor family tickets)."
  },
  {
    type: "Line Chart",
    description: "Displays trends over continuous intervals, such as threshold analysis for classifier decision boundaries.",
    keyInsight: "ROC curve uses line segments to plot TPR against FPR across multiple threshold limits."
  },
  {
    type: "Pie / Donut Chart",
    description: "Displays proportion breakdown of categorical groups (e.g., embarked ports Southampton, Cherbourg, Queenstown).",
    keyInsight: "Over 70% of passengers embarked from Southampton (S)."
  },
  {
    type: "Sankey / Sunburst Chart",
    description: "Visualizes hierarchical flows and groupings. In Colab, we plot the flow Pclass → Sex → Survived to see demographic splits.",
    keyInsight: "Hierarchical plots show that class and sex combined dominate survival odds."
  },
  {
    type: "Confusion Matrix",
    description: "A 2x2 grid plotting actual vs. predicted classes. Shows True Negatives, True Positives, False Positives, and False Negatives.",
    keyInsight: "Helps diagnostic evaluation beyond accuracy, detailing where classification errors occur (e.g., predicting death for survivors)."
  }
];
