import { useState, useEffect, useMemo, useRef } from 'react';
import { links, validatedResult } from './data/projectContent.js';
import { kaggleSteps } from './data/kaggleSteps.js';
import { notebookSteps } from './data/notebookSteps.js';
import { tfdfSteps } from './data/tfdfSteps.js';
import { modelProgressNotes, previousModelMetrics, workflowProgress } from './data/modelComparisonHistory.js';
import AssignmentPage from './components/AssignmentPage.jsx';
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
        return ['intro', 'setup', 'loading', 'cleaning', 'missing', 'eda', 'statistics', 'engineering', 'imputation', 'split', 'pipeline', 'training', 'evaluation', 'diagram', 'odds', 'submission', 'relevance', 'mindset', 'reflection'];
      } else {
        return ['setup', 'exploration', 'features', 'validation', 'training', 'evaluation', 'extensions', 'export'];
      }
    } else {
      return ['intro', 'setup', 'loading', 'cleaning', 'missing', 'eda', 'engineering', 'imputation', 'split', 'pipeline', 'training', 'evaluation', 'diagram', 'odds', 'relevance', 'mindset', 'reflection'];
    }
  }, [activeWorkflow, activeKaggleSubTab]);

  // Sidebar list configurations
  const kaggleSidebarItems = [
    { id: 'intro', name: 'Introduction', icon: 'fa-book-open' },
    { id: 'setup', name: '1. Setup & Environment', icon: 'fa-gears' },
    { id: 'loading', name: '2. Data Ingestion', icon: 'fa-file-csv' },
    { id: 'cleaning', name: '3. Cleaning & Leakage', icon: 'fa-broom' },
    { id: 'missing', name: '4. Missing Values', icon: 'fa-magnifying-glass-chart' },
    { id: 'eda', name: '5. Exploratory Analysis', icon: 'fa-chart-simple' },
    { id: 'statistics', name: '6. Statistics Exercise', icon: 'fa-square-root-variable' },
    { id: 'engineering', name: '7. Feature Engineering', icon: 'fa-flask' },
    { id: 'imputation', name: '8. Custom Imputation', icon: 'fa-user-pen' },
    { id: 'split', name: '9. Train / Test Split', icon: 'fa-scissors' },
    { id: 'pipeline', name: '10. Preprocessing Pipeline', icon: 'fa-diagram-project' },
    { id: 'training', name: '11. GridSearchCV Search', icon: 'fa-gear' },
    { id: 'evaluation', name: '12. Evaluation & ROC', icon: 'fa-square-poll-vertical' },
    { id: 'diagram', name: '13. Pipeline Diagram', icon: 'fa-code-branch' },
    { id: 'odds', name: '14. Log-Odds Coefficients', icon: 'fa-scale-balanced' },
    { id: 'submission', name: '15. Kaggle Submission', icon: 'fa-circle-check' },
    { id: 'relevance', name: '16. Economic Relevance', icon: 'fa-handshake' },
    { id: 'mindset', name: '17. Data Science Mindset', icon: 'fa-brain' },
    { id: 'reflection', name: '18. Final Reflection', icon: 'fa-lightbulb' },
  ];

  const tfdfSidebarItems = [
    { id: 'setup', name: '1. Python & Data Audit', icon: 'fa-gears' },
    { id: 'exploration', name: '2. Visualization & Stats', icon: 'fa-chart-simple' },
    { id: 'features', name: '3. Safe Preprocessing', icon: 'fa-flask' },
    { id: 'validation', name: '4. Validation Design', icon: 'fa-shield-halved' },
    { id: 'training', name: '5. Model Training', icon: 'fa-tree' },
    { id: 'evaluation', name: '6. Model Evaluation', icon: 'fa-square-poll-vertical' },
    { id: 'extensions', name: '7. ML Extensions', icon: 'fa-diagram-project' },
    { id: 'export', name: '8. Refit & Export', icon: 'fa-circle-check' },
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

  // Comparison Modal state
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const openAssignment = () => {
    setShowAssignmentModal(true);
  };

  const closeAssignment = () => {
    setShowAssignmentModal(false);
    if (window.location.hash === '#assignment') {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  };

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

  const [model, setModel] = useState(null);

  // Model comparisons loaded dynamically
  const [modelComparisons, setModelComparisons] = useState([]);
  const [compError, setCompError] = useState('');
  const [expandedModel, setExpandedModel] = useState(null);

  // Fetch model weights and metrics
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}assets/model/titanic_logistic_model.json`)
      .then((response) => {
        if (!response.ok) throw new Error('Model JSON could not be loaded.');
        return response.json();
      })
      .then((data) => setModel(data))
      .catch(() => setModel(null));

    fetch(`${import.meta.env.BASE_URL}assets/data/model_comparison.json`)
      .then((res) => {
        if (!res.ok) throw new Error('Could not load comparison metrics.');
        return res.json();
      })
      .then((data) => setModelComparisons(data))
      .catch((err) => setCompError(err.message));
  }, []);

  useEffect(() => {
    if (!expandedModel) return;
    requestAnimationFrame(() => {
      document.getElementById('model-progress-panel')?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    });
  }, [expandedModel]);

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

  useEffect(() => {
    const syncAssignmentHash = () => {
      if (window.location.hash === '#assignment') {
        setShowAssignmentModal(true);
      }
    };

    syncAssignmentHash();
    window.addEventListener('hashchange', syncAssignmentHash);
    return () => window.removeEventListener('hashchange', syncAssignmentHash);
  }, []);

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
          github: 'https://github.com/sid0sid-ops/titanic-data-to-discovery/blob/main/notebooks/01_Titanic_Model_Comparison_Project.ipynb',
          colab: 'https://colab.research.google.com/github/sid0sid-ops/titanic-data-to-discovery/blob/main/notebooks/01_Titanic_Model_Comparison_Project.ipynb'
        };
      }
    } else {
      return {
        github: 'https://github.com/sid0sid-ops/titanic-data-to-discovery/blob/main/notebooks/02_Titanic_OpenML_Reference_Workflow.ipynb',
        colab: 'https://colab.research.google.com/github/sid0sid-ops/titanic-data-to-discovery/blob/main/notebooks/02_Titanic_OpenML_Reference_Workflow.ipynb'
      };
    }
  }, [activeWorkflow, activeKaggleSubTab]);

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
    { id: 'statistics_correlation', name: 'Statistics Correlation Heatmap', file: 'assets/plots/openml_statistics_correlation.png', desc: 'Correlation heatmap of selected features from the Statistics for ML module.' },
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
    { id: 'embarked_survival', name: 'Port of Embarkation', file: 'embarked_survival.png', desc: 'Survival distribution by embarkation port.' },
    { id: 'cabin_known_survival', name: 'Cabin Records', file: 'cabin_known_survival.png', desc: 'Comparison of survival rates for passengers with registered cabins.' },
    { id: 'title_survival', name: 'Title Groupings', file: 'title_survival.png', desc: 'Survival rates mapped against engineered passenger titles.' },
    { id: 'statistics_correlation', name: 'Statistics Correlation Heatmap', file: 'kaggle_statistics_correlation.png', desc: 'Correlation heatmap of selected features from the Statistics for ML module.' },
    { id: 'confusion_matrix', name: 'Confusion Matrix', file: 'confusion_matrix.png', desc: 'Confusion matrix of actual vs. predicted classifications for the best Kaggle model.' },
    { id: 'feature_importance', name: 'Feature Importance', file: 'feature_importance.png', desc: 'Feature importances showing the influence weights of different features.' }
  ];

  const activeKPlot = kagglePlots.find(p => p.id === activeKagglePlot) || kagglePlots[0];

  const renderPlotGallery = () => {
    const isKaggle = activeWorkflow === 'kaggle';
    const plotsList = isKaggle ? kagglePlots : plotTabs;
    const activeId = isKaggle ? activeKagglePlot : activePlotTab;
    const setActive = isKaggle ? setActiveKagglePlot : setActivePlotTab;
    const scrollRef = isKaggle ? kagglePlotTabsRef : plotTabsRef;
    const activeItem = plotsList.find(p => p.id === activeId) || plotsList[0];

    const getPlotSrc = (file) => {
      if (file.startsWith('assets/')) {
        return `${import.meta.env.BASE_URL}${file}`;
      }
      return `${import.meta.env.BASE_URL}assets/plots/${file}`;
    };

    return (
      <div className="plot-viewer-card" style={{ marginTop: '30px' }}>
        <div className="plot-tabs-wrapper">
          <button 
            className="plot-scroll-btn left" 
            onClick={() => scrollPlotTabs(scrollRef, 'left')}
            title="Scroll Left"
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          
          <div className="plot-tabs" ref={scrollRef}>
            {plotsList.map(p => (
              <button
                key={p.id}
                onClick={() => setActive(p.id)}
                className={`plot-tab-btn ${activeId === p.id ? 'active' : ''}`}
              >
                {p.name}
              </button>
            ))}
          </div>

          <button 
            className="plot-scroll-btn right" 
            onClick={() => scrollPlotTabs(scrollRef, 'right')}
            title="Scroll Right"
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
        <div className="plot-content" style={{ padding: '20px', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '8px', marginTop: '12px' }}>
          <div style={{ textAlign: 'center' }}>
            <img
              src={getPlotSrc(activeItem.file)}
              alt={activeItem.name}
              style={{ maxWidth: '100%', height: 'auto', maxHeight: '380px', objectFit: 'contain', borderRadius: '4px' }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div style={{ display: 'none', flexDirection: 'column', alignItems: 'center', color: 'var(--text-muted)', padding: '20px' }}>
              <i className="fa-solid fa-chart-line" style={{ fontSize: '48px', marginBottom: '10px' }}></i>
              <span>Plot image missing. Run python script to generate visuals first.</span>
            </div>
          </div>
          <p className="plot-caption" style={{ marginTop: '12px', fontSize: '14.5px', color: 'var(--text-secondary)' }}>
            <strong>{activeItem.name}:</strong> {activeItem.desc || activeItem.interpretation}
          </p>
        </div>
      </div>
    );
  };

  const renderPipelineDiagram = () => {
    return (
      <div className="cell-output" style={{ maxHeight: 'none', backgroundColor: '#ffffff', marginTop: '20px' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '12px' }}>
          <i className="fa-solid fa-cubes"></i> Scikit-Learn Pipeline Diagram from 00_Titanic_Kaggle_Main_Workflow.ipynb
        </div>
        
        <div className="pipeline-diagram">
          <div className="pipeline-step">
            <div className="pipeline-node">
              <div className="node-type">Pipeline Step 1</div>
              <div className="node-name">group_age_imputer: GroupMedianAgeImputer</div>
              <details className="node-details">
                <summary>Parameters</summary>
                <div><code>age_col="age"</code></div>
                <div><code>group_cols=("pclass", "sex")</code></div>
                <div>Fills missing ages with fitted group medians, falling back to the global median.</div>
              </details>
            </div>
          </div>
          
          <div className="pipeline-arrow-down">
            <i className="fa-solid fa-arrow-down-long"></i>
          </div>
          
          <div className="pipeline-step">
            <div className="pipeline-node">
              <div className="node-type">Pipeline Step 2</div>
              <div className="node-name">feature_engineer: TitanicFeatureEngineer</div>
              <details className="node-details">
                <summary>Transformations</summary>
                <div>Creates <code>family_size</code>, <code>is_alone</code>, <code>title</code>, and <code>has_cabin</code>.</div>
                <div>Drops raw/leakage columns when present: <code>passengerid</code>, <code>name</code>, <code>ticket</code>, <code>cabin</code>, <code>boat</code>, <code>body</code>, <code>home_dest</code>.</div>
              </details>
            </div>
          </div>
          
          <div className="pipeline-arrow-down">
            <i className="fa-solid fa-arrow-down-long"></i>
          </div>
          
          <div className="pipeline-step" style={{ maxWidth: '640px' }}>
            <div className="pipeline-node" style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
              <div className="node-type" style={{ color: 'var(--color-primary)' }}>Pipeline Step 3</div>
              <div className="node-name">preprocess: ColumnTransformer</div>
              <details className="node-details">
                <summary>Transformer branches</summary>
                <div><code>num</code>: numeric pipeline over age, sibsp, parch, fare, family_size.</div>
                <div><code>cat</code>: categorical pipeline over pclass, sex, embarked, is_alone, title, has_cabin.</div>
              </details>
            </div>
            
            <div className="pipeline-split-container">
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
          
          <div className="pipeline-step">
            <div className="pipeline-node" style={{ backgroundColor: '#e0f2fe', borderColor: '#7dd3fc' }}>
              <div className="node-type" style={{ color: '#0369a1' }}>Pipeline Step 4</div>
              <div className="node-name">classifier: LogisticRegression(C=1.0)</div>
              <details className="node-details">
                <summary>Fitted estimator</summary>
                <div><code>max_iter=1000</code></div>
                <div><code>solver="liblinear"</code></div>
                <div><code>random_state=42</code></div>
                <div><code>C=1.0</code> selected by GridSearchCV from <code>[0.1, 1.0, 10.0]</code>.</div>
              </details>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCoefficientsTable = () => {
    return (
      <div className="coef-table-container" style={{ marginTop: '20px' }}>
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
                <td>Model Intercept</td>
                <td>{model.intercept.toFixed(4)}</td>
                <td>Baseline constant bias</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const renderComparisonTable = () => {
    const selectedModel = modelComparisons.find(
      (item) => (item.Model || item.model) === expandedModel
    );
    const previousMetrics = expandedModel ? previousModelMetrics[expandedModel] : null;

    const currentMetric = (key, fallback = 0) => selectedModel?.[key] ?? fallback;
    const formatMetric = (value) => Number(value ?? 0).toFixed(4);
    const formatDelta = (current, previous) => {
      if (previous === undefined || previous === null) return 'New';
      const delta = current - previous;
      return `${delta >= 0 ? '+' : ''}${delta.toFixed(4)}`;
    };

    const progressMetrics = selectedModel ? [
      {
        label: 'Accuracy',
        before: previousMetrics?.accuracy,
        after: currentMetric('Holdout Accuracy', selectedModel.Accuracy),
      },
      {
        label: 'Precision',
        before: previousMetrics?.precision,
        after: currentMetric('Precision', selectedModel.precision),
      },
      {
        label: 'Recall',
        before: previousMetrics?.recall,
        after: currentMetric('Recall', selectedModel.recall),
      },
      {
        label: 'F1',
        before: previousMetrics?.f1,
        after: currentMetric('F1', selectedModel.f1),
      },
      {
        label: 'ROC-AUC',
        before: previousMetrics?.rocAuc,
        after: currentMetric('Holdout ROC-AUC', selectedModel['ROC-AUC'] ?? selectedModel.roc_auc),
      },
    ] : [];

    return (
      <div className="comparison-module" style={{ marginTop: '30px' }}>
        <div className="insight-box" style={{ marginBottom: '14px' }}>
          <strong>Validated Colab run:</strong> Generated on June 24, 2026 from the leakage-safe workflow. Selection uses training CV ROC-AUC; holdout metrics are reported for final comparison.
        </div>
        {compError ? (
          <div style={{ padding: '10px', backgroundColor: '#fee2e2', color: '#b91c1c', fontSize: '13px', borderRadius: '4px', marginBottom: '10px' }}>
            Loading saved reference metrics failed.
          </div>
        ) : null}
        <p className="comparison-scroll-hint">
          <i className="fa-solid fa-arrows-left-right" aria-hidden="true"></i>
          Scroll horizontally for all metrics. Select a model to view its progress.
        </p>
        <div className="comparison-table-wrap" tabIndex="0" aria-label="Scrollable model comparison table">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Model</th>
                <th>CV ROC-AUC</th>
                <th>Holdout Accuracy</th>
                <th>Balanced Accuracy</th>
                <th>Precision</th>
                <th>Recall</th>
                <th>F1 Score</th>
                <th>Holdout ROC-AUC</th>
                <th>Log Loss</th>
              </tr>
            </thead>
            <tbody>
              {modelComparisons.length > 0 ? (
                modelComparisons.map((item) => {
                  const modelName = item.Model || item.model;
                  const isExpanded = expandedModel === modelName;
                  return (
                    <tr key={modelName} className={isExpanded ? 'is-selected' : ''}>
                      <td>
                        <button
                          type="button"
                          className="model-progress-button"
                          aria-expanded={isExpanded}
                          aria-controls="model-progress-panel"
                          onClick={() => setExpandedModel(isExpanded ? null : modelName)}
                        >
                          <span>{modelName}</span>
                          <i className={`fa-solid ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'}`} aria-hidden="true"></i>
                        </button>
                      </td>
                      <td>{formatMetric(item['CV ROC-AUC'] ?? item.CV_Accuracy)}</td>
                      <td>{((item['Holdout Accuracy'] ?? item.Accuracy ?? 0) * 100).toFixed(2)}%</td>
                      <td>{formatMetric(item['Balanced Accuracy'])}</td>
                      <td>{formatMetric(item.Precision ?? item.precision)}</td>
                      <td>{formatMetric(item.Recall ?? item.recall)}</td>
                      <td>{formatMetric(item.F1 ?? item.f1)}</td>
                      <td>{formatMetric(item['Holdout ROC-AUC'] ?? item['ROC-AUC'] ?? item.roc_auc)}</td>
                      <td>{formatMetric(item['Log Loss'])}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9">Loading validated comparison metrics...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {selectedModel && (
          <section id="model-progress-panel" className="model-progress-panel" aria-live="polite">
            <div className="model-progress-header">
              <div>
                <span className="model-progress-eyebrow">Model Progress</span>
                <h3>{expandedModel}</h3>
              </div>
              <button
                type="button"
                className="model-progress-close"
                onClick={() => setExpandedModel(null)}
                aria-label={`Close ${expandedModel} progress`}
              >
                <i className="fa-solid fa-xmark" aria-hidden="true"></i>
              </button>
            </div>

            <p className="model-progress-summary">{modelProgressNotes[expandedModel]}</p>

            <div className="model-progress-metrics">
              {progressMetrics.map((metric) => {
                const delta = metric.before == null ? null : metric.after - metric.before;
                return (
                  <div className="progress-metric" key={metric.label}>
                    <span>{metric.label}</span>
                    <div className="progress-values">
                      <div><small>Before</small><strong>{metric.before == null ? 'Not available' : formatMetric(metric.before)}</strong></div>
                      <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
                      <div><small>Current</small><strong>{formatMetric(metric.after)}</strong></div>
                    </div>
                    <span className={`metric-delta ${delta == null ? 'new' : delta >= 0 ? 'positive' : 'negative'}`}>
                      {formatDelta(metric.after, metric.before)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="model-progress-details">
              <div>
                <h4>What changed in the workflow</h4>
                <ul>
                  {workflowProgress.map((change) => <li key={change}>{change}</li>)}
                </ul>
              </div>
              <div>
                <h4>Current configuration</h4>
                <pre><code>{JSON.stringify(selectedModel.Parameters ?? selectedModel.Best_Params ?? {}, null, 2)}</code></pre>
              </div>
            </div>
          </section>
        )}
      </div>
    );
  };

  const renderStep = (step) => {
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
        
        {step.warningBox && (
          <div className="warning-box" style={{ margin: '20px 0' }}>
            <div className="warning-icon"><i className="fa-solid fa-triangle-exclamation"></i></div>
            <div className="warning-content">
              <h4>{step.warningBox.title}</h4>
              <p>{step.warningBox.text}</p>
            </div>
          </div>
        )}

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

        {/* Special Render: Exploratory Plot Gallery (Step 5) */}
        {step.isGallery && renderPlotGallery()}

        {/* Special Render: Pipeline Diagram (Step 12) */}
        {step.isPipelineDiagram && renderPipelineDiagram()}

        {/* Special Render: Log-Odds Coefficients Table (Step 13) */}
        {step.isCoefficientsTable && renderCoefficientsTable()}

        {/* Special Render: Model Comparison Table (Step 10) */}
        {step.isComparisonTable && renderComparisonTable()}
      </section>
    );
  };

  return (
    <div>
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-logo">
            <i className="fa-solid fa-ship"></i>
            <span>Titanic Companion</span>
          </div>
          
          {/* Desktop Nav Actions */}
          <div className="navbar-actions">
            <a
              href="#assignment"
              onClick={openAssignment}
              className="btn btn-assignment btn-sm"
            >
              <i className="fa-solid fa-graduation-cap"></i>
              <span>Classroom Assignment Submission</span>
            </a>
            <a href={activeLinks.colab} target="_blank" rel="noreferrer" className="btn btn-primary">
              <i className="fa-solid fa-play"></i>
              <span>Run in Google Colab</span>
            </a>
            <a href={activeLinks.github} target="_blank" rel="noreferrer" className="btn btn-secondary">
              <i className="fa-brands fa-github"></i>
              <span>View GitHub</span>
            </a>
          </div>

          {/* Hamburger Menu Toggle (Mobile) */}
          <button 
            className="navbar-hamburger" 
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <i className={`fa-solid ${menuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {menuOpen && (
          <div className="navbar-mobile-menu">
            <a
              href="#assignment"
              onClick={() => {
                openAssignment();
                setMenuOpen(false);
              }} 
              className="btn btn-assignment"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <i className="fa-solid fa-graduation-cap"></i>
              <span>Classroom Assignment Submission</span>
            </a>
            <a 
              href={activeLinks.colab} 
              target="_blank" 
              rel="noreferrer" 
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => setMenuOpen(false)}
            >
              <i className="fa-solid fa-play"></i>
              <span>Run in Google Colab</span>
            </a>
            <a 
              href={activeLinks.github} 
              target="_blank" 
              rel="noreferrer" 
              className="btn btn-secondary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => setMenuOpen(false)}
            >
              <i className="fa-brands fa-github"></i>
              <span>View GitHub</span>
            </a>
          </div>
        )}
      </nav>

      {/* Main Layout Container */}
      <div className="layout-container">
        
        {/* Sticky Table of Contents Sidebar */}
        <aside className="sidebar-sticky">
          
          {/* Dataset Switcher Just Above the Notebook Pipeline Box */}
          <div style={{ marginBottom: '8px', width: '100%' }}>
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
            <div id="workflow-panel-kaggle">
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
                    <i className="fa-solid fa-scale-balanced" style={{ marginRight: '6px' }}></i>
                    Model Comparison Module
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
                      This webpage serves as an educational companion to the main Kaggle notebook (<code style={{ fontSize: '15px', color: 'var(--color-accent)' }}>00_Titanic_Kaggle_Main_Workflow.ipynb</code>). It connects the Day 6 supervised-learning material with the Titanic workflow: labeled data, classification vs regression, train/test evaluation, and model predictions on the standard Kaggle training dataset.
                    </p>
                    <div className="navbar-actions" style={{ justifyContent: 'flex-start' }}>
                      <a href="#assignment" onClick={openAssignment} className="btn btn-assignment">
                        <i className="fa-solid fa-graduation-cap"></i> Classroom Assignment Submission
                      </a>
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
                        <span className="hero-stat-val">2</span>
                        <span className="hero-stat-lbl">Supervised Tasks</span>
                      </div>
                    </div>
                  </section>

                  {/* Render Kaggle Steps dynamically */}
                  {kaggleSteps.map((step) => renderStep(step))}
                </div>
              )}

              {/* RENDER KAGGLE YDF ADVANCED MODEL */}
              {activeKaggleSubTab === 'tfdf' && (
                <div>
                  {/* Hero Banner Section */}
                  <section id="setup" className="hero">
                    <span className="hero-tag">TITANIC MODEL COMPARISON MODULE</span>
                    <h1>Logistic Regression, Decision Tree, Random Forest, YDF, XGBoost, LightGBM, CatBoost, TensorFlow NN</h1>
                    <p className="hero-description">
                      This module uses Python, Pandas, visualization, statistics, leakage-safe preprocessing, supervised learning, and model evaluation to compare linear, neighbor, tree, forest, boosting, YDF, and TensorFlow classifiers on the Titanic Kaggle dataset.
                      <br /><br />
                      Five-fold stratified cross-validation on the training partition selects the algorithm by ROC-AUC. One untouched holdout then reports accuracy, balanced accuracy, precision, recall, F1, ROC-AUC, and log loss. Separate notebook exercises cover Linear Regression, KNN, K-Means clustering, neural networks, and anomaly detection for cyber-security concepts without mixing unlike tasks into the survival leaderboard.
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
                        <span className="hero-stat-val">5</span>
                        <span className="hero-stat-lbl">Stratified CV Folds</span>
                      </div>
                      <div className="hero-stat-card">
                        <span className="hero-stat-val">8</span>
                        <span className="hero-stat-lbl">Evaluation Metrics</span>
                      </div>
                    </div>
                  </section>

                  {/* Render TF-DF Steps dynamically */}
                  {tfdfSteps.map((step) => renderStep(step))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. OPENML DATASET WORKFLOW (RESTORED EXACT STRUCTURE)                     */}
          {/* ========================================================================= */}
          {activeWorkflow === 'openml' && (
            <div id="workflow-panel-openml">
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

              {/* Render OpenML Steps dynamically */}
              {notebookSteps.map((step) => renderStep(step))}

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
            <a href={links.github} target="_blank" rel="noreferrer"><i className="fa-brands fa-github"></i> GitHub</a>
            <a href={activeLinks.github} target="_blank" rel="noreferrer"><i className="fa-solid fa-code"></i> IPYNB Source</a>
          </div>

          <button 
            className="btn-secondary" 
            onClick={() => setShowComparisonModal(true)}
            style={{ 
              fontSize: '13px', 
              padding: '6px 16px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              cursor: 'pointer',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              backgroundColor: '#f8fafc',
              color: 'var(--text-color)',
              fontWeight: '500'
            }}
          >
            <i className="fa-solid fa-code-compare" style={{ color: 'var(--primary-color)' }}></i> Side-by-Side Comparison
          </button>

          <p className="footer-text" style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            From Data to Discovery — Titanic ML Companion • Built with React & Vite
          </p>
        </div>
      </footer>

      {showComparisonModal && (
        <div 
          className="modal-overlay" 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            backgroundColor: 'rgba(15, 23, 42, 0.6)', 
            backdropFilter: 'blur(8px)', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            zIndex: 9999, 
            padding: '20px' 
          }}
          onClick={() => setShowComparisonModal(false)}
        >
          <div 
            className="modal-card" 
            style={{ 
              backgroundColor: '#ffffff', 
              borderRadius: '16px', 
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', 
              width: '100%', 
              maxWidth: '960px', 
              maxHeight: '90vh', 
              overflowY: 'auto', 
              position: 'relative', 
              display: 'flex', 
              flexDirection: 'column' 
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-code-compare" style={{ color: 'var(--primary-color)' }}></i> Side-by-Side Workflow Comparison
              </h3>
              <button 
                onClick={() => setShowComparisonModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6' }}>
                Compare how the main Kaggle notebook and the OpenML reference notebook structure the Titanic workflow. Model benchmark tables are kept inside the dedicated Model Comparison Module.
              </p>

              <div style={{ overflowX: 'auto' }}>
                <table className="comparison-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-color)' }}>
                      <th style={{ padding: '12px 8px', fontWeight: '600' }}>Pipeline Step / Component</th>
                      <th style={{ padding: '12px 8px', fontWeight: '600' }}>00: Kaggle Main Workflow</th>
                      <th style={{ padding: '12px 8px', fontWeight: '600' }}>02: OpenML Reference Workflow</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 8px', fontWeight: '600' }}>1. Setup & Environment</td>
                      <td style={{ padding: '12px 8px' }}>Kaggle files, pandas, NumPy, Seaborn, Matplotlib, and Scikit-Learn</td>
                      <td style={{ padding: '12px 8px' }}>OpenML export, pandas, Seaborn, Matplotlib, and Scikit-Learn</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 8px', fontWeight: '600' }}>2. Dataset Ingestion</td>
                      <td style={{ padding: '12px 8px' }}>Loads <code>train.csv</code> and <code>test.csv</code> for Kaggle submission</td>
                      <td style={{ padding: '12px 8px' }}>Loads the combined OpenML Titanic reference dataset</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 8px', fontWeight: '600' }}>3. Column Cleaning</td>
                      <td style={{ padding: '12px 8px' }}>Standardizes names, audits leakage columns, and prepares train/test schemas</td>
                      <td style={{ padding: '12px 8px' }}>Standardizes names and prepares one local modeling dataset</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 8px', fontWeight: '600' }}>4. Missing Values</td>
                      <td style={{ padding: '12px 8px' }}>Audits missing values before custom group age imputation</td>
                      <td style={{ padding: '12px 8px' }}>Audits missing values inside the OpenML reference data</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 8px', fontWeight: '600' }}>5. Data Visualization</td>
                      <td style={{ padding: '12px 8px' }}>Explores survival, class, gender, fare, age, and related Titanic patterns</td>
                      <td style={{ padding: '12px 8px' }}>Explores the same concepts using the OpenML schema</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 8px', fontWeight: '600' }}>6. Statistics Exercise</td>
                      <td style={{ padding: '12px 8px' }}>Includes descriptive statistics, variance, correlation, hypothesis testing, and regression practice</td>
                      <td style={{ padding: '12px 8px' }}><em>Not included as a separate classroom exercise</em></td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 8px', fontWeight: '600' }}>7. Feature Engineering</td>
                      <td style={{ padding: '12px 8px' }}>Builds <code>family_size</code>, <code>is_alone</code>, <code>title</code>, and <code>has_cabin</code></td>
                      <td style={{ padding: '12px 8px' }}>Uses matching engineered Titanic features for reference modeling</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 8px', fontWeight: '600' }}>8. Preprocessing Pipeline</td>
                      <td style={{ padding: '12px 8px' }}>Runs custom age imputation, feature engineering, column transformation, and Logistic Regression</td>
                      <td style={{ padding: '12px 8px' }}>Runs the OpenML preprocessing and Logistic Regression reference pipeline</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 8px', fontWeight: '600' }}>9. Output</td>
                      <td style={{ padding: '12px 8px' }}>Exports a Kaggle submission CSV after validation</td>
                      <td style={{ padding: '12px 8px' }}>Reports local reference metrics only</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', backgroundColor: '#f8fafc', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowComparisonModal(false)}
                style={{ padding: '8px 16px', fontSize: '14px', cursor: 'pointer' }}
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}

      {showAssignmentModal && (
        <div 
          className="modal-overlay" 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            backgroundColor: 'rgba(15, 23, 42, 0.6)', 
            backdropFilter: 'blur(8px)', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            zIndex: 9999, 
            padding: '20px' 
          }}
          onClick={closeAssignment}
        >
          <div 
            className="modal-card" 
            style={{ 
              backgroundColor: '#ffffff', 
              borderRadius: '16px', 
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', 
              width: '100%', 
              maxWidth: '850px', 
              maxHeight: '90vh', 
              overflowY: 'auto', 
              position: 'relative', 
              display: 'flex', 
              flexDirection: 'column' 
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-graduation-cap" style={{ color: 'var(--color-success)' }}></i> Classroom Assignment Submission
              </h3>
              <button 
                onClick={closeAssignment}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-muted)' }}
                aria-label="Close modal"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Modal Body */}
            <AssignmentPage />

          </div>
        </div>
      )}
    </div>
  );
}
