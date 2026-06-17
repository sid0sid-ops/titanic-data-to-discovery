import { useState } from 'react';
import { links } from './data/projectContent.js';
import PillDatasetTabs from './components/PillDatasetTabs.jsx';
import KaggleGuide from './components/KaggleGuide.jsx';
import VisualizationStory from './components/VisualizationStory.jsx';
import ChartMeaningCard from './components/ChartMeaningCard.jsx';
import CodeMeaningCard from './components/CodeMeaningCard.jsx';
import ColabWorkflowGuide from './components/ColabWorkflowGuide.jsx';
import ModelComparisonGuide from './components/ModelComparisonGuide.jsx';
import OpenMLReferenceGuide from './components/OpenMLReferenceGuide.jsx';

export default function App() {
  const [activeTab, setActiveTab] = useState('kaggle');

  return (
    <div>
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-logo">
            <span>Titanic Data Science Companion</span>
          </div>
          <div className="navbar-actions">
            <a href={links.colab} target="_blank" rel="noreferrer" className="btn btn-primary">
              <i className="fa-solid fa-play"></i>
              <span>Run in Google Colab</span>
            </a>
            <a href={links.github} target="_blank" rel="noreferrer" className="btn btn-secondary">
              <i className="fa-brands fa-github"></i>
              <span>View GitHub</span>
            </a>
          </div>
        </div>
      </nav>

      {/* Main Layout Container */}
      <div className="layout-container" style={{ display: 'block' }}>
        {/* Top Header Section */}
        <section className="hero" style={{ padding: '24px 0', borderBottom: '1px solid var(--border-color)', marginBottom: '30px' }}>
          <span className="hero-tag">Google Colab & Static Visualization Companion</span>
          <h1>Titanic Exploration & Predictive Modeling</h1>
          <p className="hero-description" style={{ maxWidth: '800px', fontSize: '15.5px', marginTop: '8px' }}>
            This web companion serves as a guide to our Google Colab workflows. All predictive modeling, Decision Forests (TF-DF) training, cross-validation, and analysis happen inside our Colab notebooks.
          </p>
        </section>

        {/* Top Pill Tabs */}
        <PillDatasetTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Central Dashboard Tab Panel Panels */}
        <main className="main-content-tab" style={{ marginTop: '20px' }}>
          {activeTab === 'kaggle' && <KaggleGuide />}
          
          {activeTab === 'story' && <VisualizationStory />}
          
          {activeTab === 'charts' && (
            <div className="tab-panel-container">
              <ChartMeaningCard />
              <div style={{ marginTop: '40px' }}>
                <div className="section-header-box">
                  <h2>Python Code Snippets</h2>
                  <p>Check out the key code blocks used in the Kaggle & OpenML notebooks.</p>
                </div>
                <CodeMeaningCard />
              </div>
            </div>
          )}
          
          {activeTab === 'colab' && <ColabWorkflowGuide />}
          
          {activeTab === 'models' && <ModelComparisonGuide />}
          
          {activeTab === 'openml' && <OpenMLReferenceGuide />}
          
          {activeTab === 'submission' && (
            <div className="tab-panel-container">
              <div className="section-header-box">
                <h2>Kaggle Submission Centre</h2>
                <p>Learn how final predictions are exported and structured for upload to Kaggle.</p>
              </div>

              <div className="info-grid">
                <div className="info-card">
                  <div className="card-icon"><i className="fa-solid fa-file-csv"></i></div>
                  <h3>Format Requirements</h3>
                  <p className="card-sub">CSV Structure</p>
                  <p className="card-desc">
                    The submission file must contain exactly 418 rows (corresponding to passenger IDs in <code>test.csv</code>) and exactly two columns:
                    <ul style={{ paddingLeft: '20px', marginTop: '8px', fontSize: '13px' }}>
                      <li><code>PassengerId</code>: Unique identifier for each test passenger.</li>
                      <li><code>Survived</code>: Binary classification label (0 = Deceased, 1 = Survived).</li>
                    </ul>
                  </p>
                </div>

                <div className="info-card">
                  <div className="card-icon"><i className="fa-solid fa-file-circle-check"></i></div>
                  <h3>submission_best_classical.csv</h3>
                  <p className="card-sub">Main Classical Model</p>
                  <p className="card-desc">
                    Generated from the best classical estimator (typically Logistic Regression or Random Forest) in the main workflow notebook. Uses clean, stratified cross-validation.
                  </p>
                </div>

                <div className="info-card">
                  <div className="card-icon"><i className="fa-solid fa-square-plus"></i></div>
                  <h3>submission_tfdf_tuned.csv</h3>
                  <p className="card-sub">Advanced Decision Forests</p>
                  <p className="card-desc">
                    Generated using TensorFlow Decision Forests (TF-DF) inside the advanced notebook. Employs name tokenization, ticket splitting, and RandomSearch hyperparameter tuning.
                  </p>
                </div>
              </div>

              <div className="rule-alert-box info">
                <div className="alert-title">
                  <i className="fa-solid fa-circle-info"></i> OpenML Exclusivity Rule
                </div>
                <p>
                  <strong>OpenML does not generate Kaggle submissions.</strong> The OpenML dataset is a single combined historical dataset used for reference and learning. It does not map to the hidden test labels used in the Kaggle competition.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* App Footer */}
      <footer className="app-footer" style={{ marginTop: '60px', padding: '30px 24px', borderTop: '1px solid var(--border-color)', backgroundColor: '#ffffff' }}>
        <div className="footer-container" style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div className="footer-links" style={{ display: 'flex', gap: '20px', fontSize: '14px' }}>
            <a href={links.colab} target="_blank" rel="noreferrer"><i className="fa-solid fa-play"></i> Google Colab</a>
            <a href={links.github} target="_blank" rel="noreferrer"><i className="fa-brands fa-github"></i> GitHub</a>
            <a href={links.notebook} target="_blank" rel="noreferrer"><i className="fa-solid fa-code"></i> IPYNB Source</a>
          </div>
          <p className="footer-text" style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            From Data to Discovery — Titanic ML Companion • Built with React & Vite
          </p>
        </div>
      </footer>
    </div>
  );
}
