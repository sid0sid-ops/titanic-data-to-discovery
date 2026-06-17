import React, { useState, useEffect } from 'react';
import { openmlGuide } from '../data/openmlGuide.js';

export default function OpenMLReferenceGuide() {
  const [metrics, setMetrics] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}assets/data/openml_model_metrics.json`)
      .then((res) => {
        if (!res.ok) throw new Error('Could not load OpenML metrics.');
        return res.json();
      })
      .then((data) => setMetrics(data))
      .catch((err) => setError(err.message));
  }, []);

  const openmlPlots = [
    { id: 'openml_count', name: 'OpenML: Survival Count', file: 'openml_survival_count.png', desc: 'Survival counts for the larger unified 1309 passenger records.' },
    { id: 'openml_sex', name: 'OpenML: Gender Survival', file: 'openml_survival_by_sex.png', desc: 'Survival rates by passenger gender on OpenML.' },
    { id: 'openml_models', name: 'OpenML: Model Comparison', file: 'openml_model_comparison.png', desc: 'Validation accuracy across models trained solely on OpenML data.' }
  ];

  return (
    <div className="tab-panel-container">
      <div className="section-header-box">
        <h2>OpenML Reference Workflow</h2>
        <p>A separate reference workflow demonstrating differences on the unified OpenML Titanic dataset.</p>
      </div>

      <div className="rule-alert-box danger">
        <div className="alert-title">
          <i className="fa-solid fa-triangle-exclamation"></i> Warning: Zero-Mixing Rule
        </div>
        <p>{openmlGuide.warning}</p>
      </div>

      <div className="openml-intro-card">
        <p>{openmlGuide.description}</p>
      </div>

      <div className="comparison-table-wrap">
        <h3>Kaggle vs. OpenML Dataset Comparison</h3>
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Comparison Aspect</th>
              <th>Kaggle Dataset (Default)</th>
              <th>OpenML Dataset (Reference)</th>
            </tr>
          </thead>
          <tbody>
            {openmlGuide.differences.map((diff, idx) => (
              <tr key={idx}>
                <td><strong>{diff.aspect}</strong></td>
                <td>{diff.kaggle}</td>
                <td>{diff.openml}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="openml-plots-section">
        <h3>OpenML Generated Visualizations</h3>
        <div className="openml-plots-grid">
          {openmlPlots.map((plot, idx) => (
            <div key={idx} className="openml-plot-card">
              <h4>{plot.name}</h4>
              <div className="openml-plot-img-wrap">
                <img
                  src={`${import.meta.env.BASE_URL}assets/plots/${plot.file}`}
                  alt={plot.name}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="image-error-placeholder" style={{ display: 'none' }}>
                  <i className="fa-solid fa-image"></i>
                  <p>OpenML reference plot missing. Run generate_openml_reference.py script.</p>
                </div>
              </div>
              <p>{plot.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="openml-metrics-section">
        <h3>OpenML Model Performance Metrics</h3>
        {error ? (
          <p className="text-muted">Metrics JSON unavailable. Re-run OpenML generator script if needed.</p>
        ) : (
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Model</th>
                <th>Accuracy</th>
                <th>Precision</th>
                <th>Recall</th>
                <th>F1 Score</th>
                <th>ROC-AUC</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((item, idx) => (
                <tr key={idx}>
                  <td><strong>{item.model}</strong></td>
                  <td>{item.accuracy.toFixed(4)}</td>
                  <td>{item.precision.toFixed(4)}</td>
                  <td>{item.recall.toFixed(4)}</td>
                  <td>{item.f1.toFixed(4)}</td>
                  <td>{item.roc_auc.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
