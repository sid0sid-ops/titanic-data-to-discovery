import { useState, useEffect, useMemo, useRef } from 'react';
import { preparePassenger, predictPassenger, buildColabPassengerCode } from './utils/titanicPredictor.js';
import { links, validatedResult } from './data/projectContent.js';
import { kaggleSteps } from './data/kaggleSteps.js';
import { tfdfSteps } from './data/tfdfSteps.js';
import PillWorkflowTabs from './components/PillWorkflowTabs.jsx';

export default function App() {
  // Pill tab selection for Dataset: 'kaggle' | 'openml'
  const [activeWorkflow, setActiveWorkflow] = useState('kaggle');

  // Sub-tab selection inside Kaggle Dataset: 'main' | 'tfdf'
  const [activeKaggleSubTab, setActiveKaggleSubTab] = useState('main');

  // Active section for sidebar navigation tracking
  const [activeSection, setActiveSection] = useState('intro');

  // IntersectionObserver section tracking IDs based on active workflow/sub-workflow
  const sectionIds = useMemo(() => {
    if (activeWorkflow === 'kaggle') {
      if (activeKaggleSubTab === 'main') {
        return ['intro', 'loading', 'questions', 'interactive-eda', 'plots-gallery', 'feature-engineering', 'classical-models', 'evaluation', 'model-comparison', 'submission'];
      } else {
        return ['setup', 'features', 'datasets', 'training', 'tuning'];
      }
    } else {
      return ['intro', 'setup', 'loading', 'cleaning', 'missing', 'eda', 'engineering', 'imputation', 'split', 'pipeline', 'training', 'evaluation', 'diagram', 'odds', 'relevance', 'mindset', 'reflection', 'predictor'];
    }
  }, [activeWorkflow, activeKaggleSubTab]);

  // Sidebar list configurations
  const kaggleSidebarItems = [
    { id: 'intro', name: '1. Project Introduction', icon: 'fa-book-open' },
    { id: 'loading', name: '2. Dataset Loading & Audit', icon: 'fa-file-csv' },
    { id: 'questions', name: '3. Basic Titanic Questions', icon: 'fa-question' },
    { id: 'interactive-eda', name: '4. Interactive EDA', icon: 'fa-chart-pie' },
    { id: 'plots-gallery', name: '5. Static Plot Gallery', icon: 'fa-images' },
    { id: 'feature-engineering', name: '6. Feature Engineering', icon: 'fa-flask' },
    { id: 'classical-models', name: '7. Classical Model Training', icon: 'fa-gears' },
    { id: 'evaluation', name: '8. Model Evaluation', icon: 'fa-square-poll-vertical' },
    { id: 'model-comparison', name: '9. Model Comparison', icon: 'fa-table' },
    { id: 'submission', name: '10. Kaggle Submission', icon: 'fa-circle-check' },
  ];

  const tfdfSidebarItems = [
    { id: 'setup', name: '1. Setup & Installation', icon: 'fa-gears' },
    { id: 'features', name: '2. Advanced Preprocessing', icon: 'fa-flask' },
    { id: 'datasets', name: '3. Dataset Conversion', icon: 'fa-circle-nodes' },
    { id: 'training', name: '4. Model Training', icon: 'fa-tree' },
    { id: 'tuning', name: '5. Tuning & Submissions', icon: 'fa-circle-check' },
  ];

  const openmlSidebarItems = [
    { id: 'intro', name: 'Introduction', icon: 'fa-book-open' },
    { id: 'setup', name: '1. Setup & Environment', icon: 'fa-gears' },
    { id: 'loading', name: '2. Data Ingestion', icon: 'fa-file-csv' },
    { id: 'cleaning', name: '3. Cleaning & Leakage', icon: 'fa-broom' },
    { id: 'missing', name: '4. Missing Values', icon: 'fa-magnifying-glass-chart' },
    { id: 'eda', name: '5. Exploratory Analysis', icon: 'fa-chart-simple' },
    { id: 'engineering', name: '6. Feature Engineering', icon: 'fa-flask' },
    { id: 'imputation', name: '7. Custom Imputation', icon: 'fa-user-pen' },
    { id: 'split', name: '8. Train / Test Split', icon: 'fa-scissors' },
    { id: 'pipeline', name: '9. Preprocessing Pipeline', icon: 'fa-diagram-project' },
    { id: 'training', name: '10. GridSearchCV Search', icon: 'fa-gear' },
    { id: 'evaluation', name: '11. Evaluation & ROC', icon: 'fa-square-poll-vertical' },
    { id: 'diagram', name: '12. Pipeline Diagram', icon: 'fa-code-branch' },
    { id: 'odds', name: '13. Log-Odds Coefficients', icon: 'fa-scale-balanced' },
    { id: 'relevance', name: '14. Economic Relevance', icon: 'fa-handshake' },
    { id: 'mindset', name: '15. Data Science Mindset', icon: 'fa-brain' },
    { id: 'reflection', name: '16. Final Reflection', icon: 'fa-lightbulb' },
    { id: 'predictor', name: '17. Sandbox Predictor', icon: 'fa-circle-play' },
  ];

  const activeSidebarItems = useMemo(() => {
    if (activeWorkflow === 'kaggle') {
      return activeKaggleSubTab === 'main' ? kaggleSidebarItems : tfdfSidebarItems;
    }
    return openmlSidebarItems;
  }, [activeWorkflow, activeKaggleSubTab]);

  // Interactive Plot Viewer State for OpenML (Step 5)
  const [activePlotTab, setActivePlotTab] = useState('survival_count');
  // Interactive Plot Viewer State for Kaggle (Step 5)
  const [activeKagglePlot, setActiveKagglePlot] = useState('survival_count');

  // Refs and handlers to scroll EDA plots tabs horizontally
  const plotTabsRef = useRef(null);
  const kagglePlotTabsRef = useRef(null);

  const scrollPlotTabs = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = 160;
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Predictor Form Inputs (OpenML Sandbox)
  const [input, setInput] = useState({
    pclass: 3,
    sex: 'male',
    age: 25,
    sibsp: 0,
    parch: 0,
    fare: 7.25,
    embarked: 'S',
    title: 'Mr',
    has_cabin: false,
  });

  const [model, setModel] = useState(null);
  const [modelError, setModelError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Model comparisons loaded dynamically
  const [modelComparisons, setModelComparisons] = useState([]);
  const [compError, setCompError] = useState('');

  // Fetch model weights and metrics
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}assets/model/titanic_logistic_model.json`)
      .then((response) => {
        if (!response.ok) throw new Error('Model JSON could not be loaded.');
        return response.json();
      })
      .then((data) => setModel(data))
      .catch((err) => setModelError(err.message));

    fetch(`${import.meta.env.BASE_URL}assets/data/model_comparison.json`)
      .then((res) => {
        if (!res.ok) throw new Error('Could not load comparison metrics.');
        return res.json();
      })
      .then((data) => setModelComparisons(data))
      .catch((err) => setCompError(err.message));
  }, []);

  // Reset active section on tab change
  useEffect(() => {
    if (activeWorkflow === 'kaggle') {
      if (activeKaggleSubTab === 'main') {
        setActiveSection('intro');
      } else {
        setActiveSection('setup');
      }
    } else {
      setActiveSection('intro');
    }
    // Scroll page to top when changing workflow tabs
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeWorkflow, activeKaggleSubTab]);

  // IntersectionObserver scroll tracker
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -50% 0px',
      threshold: 0
    };

    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      sectionIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) observer.unobserve(el);
      });
    };
  }, [sectionIds]);

  // Compute dynamic links based on active workflow and sub-tab selection
  const activeLinks = useMemo(() => {
    if (activeWorkflow === 'kaggle') {
      if (activeKaggleSubTab === 'main') {
        return {
          github: 'https://github.com/sid0sid-ops/titanic-data-to-discovery/blob/main/notebooks/00_Titanic_Kaggle_Main_Workflow.ipynb',
          colab: 'https://colab.research.google.com/github/sid0sid-ops/titanic-data-to-discovery/blob/main/notebooks/00_Titanic_Kaggle_Main_Workflow.ipynb'
        };
      } else {
        return {
          github: 'https://github.com/sid0sid-ops/titanic-data-to-discovery/blob/main/notebooks/01_Titanic_TFDF_Advanced_Model.ipynb',
          colab: 'https://colab.research.google.com/github/sid0sid-ops/titanic-data-to-discovery/blob/main/notebooks/01_Titanic_TFDF_Advanced_Model.ipynb'
        };
      }
    } else {
      return {
        github: 'https://github.com/sid0sid-ops/titanic-data-to-discovery/blob/main/notebooks/02_Titanic_OpenML_Reference_Workflow.ipynb',
        colab: 'https://colab.research.google.com/github/sid0sid-ops/titanic-data-to-discovery/blob/main/notebooks/02_Titanic_OpenML_Reference_Workflow.ipynb'
      };
    }
  }, [activeWorkflow, activeKaggleSubTab]);

  // Compute live prediction in JS
  const liveResult = useMemo(() => {
    if (!model) return null;
    return predictPassenger(model, input);
  }, [model, input]);

  const updateForm = (field, value) => {
    setInput(prev => ({ ...prev, [field]: value }));
  };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const copyPythonCode = async () => {
    const code = buildColabPassengerCode(input);
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      triggerToast('Copied Colab Python script to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Scroll smoothly to section
  const handleScrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(id);
    }
  };

  // Plot tabs definition for OpenML
  const plotTabs = [
    { id: 'survival_count', name: 'Survival Distribution', file: 'assets/plots/survival_count.png', desc: 'Baseline count of survived (1) vs deceased (0) passengers.' },
    { id: 'survival_by_sex', name: 'Survival by Sex', file: 'assets/plots/survival_by_sex.png', desc: 'Shows the dramatic difference in survival outcomes between female and male passengers.' },
    { id: 'survival_by_class', name: 'Survival by Class', file: 'assets/plots/survival_by_class.png', desc: 'Socio-economic standing proxy showing higher survival rates for first class passengers.' },
    { id: 'survival_by_sex_class', name: 'Class & Sex Interaction', file: 'assets/plots/survival_by_sex_and_class.png', desc: 'Highlights near-perfect survival for upper-class females and low survival for lower-class males.' },
    { id: 'age_distribution', name: 'Age Distribution (KDE)', file: 'assets/plots/age_distribution_by_survival.png', desc: 'Kernel Density Estimate showing high survival rates among young children.' },
    { id: 'log_fare_boxplot', name: 'Log Fare Boxplot', file: 'assets/plots/log_fare_by_survival.png', desc: 'Log-transformed fares compared across classes to address skewness.' },
    { id: 'embarked_vs_survival', name: 'Embarked Location', file: 'assets/plots/embarked_survival.png', desc: 'Survival distribution mapped against port of embarkation (C = Cherbourg, Q = Queenstown, S = Southampton).' },
    { id: 'correlation_heatmap', name: 'Correlation Heatmap', file: 'assets/plots/correlation_heatmap.png', desc: 'Summarizes linear correlation coefficients across all numeric attributes.' },
  ];

  const activePlot = plotTabs.find(p => p.id === activePlotTab) || plotTabs[0];

  // List of Kaggle plots
  const kagglePlots = [
    { id: 'survival_count', name: 'Survival Count', file: 'survival_count.png', desc: 'Overall distribution of survivors vs. non-survivors.' },
    { id: 'sex_count', name: 'Sex Distribution', file: 'sex_count.png', desc: 'Total count of male and female passengers.' },
    { id: 'survival_rate_by_sex', name: 'Survival by Gender', file: 'survival_rate_by_sex.png', desc: 'Survival probability for male vs. female passengers.' },
    { id: 'survival_rate_by_class', name: 'Survival by Class', file: 'survival_rate_by_class.png', desc: 'Survival rate breakdown across Passenger Class.' },
    { id: 'survival_by_sex_class_heatmap', name: 'Gender & Class Heatmap', file: 'survival_by_sex_class_heatmap.png', desc: 'Cross-tabulation of survival rates across genders and passenger classes.' },
    { id: 'age_distribution_survival', name: 'Age Density Plot', file: 'age_distribution_survival.png', desc: 'KDE plot of age distribution for survived vs. deceased passengers.' },
    { id: 'age_group_survival', name: 'Age Group Survival', file: 'age_group_survival.png', desc: 'Survival rates grouped into custom age cohorts.' },
    { id: 'fare_distribution', name: 'Fare Histogram', file: 'fare_distribution.png', desc: 'Stacked histogram showing passenger counts across ticket price ranges.' },
    { id: 'fare_outlier_boxplot', name: 'Fare Boxplot', file: 'fare_outlier_boxplot.png', desc: 'Box-and-whisker plot highlighting outliers in passenger ticket fares.' },
    { id: 'age_fare_scatter', name: 'Age vs Fare Scatter', file: 'age_fare_scatter.png', desc: 'Scatter plot of passenger age against fare, colored by survival.' },
    { id: 'family_size_survival', name: 'Family Size Impact', file: 'family_size_survival.png', desc: 'Survival probability of passengers grouped by family size.' },
    { id: 'embarked_survival', name: 'Port of Embarkation', file: 'embarked_survival.png', desc: 'Survival rate by embarkation port.' },
    { id: 'cabin_known_survival', name: 'Cabin Records', file: 'cabin_known_survival.png', desc: 'Comparison of survival rates for passengers with registered cabins.' },
    { id: 'title_survival', name: 'Title Groupings', file: 'title_survival.png', desc: 'Survival rates mapped against engineered passenger titles.' },
    { id: 'confusion_matrix', name: 'Confusion Matrix', file: 'confusion_matrix.png', desc: 'Confusion matrix of actual vs. predicted classifications for the best Kaggle model.' },
    { id: 'feature_importance', name: 'Feature Importance', file: 'feature_importance.png', desc: 'Feature importances showing the influence weights of different features.' }
  ];

  const activeKPlot = kagglePlots.find(p => p.id === activeKagglePlot) || kagglePlots[0];

  return (
    <div>
      {/* Toast Notification */}
      {showToast && (
        <div className="toast">
          <i className="fa-solid fa-circle-check"></i>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-logo">
            <span>Titanic Companion</span>
          </div>
          <div className="navbar-actions">
            <a href={activeLinks.colab} target="_blank" rel="noreferrer" className="btn btn-primary">
              <i className="fa-solid fa-play"></i>
              <span>Run in Google Colab</span>
            </a>
            <a href={activeLinks.github} target="_blank" rel="noreferrer" className="btn btn-secondary">
              <i className="fa-brands fa-github"></i>
              <span>View GitHub</span>
            </a>
          </div>
        </div>
      </nav>

      {/* Main Layout Container */}
      <div className="layout-container">
        
        {/* Sticky Table of Contents Sidebar */}
        <aside className="sidebar-sticky">
          
          {/* Dataset Switcher Just Above the Notebook Pipeline Box */}
          <div style={{ marginBottom: '16px', width: '100%' }}>
            <PillWorkflowTabs activeTab={activeWorkflow} setActiveTab={setActiveWorkflow} />
          </div>

          <div className="toc-card">
            <div className="toc-title">Notebook Pipeline</div>
            <ul className="toc-list">
              {activeSidebarItems.map(item => (
                <li key={item.id}>
                  <button 
                    onClick={() => handleScrollTo(item.id)} 
                    className={`toc-item-link ${activeSection === item.id ? 'active' : ''}`}
                    style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left' }}
                  >
                    <i className={`fa-solid ${item.icon}`}></i>
                    <span>{item.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Central Educational Dashboard */}
        <main className="main-content">
          
          {/* ========================================================================= */}
          {/* 1. KAGGLE DATASET WORKFLOW (Includes TF-DF Model internally)               */}
          {/* ========================================================================= */}
          {activeWorkflow === 'kaggle' && (
            <div>
              {/* Secondary Sub-tabs Toggle for Kaggle Dataset */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
                <div className="pill-tabs-container" style={{ display: 'flex', gap: '4px' }}>
                  <button 
                    onClick={() => setActiveKaggleSubTab('main')} 
                    className={`pill-tab-btn ${activeKaggleSubTab === 'main' ? 'active' : ''}`}
                    style={{ fontSize: '13px', padding: '6px 16px' }}
                  >
                    <i className="fa-solid fa-gears" style={{ marginRight: '6px' }}></i>
                    Classical ML Workflow
                  </button>
                  <button 
                    onClick={() => setActiveKaggleSubTab('tfdf')} 
                    className={`pill-tab-btn ${activeKaggleSubTab === 'tfdf' ? 'active' : ''}`}
                    style={{ fontSize: '13px', padding: '6px 16px' }}
                  >
                    <i className="fa-solid fa-tree" style={{ marginRight: '6px' }}></i>
                    Advanced TF-DF Model
                  </button>
                </div>
              </div>

              {/* RENDER KAGGLE CLASSICAL ML WORKFLOW */}
              {activeKaggleSubTab === 'main' && (
                <div>
                  {/* Hero Banner Section */}
                  <section id="intro" className="hero">
                    <span className="hero-tag">Jupyter Companion • Kaggle Dataset</span>
                    <h1>From Data to Discovery — Lessons from the Titanic Project</h1>
                    <p className="hero-description">
                      This webpage serves as an educational companion to the main Kaggle notebook (<code style={{ fontSize: '15px', color: 'var(--color-accent)' }}>00_Titanic_Kaggle_Main_Workflow.ipynb</code>). It details data auditing, feature preprocessing, and model evaluations on the standard Kaggle training dataset.
                    </p>
                    <div className="navbar-actions" style={{ justifyContent: 'flex-start' }}>
                      <a href={activeLinks.colab} target="_blank" rel="noreferrer" className="btn btn-primary">
                        <i className="fa-solid fa-play"></i> Run Live Python Code in Colab
                      </a>
                    </div>
                    
                    <div className="hero-stats">
                      <div className="hero-stat-card">
                        <span className="hero-stat-val">891</span>
                        <span className="hero-stat-lbl">Train Rows (Local)</span>
                      </div>
                      <div className="hero-stat-card">
                        <span className="hero-stat-val">81.56%</span>
                        <span className="hero-stat-lbl">Validation Accuracy</span>
                      </div>
                      <div className="hero-stat-card">
                        <span className="hero-stat-val">10</span>
                        <span className="hero-stat-lbl">Engineered Features</span>
                      </div>
                    </div>
                  </section>

                  {/* Render Kaggle Steps dynamically */}
                  {kaggleSteps.map((step) => {
                    if (step.id === 'intro') return null;

                    return (
                      <section key={step.id} id={step.id} className="step-card">
                        <div className="step-header">
                          <span className="step-number-tag">Step {step.stepNumber}</span>
                          <span className="step-title">{step.title}</span>
                        </div>
                        <p className="step-subtitle" style={{ fontSize: '15px', color: 'var(--text-muted)', fontWeight: 600, margin: '-10px 0 16px 0' }}>
                          {step.subtitle}
                        </p>
                        <p className="step-explanation">{step.explanation}</p>
                        
                        {step.whyItMatters && (
                          <div className="insight-box" style={{ margin: '16px 0', padding: '14px', backgroundColor: '#eff6ff', borderLeft: '4px solid var(--color-primary)', borderRadius: '4px' }}>
                            <strong>Why It Matters:</strong> {step.whyItMatters}
                          </div>
                        )}

                        {step.codeSnippet && (
                          <div className="notebook-cell" style={{ margin: '20px 0' }}>
                            <div className="cell-header"><span>In [{step.stepNumber}]:</span><span>Python Pipeline Code</span></div>
                            <pre className="cell-code" style={{ whiteSpace: 'pre-wrap' }}><code>{step.codeSnippet}</code></pre>
                            {step.outputSummary && (
                              <div className="cell-output" style={{ fontSize: '13px', borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '10px' }}>
                                <strong>Output summary:</strong> {step.outputSummary}
                              </div>
                            )}
                          </div>
                        )}

                        {step.keyInsight && (
                          <div className="insight-box" style={{ margin: '16px 0', padding: '14px', backgroundColor: '#f0fdf4', borderLeft: '4px solid var(--color-success)', borderRadius: '4px' }}>
                            <strong>Key Insight:</strong> {step.keyInsight}
                          </div>
                        )}

                        {/* Special Render: Kaggle Visual Plot Gallery (Step 5) */}
                        {step.isGallery && (
                          <div className="plot-viewer-card" style={{ marginTop: '30px' }}>
                            <div className="plot-tabs-wrapper">
                              <button 
                                className="plot-scroll-btn left" 
                                onClick={() => scrollPlotTabs(kagglePlotTabsRef, 'left')}
                                title="Scroll Left"
                              >
                                <i className="fa-solid fa-chevron-left"></i>
                              </button>
                              
                              <div className="plot-tabs" ref={kagglePlotTabsRef}>
                                {kagglePlots.map(p => (
                                  <button
                                    key={p.id}
                                    onClick={() => setActiveKagglePlot(p.id)}
                                    className={`plot-tab-btn ${activeKagglePlot === p.id ? 'active' : ''}`}
                                  >
                                    {p.name}
                                  </button>
                                ))}
                              </div>

                              <button 
                                className="plot-scroll-btn right" 
                                onClick={() => scrollPlotTabs(kagglePlotTabsRef, 'right')}
                                title="Scroll Right"
                              >
                                <i className="fa-solid fa-chevron-right"></i>
                              </button>
                            </div>
                            <div className="plot-content" style={{ padding: '20px', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '8px', marginTop: '12px' }}>
                              <div style={{ textAlign: 'center' }}>
                                <img
                                  src={`${import.meta.env.BASE_URL}assets/plots/${activeKPlot.file}`}
                                  alt={activeKPlot.name}
                                  style={{ maxWidth: '100%', height: 'auto', maxHeight: '380px', objectFit: 'contain', borderRadius: '4px' }}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                                <div style={{ display: 'none', flexDirection: 'column', alignItems: 'center', color: 'var(--text-muted)', padding: '20px' }}>
                                  <i className="fa-solid fa-chart-line" style={{ fontSize: '48px', marginBottom: '10px' }}></i>
                                  <span>Static Plot missing. Run generate_kaggle_visuals.py first.</span>
                                </div>
                              </div>
                              <p className="plot-caption" style={{ marginTop: '12px', fontSize: '14.5px', color: 'var(--text-secondary)' }}>
                                <strong>{activeKPlot.name}:</strong> {activeKPlot.desc}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Special Render: Kaggle Model Comparison Table (Step 9) */}
                        {step.isComparisonTable && (
                          <div className="comparison-table-wrap" style={{ marginTop: '30px' }}>
                            {compError ? (
                              <div style={{ padding: '10px', backgroundColor: '#fee2e2', color: '#b91c1c', fontSize: '13px', borderRadius: '4px', marginBottom: '10px' }}>
                                ⚠️ Loading live metrics failed. Displaying static baselines.
                              </div>
                            ) : null}
                            <table className="comparison-table">
                              <thead>
                                <tr>
                                  <th>Model</th>
                                  <th>Accuracy</th>
                                  <th>Precision</th>
                                  <th>Recall</th>
                                  <th>F1 Score</th>
                                  <th>ROC-AUC</th>
                                  <th>Notes</th>
                                </tr>
                              </thead>
                              <tbody>
                                {modelComparisons.length > 0 ? (
                                  modelComparisons.map((item, idx) => (
                                    <tr key={idx}>
                                      <td><strong>{item.Model || item.model}</strong></td>
                                      <td>{(item.Accuracy || item.accuracy || 0).toFixed(4)}</td>
                                      <td>{(item.Precision || item.precision || 0).toFixed(4)}</td>
                                      <td>{(item.Recall || item.recall || 0).toFixed(4)}</td>
                                      <td>{(item.F1 || item.f1 || 0).toFixed(4)}</td>
                                      <td>{(item["ROC-AUC"] || item.roc_auc || 0).toFixed(4)}</td>
                                      <td>{item.Notes || item.notes}</td>
                                    </tr>
                                  ))
                                ) : (
                                  <>
                                    <tr>
                                      <td><strong>Gender Baseline</strong></td>
                                      <td>0.7765</td>
                                      <td>0.7377</td>
                                      <td>0.6522</td>
                                      <td>0.6923</td>
                                      <td>0.7534</td>
                                      <td>Baseline predicting all females survive and all males die.</td>
                                    </tr>
                                    <tr>
                                      <td><strong>Logistic Regression</strong></td>
                                      <td>0.8156</td>
                                      <td>0.7903</td>
                                      <td>0.7101</td>
                                      <td>0.7481</td>
                                      <td>0.8659</td>
                                      <td>CV score on train: 0.8301.</td>
                                    </tr>
                                  </>
                                )}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </section>
                    );
                  })}
                </div>
              )}

              {/* RENDER KAGGLE TF-DF ADVANCED MODEL */}
              {activeKaggleSubTab === 'tfdf' && (
                <div>
                  {/* Hero Banner Section */}
                  <section id="setup" className="hero">
                    <span className="hero-tag">Jupyter Companion • TensorFlow Decision Forests</span>
                    <h1>Advanced Modeling with TensorFlow Decision Forests (TF-DF)</h1>
                    <p className="hero-description">
                      This companion details the setup and engineering choices of our advanced model (<code style={{ fontSize: '15px', color: 'var(--color-accent)' }}>01_Titanic_TFDF_Advanced_Model.ipynb</code>). We utilize neural gradient boosted trees and auto-tuned structural variables.
                    </p>
                    <div className="navbar-actions" style={{ justifyContent: 'flex-start' }}>
                      <a href={activeLinks.colab} target="_blank" rel="noreferrer" className="btn btn-primary">
                        <i className="fa-solid fa-play"></i> Run Live Python Code in Colab
                      </a>
                    </div>
                    
                    <div className="hero-stats">
                      <div className="hero-stat-card">
                        <span className="hero-stat-val">891</span>
                        <span className="hero-stat-lbl">Train Rows</span>
                      </div>
                      <div className="hero-stat-card">
                        <span className="hero-stat-val">81.33%</span>
                        <span className="hero-stat-lbl">Out-of-Bag Accuracy</span>
                      </div>
                      <div className="hero-stat-card">
                        <span className="hero-stat-val">Auto</span>
                        <span className="hero-stat-lbl">Decision Tree Splits</span>
                      </div>
                    </div>
                  </section>

                  {/* Render TF-DF Steps dynamically */}
                  {tfdfSteps.map((step) => {
                    if (step.id === 'setup') return null;

                    return (
                      <section key={step.id} id={step.id} className="step-card">
                        <div className="step-header">
                          <span className="step-number-tag">Step {step.stepNumber}</span>
                          <span className="step-title">{step.title}</span>
                        </div>
                        <p className="step-subtitle" style={{ fontSize: '15px', color: 'var(--text-muted)', fontWeight: 600, margin: '-10px 0 16px 0' }}>
                          {step.subtitle}
                        </p>
                        <p className="step-explanation">{step.explanation}</p>
                        
                        {step.whyItMatters && (
                          <div className="insight-box" style={{ margin: '16px 0', padding: '14px', backgroundColor: '#eff6ff', borderLeft: '4px solid var(--color-primary)', borderRadius: '4px' }}>
                            <strong>Why It Matters:</strong> {step.whyItMatters}
                          </div>
                        )}

                        {step.codeSnippet && (
                          <div className="notebook-cell" style={{ margin: '20px 0' }}>
                            <div className="cell-header"><span>In [{step.stepNumber}]:</span><span>TF-DF Model Code</span></div>
                            <pre className="cell-code" style={{ whiteSpace: 'pre-wrap' }}><code>{step.codeSnippet}</code></pre>
                            {step.outputSummary && (
                              <div className="cell-output" style={{ fontSize: '13px', borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '10px' }}>
                                <strong>Output summary:</strong> {step.outputSummary}
                              </div>
                            )}
                          </div>
                        )}

                        {step.keyInsight && (
                          <div className="insight-box" style={{ margin: '16px 0', padding: '14px', backgroundColor: '#f0fdf4', borderLeft: '4px solid var(--color-success)', borderRadius: '4px' }}>
                            <strong>Key Insight:</strong> {step.keyInsight}
                          </div>
                        )}
                      </section>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. OPENML DATASET WORKFLOW (RESTORED EXACT STRUCTURE)                     */}
          {/* ========================================================================= */}
          {activeWorkflow === 'openml' && (
            <div>
              {/* Hero Banner Section */}
              <section id="intro" className="hero">
                <span className="hero-tag">Jupyter Companion • OpenML Dataset</span>
                <h1>From Data to Discovery — Lessons from the Titanic Project</h1>
                <p className="hero-description">
                  This webpage serves as an educational companion to the project's OpenML Jupyter Notebook (<code style={{ fontSize: '15px', color: 'var(--color-accent)' }}>02_Titanic_OpenML_Reference_Workflow.ipynb</code>). It systematically details how the data cleaning, exploratory plotting, and Scikit-Learn machine learning pipelines are constructed.
                </p>
                <div className="navbar-actions" style={{ justifyContent: 'flex-start' }}>
                  <a href={activeLinks.colab} target="_blank" rel="noreferrer" className="btn btn-primary">
                    <i className="fa-solid fa-play"></i> Run Live Python Code in Colab
                  </a>
                </div>
                
                <div className="hero-stats">
                  <div className="hero-stat-card">
                    <span className="hero-stat-val">1,309</span>
                    <span className="hero-stat-lbl">Dataset Rows</span>
                  </div>
                  <div className="hero-stat-card">
                    <span className="hero-stat-val">{validatedResult.testAccuracyPercent}</span>
                    <span className="hero-stat-lbl">Verified Test Accuracy</span>
                  </div>
                  <div className="hero-stat-card">
                    <span className="hero-stat-val">11</span>
                    <span className="hero-stat-lbl">Model Features</span>
                  </div>
                </div>
              </section>

              {/* Step 1: Setup */}
              <section id="setup" className="step-card">
                <div className="step-header">
                  <span className="step-number-tag">Step 1</span>
                  <span className="step-title"><i className="fa-solid fa-gears"></i> Environment & Library Setup</span>
                </div>
                <p className="step-explanation">
                  We initialize the standard Python data science stack. In accordance with proper notebook patterns, all package imports (including regular expressions `re` for title extraction, Random Forest classifiers, and GridSearchCV estimators) are consolidated into this initial cell to prepare the notebook for running in Google Colab cleanly.
                </p>
                <div className="notebook-cell">
                  <div className="cell-header"><span>In [1]:</span><span>Python Setup Code</span></div>
                  <pre className="cell-code"><code>{`import re
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report, roc_auc_score, roc_curve

sns.set_theme(style="whitegrid")
plt.rcParams["figure.figsize"] = (10, 6)
plt.rcParams["figure.dpi"] = 120`}</code></pre>
                </div>
              </section>

              {/* Step 2: Ingestion */}
              <section id="loading" className="step-card">
                <div className="step-header">
                  <span className="step-number-tag">Step 2</span>
                  <span className="step-title"><i className="fa-solid fa-file-csv"></i> Dataset Ingestion</span>
                </div>
                <p className="step-explanation">
                  The notebook loads the complete **OpenML Titanic dataset (1,309 rows)** directly from the remote repository. This dataset combines passengers from all classes and captures a realistic distribution of passenger demographics and survival classes.
                </p>
                <div className="notebook-cell">
                  <div className="cell-header"><span>In [2]:</span><span>Loading Dataset</span></div>
                  <pre className="cell-code"><code>{`url = "https://www.openml.org/data/get_csv/16826755/phpMYEkMl"
df = pd.read_csv(url)

print("Shape:", df.shape)
display(df.head())`}</code></pre>
                  <div className="cell-output">
                    Shape: (1309, 14)<br />
                    Columns: pclass, survived, name, sex, age, sibsp, parch, ticket, fare, cabin, embarked, boat, body, home.dest
                  </div>
                </div>
              </section>

              {/* Step 3: Cleaning */}
              <section id="cleaning" className="step-card">
                <div className="step-header">
                  <span className="step-number-tag">Step 3</span>
                  <span className="step-title"><i className="fa-solid fa-broom"></i> Column Cleaning & Data Dictionary</span>
                </div>
                <p className="step-explanation">
                  Column names are normalized to lowercase and periods are replaced with underscores to prevent parsing errors. OpenML represents missing values with the character string `?`, which we explicitly convert to Python `NaN` objects before converting `age` and `fare` columns into numbers.
                </p>

                <div className="warning-box">
                  <div className="warning-icon"><i className="fa-solid fa-triangle-exclamation"></i></div>
                  <div className="warning-content">
                    <h4>Data Leakage Alert!</h4>
                    <p>Do <strong>not</strong> include post-disaster features like `boat` (lifeboat assignment number) or `body` (recovered body ID) in the model features. These variables leak the survival outcome immediately, causing artificially perfect train accuracy and complete failure on unseen real-world data.</p>
                  </div>
                </div>

                <div className="notebook-cell">
                  <div className="cell-header"><span>In [3]:</span><span>Cleaning columns</span></div>
                  <pre className="cell-code"><code>{`df = df.copy()
df.columns = (
    df.columns
    .str.strip()
    .str.lower()
    .str.replace(".", "_", regex=False)
    .str.replace(" ", "_", regex=False)
)

df = df.replace("?", np.nan)
for col in ["age", "fare"]:
    df[col] = pd.to_numeric(df[col], errors="coerce")`}</code></pre>
                </div>
              </section>

              {/* Step 4: Missing Values */}
              <section id="missing" className="step-card">
                <div className="step-header">
                  <span className="step-number-tag">Step 4</span>
                  <span className="step-title"><i className="fa-solid fa-magnifying-glass-chart"></i> Missing Value Analysis</span>
                </div>
                <p className="step-explanation">
                  To formulate a valid imputation strategy, we evaluate missingness. The fields `cabin` (77.47%), `age` (20.09%), and `embarked` (0.15%) contain missing entries. Preprocessing pipelines must handle these dynamically using Scikit-Learn transformers.
                </p>
                <div className="notebook-cell">
                  <div className="cell-header"><span>In [4]:</span><span>Missing Values Check</span></div>
                  <pre className="cell-code"><code>{`missing = (
    pd.DataFrame({
        "missing_count": df.isna().sum(),
        "missing_percent": (df.isna().mean() * 100).round(2),
    })
    .query("missing_count > 0")
    .sort_values("missing_percent", ascending=False)
)
display(missing)`}</code></pre>
                  <div className="cell-output">
                    {`             missing_count  missing_percent
cabin                 1014            77.47
age                    263            20.09
embarked                 2             0.15
fare                     1             0.08`}
                  </div>
                </div>
              </section>

              {/* Step 5: EDA & Visualizations */}
              <section id="eda" className="step-card">
                <div className="step-header">
                  <span className="step-number-tag">Step 5</span>
                  <span className="step-title"><i className="fa-solid fa-chart-simple"></i> Exploratory Data Analysis (EDA)</span>
                </div>
                <p className="step-explanation">
                  Below are the actual Seaborn visualizations generated directly in the Jupyter Notebook cells. You can click on the tabs below to dynamically switch between the charts and read their significance in the pipeline.
                </p>

                {/* Plot viewer card */}
                <div className="plot-viewer-card">
                  <div className="plot-tabs-wrapper">
                    <button 
                      className="plot-scroll-btn left" 
                      onClick={() => scrollPlotTabs(plotTabsRef, 'left')}
                      title="Scroll Left"
                    >
                      <i className="fa-solid fa-chevron-left"></i>
                    </button>
                    
                    <div className="plot-tabs" ref={plotTabsRef}>
                      {plotTabs.map(tab => (
                        <button 
                          key={tab.id} 
                          className={`plot-tab-btn ${activePlotTab === tab.id ? 'active' : ''}`}
                          onClick={() => setActivePlotTab(tab.id)}
                        >
                          {tab.name}
                        </button>
                      ))}
                    </div>

                    <button 
                      className="plot-scroll-btn right" 
                      onClick={() => scrollPlotTabs(plotTabsRef, 'right')}
                      title="Scroll Right"
                    >
                      <i className="fa-solid fa-chevron-right"></i>
                    </button>
                  </div>
                  <div className="plot-content">
                    <img 
                      src={`${import.meta.env.BASE_URL}${activePlot.file}`} 
                      alt={activePlot.name} 
                      className="plot-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div style={{ display: 'none', flexDirection: 'column', alignItems: 'center', color: 'var(--text-muted)' }}>
                      <i className="fa-solid fa-chart-line" style={{ fontSize: '48px', marginBottom: '10px' }}></i>
                      <span style={{ fontSize: '14px' }}>Chart asset not found locally</span>
                    </div>
                    <p className="plot-caption">
                      <strong>{activePlot.name}:</strong> {activePlot.desc}
                    </p>
                  </div>
                </div>
              </section>

              {/* Step 6: Feature Engineering */}
              <section id="engineering" className="step-card">
                <div className="step-header">
                  <span className="step-number-tag">Step 6</span>
                  <span className="step-title"><i className="fa-solid fa-flask"></i> Feature Engineering Transformer</span>
                </div>
                <p className="step-explanation">
                  We encapsulate all feature engineering steps inside a custom, leakage-safe Scikit-Learn transformer class `TitanicFeatureEngineer`. It engineers family size features (`family_size`, `is_alone`), deck features (`has_cabin`), and extracts name `title` groupings (Mr, Mrs, Miss, Master, Rare) using standard regular expression parsing while safely dropping raw string/leakage fields.
                </p>
                <div className="notebook-cell">
                  <div className="cell-header"><span>In [6]:</span><span>Custom Feature Engineer Class</span></div>
                  <pre className="cell-code"><code>{`class TitanicFeatureEngineer(BaseEstimator, TransformerMixin):
    """Create leakage-safe Titanic model features inside the pipeline."""
    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X_out = X.copy()
        X_out["family_size"] = X_out["sibsp"] + X_out["parch"] + 1
        X_out["is_alone"] = (X_out["family_size"] == 1).astype(int)

        def extract_title(name):
            if not isinstance(name, str):
                return "Mr"
            match = re.search(r",\\s*([^\\.]+)\\.", name)
            return match.group(1).strip() if match else "Mr"

        X_out["title"] = X_out["name"].apply(extract_title)
        title_mapping = {"Mr": "Mr", "Mrs": "Mrs", "Miss": "Miss", "Master": "Master", "Mme": "Mrs", "Ms": "Miss", "Mlle": "Miss"}
        X_out["title"] = X_out["title"].map(title_mapping).fillna("Rare")
        X_out["has_cabin"] = X_out["cabin"].notna().astype(int)

        leakage_or_raw = ["passengerid", "name", "ticket", "cabin", "boat", "body", "home_dest"]
        return X_out.drop(columns=[col for col in leakage_or_raw if col in X_out.columns])`}</code></pre>
                </div>
              </section>

              {/* Step 7: Imputation */}
              <section id="imputation" className="step-card">
                <div className="step-header">
                  <span className="step-number-tag">Step 7</span>
                  <span className="step-title"><i className="fa-solid fa-user-pen"></i> Custom Group Median Imputation</span>
                </div>
                <p className="step-explanation">
                  Simple global median imputation ignores demographic context (e.g. 1st class females are generally older than 3rd class children). We build a custom transformer `GroupMedianAgeImputer` that calculates median ages grouped by passenger class and gender, fitting *only* on the training fold to prevent cross-validation leakage.
                </p>
                <div className="notebook-cell">
                  <div className="cell-header"><span>In [7]:</span><span>Group Median Imputer Class</span></div>
                  <pre className="cell-code"><code>{`class GroupMedianAgeImputer(BaseEstimator, TransformerMixin):
    """Impute missing age from training-fold medians grouped by pclass and sex."""
    def __init__(self, age_col="age", group_cols=("pclass", "sex")):
        self.age_col = age_col
        self.group_cols = group_cols
        self.group_medians_ = {}
        self.global_median_ = None

    def fit(self, X, y=None):
        X_fit = X.copy()
        self.global_median_ = X_fit[self.age_col].median()
        medians = X_fit.groupby(list(self.group_cols), dropna=False)[self.age_col].median()
        self.group_medians_ = medians.to_dict()
        return self

    def transform(self, X):
        X_out = X.copy()
        def fill_age(row):
            if pd.isna(row[self.age_col]):
                key = tuple(row[col] for col in self.group_cols)
                return self.group_medians_.get(key, self.global_median_)
            return row[self.age_col]
        X_out[self.age_col] = X_out.apply(fill_age, axis=1)
        return X_out`}</code></pre>
                </div>
              </section>

              {/* Step 8: Train-test split */}
              <section id="split" className="step-card">
                <div className="step-header">
                  <span className="step-number-tag">Step 8</span>
                  <span className="step-title"><i className="fa-solid fa-scissors"></i> Train / Test Stratification</span>
                </div>
                <p className="step-explanation">
                  We separate variables from target indicators. We perform an **80-20 train-test split** using stratified partition (`stratify=y`) to guarantee that target proportions are identical in both folders, ensuring fair model evaluation.
                </p>
                <div className="notebook-cell">
                  <div className="cell-header"><span>In [8]:</span><span>Train-Test Split</span></div>
                  <pre className="cell-code"><code>{`X = df_raw.drop(columns=["survived"])
y = df_raw["survived"].astype(int)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42, stratify=y
)
print("Train shape:", X_train.shape, "| Test shape:", X_test.shape)`}</code></pre>
                  <div className="cell-output">
                    Train shape: (1047, 11) | Test shape: (262, 11)
                  </div>
                </div>
              </section>

              {/* Step 9: Preprocessing Pipeline */}
              <section id="pipeline" className="step-card">
                <div className="step-header">
                  <span className="step-number-tag">Step 9</span>
                  <span className="step-title"><i className="fa-solid fa-diagram-project"></i> Scikit-Learn Pipeline</span>
                </div>
                <p className="step-explanation">
                  To prevent data leakage during scaling and imputation, we build a Scikit-Learn `ColumnTransformer`:
                  - **Numeric attributes**: Impute missing entries with the `median` and standard scale values to center them.
                  - **Categorical attributes**: Impute with the `most frequent` category and perform one-hot encoding, dropping the first category to avoid multicollinearity.
                </p>
                <div className="notebook-cell">
                  <div className="cell-header"><span>In [9]:</span><span>Column Transformers</span></div>
                  <pre className="cell-code"><code>{`numeric_features = ["age", "sibsp", "parch", "fare", "family_size"]
