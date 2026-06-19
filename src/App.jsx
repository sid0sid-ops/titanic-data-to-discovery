import { useState, useEffect, useMemo, useRef } from 'react';
import { preparePassenger, predictPassenger, buildColabPassengerCode } from './utils/titanicPredictor.js';
import { links, validatedResult } from './data/projectContent.js';
import { kaggleSteps } from './data/kaggleSteps.js';
import { notebookSteps } from './data/notebookSteps.js';
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
        return ['intro', 'setup', 'loading', 'cleaning', 'missing', 'eda', 'engineering', 'imputation', 'split', 'pipeline', 'training', 'evaluation', 'diagram', 'odds', 'relevance', 'mindset', 'reflection', 'predictor', 'submission'];
      } else {
        return ['setup', 'loading', 'features', 'training', 'tuning'];
      }
    } else {
      return ['intro', 'setup', 'loading', 'cleaning', 'missing', 'eda', 'engineering', 'imputation', 'split', 'pipeline', 'training', 'evaluation', 'diagram', 'odds', 'relevance', 'mindset', 'reflection', 'predictor'];
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
    { id: 'submission', name: '18. Kaggle Submission', icon: 'fa-circle-check' },
  ];

  const tfdfSidebarItems = [
    { id: 'setup', name: '1. Setup & Environment', icon: 'fa-gears' },
    { id: 'loading', name: '2. Data Ingestion', icon: 'fa-file-csv' },
    { id: 'features', name: '3. Advanced Preprocessing', icon: 'fa-flask' },
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

  // Comparison Modal state
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [comparisonTab, setComparisonTab] = useState('datasets');
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
          <i className="fa-solid fa-cubes"></i> Scikit-Learn Interactive Diagram (Hover blocks for parameters)
        </div>
        
        <div className="pipeline-diagram">
          <div className="pipeline-step">
            <div className="pipeline-node">
              <div className="node-type">Step 1: Custom Group Imputer</div>
              <div className="node-name">group_age_imputer: GroupMedianAgeImputer</div>
              <div className="node-details">
                Calculates median ages grouped by passenger class (pclass) and gender (sex) to perform demographic-specific imputation.
              </div>
            </div>
          </div>
          
          <div className="pipeline-arrow-down">
            <i className="fa-solid fa-arrow-down-long"></i>
          </div>
          
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
          
          <div className="pipeline-step" style={{ maxWidth: '640px' }}>
            <div className="pipeline-node" style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
              <div className="node-type" style={{ color: 'var(--color-primary)' }}>Step 3: Column Partitioning</div>
              <div className="node-name">preprocess: ColumnTransformer</div>
              <div className="node-details">
                Routes columns dynamically to numeric or categorical sub-pipelines based on data types.
              </div>
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
              <div className="node-type" style={{ color: '#0369a1' }}>Step 4: Optimal Estimator Classifier</div>
              <div className="node-name">classifier: LogisticRegression</div>
              <div className="node-details">
                Optimal hyperparameter C selected via GridSearchCV. Out-performs Random Forest estimators in CV score.
              </div>
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

  const renderSandboxPredictor = () => {
    return (
      <div className="sandbox-card" style={{ marginTop: '20px', padding: '24px', backgroundColor: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', marginBottom: '24px' }}>
          Test how the notebook's trained model parameters calculate predictions in real-time. Modify the passenger attributes below to see the local JS log-odds inference instantly.
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
                High risk group. Negative coefficients for male sex, Mr title, and class 3 status heavily depress survival odds.
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
                High survival rate. Positive coefficients for has_cabin, Mrs title, and female sex increase survival odds.
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
      </div>
    );
  };

  const renderComparisonTable = () => {
    return (
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
              <th>CV Accuracy (Model Search)</th>
              <th>Holdout Accuracy (Test)</th>
              <th>Precision</th>
              <th>Recall</th>
              <th>F1 Score</th>
              <th>ROC-AUC</th>
              <th>GridSearchCV Hyperparameters</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {modelComparisons.length > 0 ? (
              modelComparisons.map((item, idx) => (
                <tr key={idx}>
                  <td><strong>{item.Model || item.model}</strong></td>
                  <td>{item.CV_Accuracy ? (item.CV_Accuracy * 100).toFixed(2) + '%' : 'N/A'}</td>
                  <td>{(item.Accuracy ? (item.Accuracy * 100).toFixed(2) + '%' : '0.00%')}</td>
                  <td>{(item.Precision || item.precision || 0).toFixed(4)}</td>
                  <td>{(item.Recall || item.recall || 0).toFixed(4)}</td>
                  <td>{(item.F1 || item.f1 || 0).toFixed(4)}</td>
                  <td>{(item["ROC-AUC"] || item.roc_auc || 0).toFixed(4)}</td>
                  <td><code>{item.Best_Params || 'None'}</code></td>
                  <td>{item.Notes || item.notes}</td>
                </tr>
              ))
            ) : (
              <>
                <tr>
                  <td><strong>Logistic Regression</strong></td>
                  <td>84.28%</td>
                  <td>77.65%</td>
                  <td>0.7385</td>
                  <td>0.6957</td>
                  <td>0.7164</td>
                  <td>0.8342</td>
                  <td><code>C=0.1</code></td>
                  <td>Baseline linear classifier.</td>
                </tr>
                <tr>
                  <td><strong>Random Forest</strong></td>
                  <td>84.70%</td>
                  <td>81.56%</td>
                  <td>0.8103</td>
                  <td>0.6812</td>
                  <td>0.7402</td>
                  <td>0.8659</td>
                  <td><code>max_depth=8, n_estimators=50</code></td>
                  <td>Robust ensemble.</td>
                </tr>
              </>
            )}
          </tbody>
        </table>
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

        {/* Special Render: Sandbox Predictor (Step 17) */}
        {step.isSandboxPredictor && renderSandboxPredictor()}

        {/* Special Render: Model Comparison Table (Step 10) */}
        {step.isComparisonTable && renderComparisonTable()}
      </section>
    );
  };

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
            <i className="fa-solid fa-ship"></i>
            <span>Titanic Companion</span>
          </div>
          
          {/* Desktop Nav Actions */}
          <div className="navbar-actions">
            <button 
              onClick={() => setShowAssignmentModal(true)} 
              className="btn btn-assignment btn-sm"
            >
              <i className="fa-solid fa-graduation-cap"></i>
              <span>Assignment</span>
            </button>
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
            <button 
              onClick={() => {
                setShowAssignmentModal(true);
                setMenuOpen(false);
              }} 
              className="btn btn-assignment"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <i className="fa-solid fa-graduation-cap"></i>
              <span>Assignment</span>
            </button>
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
                    <i className="fa-solid fa-scale-balanced" style={{ marginRight: '6px' }}></i>
                    Model Comparison
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
                  {kaggleSteps.map((step) => renderStep(step))}
                </div>
              )}

              {/* RENDER KAGGLE YDF ADVANCED MODEL */}
              {activeKaggleSubTab === 'tfdf' && (
                <div>
                  {/* Hero Banner Section */}
                  <section id="setup" className="hero">
                    <span className="hero-tag">TITANIC MODEL COMPARISON PROJECT</span>
                    <h1>Logistic Regression, Decision Tree, Random Forest, YDF, XGBoost, LightGBM, CatBoost, TensorFlow NN</h1>
                    <p className="hero-description">
                      I compared multiple machine learning models on the Titanic Kaggle dataset to observe how different algorithms affect survival prediction. I used Logistic Regression as a simple baseline, Decision Tree and Random Forest as tree-based models, YDF as a modern decision forest framework, XGBoost, LightGBM, and CatBoost as advanced gradient boosting models, and a TensorFlow deep learning neural network.
                      <br /><br />
                      All models were trained and tested on the same train-validation split to make the comparison fair. I evaluated them using accuracy, precision, recall, F1 score, and ROC-AUC. The best model was selected based on validation performance and then used to generate predictions for the Kaggle test dataset.
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
                  {tfdfSteps.map((step) => renderStep(step))}
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
            <a href={activeLinks.github} target="_blank" rel="noreferrer"><i className="fa-brands fa-github"></i> GitHub</a>
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
                Compare workflow datasets or machine learning algorithms side-by-side. Toggle between the tabs to view the different comparison scopes.
              </p>

              {/* Tab Switcher */}
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', gap: '16px', paddingBottom: '2px', marginBottom: '12px' }}>
                <button
                  onClick={() => setComparisonTab('datasets')}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    background: 'none',
                    borderBottom: comparisonTab === 'datasets' ? '2.5px solid var(--primary-color)' : '2.5px solid transparent',
                    fontWeight: comparisonTab === 'datasets' ? '600' : '500',
                    color: comparisonTab === 'datasets' ? 'var(--primary-color)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    paddingBottom: '10px'
                  }}
                >
                  <i className="fa-solid fa-database"></i> Dataset Comparison (Same Models, Different Data)
                </button>
                <button
                  onClick={() => setComparisonTab('algorithms')}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    background: 'none',
                    borderBottom: comparisonTab === 'algorithms' ? '2.5px solid var(--primary-color)' : '2.5px solid transparent',
                    fontWeight: comparisonTab === 'algorithms' ? '600' : '500',
                    color: comparisonTab === 'algorithms' ? 'var(--primary-color)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    paddingBottom: '10px'
                  }}
                >
                  <i className="fa-solid fa-microchip"></i> Algorithm Comparison (Kaggle Dataset)
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                {comparisonTab === 'datasets' ? (
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
                        <td style={{ padding: '12px 8px' }}>Seaborn + Plotly Express</td>
                        <td style={{ padding: '12px 8px' }}>Seaborn (Matplotlib)</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '12px 8px', fontWeight: '600' }}>2. Dataset Ingestion</td>
                        <td style={{ padding: '12px 8px' }}>Ingests <code>train.csv</code> + <code>test.csv</code> (891 / 418 rows)</td>
                        <td style={{ padding: '12px 8px' }}>Ingests <code>openml_titanic.csv</code> (1,309 rows)</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '12px 8px', fontWeight: '600' }}>3. Column Cleaning</td>
                        <td style={{ padding: '12px 8px' }}>Lowercase columns + simplify schema</td>
                        <td style={{ padding: '12px 8px' }}>Lowercase columns + simplify schema</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '12px 8px', fontWeight: '600' }}>5. Data Visualization</td>
                        <td style={{ padding: '12px 8px' }}>16 static plots + 4 Plotly interactive charts</td>
                        <td style={{ padding: '12px 8px' }}>8 static Seaborn plots</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '12px 8px', fontWeight: '600' }}>6. Feature Engineering</td>
                        <td style={{ padding: '12px 8px' }}>Custom <code>TitanicFeatureEngineer</code></td>
                        <td style={{ padding: '12px 8px' }}>Custom <code>TitanicFeatureEngineer</code></td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '12px 8px', fontWeight: '600' }}>7. Missing Values</td>
                        <td style={{ padding: '12px 8px' }}>Custom <code>GroupMedianAgeImputer</code></td>
                        <td style={{ padding: '12px 8px' }}>Custom <code>GroupMedianAgeImputer</code></td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '12px 8px', fontWeight: '600' }}>10. GridSearchCV</td>
                        <td style={{ padding: '12px 8px' }}>Tuned Logistic Regression (Best <code>C=1.0</code>)</td>
                        <td style={{ padding: '12px 8px' }}>Tuned Logistic Regression (Best <code>C=10.0</code>)</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(56, 189, 248, 0.05)' }}>
                        <td style={{ padding: '12px 8px', fontWeight: '600' }}>Model Search Accuracy</td>
                        <td style={{ padding: '12px 8px', color: 'var(--primary-color)', fontWeight: '600' }}>83.01% (CV)</td>
                        <td style={{ padding: '12px 8px', color: 'var(--primary-color)', fontWeight: '600' }}>80.42% (CV)</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(16, 185, 129, 0.05)' }}>
                        <td style={{ padding: '12px 8px', fontWeight: '600' }}>Holdout Test Accuracy</td>
                        <td style={{ padding: '12px 8px', color: 'var(--success-color)', fontWeight: '600' }}>81.56% (Holdout)</td>
                        <td style={{ padding: '12px 8px', color: 'var(--success-color)', fontWeight: '600' }}>84.35% (Holdout)</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '12px 8px', fontWeight: '600' }}>18. Predictions Export</td>
                        <td style={{ padding: '12px 8px' }}>Outputs <code>submission_best_classical.csv</code></td>
                        <td style={{ padding: '12px 8px' }}><em>Not applicable (Local metrics only)</em></td>
                      </tr>
                    </tbody>
                  </table>
                ) : (
                  <table className="comparison-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-color)' }}>
                        <th style={{ padding: '10px 6px', fontWeight: '600' }}>Model Name</th>
                        <th style={{ padding: '10px 6px', fontWeight: '600' }}>CV Accuracy</th>
                        <th style={{ padding: '10px 6px', fontWeight: '600' }}>Holdout Accuracy</th>
                        <th style={{ padding: '10px 6px', fontWeight: '600' }}>Precision</th>
                        <th style={{ padding: '10px 6px', fontWeight: '600' }}>Recall</th>
                        <th style={{ padding: '10px 6px', fontWeight: '600' }}>F1 Score</th>
                        <th style={{ padding: '10px 6px', fontWeight: '600' }}>ROC-AUC</th>
                        <th style={{ padding: '10px 6px', fontWeight: '600' }}>GridSearchCV Parameters</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modelComparisons.map((item, idx) => {
                        const isBest = item.Model.includes('YDF Random Forest');
                        return (
                          <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: isBest ? 'rgba(16, 185, 129, 0.05)' : 'transparent' }}>
                            <td style={{ padding: '10px 6px' }}>
                              <strong>{item.Model}</strong>
                              {isBest && (
                                <span style={{ fontSize: '9px', backgroundColor: 'var(--success-color)', color: '#fff', padding: '1px 4px', borderRadius: '3px', marginLeft: '4px' }}>
                                  Best
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '10px 6px', fontWeight: '600' }}>{(item.CV_Accuracy * 100).toFixed(2)}%</td>
                            <td style={{ padding: '10px 6px', fontWeight: '600', color: 'var(--primary-color)' }}>{(item.Accuracy * 100).toFixed(2)}%</td>
                            <td style={{ padding: '10px 6px' }}>{item.Precision.toFixed(4)}</td>
                            <td style={{ padding: '10px 6px' }}>{item.Recall.toFixed(4)}</td>
                            <td style={{ padding: '10px 6px' }}>{item.F1.toFixed(4)}</td>
                            <td style={{ padding: '10px 6px' }}>{item["ROC-AUC"].toFixed(4)}</td>
                            <td style={{ padding: '10px 6px' }}><code>{item.Best_Params}</code></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
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
          onClick={() => setShowAssignmentModal(false)}
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
                onClick={() => setShowAssignmentModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-muted)' }}
                aria-label="Close modal"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', overflowY: 'auto' }}>
              {/* Header Info */}
              <div style={{ padding: '16px', backgroundColor: '#f0fdf4', borderLeft: '4px solid var(--color-success)', borderRadius: '6px', marginBottom: '24px' }}>
                <div style={{ fontWeight: '700', color: '#166534', marginBottom: '4px', fontSize: '15px' }}>
                  📝 Classroom Curriculum Reference: Exploring Statistics in the Titanic Dataset
                </div>
                <div style={{ fontSize: '13px', color: '#166534', lineHeight: '1.4' }}>
                  This page documents your hands-on statistical exercises and final reflection responses for the class assignment on <strong>18 June 2026</strong>. In the future, new questions and updates will be added directly to this view.
                </div>
              </div>

              {/* Five Pillars of Statistics Table */}
              <h4 style={{ margin: '0 0 12px 0', color: 'var(--text-primary)', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-circle-nodes" style={{ color: 'var(--color-primary)' }}></i> The 5 Pillars of Statistical Reasoning in ML
              </h4>
              <div style={{ overflowX: 'auto', marginBottom: '28px' }}>
                <table className="comparison-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid var(--border-color)' }}>
                      <th style={{ padding: '10px 12px', fontWeight: '700' }}>Pillar</th>
                      <th style={{ padding: '10px 12px', fontWeight: '700' }}>Mathematical Concept</th>
                      <th style={{ padding: '10px 12px', fontWeight: '700' }}>Titanic Dataset Value</th>
                      <th style={{ padding: '10px 12px', fontWeight: '700' }}>ML Equivalent</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '10px 12px', fontWeight: '600' }}>Mean & Median</td>
                      <td style={{ padding: '10px 12px' }}>Central tendency measures.</td>
                      <td style={{ padding: '10px 12px' }}>Mean Age = <strong>29.7 years</strong>; Median Fare = <strong>$14.45</strong></td>
                      <td style={{ padding: '10px 12px' }}>Feature Imputation & Balance</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '10px 12px', fontWeight: '600' }}>Variance & Std Dev</td>
                      <td style={{ padding: '10px 12px' }}>Measures of data dispersion.</td>
                      <td style={{ padding: '10px 12px' }}>Fare Std Dev = <strong>$49.69</strong> (reflects wide wealth spread)</td>
                      <td style={{ padding: '10px 12px' }}>Feature Scaling & Z-Normalizer</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '10px 12px', fontWeight: '600' }}>Correlation</td>
                      <td style={{ padding: '10px 12px' }}>Strength of linear relationships.</td>
                      <td style={{ padding: '10px 12px' }}>Sex code vs. Survived = <strong>+0.54</strong> (strongest signal)</td>
                      <td style={{ padding: '10px 12px' }}>Feature Selection & Pruning</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '10px 12px', fontWeight: '600' }}>Hypothesis Testing</td>
                      <td style={{ padding: '10px 12px' }}>Statistical significance check.</td>
                      <td style={{ padding: '10px 12px' }}>Gender difference t-test p-value = <strong>p &lt; 0.001</strong></td>
                      <td style={{ padding: '10px 12px' }}>A/B Testing & Cross Validation</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '10px 12px', fontWeight: '600' }}>Regression</td>
                      <td style={{ padding: '10px 12px' }}>Predictive outcome modeling.</td>
                      <td style={{ padding: '10px 12px' }}>Survival Probability of passenger = <strong>Logistic function</strong></td>
                      <td style={{ padding: '10px 12px' }}>Linear/Logistic Classifier</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Hands-On Coding Exercises */}
              <h4 style={{ margin: '0 0 12px 0', color: 'var(--text-primary)', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-code" style={{ color: 'var(--color-primary)' }}></i> Hands-On Coding Sandbox Outputs
              </h4>
              <div className="sandbox-grid" style={{ gap: '16px', marginBottom: '28px', marginTop: 0 }}>
                <div style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: '#fafafa' }}>
                  <div style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text-primary)', marginBottom: '8px' }}>
                    Part 3: Student's t-Test
                  </div>
                  <pre style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', backgroundColor: '#e2e8f0', padding: '10px', borderRadius: '4px' }}>
                    {`>>> from scipy.stats import ttest_ind
>>> ttest_ind(female_survival, male_survival)
TtestResult(statistic=19.3499, pvalue=3.79e-71, df=889.0)`}
                  </pre>
                  <div style={{ marginTop: '8px', fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    <strong>Interpretation:</strong> Since the p-value is extremely close to 0 ($p \ll 0.05$), the survival rates between genders are statistically different, validating historical lifeboat boarding assumptions.
                  </div>
                </div>

                <div style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: '#fafafa' }}>
                  <div style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text-primary)', marginBottom: '8px' }}>
                    Part 4: Logistic Regression
                  </div>
                  <pre style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', backgroundColor: '#e2e8f0', padding: '10px', borderRadius: '4px' }}>
                    {`>>> custom_passenger = [[25.0, 50.0, 2]]
>>> model.predict_proba(custom_passenger)[:, 1]
array([0.8242]) # ~82.42%`}
                  </pre>
                  <div style={{ marginTop: '8px', fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    <strong>Interpretation:</strong> A 25-year-old passenger traveling in Second Class who paid a $50 fare is predicted by the logistic model to have an <strong>82.42% probability of survival</strong>.
                  </div>
                </div>
              </div>

              {/* Reflection Questions */}
              <h4 style={{ margin: '0 0 12px 0', color: 'var(--text-primary)', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-lightbulb" style={{ color: 'var(--color-primary)' }}></i> Part 5: Classroom Reflection & Discussion
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
                <div style={{ borderLeft: '3px solid var(--color-accent)', paddingLeft: '12px' }}>
                  <div style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-primary)' }}>Q: Which statistical measure gave the most insight?</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Comparing passenger survival rates by gender and class (descriptive stats) along with the correlation heatmap reveals that gender (`sex_code`) is the strongest linear predictor of survival.</div>
                </div>
                <div style={{ borderLeft: '3px solid var(--color-accent)', paddingLeft: '12px' }}>
                  <div style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-primary)' }}>Q: How did hypothesis testing validate your assumptions?</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>The Student's t-test yielded a p-value far smaller than $0.05$ ($3.79 \times 10^{-71}$), which mathematically validated that the differences in survival probabilities between genders were not the result of random chance.</div>
                </div>
                <div style={{ borderLeft: '3px solid var(--color-accent)', paddingLeft: '12px' }}>
                  <div style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-primary)' }}>Q: How does regression connect statistics to ML prediction?</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Regression maps correlation coefficients into parameter weights of a linear equation, showing how statistics converts descriptive metrics (means, covariances) into a predictive log-odds classifier.</div>
                </div>
              </div>

              {/* Main Homework Q&A */}
              <h4 style={{ margin: '0 0 16px 0', color: 'var(--text-primary)', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-circle-question" style={{ color: 'var(--color-success)' }}></i> Assignment Answers: 18 June 2026
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px', position: 'relative' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ display: 'inline-flex', padding: '4px 8px', borderRadius: '4px', backgroundColor: '#e0f2fe', color: '#0369a1', fontSize: '11px', fontWeight: '700' }}>Question 1</span>
                    <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Distractions are dangerous. Elaborate.</strong>
                  </div>
                  <div style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    On the Titanic, wireless operators were distracted by transmitting high-volume private passenger telegrams, causing them to set aside and ignore critical incoming ice warnings from surrounding ships.
                    <br /><br />
                    In Machine Learning, distractions manifest as prioritizing model complexity (e.g. over-parameterized neural networks) or hyperparameter tuning before verifying the integrity of the data. Chasing validation accuracy on a dataset containing <strong>target leakage</strong> or <strong>class representation bias</strong> leads to model failure when confronted with real-world validation sets.
                  </div>
                </div>

                <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px', position: 'relative' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ display: 'inline-flex', padding: '4px 8px', borderRadius: '4px', backgroundColor: '#e0f2fe', color: '#0369a1', fontSize: '11px', fontWeight: '700' }}>Question 2</span>
                    <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Stakeholders should be kept informed. (Yes/No - Explain)</strong>
                  </div>
                  <div style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    <strong>YES.</strong> Delaying clear communications regarding the damage and lack of lifeboats on the Titanic prevented organized boarding, leading to lifeboats being launched half-empty.
                    <br /><br />
                    In Data Science, stakeholders (domain users, business owners, safety engineers) must be informed of a model's prediction boundaries, standard error rates, and failure thresholds. Hiding model uncertainty to project perfect accuracy leads to disastrous failures when decisions are automated on out-of-distribution inputs.
                  </div>
                </div>

                <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px', position: 'relative' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ display: 'inline-flex', padding: '4px 8px', borderRadius: '4px', backgroundColor: '#e0f2fe', color: '#0369a1', fontSize: '11px', fontWeight: '700' }}>Question 3</span>
                    <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Traceability is essential. What do you think?</strong>
                  </div>
                  <div style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    <strong>Traceability is absolutely essential.</strong> The absence of trace records for cabin allocations, communication receipts, and exact lifeboat logs made post-accident audits highly challenging.
                    <br /><br />
                    For Machine Learning workflows, traceability means logging data lineage, pipeline definitions, random seeds, and specific model weights. If a deployed classifier makes an unfair or biased decision, engineers must be able to trace that output back to the specific training data sample and preprocessing configuration that caused it.
                  </div>
                </div>

                <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px', position: 'relative' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ display: 'inline-flex', padding: '4px 8px', borderRadius: '4px', backgroundColor: '#e0f2fe', color: '#0369a1', fontSize: '11px', fontWeight: '700' }}>Question 4</span>
                    <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Documentation may have lasting benefits. True or False? Explain.</strong>
                  </div>
                  <div style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    <strong>TRUE.</strong> The extensive records and testimonies compiled by the American and British inquiries established safety policies (the International Ice Patrol, continuous radio watches, lifeboat capacities mapped to passenger count) that have protected ships for over a century.
                    <br /><br />
                    In AI development, documentation prevents knowledge silos and ensures model reproducibility. Detailed descriptions of data dictionaries, validation strategies, assumptions, and ethical audits protect platforms against regression and ensure regulatory compliance.
                  </div>
                </div>

                {/* Part 6: Model Comparison Results & Interpretation */}
                <div style={{ marginTop: '32px', borderTop: '2px dashed var(--border-color)', paddingTop: '28px' }}>
                  <h4 style={{ margin: '0 0 16px 0', color: 'var(--text-primary)', fontSize: '17px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fa-solid fa-square-poll-vertical" style={{ color: 'var(--color-primary)' }}></i> Part 6: Model Comparison Results & Interpretation
                  </h4>
                  
                  <div style={{ padding: '18px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid var(--color-success)', marginBottom: '24px' }}>
                    <p style={{ margin: 0, fontSize: '14.5px', color: '#166534', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="fa-solid fa-circle-check" style={{ color: 'var(--color-success)' }}></i> Yes, this table is your model comparison result.
                    </p>
                    <p style={{ margin: '8px 0 0 0', fontSize: '13.5px', color: '#166534', lineHeight: '1.5' }}>
                      It shows which machine learning model predicted Titanic survival better. In your result, the <strong>best overall model is YDF Random Forest</strong>, because it has the highest <strong>Holdout Validation Accuracy = 0.8212</strong>, meaning around <strong>82.12% correct predictions</strong> on unseen validation data.
                    </p>
                  </div>

                  {/* Column Definitions */}
                  <h5 style={{ margin: '0 0 10px 0', color: 'var(--text-primary)', fontSize: '14px', fontWeight: '700' }}>1. What each column means</h5>
                  <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
                    <table className="comparison-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                          <th style={{ padding: '8px 10px', fontWeight: '700' }}>Term</th>
                          <th style={{ padding: '8px 10px', fontWeight: '700' }}>Simple meaning</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '8px 10px', fontWeight: '600' }}><strong>Model Name</strong></td>
                          <td style={{ padding: '8px 10px' }}>The machine learning algorithm used.</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '8px 10px', fontWeight: '600' }}><strong>GridSearchCV / CV Accuracy</strong></td>
                          <td style={{ padding: '8px 10px' }}>Average accuracy during cross-validation or tuning. It tests the model on different parts of training data.</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '8px 10px', fontWeight: '600' }}><strong>Holdout Validation Accuracy</strong></td>
                          <td style={{ padding: '8px 10px' }}>Accuracy on a separate validation set that the model did not train on. This is very important.</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '8px 10px', fontWeight: '600' }}><strong>Precision</strong></td>
                          <td style={{ padding: '8px 10px' }}>Out of passengers predicted as "Survived", how many really survived.</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '8px 10px', fontWeight: '600' }}><strong>Recall</strong></td>
                          <td style={{ padding: '8px 10px' }}>Out of actual survivors, how many the model correctly found.</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '8px 10px', fontWeight: '600' }}><strong>F1 Score</strong></td>
                          <td style={{ padding: '8px 10px' }}>Balance between precision and recall. Useful when both mistakes matter.</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '8px 10px', fontWeight: '600' }}><strong>ROC-AUC</strong></td>
                          <td style={{ padding: '8px 10px' }}>Measures how well the model separates survivors from non-survivors using probability. Higher is better.</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '8px 10px', fontWeight: '600' }}><strong>Best Parameters</strong></td>
                          <td style={{ padding: '8px 10px' }}>The best settings found for that model.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Definitions list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
                    <div style={{ padding: '12px 16px', borderLeft: '3px solid var(--color-primary)', backgroundColor: '#f8fafc', borderRadius: '4px' }}>
                      <strong style={{ fontSize: '13.5px', color: 'var(--text-primary)' }}>2. Accuracy meaning</strong>
                      <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                        Example: <code>YDF Random Forest Holdout Accuracy = 0.8212</code><br/>
                        Meaning: The model correctly predicted around 82 out of 100 passengers. Accuracy alone is not enough, which is why we check precision, recall, F1 score, and ROC-AUC.
                      </p>
                    </div>
                    <div style={{ padding: '12px 16px', borderLeft: '3px solid var(--color-primary)', backgroundColor: '#f8fafc', borderRadius: '4px' }}>
                      <strong style={{ fontSize: '13.5px', color: 'var(--text-primary)' }}>3. Precision meaning</strong>
                      <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                        Example: <code>YDF Random Forest Precision = 0.8136</code><br/>
                        Meaning: When the model predicted survival, it was correct around 81.36% of the time. High precision prevents falsely saying too many people survived.
                      </p>
                    </div>
                    <div style={{ padding: '12px 16px', borderLeft: '3px solid var(--color-primary)', backgroundColor: '#f8fafc', borderRadius: '4px' }}>
                      <strong style={{ fontSize: '13.5px', color: 'var(--text-primary)' }}>4. Recall meaning</strong>
                      <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                        Example: <code>YDF Random Forest Recall = 0.6957</code><br/>
                        Meaning: The model correctly detected around 69.57% of the actual survivors. High recall catches more survivors.
                      </p>
                    </div>
                    <div style={{ padding: '12px 16px', borderLeft: '3px solid var(--color-primary)', backgroundColor: '#f8fafc', borderRadius: '4px' }}>
                      <strong style={{ fontSize: '13.5px', color: 'var(--text-primary)' }}>5. F1 Score meaning</strong>
                      <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                        Example: <code>YDF Random Forest F1 = 0.7500</code><br/>
                        Meaning: This is the balance between correct survival predictions and ability to find actual survivors. This is the best F1 score in your table, showing a well-balanced model.
                      </p>
                    </div>
                    <div style={{ padding: '12px 16px', borderLeft: '3px solid var(--color-primary)', backgroundColor: '#f8fafc', borderRadius: '4px' }}>
                      <strong style={{ fontSize: '13.5px', color: 'var(--text-primary)' }}>6. ROC-AUC meaning</strong>
                      <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                        Example: Measures probability ranking and separation capability (0 = Died, 1 = Survived). <strong>Random Forest is slightly best at 0.8486</strong>, but YDF Random Forest is best overall due to validation accuracy and F1 balance.
                      </p>
                    </div>
                  </div>

                  {/* 7. What each model does */}
                  <h5 style={{ margin: '0 0 12px 0', color: 'var(--text-primary)', fontSize: '14px', fontWeight: '700' }}>7. What each model does & Notebook Code Meaning</h5>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginBottom: '28px' }}>
                    <div style={{ padding: '14px', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: '#fafafa' }}>
                      <strong style={{ fontSize: '13.5px', color: 'var(--text-primary)' }}>Logistic Regression (Baseline)</strong>
                      <p style={{ margin: '6px 0 0 0', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                        Baseline model searching for linear relationships between features (e.g. Female + First class = higher probability).<br/>
                        <code>Holdout Validation Accuracy: 77.65%</code>
                      </p>
                    </div>
                    <div style={{ padding: '14px', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: '#fafafa' }}>
                      <strong style={{ fontSize: '13.5px', color: 'var(--text-primary)' }}>Decision Tree</strong>
                      <p style={{ margin: '6px 0 0 0', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                        Splits variables recursively based on binary questions (e.g. Is Sex = Female?). Better at non-linear patterns.<br/>
                        <code>Holdout Validation Accuracy: 80.45%</code>
                      </p>
                    </div>
                    <div style={{ padding: '14px', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: '#fafafa' }}>
                      <strong style={{ fontSize: '13.5px', color: 'var(--text-primary)' }}>Random Forest</strong>
                      <p style={{ margin: '6px 0 0 0', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                        Ensemble of decision trees voting on predictions to stabilize variance and avoid tree overfitting.<br/>
                        <code>Holdout Validation Accuracy: 81.56% | Best ROC-AUC: 0.8486</code>
                      </p>
                    </div>
                    <div style={{ padding: '14px', border: '1px solid var(--color-success)', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.04)' }}>
                      <strong style={{ fontSize: '13.5px', color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        YDF Random Forest <span style={{ fontSize: '9px', backgroundColor: 'var(--color-success)', color: '#fff', padding: '1px 4px', borderRadius: '3px' }}>Best Model</span>
                      </strong>
                      <p style={{ margin: '6px 0 0 0', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                        Google's Yggdrasil Decision Forest Random Forest. Most balanced validation model with native missing value handling.<br/>
                        <code>Holdout Validation Accuracy: 82.12% | F1 Score: 0.7500</code>
                      </p>
                    </div>
                    <div style={{ padding: '14px', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: '#fafafa' }}>
                      <strong style={{ fontSize: '13.5px', color: 'var(--text-primary)' }}>YDF Gradient Boosted Trees</strong>
                      <p style={{ margin: '6px 0 0 0', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                        Google's YDF boosting framework. Trains trees sequentially where each fixes previous mistakes.<br/>
                        <code>Holdout Validation Accuracy: 81.56% | ROC-AUC: 0.8440</code>
                      </p>
                    </div>
                    <div style={{ padding: '14px', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: '#fafafa' }}>
                      <strong style={{ fontSize: '13.5px', color: 'var(--text-primary)' }}>XGBoost</strong>
                      <p style={{ margin: '6px 0 0 0', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                        Advanced highly-regularized gradient boosting popular in competitions. Restricted by Titanic's small dataset size.<br/>
                        <code>Holdout Validation Accuracy: 79.89%</code>
                      </p>
                    </div>
                    <div style={{ padding: '14px', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: '#fafafa' }}>
                      <strong style={{ fontSize: '13.5px', color: 'var(--text-primary)' }}>LightGBM</strong>
                      <p style={{ margin: '6px 0 0 0', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                        Fast leaf-wise tree growth gradient boosting library optimized for efficiency and scaling.<br/>
                        <code>Holdout Validation Accuracy: 80.45%</code>
                      </p>
                    </div>
                    <div style={{ padding: '14px', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: '#fafafa' }}>
                      <strong style={{ fontSize: '13.5px', color: 'var(--text-primary)' }}>CatBoost</strong>
                      <p style={{ margin: '6px 0 0 0', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                        Symmetric tree structure engineered to natively process high-cardinality categorical attributes without one-hot expansion.<br/>
                        <code>Holdout Validation Accuracy: 79.33%</code>
                      </p>
                    </div>
                    <div style={{ padding: '14px', border: '1px solid #ef4444', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.02)' }}>
                      <strong style={{ fontSize: '13.5px', color: '#b91c1c' }}>TensorFlow Neural Net (Overfitted)</strong>
                      <p style={{ margin: '6px 0 0 0', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                        Dense layers. Achieved extremely high CV accuracy (89.47%) but overfit training signals, yielding lower holdout validation.<br/>
                        <code>Holdout Validation Accuracy: 80.45% | CV Accuracy: 89.47%</code>
                      </p>
                    </div>
                  </div>

                  {/* 8. What are best parameters */}
                  <h5 style={{ margin: '0 0 10px 0', color: 'var(--text-primary)', fontSize: '14px', fontWeight: '700' }}>8. What are best parameters?</h5>
                  <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    Hyperparameters discovered via GridSearchCV represent the optimal settings (e.g. <code>max_depth</code>, <code>n_estimators</code>, <code>learning_rate</code>) balancing model complexity and generalization:
                  </p>
                  <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
                    <table className="comparison-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                          <th style={{ padding: '8px 10px', fontWeight: '700' }}>Parameter Setting</th>
                          <th style={{ padding: '8px 10px', fontWeight: '700' }}>Explanation</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '8px 10px' }}><code>max_depth = 8, n_estimators = 50</code></td>
                          <td style={{ padding: '8px 10px' }}>Random Forest restricted tree depth to 8 levels and pooled predictions from 50 trees.</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '8px 10px' }}><code>learning_rate = 0.1, max_depth = 3</code></td>
                          <td style={{ padding: '8px 10px' }}>XGBoost restricted depth to 3 and scaled tree adjustments by a 0.1 learning rate.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* 9. Which model is best */}
                  <h5 style={{ margin: '0 0 10px 0', color: 'var(--text-primary)', fontSize: '14px', fontWeight: '700' }}>9. Which model is best in your table?</h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    <div>✔️ <strong>Best by Holdout Validation Accuracy & F1:</strong> YDF Random Forest (Holdout: 82.12%, F1: 0.7500)</div>
                    <div>✔️ <strong>Best by ROC-AUC:</strong> Random Forest (ROC-AUC: 0.8486)</div>
                  </div>

                  {/* 10. Final Interpretation */}
                  <h5 style={{ margin: '0 0 10px 0', color: 'var(--text-primary)', fontSize: '14px', fontWeight: '700' }}>10. Final interpretation of your result</h5>
                  <div style={{ padding: '16px', backgroundColor: '#eff6ff', borderLeft: '4px solid var(--primary-color)', borderRadius: '6px', fontSize: '13.5px', color: '#1e40af', lineHeight: '1.6' }}>
                    In this Titanic survival prediction experiment, YDF Random Forest performed best overall, with the highest validation accuracy of 82.12% and F1 score of 0.7500, indicating the most stable predictions. Tree-based ensemble structures outperformed the baseline Logistic Regression and overfitted Deep Neural Net. Tabular dataset splits (relying strongly on rule-based attributes like passenger gender, class groups, fares, and cabin decks) are highly suited to tree classifiers rather than linear algorithms or high-parameter neural layers.
                  </div>
                </div>

              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', backgroundColor: '#f8fafc', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
              <button 
                className="btn btn-assignment" 
                onClick={() => setShowAssignmentModal(false)}
                style={{ padding: '8px 16px', fontSize: '14px', cursor: 'pointer' }}
              >
                Close Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
