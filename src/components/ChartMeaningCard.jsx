import React from 'react';
import { chartGuide } from '../data/chartGuide.js';

export default function ChartMeaningCard() {
  return (
    <div className="tab-panel-container">
      <div className="section-header-box">
        <h2>Chart Dictionary & Guide</h2>
        <p>Understand the visual structures and data science rationale behind each chart type used in the project.</p>
      </div>

      <div className="charts-grid">
        {chartGuide.map((chart, idx) => (
          <div key={idx} className="chart-card">
            <div className="chart-card-header">
              <i className="fa-solid fa-chart-line chart-icon"></i>
              <h3>{chart.type}</h3>
            </div>
            <p className="chart-card-desc">{chart.description}</p>
            <div className="chart-card-insight">
              <strong>Key Project Insight:</strong> {chart.keyInsight}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