categorical_features = ["pclass", "sex", "embarked", "is_alone", "title", "has_cabin"]

numeric_pipeline = Pipeline(steps=[
    ("imputer", SimpleImputer(strategy="median")),
    ("scaler", StandardScaler())
])

categorical_pipeline = Pipeline(steps=[
    ("imputer", SimpleImputer(strategy="most_frequent")),
    ("encoder", OneHotEncoder(handle_unknown="ignore", drop="first"))
])

preprocessor = ColumnTransformer(transformers=[
    ("num", numeric_pipeline, numeric_features),
    ("cat", categorical_pipeline, categorical_features)
])`}</code></pre>
                </div>
              </section>

              {/* Step 10: Model search */}
              <section id="training" className="step-card">
                <div className="step-header">
                  <span className="step-number-tag">Step 10</span>
                  <span className="step-title"><i className="fa-solid fa-gear"></i> GridSearchCV Model Comparison Search</span>
                </div>
                <p className="step-explanation">
                  Instead of randomly fitting a single model, we run a cross-validated grid search (`GridSearchCV`) comparing `LogisticRegression` against a non-linear `RandomForestClassifier` with various tree depths. The pipeline links our custom imputers, feature engineers, transformers, and classifiers.
                </p>
                <div className="notebook-cell">
                  <div className="cell-header"><span>In [10]:</span><span>Grid Search Setup & Execute</span></div>
                  <pre className="cell-code"><code>{`base_pipeline = Pipeline(steps=[
    ("group_age_imputer", GroupMedianAgeImputer()),
    ("feature_engineer", TitanicFeatureEngineer()),
    ("preprocess", preprocessor),
    ("classifier", LogisticRegression(max_iter=1000, solver="liblinear", random_state=42))
])

