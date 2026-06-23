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
  { id: 'day1', label: 'Day 1' },
  { id: 'day3', label: 'Day 3' },
  { id: 'day4', label: 'Day 4' },
  { id: 'day6', label: 'Day 6' },
  { id: 'day7', label: 'Day 7' },
  { id: 'day8', label: 'Day 8' },
  { id: 'day11', label: 'Day 11' },
];

const tabIdsByDay = Object.fromEntries(tabs.map((tab) => [tab.label, tab.id]));

const qaStyle = {
  padding: '14px 16px',
  border: '1px solid var(--border-color)',
  borderRadius: '8px',
  backgroundColor: '#ffffff',
};

function QA({ label, question, answer }) {
  return (
    <div style={qaStyle}>
      <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '6px' }}>{label}</div>
      <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>{question}</div>
      <div style={{ fontSize: '13.5px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>{answer}</div>
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

      <div role="tablist" aria-label="Assignment days" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '18px 0' }}>
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

      {activeTab === 'day1' && (
        <section id="assignment-panel-day1" role="tabpanel" aria-labelledby="assignment-tab-day1" style={{ display: 'grid', gap: '12px' }}>
          <h4 style={{ margin: 0, fontSize: '16px' }}>Day 1 - Introduction to AI & ML</h4>
          <QA
            label="Study Material Note"
            question="What assignment questions were present in the uploaded Day 1 material?"
            answer="Day 1 introduced Python for data science, common libraries, and the Titanic case-study workflow. The material focused on how data is collected, cleaned, explored, modeled, and communicated."
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
            answer="Before testing, the visualizations suggested that women had a higher survival rate than men. Hypothesis testing gave a statistical check for that assumption. Since the p-value was below 0.05, I could say the difference was statistically significant in this dataset. It did not prove the full historical cause, but it showed that the observed gender difference was too strong to treat as random noise."
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
            answer="Fare is the target, so Linear Regression is used because it predicts a continuous value. Age, Pclass, and SibSp are the input features. Missing values are filled with the mean, then the data is split into training and testing sets. The model is trained on the training data and evaluated with Mean Squared Error and R2 Score."
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
            answer="Survived is the target, so Logistic Regression is used because it predicts a category with two classes: No or Yes. Age, Pclass, and Sex are the input features. Age is filled with the mean and Sex is converted to numbers. The model is trained on the training data and evaluated with accuracy, confusion matrix, and classification report."
          />
          <NotebookButton filename="Python demo snippet for Logistic Regression on the Titanic dataset.ipynb">
            Run Logistic Regression Notebook in Colab
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
    </div>
  );
}
