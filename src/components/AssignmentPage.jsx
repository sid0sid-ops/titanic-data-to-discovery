import { useState } from 'react';

const schedule = [
  ['Day 1', 'Introduction to AI & ML', '15th June 2026'],
  ['Day 2', 'Python for Data Science', '16th June 2026'],
  ['Day 3', 'Data Visualization', '17th June 2026'],
  ['Day 4', 'Statistics for ML', '18th June 2026'],
  ['Day 5', 'Data Preprocessing', '19th June 2026'],
  ['Day 6', 'Supervised Learning', '20th June 2026'],
  ['Day 7', 'Linear Regression', '22nd June 2026'],
  ['Day 8', 'Logistic Regression', '23rd June 2026'],
  ['Day 9', 'KNN Algorithm', '24th June 2026'],
  ['Day 10', 'Decision Trees & Random Forest', '25th June 2026'],
  ['Day 11', 'Unsupervised Learning', '26th June 2026'],
  ['Day 12', 'Neural Networks', '27th June 2026'],
  ['Day 13', 'Model Evaluation', '29th June 2026'],
  ['Day 14', 'Mini Project', '30th June 2026'],
  ['Day 15', 'Cyber Security using AI & ML', '01st July 2026'],
];

const tabs = [
  { id: 'day2', label: 'Day 2' },
  { id: 'day3', label: 'Day 3' },
  { id: 'day4', label: 'Day 4' },
  { id: 'day5', label: 'Day 5' },
  { id: 'day6', label: 'Day 6' },
  { id: 'day7', label: 'Day 7' },
  { id: 'day8', label: 'Day 8' },
  { id: 'day9', label: 'Day 9' },
  { id: 'day10', label: 'Day 10' },
  { id: 'day11', label: 'Day 11' },
  { id: 'day12', label: 'Day 12' },
  { id: 'day13', label: 'Day 13' },
];

const tabIdsByDay = Object.fromEntries(tabs.map((tab) => [tab.label, tab.id]));

const qaStyle = {
  padding: '14px 16px',
  border: '1px solid var(--border-color)',
  borderRadius: '8px',
  backgroundColor: '#ffffff',
};

const codeStyle = {
  margin: '10px 0 0',
  padding: '10px 12px',
  borderRadius: '6px',
  backgroundColor: '#0f172a',
  color: '#e2e8f0',
  fontSize: '12px',
  lineHeight: 1.5,
  overflowX: 'auto',
  whiteSpace: 'pre-wrap',
};

function QA({ label, question, answer, code }) {
  return (
    <div style={qaStyle}>
      <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '6px' }}>{label}</div>
      <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>{question}</div>
      <div style={{ fontSize: '13.5px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>{answer}</div>
      {code && <pre style={codeStyle}>{code}</pre>}
    </div>
  );
}

function NotebookButton({ filename, children }) {
  const encodedFilename = encodeURIComponent(filename);
  return (
    <a
      href={`https://colab.research.google.com/github/sid0sid-ops/titanic-data-to-discovery/blob/main/notebooks/${encodedFilename}`}
      className="btn btn-primary"
      target="_blank"
      rel="noreferrer"
      style={{ justifyContent: 'center', width: 'fit-content', fontSize: '13px' }}
    >
      <i className="fa-solid fa-play"></i>
      <span>{children}</span>
    </a>
  );
}