param_grid = [
    {
        "classifier": [LogisticRegression(max_iter=1000, solver="liblinear", random_state=42)],
        "classifier__C": [0.1, 1.0, 10.0],
    },
    {
        "classifier": [RandomForestClassifier(random_state=42, n_jobs=-1)],
        "classifier__n_estimators": [100],
        "classifier__max_depth": [3, 5],
        "classifier__min_samples_leaf": [1, 3],
    }
]

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
grid_search = GridSearchCV(estimator=base_pipeline, param_grid=param_grid, cv=cv, scoring="accuracy", n_jobs=-1)
grid_search.fit(X_train, y_train)`}</code></pre>
                </div>
              </section>

              {/* Step 11: Evaluation */}
              <section id="evaluation" className="step-card">
                <div className="step-header">
                  <span className="step-number-tag">Step 11</span>
                  <span className="step-title"><i className="fa-solid fa-square-poll-vertical"></i> Evaluation Metrics & ROC Curve</span>
                </div>
                <p className="step-explanation">
                  The grid search selects tuned Logistic Regression as the optimal pipeline. It yields a holdout test accuracy of **84.73%** and a 5-fold cross-validation accuracy of **80.20%**. Below is the holdout ROC-AUC evaluation and the diagnostic ROC curve.
                </p>
                <div className="notebook-cell">
                  <div className="cell-header"><span>In [11]:</span><span>Model Evaluation Output</span></div>
                  <pre className="cell-code"><code>{`best_pipeline = grid_search.best_estimator_
