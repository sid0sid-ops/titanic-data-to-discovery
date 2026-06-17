import React from 'react';

export default function PillDatasetTabs({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'kaggle', label: 'Kaggle Dataset' },
    { id: 'story', label: 'Visual Story' },
    { id: 'charts', label: 'Chart Guide' },
    { id: 'colab', label: 'Colab Workflow' },
    { id: 'models', label: 'Models' },
    { id: 'openml', label: 'OpenML Reference' },
    { id: 'submission', label: 'Submission' }
  ];

  return (
    <div className="pill-tabs-container">
      <div className="pill-tabs-scroll">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pill-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            aria-selected={activeTab === tab.id}
            role="tab"
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
