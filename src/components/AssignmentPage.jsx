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
  { id: 'day7', label: 'Day 7' },
  { id: 'day8', label: 'Day 8' },
  { id: 'day11', label: 'Day 11' },
];

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
      <div style={{ padding: '16px', backgroundColor: '#f0fdf4', borderLeft: '4px solid var(--color-success)', borderRadius: '6px', marginBottom: '22px' }}>
        <div style={{ fontWeight: 800, color: '#166534', marginBottom: '4px', fontSize: '15px' }}>
          Classroom Assignment Page
        </div>
        <div style={{ fontSize: '13px', color: '#166534', lineHeight: 1.5 }}>
          Content is based only on the study material files currently present in <code>study materials/</code>: Day 1, Day 3, Day 4, Linear Regression, Logistic Regression, and the Jupyter supervised/unsupervised exercise. Session timing: 04:00 pm to 06:00 pm.
        </div>
      </div>

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
            {schedule.map(([day, topic, date]) => (
              <tr key={day} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '9px 10px', fontWeight: 700 }}>{day}</td>
                <td style={{ padding: '9px 10px' }}>{topic}</td>
                <td style={{ padding: '9px 10px' }}>{date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <label htmlFor="assignment-source-note" style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px' }}>
        Available study material tabs
      </label>
      <input id="assignment-source-note" type="checkbox" checked readOnly style={{ marginRight: '6px' }} />
      <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>Only days with uploaded study material are shown below.</span>

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

      {activeTab === 'day7' && (
        <section id="assignment-panel-day7" role="tabpanel" aria-labelledby="assignment-tab-day7" style={{ display: 'grid', gap: '12px' }}>
          <h4 style={{ margin: 0, fontSize: '16px' }}>Day 7 - Linear Regression</h4>
          <QA
            label="Exercise 1"
            question="# Linear Regression on Titanic Dataset Python Program code. Goal: Predict passenger fare based on age, class, and family size"
            answer="For this exercise, the target value is Fare, so Linear Regression is the correct model because it predicts a continuous number. The input features are Age, Pclass, and SibSp. Missing values are filled with the mean so the model can train without blank cells. After splitting the data into training and testing parts, the model learns how these passenger details relate to ticket fare. The final checks, Mean Squared Error and R2 Score, tell us how close the fare predictions are to the real fares. The new passenger example is used to show how the trained model can estimate fare for one passenger using age, class, and family-size information."
          />
          <QA
            label="Answer Format"
            question="What should be written as the answer for Exercise 1?"
            answer="I would write that Linear Regression is used here because Fare is a numeric output. Age, passenger class, and number of siblings/spouses are used as input features. The dataset is cleaned by filling missing values, then it is split into train and test sets. After training, the model is evaluated using Mean Squared Error and R2 Score. This helped me understand that regression is useful when the goal is to predict a quantity, not a category."
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
            answer="This exercise uses Logistic Regression because the target is Survived, which is a classification output with two possible classes: No or Yes. The selected features are Age, Pclass, and Sex. Age is filled using the mean, and Sex is converted into numbers so the model can use it. After training, the model predicts survival labels for the test data. Accuracy, confusion matrix, and classification report help explain how well the model separates passengers who survived from passengers who did not."
          />
          <QA
            label="Answer Format"
            question="How does classification differ from regression in this Titanic example?"
            answer="Regression predicts a continuous value such as Fare, while classification predicts a category such as Survived or Not Survived. In the Logistic Regression exercise, the model does not estimate a ticket price. It learns from passenger features and gives a class decision for survival. That is why the evaluation uses accuracy, confusion matrix, precision, recall, and classification report instead of only regression error."
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
            answer="This exercise compares two learning styles on the same Titanic dataset. Logistic Regression is supervised because it trains with the known Survived column and learns to predict that target. K-Means is unsupervised because it does not use the survival label. Instead, it groups passengers into clusters using Age, Fare, and Pclass. The supervised part is evaluated with accuracy and classification results, while the unsupervised part is understood by checking cluster centers and visualizing passenger groups."
          />
          <QA
            label="Answer Format"
            question="What is the main difference between Supervised Learning and Unsupervised Learning in this exercise?"
            answer="Supervised Learning uses a known answer during training. In this notebook, Logistic Regression uses Survived as the target and learns to predict survival. Unsupervised Learning does not use a target answer. K-Means only studies passenger features and forms natural groups based on similarity. So supervised learning is used for prediction, while unsupervised learning is used for pattern discovery."
          />
          <NotebookButton filename="Jupytor Notebook exercise.ipynb">
            Run Supervised vs Unsupervised Notebook in Colab
          </NotebookButton>
        </section>
      )}
    </div>
  );
}