y_pred = best_pipeline.predict(X_test)
y_proba = best_pipeline.predict_proba(X_test)[:, 1]

print(f"Holdout Test Accuracy: {accuracy_score(y_test, y_pred):.4f}")
print(f"ROC-AUC score: {roc_auc_score(y_test, y_proba):.4f}")
print("\\nConfusion Matrix:\\n", confusion_matrix(y_test, y_pred))`}</code></pre>
                  <div className="cell-output">
                    Holdout Test Accuracy: 0.8473<br />
                    ROC-AUC score: 0.8872<br />
                    Confusion Matrix:<br />
                    [[146  16]<br />
                    [ 24  76]]
                  </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <img 
                    src={`${import.meta.env.BASE_URL}assets/plots/roc_curve.png`} 
                    alt="ROC Curve" 
                    style={{ maxWidth: '100%', height: 'auto', maxHeight: '380px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginTop: '8px' }}>
                    ROC-AUC diagnostic plot generated in the GridSearch step, illustrating the tradeoff between False Positive and True Positive rates.
                  </p>
                </div>
              </section>

              {/* Step 12: Pipeline Diagram */}
              <section id="diagram" className="step-card">
                <div className="step-header">
                  <span className="step-number-tag">Step 12</span>
                  <span className="step-title"><i className="fa-solid fa-code-branch"></i> Interactive Pipeline Diagram</span>
                </div>
                <p className="step-explanation">
                  Scikit-Learn supports visual diagram representations of estimators. Below is the interactive visual mapping of the chosen optimal pipeline. Hover over any block to reveal parameters and class features.
                </p>

                <div className="notebook-cell">
                  <div className="cell-header"><span>In [12]:</span><span>Pipeline Diagram Render</span></div>
                  <pre className="cell-code"><code>{`# Get the best estimator from grid search and render its structure
