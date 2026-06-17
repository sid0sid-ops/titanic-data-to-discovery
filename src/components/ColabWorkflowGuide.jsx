import React from 'react';
import { notebookGuide } from '../data/notebookGuide.js';

export default function ColabWorkflowGuide() {
  return (
    <div className="tab-panel-container">
      <div className="section-header-box">
        <h2>Jupyter & Colab Notebook Guides</h2>
        <p>The core execution environment. Real models are trained and validated inside these interactive notebooks.</p>
      </div>

      <div className="alert-message-box info">
        <i className="fa-solid fa-laptop-code"></i>
        <span>
          <strong>Website Role:</strong> This webpage acts strictly as an educational companion, showcase, and guide. No training or heavy libraries (TensorFlow) are run here. Real model builds, hyperparameter searches, and predictions are run inside Colab.
        </span>
      </div>

      <div className="notebook-grid">
        {notebookGuide.map((nb, idx) => (
          <div key={idx} className="notebook-card">
            <div className="notebook-card-header">
              <i className="fa-solid fa-file-code notebook-icon"></i>
              <h3>{nb.title}</h3>
            </div>
            <div className="notebook-meta">
              <span><strong>Dataset:</strong> {nb.dataset}</span>
              <span><strong>Key Output:</strong> <code>{nb.keyOutput}</code></span>
            </div>
            <p className="notebook-desc">{nb.purpose}</p>
            <div className="notebook-actions">
              <a
                href={nb.colabUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary"
              >
                <i className="fa-solid fa-play"></i> Open in Google Colab
              </a>
              <a
                href={`${import.meta.env.BASE_URL}notebooks/${nb.id}`}
                download
                className="btn btn-secondary"
              >
                <i className="fa-solid fa-download"></i> Download IPYNB
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
