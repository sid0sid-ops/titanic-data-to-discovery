# Professor Questions — Titanic Data to Discovery Project

These questions are taken from the workshop study material and are organized by day number for project documentation and revision.

## Day 2 — Python for Data Science and Titanic Case Study

Context:
Python for Data Science, NumPy, Pandas, Matplotlib, Seaborn, Scikit-Learn, and Titanic survival prediction workflow.

Project workflow to document:

* Load Data
* Clean Data
* Explore Data
* Visualize Data
* Model
* Predict
* Communicate Results

Class task themes:

* Show the Titanic dataset table with passenger details.
* Use `pd.read_csv()` to load the data.
* Handle missing ages and embarkation values.
* Visualize survival by gender/class with Seaborn.
* Build a Logistic Regression model with Scikit-Learn.
* Display accuracy score and key insights.
* Discuss how gender and class influenced survival.

Reflection line to include:
“Every dataset tells a story — Python helps us Listen, Learn, and Lead.”

## Day 3 — Data Visualization

### Student Worksheet Tasks

Get the Data (📂)
Load train.csv from Kaggle or Seaborn dataset.
Task: Count survivors vs. non-survivors.

Explore (🔍)
Use Pandas + Seaborn for quick plots.
Task: Plot survival by gender and class.

Clean (🧹)
Fill missing values (Age, Embarked).
Encode categorical variables (Sex, Embarked).
Task: Check for remaining nulls.

Model (🤖)
Train Logistic Regression or Decision Tree.
Task: Interpret coefficients — which features matter most?

Predict (📈)
Generate survival predictions.
Task: Compare predicted vs. actual for 10 passengers.

Evaluate (📊)
Accuracy, confusion matrix, ROC curve.
Task: Discuss what the confusion matrix shows.

Communicate (💬)
Visualize insights (e.g., gender vs. survival).
Task: Write a short summary of findings.

### Project Questions

Which chart type best answers the question?

How does design choice affect interpretation?

Can you make the visualization more engaging without losing clarity?

### Interactive Q&A Prompt

Question 1: If you had to visualize the Titanic dataset, which chart would best show survival by gender and class — and why? 🧩 (Encourages you all to connect chart choice with storytelling.)

Question 2: How can poor design choices — like misleading scales or excessive color — distort the message of a visualization? 🧠 (Promotes critical thinking about ethics and clarity in data communication.)

## Day 4 — Statistics for Machine Learning

### Applying Statistics to the Titanic Project

Our investigation aims to answer the following questions:

What were the key factors that influenced passenger survival on the Titanic?

How did variables such as age, gender, ticket class, and family size affect the chances of survival?

Can we identify significant predictors of survival based on the available data?

Are the differences in survival rates of different demographics really statistically significant to be able to make conclusions from it?

### Hands-On Exercise Sheet: “Exploring Statistics in the Titanic Dataset”

Objective:
Apply key statistical concepts — mean, variance, correlation, hypothesis testing, and regression — to understand survival patterns in the Titanic dataset.

Part 1: Descriptive Statistics
Load the dataset (titanic.csv).
Compute:
Mean and median of Age and Fare.
Survival rate (Survived column).
Plot a histogram of passenger ages.

Part 2: Variance & Correlation
Calculate variance and standard deviation of Fare.
Create a correlation heatmap for selected features (Age, Fare, Sex, Pclass, Survived).

Part 3: Hypothesis Testing
Test whether women had a higher survival rate than men.
Interpret the p-value: if p < 0.05, the difference is statistically significant.

Part 4: Regression
Build a simple logistic regression model to predict survival.

Part 5: Reflection
Write a short paragraph (100–150 words) explaining:
Which statistical measure gave the most insight?
How did hypothesis testing validate your assumptions?
How does regression connect statistics to ML prediction?

### Reflection Activity: “From Numbers to Wisdom”

Thought Question — The Bridge
How does statistical reasoning transform raw data into intelligent decisions in AI?

Thought Question — The Balance
Why is fairness a statistical concept as much as an ethical one?

Thought Question — The Future
If AI learns from data, who ensures it learns truthfully?

### Questions for Today, 18 June 2026

What have you learnt from the Titanic Disaster?

Distractions are dangerous, elaborate

Stakeholders should be kept informed, yes/no

Traceability is essential, what do you think?

Documentation may have lasting benefits, true or false and why

Kindly answer the above and submit the same to my mail id on or before 20 June 2026.

## Day 10 — Decision Trees & Random Forest

Class task themes:
* Explain Splitting Criteria: Gini Impurity vs. Information Gain (Entropy).
* Define Decision Tree vs. Random Forest ("one expert vs. panel of experts").
* Highlight Tree-Based Data Cleansing: surrogate splits, outlier detection, and feature importance.
* Answer the Spot the Dirty Data worksheet questions.
* Discuss the "Build Your Own Forest" reflection question: "If one tree makes a mistake, how does the forest correct it?"

## Day 12 — Neural Networks, Perceptron & Deep Learning

Class task themes:
* Define Perceptron in your own words.
* List three key differences between a Perceptron and a Deep Neural Network.
* Explain what Gradient Descent does in a neural network.
* Why is backpropagation essential for learning?
* Identify five features used to predict survival in the Titanic dataset.
* Describe how Gradient Descent helps the model improve its predictions.
* Reflect on: "From simple neurons to deep insights — AI is teaching machines to think."

## Day 13 — Model Evaluation

Class task themes:
* Define Accuracy, Precision, Recall, and F1-score for Titanic survival classification.
* Solve the rescue-prediction trade-off: "If you were designing a rescue-prediction system, would you prefer high precision or high recall?"
* Interpret the confusion matrix (TP=80, FN=40, FP=20, TN=160) and calculate accuracy, precision, recall, and F1-score.
* Explain why accuracy alone is insufficient for evaluating models under class imbalance.