best_pipeline = grid_search.best_estimator_
best_pipeline`}</code></pre>
                  
                  {/* Interactive HTML pipeline output block */}
                  <div className="cell-output" style={{ maxHeight: 'none', backgroundColor: '#ffffff' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '12px' }}>
                      <i className="fa-solid fa-cubes"></i> Scikit-Learn Interactive Diagram (Hover blocks for parameters)
                    </div>
                    
                    <div className="pipeline-diagram">
                      {/* Step 1 */}
                      <div className="pipeline-step">
                        <div className="pipeline-node">
                          <div className="node-type">Step 1: Custom Group Imputer</div>
                          <div className="node-name">group_age_imputer: GroupMedianAgeImputer</div>
                          <div className="node-details">
                            Imputes missing 'age' values using training-fold medians grouped by Pclass and Sex. Avoids split fold leakage.
                          </div>
                        </div>
                      </div>
                      
                      <div className="pipeline-arrow-down">
                        <i className="fa-solid fa-arrow-down-long"></i>
                      </div>
                      
                      {/* Step 2 */}
                      <div className="pipeline-step">
                        <div className="pipeline-node">
                          <div className="node-type">Step 2: Feature Engineering</div>
                          <div className="node-name">feature_engineer: TitanicFeatureEngineer</div>
                          <div className="node-details">
                            Engineers 'family_size', 'is_alone', 'has_cabin', and parses names for 'title' mapping (Mr, Mrs, Miss, Master, Rare). Safely drops raw string leakage variables.
                          </div>
                        </div>
                      </div>
                      
                      <div className="pipeline-arrow-down">
                        <i className="fa-solid fa-arrow-down-long"></i>
                      </div>
                      
                      {/* Step 3: ColumnTransformer Split */}
                      <div className="pipeline-step" style={{ maxWidth: '640px' }}>
                        <div className="pipeline-node" style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
                          <div className="node-type" style={{ color: 'var(--color-primary)' }}>Step 3: Column Partitioning</div>
                          <div className="node-name">preprocess: ColumnTransformer</div>
                          <div className="node-details">
                            Routes columns dynamically to numeric or categorical sub-pipelines based on data types.
                          </div>
                        </div>
                        
                        <div className="pipeline-split-container">
                          {/* Numerical Branch */}
                          <div className="pipeline-branch">
                            <div className="pipeline-branch-title">Numerical Features (num)</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', textAlign: 'center' }}>
                              age, sibsp, parch, fare, family_size
                            </div>
                            
                            <div className="pipeline-node" style={{ padding: '6px 10px' }}>
                              <div className="node-type">Imputer</div>
                              <div className="node-name" style={{ fontSize: '12px' }}>SimpleImputer(strategy='median')</div>
                            </div>
                            
                            <div className="pipeline-arrow-down" style={{ height: '12px', fontSize: '11px' }}>
                              <i className="fa-solid fa-arrow-down"></i>
                            </div>
                            
                            <div className="pipeline-node" style={{ padding: '6px 10px' }}>
                              <div className="node-type">Scaler</div>
                              <div className="node-name" style={{ fontSize: '12px' }}>StandardScaler()</div>
                            </div>
                          </div>
                          
                          {/* Categorical Branch */}
                          <div className="pipeline-branch">
                            <div className="pipeline-branch-title">Categorical Features (cat)</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', textAlign: 'center' }}>
                              pclass, sex, embarked, is_alone, title, has_cabin
                            </div>
                            
                            <div className="pipeline-node" style={{ padding: '6px 10px' }}>
                              <div className="node-type">Imputer</div>
                              <div className="node-name" style={{ fontSize: '12px' }}>SimpleImputer(strategy='most_frequent')</div>
                            </div>
                            
                            <div className="pipeline-arrow-down" style={{ height: '12px', fontSize: '11px' }}>
                              <i className="fa-solid fa-arrow-down"></i>
                            </div>
                            
                            <div className="pipeline-node" style={{ padding: '6px 10px' }}>
                              <div className="node-type">Encoder</div>
                              <div className="node-name" style={{ fontSize: '12px' }}>OneHotEncoder(drop='first', handle_unknown='ignore')</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pipeline-arrow-down">
                        <i className="fa-solid fa-arrow-down-long"></i>
                      </div>
                      
                      {/* Step 4: Classifier */}
                      <div className="pipeline-step">
                        <div className="pipeline-node" style={{ backgroundColor: '#e0f2fe', borderColor: '#7dd3fc' }}>
                          <div className="node-type" style={{ color: '#0369a1' }}>Step 4: Optimal Estimator Classifier</div>
                          <div className="node-name">classifier: LogisticRegression</div>
                          <div className="node-details">
                            Optimal hyperparameter C selected: 1.0 (out-performing C=0.1, C=10.0 and Random Forest estimators in CV score).
                          </div>
                        </div>
                      </div>
                      
                    </div>
                  </div>
                </div>
              </section>

              {/* Step 13: Coefficients */}
              <section id="odds" className="step-card">
                <div className="step-header">
                  <span className="step-number-tag">Step 13</span>
                  <span className="step-title"><i className="fa-solid fa-scale-balanced"></i> Log-Odds & Coefficients</span>
                </div>
                <p className="step-explanation">
                  Logistic regression outputs a probability using standard features coefficients. Below are the actual model coefficients parsed from the notebook. A positive value increases survival probability; a negative value decreases it.
                </p>

                <div className="coef-table-container">
                  <table className="coef-table">
                    <thead>
                      <tr>
                        <th>Encoded Pipeline Feature</th>
                        <th>Coefficient Value (Log-Odds)</th>
                        <th>Direction Influence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {model ? (
                        model.encodedFeatureNames.map((name, i) => (
                          <tr key={i}>
                            <td style={{ fontWeight: 600 }}>{name}</td>
                            <td className={`coef-val ${model.coefficients[i] > 0 ? 'positive' : 'negative'}`}>
                              {model.coefficients[i] > 0 ? '+' : ''}{model.coefficients[i].toFixed(4)}
                            </td>
                            <td>
                              {model.coefficients[i] > 0 ? (
                                <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>
                                  <i className="fa-solid fa-circle-arrow-up"></i> Increases Survival Odds
                                </span>
                              ) : (
                                <span style={{ color: 'var(--color-danger)', fontWeight: 600 }}>
                                  <i className="fa-solid fa-circle-arrow-down"></i> Decreases Survival Odds
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3">Loading model coefficients...</td>
                        </tr>
                      )}
                      {model && (
                        <tr style={{ background: '#f8fafc', fontWeight: 700 }}>
                          <td>Model Intercept (\(\theta_0\))</td>
                          <td>{model.intercept.toFixed(4)}</td>
                          <td>Baseline constant bias</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Step 14: Economic and Real-World Relevance */}
              <section id="relevance" className="step-card">
                <div className="step-header">
                  <span className="step-number-tag">Step 14</span>
                  <span className="step-title"><i className="fa-solid fa-handshake"></i> Economic & Real-World Relevance</span>
                </div>
                <p className="step-explanation">
                  The Titanic workflow is universal and applies directly to modern industry classification tasks:
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '16px' }}>
                  <div style={{ border: '1px solid var(--border-color)', padding: '16px', borderRadius: '8px', backgroundColor: '#ffffff' }}>
                    <strong style={{ display: 'block', fontSize: '14px', color: 'var(--text-primary)', marginBottom: '6px' }}><i className="fa-solid fa-credit-card" style={{ color: 'var(--color-primary)', marginRight: '8px' }}></i> Financial Risk</strong>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                      Classifying borrowers as default vs. non-default. Standard credit scoring pipelines use similar stratified splitting, imputation, scaling, and GridSearchCV hyperparameter tuning on logistic regression models to control credit risk.
                    </p>
                  </div>
                  <div style={{ border: '1px solid var(--border-color)', padding: '16px', borderRadius: '8px', backgroundColor: '#ffffff' }}>
                    <strong style={{ display: 'block', fontSize: '14px', color: 'var(--text-primary)', marginBottom: '6px' }}><i className="fa-solid fa-house-fire" style={{ color: 'var(--color-primary)', marginRight: '8px' }}></i> Disaster Response</strong>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                      Categorizing geographical regions or structures as high-risk vs. low-risk zones to optimize evacuation routes, distribute emergency supplies, and prioritize retrofits before extreme weather events.
                    </p>
                  </div>
                  <div style={{ border: '1px solid var(--border-color)', padding: '16px', borderRadius: '8px', backgroundColor: '#ffffff' }}>
                    <strong style={{ display: 'block', fontSize: '14px', color: 'var(--text-primary)', marginBottom: '6px' }}><i className="fa-solid fa-shield-halved" style={{ color: 'var(--color-primary)', marginRight: '8px' }}></i> Insurance Analytics</strong>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                      Predicting claim likelihood based on demographic signals. Leakage-free preprocessing prevents historical bias from corrupting pricing and premium calculations.
                    </p>
                  </div>
                  <div style={{ border: '1px solid var(--border-color)', padding: '16px', borderRadius: '8px', backgroundColor: '#ffffff' }}>
                    <strong style={{ display: 'block', fontSize: '14px', color: 'var(--text-primary)', marginBottom: '6px' }}><i className="fa-solid fa-briefcase-medical" style={{ color: 'var(--color-primary)', marginRight: '8px' }}></i> Healthcare Triage</strong>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                      Identifying high-risk vs. stable patients in emergency wards, using diagnostic inputs to dynamically allocate intensive care beds and physician support.
                    </p>
                  </div>
                </div>
              </section>

              {/* Step 15: Data Science Mindset */}
              <section id="mindset" className="step-card">
                <div className="step-header">
                  <span className="step-number-tag">Step 15</span>
                  <span className="step-title"><i className="fa-solid fa-brain"></i> Data Science Mindset</span>
                </div>
                <p className="step-explanation">
                  A professional data scientist approaches predictive modeling with a structured checklist of best practices:
                </p>
                <ul style={{ paddingLeft: '20px', lineHeight: '1.8', fontSize: '14.5px', color: 'var(--text-secondary)' }}>
                  <li><strong>Ask the right questions:</strong> Understand the socio-economic context and variables before writing any code.</li>
                  <li><strong>Clean data is the foundation of truth:</strong> Converting placeholder values and resolving anomalies prevents garbage-in, garbage-out.</li>
                  <li><strong>Visualize to understand:</strong> Exploratory plotting reveals non-linear interactions and class distributions.</li>
                  <li><strong>Model to predict:</strong> Establish robust cross-validation limits to measure realistic performance rather than memorizing training data.</li>
                  <li><strong>Communicate to inspire:</strong> Explain decisions using odds ratios, features, and simple interactive interfaces.</li>
                </ul>
              </section>

              {/* Step 16: Final Reflection */}
              <section id="reflection" className="step-card">
                <div className="step-header">
                  <span className="step-number-tag">Step 16</span>
                  <span className="step-title"><i className="fa-solid fa-lightbulb"></i> Final Reflection</span>
                </div>
                <p className="step-explanation" style={{ fontSize: '15px', lineHeight: '1.6' }}>
                  The Titanic dataset demonstrates that data is not merely numbers in a matrix — it represents real human stories, social hierarchies, and survival outcomes. 
                </p>
                <p className="step-explanation" style={{ fontSize: '15px', lineHeight: '1.6', marginTop: '12px' }}>
                  Our workflow showed that simple, transparent models (like logistic regression with clean, leakage-free features and demographic-specific imputation) can achieve high classification accuracy while remaining fully interpretable. Machine learning engineering is not about building the most complex neural networks, but about building models responsibly, parsing features cleanly, and communicating findings effectively.
                </p>
              </section>

              {/* Step 17: Sandbox Predictor (The Grand Finale) */}
              <section id="predictor" className="sandbox-card">
                <div className="sandbox-title">
                  <i className="fa-solid fa-circle-play"></i>
                  <span>Step 17: Interactive Predictions Sandbox</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', marginBottom: '24px' }}>
                  We conclude with example predictions and our live sandbox. Test how the notebook's trained model parameters calculate predictions in real-time. Modify the passenger attributes below to see the local JS log-odds inference instantly.
                </p>

                {/* Example Predictions Grid */}
                <div style={{ marginBottom: '32px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    Jupyter Notebook Example Scenarios
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                    <div style={{ border: '1px solid var(--border-color)', padding: '16px', borderRadius: '8px', backgroundColor: '#ffffff' }}>
                      <strong style={{ display: 'block', fontSize: '14px', color: 'var(--text-primary)', marginBottom: '4px' }}>Young Third-Class Male</strong>
                      <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Not Survived (~11.6%)</span>
                      <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                        High risk group. Negative coefficients for male sex (-0.36), Mr title (-1.75), and class 3 status (-0.88) heavily depress survival odds.
                      </p>
                      <button className="btn btn-secondary btn-sm" onClick={() => {
                        setInput({ pclass: 3, sex: 'male', age: 22, sibsp: 0, parch: 0, fare: 7.25, embarked: 'S', title: 'Mr', has_cabin: false });
                        triggerToast('Loaded Young Third-Class Male!');
                      }} style={{ marginTop: '12px', width: '100%', justifyContent: 'center' }}>
                        Load Scenario
                      </button>
                    </div>

                    <div style={{ border: '1px solid var(--border-color)', padding: '16px', borderRadius: '8px', backgroundColor: '#ffffff' }}>
                      <strong style={{ display: 'block', fontSize: '14px', color: 'var(--text-primary)', marginBottom: '4px' }}>First-Class Female</strong>
                      <span style={{ display: 'block', fontSize: '11px', color: 'var(--color-success)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Survived (~97.1%)</span>
                      <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                        High survival rate. Positive coefficients for has_cabin (+1.00), Mrs title (+0.91), and female sex increase survival odds.
                      </p>
                      <button className="btn btn-secondary btn-sm" onClick={() => {
                        setInput({ pclass: 1, sex: 'female', age: 38, sibsp: 1, parch: 0, fare: 71.28, embarked: 'C', title: 'Mrs', has_cabin: true });
                        triggerToast('Loaded First-Class Female!');
                      }} style={{ marginTop: '12px', width: '100%', justifyContent: 'center' }}>
                        Load Scenario
                      </button>
                    </div>

                    <div style={{ border: '1px solid var(--border-color)', padding: '16px', borderRadius: '8px', backgroundColor: '#ffffff' }}>
                      <strong style={{ display: 'block', fontSize: '14px', color: 'var(--text-primary)', marginBottom: '4px' }}>Child (Second-Class Male)</strong>
                      <span style={{ display: 'block', fontSize: '11px', color: 'var(--color-success)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Survived (~84.2%)</span>
                      <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                        Young age and child 'Master' title features offset the negative coefficient for male gender in model predictions.
                      </p>
                      <button className="btn btn-secondary btn-sm" onClick={() => {
                        setInput({ pclass: 2, sex: 'male', age: 6, sibsp: 1, parch: 1, fare: 26.00, embarked: 'S', title: 'Master', has_cabin: false });
                        triggerToast('Loaded Child Scenario!');
                      }} style={{ marginTop: '12px', width: '100%', justifyContent: 'center' }}>
                        Load Scenario
                      </button>
                    </div>
                  </div>
                </div>

                {modelError && (
                  <div style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid var(--color-danger)', padding: '12px', color: 'var(--color-danger)', borderRadius: '6px', fontSize: '13px', marginBottom: '20px' }}>
                    ⚠️ Error loading model file: {modelError}. Replicating demo estimates.
                  </div>
                )}

                <div className="sandbox-grid">
                  
                  {/* Inputs Column */}
                  <div className="sandbox-form-col">
                    <div className="form-group">
                      <label>Passenger Class</label>
                      <select 
                        className="form-control"
                        value={input.pclass}
                        onChange={(e) => updateForm('pclass', Number(e.target.value))}
                      >
                        <option value={1}>1st Class (Upper Deck)</option>
                        <option value={2}>2nd Class (Middle Deck)</option>
                        <option value={3}>3rd Class (Lower Deck)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Sex</label>
                      <select 
                        className="form-control"
                        value={input.sex}
                        onChange={(e) => updateForm('sex', e.target.value)}
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Age: {input.age} years</label>
                      <div className="range-wrap">
                        <input 
                          type="range" 
                          min="1" 
                          max="80" 
                          className="form-control"
                          value={input.age} 
                          onChange={(e) => updateForm('age', Number(e.target.value))}
                        />
                        <span className="range-val">{input.age}</span>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Fare (Ticket Price): ${input.fare.toFixed(2)}</label>
                      <div className="range-wrap">
                        <input 
                          type="range" 
                          min="0" 
                          max="300" 
                          step="0.5"
                          className="form-control"
                          value={input.fare} 
                          onChange={(e) => updateForm('fare', Number(e.target.value))}
                        />
                        <span className="range-val">${input.fare.toFixed(0)}</span>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Name Title Category</label>
                      <select 
                        className="form-control"
                        value={input.title}
                        onChange={(e) => updateForm('title', e.target.value)}
                      >
                        <option value="Mr">Mr.</option>
                        <option value="Mrs">Mrs.</option>
                        <option value="Miss">Miss.</option>
                        <option value="Master">Master. (Male child)</option>
                        <option value="Rare">Rare Title (Dr, Rev, Officer)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Port of Embarkation</label>
                      <select 
                        className="form-control"
                        value={input.embarked}
                        onChange={(e) => updateForm('embarked', e.target.value)}
                      >
                        <option value="C">Cherbourg</option>
                        <option value="Q">Queenstown</option>
                        <option value="S">Southampton</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Siblings / Spouses Aboard</label>
                      <input 
                        type="number" 
                        min="0" 
                        max="8" 
                        className="form-control"
                        value={input.sibsp}
                        onChange={(e) => updateForm('sibsp', Number(e.target.value))}
                      />
                    </div>

                    <div className="form-group">
                      <label>Parents / Children Aboard</label>
                      <input 
                        type="number" 
                        min="0" 
                        max="6" 
                        className="form-control"
                        value={input.parch}
                        onChange={(e) => updateForm('parch', Number(e.target.value))}
                      />
                    </div>

                    <div className="checkbox-row">
                      <input 
                        type="checkbox" 
                        id="has_cabin_cb"
                        checked={input.has_cabin}
                        onChange={(e) => updateForm('has_cabin', e.target.checked)}
                      />
                      <label htmlFor="has_cabin_cb" style={{ cursor: 'pointer', fontSize: '13.5px' }}>Cabin is registered in passenger manifest</label>
                    </div>
                  </div>

                  {/* Real-time Probability Outputs Column */}
                  <div className="sandbox-result-col">
                    {liveResult ? (
                      <>
                        <span className={`sandbox-result-badge ${liveResult.prediction === 1 ? 'survived' : 'died'}`}>
                          {liveResult.label}
                        </span>
                        <h2 className={`sandbox-result-percent ${liveResult.prediction === 1 ? 'survived' : 'died'}`}>
                          {liveResult.probabilityPercent.toFixed(1)}%
                        </h2>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>
                          SURVIVAL PROBABILITY ESTIMATE
                        </span>

                        <div className="sandbox-result-bar">
                          <div 
                            className="sandbox-result-bar-fill" 
                            style={{ 
                              width: `${liveResult.probabilityPercent}%`,
                              backgroundColor: liveResult.prediction === 1 ? 'var(--color-success)' : 'var(--color-danger)'
                            }}
                          />
                        </div>

                        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '20px' }}>
                          Calculated using the standard sigmoid function: 
                          <code style={{ display: 'block', margin: '4px 0', fontSize: '12px' }}>P = 1 / (1 + e^-z)</code>
                          where the log-odds logit <code style={{ fontSize: '12px' }}>z = {liveResult.probability >= 0.5 ? '' : '-'}{Math.abs(Math.log(liveResult.probability / (1 - liveResult.probability))).toFixed(3)}</code>.
                        </p>

                        <div className="sandbox-actions">
                          <button className="btn btn-primary" onClick={copyPythonCode} style={{ width: '100%', justifyContent: 'center' }}>
                            <i className="fa-solid fa-copy"></i>
                            <span>{copied ? 'Copied Python script!' : 'Copy Colab Test Script'}</span>
                          </button>
                          <a href={activeLinks.colab} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                            <i className="fa-solid fa-play"></i>
                            <span>Run Notebook in Colab</span>
                          </a>
                        </div>
                        <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '12px', lineHeight: '1.4' }}>
                          💡 <strong>Tip:</strong> Copy the script first, open the notebook in Colab, and paste it into the custom sandbox cell at the very end to run!
                        </p>
                      </>
                    ) : (
                      <p>Loading predictor weights...</p>
                    )}
                  </div>

                </div>
              </section>

              {/* Launch Colab Banner Bottom */}
              <div style={{ padding: '32px', background: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)', textAlign: 'center', marginTop: '40px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '10px' }}>Ready to run the code cells?</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', marginBottom: '20px' }}>
                  Launch the companion notebook directly in Google Colab, install packages, and verify the model coefficients in your own Python session.
                </p>
                <a href={activeLinks.colab} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '15px' }}>
                  <i className="fa-solid fa-play"></i> Open Google Colab Notebook
                </a>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* App Footer */}
      <footer className="app-footer" style={{ marginTop: '60px', padding: '30px 24px', borderTop: '1px solid var(--border-color)', backgroundColor: '#ffffff' }}>
        <div className="footer-container" style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div className="footer-links" style={{ display: 'flex', gap: '20px', fontSize: '14px' }}>
            <a href={activeLinks.colab} target="_blank" rel="noreferrer"><i className="fa-solid fa-play"></i> Google Colab</a>
            <a href={activeLinks.github} target="_blank" rel="noreferrer"><i className="fa-brands fa-github"></i> GitHub</a>
            <a href={activeLinks.github} target="_blank" rel="noreferrer"><i className="fa-solid fa-code"></i> IPYNB Source</a>
          </div>
          <p className="footer-text" style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            From Data to Discovery — Titanic ML Companion • Built with React & Vite
          </p>
        </div>
      </footer>
    </div>
  );
}
