import React, { useState } from 'react';

export default function VisualizationStory() {
  const plots = [
    { id: 'survival_count', name: 'Survival Count', category: 'General', file: 'survival_count.png', desc: 'Overall distribution of survivors vs. non-survivors.' },
    { id: 'sex_count', name: 'Sex Distribution', category: 'Demographics', file: 'sex_count.png', desc: 'Total count of male and female passengers.' },
    { id: 'survival_rate_by_sex', name: 'Survival by Gender', category: 'Survival Rates', file: 'survival_rate_by_sex.png', desc: 'Survival probability for male vs. female passengers.' },
    { id: 'survival_rate_by_class', name: 'Survival by Class', category: 'Survival Rates', file: 'survival_rate_by_class.png', desc: 'Survival rate breakdown across Passenger Class (1st, 2nd, and 3rd class).' },
    { id: 'survival_by_sex_class_heatmap', name: 'Gender & Class Heatmap', category: 'Survival Rates', file: 'survival_by_sex_class_heatmap.png', desc: 'Cross-tabulation of survival rates across genders and passenger classes.' },
    { id: 'age_distribution_survival', name: 'Age Density Plot', category: 'Distributions', file: 'age_distribution_survival.png', desc: 'KDE plot of age distribution for survived vs. deceased passengers.' },
    { id: 'age_group_survival', name: 'Age Group Survival', category: 'Survival Rates', file: 'age_group_survival.png', desc: 'Survival rates grouped into custom age cohorts (Child, Teenager, Young Adult, etc.).' },
    { id: 'fare_distribution', name: 'Fare Histogram', category: 'Distributions', file: 'fare_distribution.png', desc: 'Stacked histogram showing passenger counts across different ticket price ranges.' },
    { id: 'fare_outlier_boxplot', name: 'Fare Boxplot', category: 'Distributions', file: 'fare_outlier_boxplot.png', desc: 'Box-and-whisker plot highlighting outliers in passenger ticket fares.' },
    { id: 'age_fare_scatter', name: 'Age vs Fare Scatter', category: 'General', file: 'age_fare_scatter.png', desc: 'Scatter plot of passenger age against fare, colored by survival status.' },
    { id: 'family_size_survival', name: 'Family Size Impact', category: 'Survival Rates', file: 'family_size_survival.png', desc: 'Survival probability of passengers grouped by total family members aboard.' },
    { id: 'embarked_survival', name: 'Port of Embarkation', category: 'Survival Rates', file: 'embarked_survival.png', desc: 'Survival rate by embarkation port (Cherbourg, Queenstown, Southampton).' },
    { id: 'cabin_known_survival', name: 'Cabin Records', category: 'Survival Rates', file: 'cabin_known_survival.png', desc: 'Comparison of survival rates for passengers with registered cabins vs. missing cabin fields.' },
    { id: 'title_survival', name: 'Title Groupings', category: 'Survival Rates', file: 'title_survival.png', desc: 'Survival rates mapped against engineered passenger titles (Mr, Mrs, Miss, Master, Rare).' },
    { id: 'confusion_matrix', name: 'Confusion Matrix', category: 'Model', file: 'confusion_matrix.png', desc: 'Confusion matrix of actual vs. predicted classifications for the best model.' },
    { id: 'feature_importance', name: 'Feature Importance', category: 'Model', file: 'feature_importance.png', desc: 'Feature importances or coefficients showing the influence weights of different columns.' }
  ];

  const [activePlotId, setActivePlotId] = useState(plots[0].id);
  const activePlot = plots.find(p => p.id === activePlotId);

  return (
    <div className="tab-panel-container">
      <div className="section-header-box">
        <h2>Kaggle Visual Story Gallery</h2>
        <p>Browse the static visualizations generated from the main Kaggle notebook dataset.</p>
      </div>

      <div className="gallery-layout">
        {/* Thumbnails Sidebar */}
        <div className="gallery-sidebar">
          {plots.map((plot) => (
            <button
              key={plot.id}
              onClick={() => setActivePlotId(plot.id)}
              className={`gallery-thumb-btn ${activePlotId === plot.id ? 'active' : ''}`}
            >
              <span className="thumb-cat">{plot.category}</span>
              <span className="thumb-name">{plot.name}</span>
            </button>
          ))}
        </div>

        {/* Plot Display Panel */}
        <div className="gallery-display">
          <div className="display-card">
            <div className="display-image-wrap">
              <img
                src={`${import.meta.env.BASE_URL}assets/plots/${activePlot.file}`}
                alt={activePlot.name}
                className="gallery-main-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="image-error-placeholder" style={{ display: 'none' }}>
                <i className="fa-solid fa-image"></i>
                <p>Generating visualizations... Re-run generate_kaggle_visuals.py if needed.</p>
              </div>
            </div>
            <div className="display-info">
              <h3>{activePlot.name}</h3>
              <span className="badge badge-info">{activePlot.category}</span>
              <p>{activePlot.desc}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