export default function AssignmentPage() {
  const [activeTab, setActiveTab] = useState('day4');

  return (
    <div id="assignment" style={{ padding: '24px', overflowY: 'auto' }}>
      <h4 style={{ margin: '0 0 12px 0', color: 'var(--text-primary)', fontSize: '16px' }}>Schedule</h4>
      <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
        <table className="comparison-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid var(--border-color)' }}>
              <th style={{ padding: '9px 10px' }}>Day</th>
              <th style={{ padding: '9px 10px' }}>Topic</th>
              <th style={{ padding: '9px 10px' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map(([day, topic, date]) => {
              const tabId = tabIdsByDay[day];
              const isClickable = Boolean(tabId);

              return (
                <tr
                  key={day}
                  onClick={isClickable ? () => setActiveTab(tabId) : undefined}
                  style={{
                    borderBottom: '1px solid var(--border-color)',
                    cursor: isClickable ? 'pointer' : 'default',
                    backgroundColor: activeTab === tabId ? '#eff6ff' : 'transparent',
                  }}
                  aria-label={isClickable ? `Open ${day} assignment questions` : undefined}
                >
                  <td style={{ padding: '9px 10px', fontWeight: 700 }}>{day}</td>
                  <td style={{ padding: '9px 10px' }}>{topic}</td>
                  <td style={{ padding: '9px 10px' }}>{date}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <label
        id="assignment-day-tabs-label"
        htmlFor="assignment-day-tabs"
        style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}
      >
        Assignment days
      </label>
      <div
        id="assignment-day-tabs"
        role="tablist"
        aria-labelledby="assignment-day-tabs-label"
        style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '18px 0' }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            id={`assignment-tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`assignment-panel-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`pill-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            style={{ fontSize: '13px', padding: '7px 14px' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'day2' && (
        <section id="assignment-panel-day2" role="tabpanel" aria-labelledby="assignment-tab-day2" style={{ display: 'grid', gap: '12px' }}>
          <h4 style={{ margin: 0, fontSize: '16px' }}>Day 2 - Python for Data Science</h4>
          <QA
            label="Project Workflow"
            question="What Python data-science workflow does the Day 2 material connect with the Titanic project?"
            answer="The workflow is to load the Titanic data, clean missing or inconsistent values, explore passenger patterns, visualize survival, train a simple model, predict outcomes, and communicate the result clearly. Using the Kaggle training file, the code reads 891 rows: 342 passengers survived and 549 did not survive."
            code={`df = pd.read_csv(train_url)
df["Survived"].value_counts()
# 0: 549, 1: 342`}
          />
          <QA
            label="Reflection"
            question="What does the line 'Every dataset tells a story - Python helps us Listen, Learn, and Lead' mean?"
            answer="It means that Python is not only used to write code. It helps us listen to data by loading and inspecting it, learn from data by finding patterns, and lead with data by explaining useful decisions. In the Titanic project, Python helps convert passenger records into survival insights."
          />
        </section>
      )}

      {activeTab === 'day3' && (
        <section id="assignment-panel-day3" role="tabpanel" aria-labelledby="assignment-tab-day3" style={{ display: 'grid', gap: '12px' }}>
          <h4 style={{ margin: 0, fontSize: '16px' }}>Day 3 - Data Visualization</h4>
          <QA
            label="Question 1"
            question="If you had to visualize the Titanic dataset, which chart would best show survival by gender and class - and why?"
            answer="A grouped bar chart is the clearest choice because it lets me compare survival rates across passenger class while also separating male and female passengers. For the Titanic dataset, the important story is not just how many people survived, but how survival changed by social class and gender. A grouped bar chart keeps all groups on the same scale, so the difference between first-class female passengers and third-class male passengers becomes easy to see without needing complicated interpretation."
            code={`sns.barplot(data=df, x="Pclass", y="Survived", hue="Sex")
plt.ylabel("Survival rate")`}
          />
          <QA
            label="Question 2"
            question="How can poor design choices - like misleading scales or excessive color - distort the message of a visualization?"
            answer="Poor design can make a chart look convincing even when it is misleading. For example, if a bar chart does not start from zero, a small difference in survival rate can look much larger than it really is. Too many colors can also distract the viewer and make categories look more important than they are. In a Titanic survival chart, I would use a simple color scheme, clear labels, and a consistent axis so the viewer focuses on the real pattern instead of the decoration."
          />
        </section>
      )}

      {activeTab === 'day4' && (
        <section id="assignment-panel-day4" role="tabpanel" aria-labelledby="assignment-tab-day4" style={{ display: 'grid', gap: '12px' }}>
          <h4 style={{ margin: 0, fontSize: '16px' }}>Day 4 - Statistics for ML</h4>
          <QA
            label="Part 5 Reflection"
            question="Which statistical measure gave the most insight?"
            answer="Correlation and group survival rates gave me the clearest insight because they connected the raw passenger details to survival patterns. The strongest lesson was that variables such as sex and passenger class were not just labels; they were strongly connected with survival outcome. Mean and median helped summarize the dataset, but correlation and grouped rates helped explain which features deserved attention before building a model."
          />
          <QA
            label="Part 5 Reflection"
            question="How did hypothesis testing validate your assumptions?"
            answer="Before testing, the visualizations suggested that women had a higher survival rate than men. The generated evidence showed female survival rate 0.7420, male survival rate 0.1889, and Fisher exact-test p-value 3.592513e-60. Because this is far below 0.05, the sample supports higher female survival."
            code={`female = df[df["Sex"] == "female"]["Survived"]
male = df[df["Sex"] == "male"]["Survived"]
# female rate: 0.7420, male rate: 0.1889, p-value: 3.592513e-60`}
          />
          <QA
            label="Part 5 Reflection"
            question="How does regression connect statistics to ML prediction?"
            answer="Regression connects statistics to prediction by turning relationships in the data into model coefficients. In logistic regression, those coefficients are used to estimate the probability of survival. This means the model is not just memorizing rows; it is learning how features such as age, fare, and class shift the chance of the target outcome."
          />
          <QA
            label="Question"
            question="What have you learnt from the Titanic Disaster?"
            answer="The Titanic disaster taught me that data is never only numbers. Behind every row there is a real person and a real decision-making situation. From the project, I learned that survival was shaped by social factors such as gender and class, and that responsible analysis must combine evidence, context, and humility. A model can show patterns, but we still need human judgment to explain what those patterns mean."
          />
          <QA
            label="Question"
            question="Distractions are dangerous, elaborate"
            answer="Distractions are dangerous because they pull attention away from the signals that matter most. In data science, the same thing can happen when we focus too early on accuracy or complicated models while ignoring missing values, biased data, or leakage. For this Titanic project, the safer approach was to first understand the dataset, inspect patterns, and check assumptions before trusting any prediction."
          />
          <QA
            label="Question"
            question="Stakeholders should be kept informed, yes/no"
            answer="Yes. Stakeholders should be kept informed because decisions become risky when people only see the final result and not the limitations behind it. In an ML project, stakeholders need to know where the data came from, what was missing, which assumptions were tested, and how accurate the model is. Clear communication prevents overconfidence and helps people use the analysis responsibly."
          />
          <QA
            label="Question"
            question="Traceability is essential, what do you think?"
            answer="Traceability is essential because every result should be connected back to its source. If a chart, p-value, or prediction is questioned, I should be able to trace it back to the dataset, cleaning step, feature engineering step, and model code. This makes the work reproducible and honest. Without traceability, results may look impressive but cannot be trusted properly."
          />
          <QA
            label="Question"
            question="Documentation may have lasting benefits, true or false and why"
            answer="True. Documentation has lasting benefits because it preserves the reasoning behind the work. A future reader can understand why certain columns were used, why missing values were handled in a specific way, and how the model was evaluated. In this project, documentation also helps connect classroom questions with notebook evidence, so the work can be reviewed instead of guessed."
          />
        </section>
      )}

      {activeTab === 'day5' && (
        <section id="assignment-panel-day5" role="tabpanel" aria-labelledby="assignment-tab-day5" style={{ display: 'grid', gap: '12px' }}>
          <h4 style={{ margin: 0, fontSize: '16px' }}>Day 5 - Data Preprocessing</h4>
          <QA
            label="Concept"
            question="Why is data preprocessing important before machine learning?"
            answer="Data preprocessing is important because raw data can contain missing values, duplicates, inconsistent formats, outliers, and text labels that a model cannot use directly. If these problems are ignored, the model may learn from noise instead of real patterns. In the Titanic dataset, preprocessing makes Age, Fare, Sex, Embarked, and Pclass usable for fair prediction."
          />
          <QA
            label="Titanic Steps"
            question="Which preprocessing steps should be performed on the Titanic dataset?"
            answer="The main steps are to fill missing Age values, handle missing Embarked values, drop or mark Cabin because it has many missing values, encode categorical columns such as Sex and Embarked, scale numerical features such as Age and Fare, and split the data into training and testing sets. The Colab CLI run found missing values before preprocessing: Age 177, Cabin 687, Embarked 2. After filling Age and Embarked, both became 0."
            code={`df[["Age", "Cabin", "Embarked"]].isna().sum()
# Age: 177, Cabin: 687, Embarked: 2
df["Age"] = df["Age"].fillna(df["Age"].median())
df["Embarked"] = df["Embarked"].fillna(df["Embarked"].mode()[0])
# Age: 0, Embarked: 0`}
          />
          <QA
            label="Workflow"
            question="How do cleaning, encoding, scaling, and train/test split help the model?"
            answer="Cleaning removes incorrect or incomplete values. Encoding converts text categories into numbers. Scaling keeps large numeric ranges such as Fare from dominating smaller ranges such as Age. Train/test split checks whether the model works on unseen data instead of only memorizing the training rows."
          />
          <NotebookButton filename="00_Titanic_Kaggle_Main_Workflow.ipynb">
            Run Main Kaggle Workflow in Colab
          </NotebookButton>
        </section>
      )}

      {activeTab === 'day6' && (
        <section id="assignment-panel-day6" role="tabpanel" aria-labelledby="assignment-tab-day6" style={{ display: 'grid', gap: '12px' }}>
          <h4 style={{ margin: 0, fontSize: '16px' }}>Day 6 - Supervised Learning</h4>
          <QA
            label="Concept"
            question="What is supervised learning?"
            answer="Supervised learning trains a model using labeled data, where every input has a known output. In the Titanic project, passenger features such as Age, Pclass, Sex, Fare, and SibSp are inputs, while known answers such as Survived or Fare become labels. The model learns the mapping from inputs to outputs and then predicts for new passengers."
          />
          <QA
            label="Concept"
            question="How do classification and regression differ in the Titanic project?"
            answer="Classification predicts categories, such as whether a passenger survived or did not survive. Logistic Regression is used for this survival task. Regression predicts continuous numerical values, such as passenger fare. Linear Regression is used for that fare prediction task."
          />
          <QA
            label="Workflow"
            question="What supervised-learning workflow does the Day 6 material describe?"
            answer="The workflow is to collect labeled data, split it into training and testing sets, train a model, validate it on unseen test data, and then use the trained model for new predictions. This matches the Kaggle notebook workflow: prepare the Titanic data, split the labeled training rows, fit a model, evaluate metrics, and predict on new passengers."
          />
          <QA
            label="Assignment"
            question="What assignments are present in the Day 6 Supervised Learning material?"
            answer="The Day 6 material points students to three executable Titanic exercises: a Linear Regression program to predict Fare from Age, Pclass, and SibSp; a Logistic Regression program to predict Survived from Age, Pclass, and Sex; and a Titanic Learning Lab that compares supervised Logistic Regression with unsupervised K-Means clustering."
          />
        </section>
      )}

      {activeTab === 'day7' && (
        <section id="assignment-panel-day7" role="tabpanel" aria-labelledby="assignment-tab-day7" style={{ display: 'grid', gap: '12px' }}>
          <h4 style={{ margin: 0, fontSize: '16px' }}>Day 7 - Linear Regression</h4>
          <QA
            label="Exercise 1"
            question="# Linear Regression on Titanic Dataset Python Program code. Goal: Predict passenger fare based on age, class, and family size"
            answer="Fare is the target, so Linear Regression is used because it predicts a continuous value. Age, Pclass, and SibSp are the input features. In the Colab CLI evidence run, this simple model produced Mean Squared Error 976.56 and R2 Score 0.369, so it explains some fare variation but is not a strong fare predictor by itself."
            code={`X = clean[["Age", "Pclass", "SibSp"]]
y = clean["Fare"]
model = LinearRegression().fit(X_train, y_train)
# MSE: 976.56, R2: 0.369`}
          />
          <QA
            label="Plot Check"
            question="What should the regression fit plot show?"
            answer="The plot should show the actual data points and a fitted regression line. The points show the real passenger values, while the line shows the trend learned by the model. If the line follows the general direction of the points, the model has captured some relationship; if the points are widely scattered, the prediction has higher error."
          />
          <NotebookButton filename="Linear Regression on Titanic Dataset Python Program code.ipynb">
            Run Linear Regression Notebook in Colab
          </NotebookButton>
        </section>
      )}

      {activeTab === 'day8' && (
        <section id="assignment-panel-day8" role="tabpanel" aria-labelledby="assignment-tab-day8" style={{ display: 'grid', gap: '12px' }}>
          <h4 style={{ margin: 0, fontSize: '16px' }}>Day 8 - Logistic Regression</h4>
          <QA
            label="Exercise 2"
            question="Python demo snippet for Logistic Regression on the Titanic dataset, showing how classification differs from regression"
            answer="Survived is the target, so Logistic Regression is used because it predicts a category with two classes: No or Yes. Age, Pclass, Sex, Fare, SibSp, Parch, and Embarked are used after preprocessing. The generated project evidence gives baseline Logistic Regression accuracy 0.8156; the Colab CLI mini run gave 0.804 with a smaller feature setup."
            code={`model = LogisticRegression(max_iter=1000)
model.fit(X_train, y_train)
accuracy_score(y_test, model.predict(X_test))
# project evidence: 0.8156`}
          />
          <QA
            label="Mini Quiz 1"
            question="A 25-year-old passenger in 2nd class has a predicted survival probability P = 0.62. Classify the outcome and explain why the threshold of 0.5 matters."
            answer="The passenger is classified as Survived because 0.62 is greater than the usual threshold of 0.5. The threshold matters because logistic regression outputs a probability, and the threshold converts that probability into a final class label."
          />
          <QA
            label="Mini Quiz 2"
            question="A 45-year-old passenger in 3rd class has P = 0.38. What does this probability mean, and how would the decision change if the threshold were 0.4 instead of 0.5?"
            answer="A probability of 0.38 means the model estimates a 38 percent chance of survival. With a 0.5 threshold, the passenger is classified as Did Not Survive. With a 0.4 threshold, the result is still Did Not Survive because 0.38 is below 0.4, but it is closer to the boundary."
          />
          <QA
            label="Mini Quiz 3"
            question="A 10-year-old passenger in 1st class has P = 0.85. Interpret the probability and discuss how age and class might influence the coefficients."
            answer="A probability of 0.85 means the model estimates a high chance of survival, so the passenger is classified as Survived. Younger age and higher passenger class may increase the survival probability if their learned coefficients move the log-odds in a positive direction."
          />
          <QA
            label="Bonus"
            question="If gender is added as a variable and the coefficient for female is positive, what does that tell us about survival likelihood?"
            answer="A positive female coefficient means that being female increases the model's predicted log-odds of survival compared with the reference category. In simple words, the model has learned that female passengers had a higher survival likelihood in this dataset."
          />
          <NotebookButton filename="Python demo snippet for Logistic Regression on the Titanic dataset.ipynb">
            Run Logistic Regression Notebook in Colab
          </NotebookButton>
        </section>
      )}

      {activeTab === 'day9' && (
        <section id="assignment-panel-day9" role="tabpanel" aria-labelledby="assignment-tab-day9" style={{ display: 'grid', gap: '12px' }}>
          <h4 style={{ margin: 0, fontSize: '16px' }}>Day 9 - KNN Algorithm</h4>
          <QA
            label="Concept"
            question="What is the K-Nearest Neighbors algorithm?"
            answer="K-Nearest Neighbors is a supervised machine-learning algorithm used for classification and regression. For a new passenger, it finds the most similar passengers in the training data and predicts the result from those nearest neighbors."
          />
          <QA
            label="Lazy Learning"
            question="Why is KNN called a lazy learner?"
            answer="KNN is called lazy because it does not build a fixed model during training. It stores the training examples and waits until prediction time. When a new case appears, it calculates distances to known examples and decides from the nearest ones."
          />
          <QA
            label="Comparison"
            question="How is KNN different from Logistic Regression?"
            answer="Logistic Regression is an eager, parametric model because it learns coefficients before prediction and then predicts quickly. KNN is lazy and non-parametric because it keeps the data and searches neighbors during prediction. KNN is flexible, but it can be slower and needs more memory."
          />
          <QA
            label="Distance Metrics"
            question="Why do distance metrics and scaling matter in KNN?"
            answer="KNN depends on distance, so the way distance is measured directly affects the prediction. Euclidean distance works well for continuous scaled features, Manhattan distance adds absolute differences, and Minkowski generalizes both. Scaling is important because a large-range feature such as Fare can dominate Age if the values are not normalized."
          />
          <QA
            label="K Value"
            question="How should we choose the value of K?"
            answer="Small K values such as 1 or 3 can be sensitive to noise and may overfit. Large K values create smoother decisions but may hide local patterns. In the Colab CLI run on the Titanic data, K=3 gave accuracy 0.804, while K=5 and K=7 both gave 0.816. So for this small comparison, K=5 or K=7 worked better than K=3."
            code={`for k in (3, 5, 7):
    model = KNeighborsClassifier(n_neighbors=k)
    model.fit(X_train, y_train)
# K=3: 0.804, K=5: 0.816, K=7: 0.816`}
          />
          <QA
            label="KNN vs K-Means"
            question="How is KNN different from K-Means?"
            answer="KNN is supervised because it uses labeled examples to predict a class or value for a new point. K-Means is unsupervised because it does not use labels; it groups similar rows into clusters. Both use distance, but they solve different problems."
          />
          <NotebookButton filename="01_Titanic_Model_Comparison_Project.ipynb">
            Run Model Comparison Notebook in Colab
          </NotebookButton>
        </section>
      )}

      {activeTab === 'day11' && (
        <section id="assignment-panel-day11" role="tabpanel" aria-labelledby="assignment-tab-day11" style={{ display: 'grid', gap: '12px' }}>
          <h4 style={{ margin: 0, fontSize: '16px' }}>Day 11 - Unsupervised Learning</h4>
          <QA
            label="Exercise 3"
            question="Titanic Learning Lab: Supervised vs Unsupervised. Goal: Compare Logistic Regression (Supervised) vs K-Means (Unsupervised)"
            answer="Logistic Regression is supervised because it uses the known Survived column to learn a prediction. K-Means is unsupervised because it does not use the survival label. It groups passengers by similarity using Age, Fare, and Pclass. The supervised part is checked with accuracy and classification results, while the unsupervised part is checked with cluster centers and the cluster plot."
          />
          <NotebookButton filename="Jupytor Notebook exercise.ipynb">
            Run Supervised vs Unsupervised Notebook in Colab
          </NotebookButton>
        </section>
      )}

      {activeTab === 'day10' && (
        <section id="assignment-panel-day10" role="tabpanel" aria-labelledby="assignment-tab-day10" style={{ display: 'grid', gap: '12px' }}>
          <h4 style={{ margin: 0, fontSize: '16px' }}>Day 10 - Decision Trees & Random Forest</h4>
          <QA
            label="Splitting Criteria"
            question="How do Entropy and Gini Impurity differ as splitting criteria in Decision Trees?"
            answer="Entropy measures the overall disorder or randomness in the dataset. If a group of passengers is perfectly split between survivors and non-survivors, entropy is 1.0; if everyone in a group survives, it is 0.0. Gini Impurity measures the likelihood of misclassifying a passenger if randomly labeled according to the class distribution. Gini is computationally faster because it avoids logarithmic operations (Gini = 1 - sum(p_i^2)), whereas Entropy uses log2 (Entropy = -sum(p_i * log2(p_i))). Both aim to increase the purity of nodes with each split."
          />
          <QA
            label="Model Comparison"
            question="What is the core difference between a single Decision Tree and a Random Forest?"
            answer="A Decision Tree is a single model that splits data step-by-step using if-else rules. While intuitive and easy to trace, it is highly prone to overfitting because it can grow too deep and memorize noise. A Random Forest is an ensemble of many independent decision trees trained using bootstrap aggregation (bagging) and random feature selection. Each tree is trained on a different subset of passengers and features, making them uncorrelated. The forest combines their individual predictions through a majority vote, which cancels out errors and stabilizes predictions, significantly reducing overfitting. As the slide says: 'A Decision Tree is one expert; a Random Forest is a panel of experts voting together.'"
            code={`from sklearn.tree import DecisionTreeClassifier
# ID3-like (criterion='entropy')
id3_tree = DecisionTreeClassifier(criterion='entropy', max_depth=4)
id3_tree.fit(X, y)
# CART-like (criterion='gini')
cart_tree = DecisionTreeClassifier(criterion='gini', max_depth=4)
cart_tree.fit(X, y)`}
          />
          <QA
            label="Data Cleansing"
            question="How can Decision Trees be used for data cleansing?"
            answer="Decision Trees can help find anomalies and prepare data in three main ways. First, they can detect outliers: if a split isolates a tiny number of passengers (like a single passenger with a fare of $512), it flags an outlier. Second, they can handle missing values through surrogate splits, where alternative features are used when the primary feature is missing. Third, they identify feature importance, showing us that variables like Sex, Age, and Pclass are key features, which helps us focus our cleaning efforts where it matters most."
          />
          <QA
            label="Worksheet"
            question="From the Day 10 class worksheet, what dirty data issues were identified and what cleansing actions were recommended?"
            answer="The worksheet presented a table with passenger records containing three key issues: missing values (e.g., Age is missing for Passenger 1, Fare is missing for Passenger 4), inconsistent labels (Sex recorded as 'male', 'Female', and 'M'), and outliers (Passenger 1 with a Fare of $512). The recommended tree-based cleansing actions are to standardize the Sex category labels into consistent strings ('male' or 'female'), impute the missing ages based on class/gender splits (imputing median values), and flag/cap extreme Fare outliers (> $300) to keep the decision boundary from getting distorted."
          />
          <QA
            label="Reflection"
            question="If one tree makes a mistake, how does the forest correct it?"
            answer="Since a Random Forest is trained on bootstrapped samples with random feature selections, each tree has a slightly different view of the data. If one tree makes a mistake due to noise or outliers, the other trees (which were trained on different data subsets) are unlikely to make the same mistake. When we aggregate the predictions through a majority vote, the random errors of individual trees cancel out, and the collective decision of the forest remains correct. This mimics how group collaboration corrects individual biases."
          />
          <NotebookButton filename="01_Titanic_Model_Comparison_Project.ipynb">
            Run Model Comparison Notebook in Colab
          </NotebookButton>
        </section>
      )}

      {activeTab === 'day12' && (
        <section id="assignment-panel-day12" role="tabpanel" aria-labelledby="assignment-tab-day12" style={{ display: 'grid', gap: '12px' }}>
          <h4 style={{ margin: 0, fontSize: '16px' }}>Day 12 - Neural Networks</h4>
          <QA
            label="Concept"
            question="What is a Perceptron and how does it act as a decision-maker?"
            answer="A Perceptron is the simplest form of an artificial neural network, invented by Frank Rosenblatt in 1957. It takes a set of input features (like a passenger's age, class, and fare), multiplies each input by a learned weight showing its importance, adds a bias parameter to shift the decision boundary, and passes the sum through an activation function (like a step function). If the weighted sum exceeds a threshold, the neuron fires (outputting 1 for Survived); otherwise, it outputs 0. It is a linear binary classifier, meaning it draws a straight decision boundary (a line in 2D or a hyperplane in higher dimensions) to split the classes."
            code={`class Perceptron:
    def __init__(self, lr=0.1, epochs=20):
        self.lr = lr
        self.epochs = epochs
    def fit(self, X, y):
        self.weights = np.zeros(X.shape[1])
        self.bias = 0
        for _ in range(self.epochs):
            for xi, target in zip(X, y):
                y_pred = self.predict(xi)
                update = self.lr * (target - y_pred)
                self.weights += update * xi
                self.bias += update
    def predict(self, X):
        linear_output = np.dot(X, self.weights) + self.bias
        return np.where(linear_output >= 0, 1, 0)`}
          />
          <QA
            label="Comparison"
            question="What are the key differences between a Perceptron and a Deep Neural Network?"
            answer="A Perceptron is a single-layer structure with no hidden layers, meaning it can only learn linear decision boundaries and fails when data is non-linearly separable (like the XOR problem). A Deep Neural Network contains multiple hidden layers stacked between the input and output. These hidden layers use non-linear activation functions (like ReLU, Sigmoid, or Tanh) which allow the network to learn highly complex, curved, and irregular decision boundaries. In the Titanic, a single perceptron might only learn simple rules like 'females survive,' whereas a Deep Neural Network can capture complex interactions, such as 'young females in first class have high survival rates, while older males in third class have low survival rates.'"
          />
          <QA
            label="Gradient Descent"
            question="How do Gradient Descent and Backpropagation work together to train a neural network?"
            answer="Gradient Descent and Backpropagation are the engines of learning in neural networks. Initially, the network has random weights and makes poor predictions, producing a high loss (error). Backpropagation starts from the output layer and calculates the gradient (slope) of the loss function with respect to each weight, moving backward through the hidden layers to figure out how much each weight contributed to the error. Gradient Descent then updates each weight in the opposite direction of the gradient by a small step (controlled by the learning rate) to minimize the error. Repeating this process over many epochs slowly adjusts the weights so the network learns the correct patterns."
          />
          <QA
            label="Titanic Connection"
            question="Identify five features used to predict survival in the Titanic dataset and explain how the model improves its predictions."
            answer="Five common features are Age, Sex, Pclass, Fare, and Family Size. In the Titanic dataset, the network starts with random weights, resulting in many misclassifications and a high error loss. During training, backpropagation calculates how much each feature weight contributed to the prediction error, and gradient descent updates the weights (e.g., giving positive weights to features like 'female' and 'first class' and negative weights to 'third class' or 'older age'). Over many epochs, the loss decreases and the network learns complex survival patterns, such as the interaction of class and gender, to refine its final predictions."
          />
          <QA
            label="Reflection"
            question="What does the statement 'From simple neurons to deep insights — AI is teaching machines to think' mean to you?"
            answer="This statement means that AI has moved beyond hard-coded rules and simple linear boundaries. By connecting simple math units (neurons) in deep, stacked layers, a machine can learn to represent abstract concepts, recognize complex patterns, and make predictions under uncertainty. The machine learns from experience by adjusting its weights based on feedback (errors), similar to how human learning is guided by trial and error. It bridges raw numbers (like passenger records) with deep, structured reasoning, enabling us to turn historical data into foresight."
          />
        </section>
      )}

      {activeTab === 'day13' && (
        <section id="assignment-panel-day13" role="tabpanel" aria-labelledby="assignment-tab-day13" style={{ display: 'grid', gap: '12px' }}>
          <h4 style={{ margin: 0, fontSize: '16px' }}>Day 13 - Model Evaluation</h4>
          <QA
            label="Concept"
            question="Define Accuracy, Precision, Recall, and F1-score for Titanic survival classification."
            answer="Accuracy measures overall correctness: the proportion of correct predictions (both survivors and non-survivors) out of the total passengers. Precision measures the quality of positive predictions: of all passengers the model predicted would survive, how many actually survived (minimizing false positives/false alarms). Recall (Sensitivity) measures detection ability: of all passengers who actually survived, how many did the model correctly catch (minimizing false negatives/missed survivors). F1-score is the harmonic mean of Precision and Recall, providing a balanced metric when the dataset is imbalanced (such as having far more non-survivors than survivors)."
          />
          <QA
            label="Rescue Trade-Off"
            question="If you were designing a rescue-prediction system, would you prefer high precision or high recall?"
            answer="For a rescue-prediction system, high recall is highly preferred. High recall ensures that we identify as many actual survivors as possible, minimizing false negatives (missing survivors). In a life-or-death situation, the cost of a false negative (leaving someone behind because we predicted they wouldn't survive or didn't need rescue) is extremely high, whereas the cost of a false positive (sending a rescue team to someone who is already safe) is merely resources. Therefore, we want to maximize our sensitivity to detecting survivors, even if it results in some false alarms."
          />
          <QA
            label="Confusion Matrix Example"
            question="Given a confusion matrix (TP=80, FN=40, FP=20, TN=160), calculate the metrics and explain why accuracy alone is insufficient."
            answer="From the confusion matrix: Accuracy = (TP + TN) / Total = (80 + 160) / 300 = 80.0%. Precision = TP / (TP + FP) = 80 / (80 + 20) = 80.0%. Recall = TP / (TP + FN) = 80 / (80 + 40) = 66.7%. F1-Score = 2 * (Precision * Recall) / (Precision + Recall) = 72.7%. Accuracy alone is insufficient because it treats all correct predictions equally. If the dataset has a class imbalance (e.g., 60% of passengers died), a baseline model predicting 'everyone died' would get 60% accuracy, but would fail to identify a single survivor. The confusion matrix breaks this down and shows that while overall correctness is 80%, the recall of 66.7% indicates that we missed 1/3 of the survivors (40 out of 120)."
            code={`y_true = [1]*120 + [0]*180
y_pred = [1]*80 + [0]*40 + [1]*20 + [0]*160
# Accuracy: 0.800, Precision: 0.800, Recall: 0.667, F1-Score: 0.727`}
          />
        </section>
      )}
    </div>
  );
}
