import React from 'react';

export default function PillWorkflowTabs({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'kaggle', label: 'Kaggle Dataset', icon: 'fa-database' },
    { id: 'openml', label: 'OpenML Dataset', icon: 'fa-square-poll-vertical' }
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
            <i className={`fa-solid ${tab.icon}`} style={{ marginRight: '8px' }}></i>
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

