import React, { useState, useEffect } from 'react';

export default function ModelComparisonGuide() {
  const [comparisons, setComparisons] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}assets/data/model_comparison.json`)
      .then((res) => {
        if (!res.ok) throw new Error('Could not load comparison metrics.');
        return res.json();
      })
      .then((data) => setComparisons(data))
      .catch((err) => setError(err.message));
  }, []);

  const modelsInfo = [
    { name: "Gender Baseline", type: "Heuristic Baseline", notebook: "00_Titanic_Kaggle_Main_Workflow", desc: "A simple benchmark predicting all females survived and all males died. Easy to construct but ignores socio-economic context." },
    { name: "Logistic Regression", type: "Classical Linear Classifier", notebook: "00_Titanic_Kaggle_Main_Workflow", desc: "Linear model calculating probabilities based on weights. Offers extreme interpretability through odds ratios coefficients." },
    { name: "Decision Tree", type: "Non-Linear Tree Classifier", notebook: "00_Titanic_Kaggle_Main_Workflow", desc: "Maps decisions in a tree structure. Captures non-linear feature interactions but is highly prone to overfitting." },
    { name: "Random Forest", type: "Ensemble bagging classifier", notebook: "00_Titanic_Kaggle_Main_Workflow", desc: "A collection of randomized decision trees voting on predictions. Stabilizes variance and handles missing data well." },
    { name: "Gradient Boosting", type: "Ensemble boosting classifier", notebook: "00_Titanic_Kaggle_Main_Workflow", desc: "Sequential trees fitting on prediction residuals. High predictive power but harder to tune." },
    { name: "TF-DF Gradient Boosted Trees", type: "TensorFlow Decision Forests Model", notebook: "01_Titanic_TFDF_Advanced_Model", desc: "Advanced GBT model utilizing tf.strings tokenization and Colab-only TF-DF modules." },
    { name: "Ensemble", type: "Aggregated voting model", notebook: "01_Titanic_TFDF_Advanced_Model", desc: "Combines multiple model seeds and estimators to maximize generalized competition performance." }
  ];

  return (
    <div className="tab-panel-container">
      <div className="section-header-box">
        <h2>Model Directory & Evaluation</h2>
        <p>This table compares models evaluated against the Kaggle validation fold. Training runs only inside Colab.</p>
      </div>

      <div className="comparison-table-wrap">
        {error ? (
          <div className="alert-message-box danger">
            <i className="fa-solid fa-triangle-exclamation"></i>
            <span>Warning: Using static baseline comparison parameters. Live JSON load failed.</span>
          </div>
        ) : null}

        <table className="comparison-table">
          <thead>
            <tr>
              <th>Model Name</th>
              <th>Accuracy</th>
              <th>Precision</th>
              <th>Recall</th>
              <th>F1 Score</th>
              <th>ROC-AUC</th>
              <th>Notes / Cross-Validation</th>
            </tr>
          </thead>
          <tbody>
            {comparisons.length > 0 ? (
              comparisons.map((item, idx) => (
                <tr key={idx}>
                  <td><strong>{item.Model || item.model}</strong></td>
                  <td>{(item.Accuracy || item.accuracy || 0).toFixed(4)}</td>
                  <td>{(item.Precision || item.precision || 0).toFixed(4)}</td>
                  <td>{(item.Recall || item.recall || 0).toFixed(4)}</td>
                  <td>{(item.F1 || item.f1 || 0).toFixed(4)}</td>
                  <td>{(item["ROC-AUC"] || item.roc_auc || 0).toFixed(4)}</td>
                  <td className="notes-col">{item.Notes || item.notes}</td>
                </tr>
              ))
            ) : (
              // Fallback default static data in case JSON isn't loaded yet
              <>
                <tr>
                  <td><strong>Gender Baseline</strong></td>
                  <td>0.7821</td>
                  <td>0.7429</td>
                  <td>0.6842</td>
                  <td>0.7123</td>
                  <td>0.7331</td>
                  <td className="notes-col">Baseline predicting all females survive and all males die.</td>
                </tr>
                <tr>
                  <td><strong>Logistic Regression</strong></td>
                  <td>0.8156</td>
                  <td>0.7812</td>
                  <td>0.7143</td>
                  <td>0.7463</td>
                  <td>0.8654</td>
                  <td className="notes-col">Interpretated using log-odds ratios weights.</td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      <div className="models-info-sections">
        <h3>Model Directory & Context</h3>
        <div className="models-info-grid">
          {modelsInfo.map((info, idx) => (
            <div key={idx} className="model-info-card">
              <div className="info-card-header">
                <strong>{info.name}</strong>
                <span className="badge badge-info">{info.type}</span>
              </div>
              <p>{info.desc}</p>
              <div className="info-card-notebook">
                <i className="fa-solid fa-circle-notch"></i> Notebook: <code>{info.notebook}.ipynb</code>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
