import React from 'react';

export default function KaggleGuide() {
  return (
    <div className="tab-panel-container">
      <div className="section-header-box">
        <h2>Kaggle Dataset Hub</h2>
        <p>The Kaggle Titanic dataset is the primary and default dataset of this project.</p>
      </div>

      <div className="info-grid">
        <div className="info-card">
          <div className="card-icon"><i className="fa-solid fa-database"></i></div>
          <h3>train.csv</h3>
          <p className="card-sub">891 rows | 12 columns</p>
          <p className="card-desc">
            Contains ground truth labels (<code>Survived</code> column). Used for exploratory analysis, feature engineering, and model validation (train-test split / cross-validation).
          </p>
        </div>

        <div className="info-card">
          <div className="card-icon"><i className="fa-solid fa-eye-slash"></i></div>
          <h3>test.csv</h3>
          <p className="card-sub">418 rows | 11 columns</p>
          <p className="card-desc">
            Contains passenger profiles but <strong>no survival labels</strong>. Used strictly to generate predictions for final Kaggle submissions. Never used in validation.
          </p>
        </div>

        <div className="info-card">
          <div className="card-icon"><i className="fa-solid fa-square-check"></i></div>
          <h3>gender_submission.csv</h3>
          <p className="card-sub">418 rows | 2 columns</p>
          <p className="card-desc">
            A baseline benchmark submission assuming all female passengers survived and all male passengers died. Do not treat this as actual ground-truth.
          </p>
        </div>
      </div>

      <div className="rule-alert-box">
        <div className="alert-title">
          <i className="fa-solid fa-circle-info"></i> Important Workflow Rules
        </div>
        <ul>
          <li><strong>Zero Test Leakage:</strong> Do not measure training accuracy or validation scores using test.csv.</li>
          <li><strong>Separate OpenML Reference:</strong> OpenML reference data contains 1,309 rows and should remain separate. Do not combine it with Kaggle files.</li>
          <li><strong>Post-Disaster Warning:</strong> Exclude features like <code>boat</code> and <code>body</code> as they cause data leakage.</li>
        </ul>
      </div>

      <div className="data-audit-box">
        <h3><i className="fa-solid fa-list-check"></i> Dataset Ingestion Audit</h3>
        <table className="audit-table">
          <thead>
            <tr>
              <th>Dataset File</th>
              <th>Verified Columns</th>
              <th>Duplicate Rows</th>
              <th>Audit Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>train.csv</strong></td>
              <td>PassengerId, Survived, Pclass, Name, Sex, Age, SibSp, Parch, Ticket, Fare, Cabin, Embarked</td>
              <td>0</td>
              <td><span className="badge badge-success">Passed</span></td>
            </tr>
            <tr>
              <td><strong>test.csv</strong></td>
              <td>PassengerId, Pclass, Name, Sex, Age, SibSp, Parch, Ticket, Fare, Cabin, Embarked (No Survived)</td>
              <td>0</td>
              <td><span className="badge badge-success">Passed</span></td>
            </tr>
            <tr>
              <td><strong>gender_submission.csv</strong></td>
              <td>PassengerId, Survived</td>
              <td>0</td>
              <td><span className="badge badge-success">Passed</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
