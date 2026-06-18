import React from 'react';

export default function PillWorkflowTabs({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'kaggle', label: 'Kaggle Dataset', icon: 'fa-database' },
    { id: 'tfdf', label: 'TF-DF Model', icon: 'fa-square-plus' },
    { id: 'openml', label: 'OpenML Dataset', icon: 'fa-square-poll-vertical' }
  ];

  return (
    <div className="pill-tabs-container" style={{ margin: '0 auto 30px auto', maxWidth: '800px' }}>
      <div className="pill-tabs-scroll">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pill-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            aria-selected={activeTab === tab.id}
            role="tab"
            style={{ flexGrow: 1, textAlign: 'center' }}
          >
            <i className={`fa-solid ${tab.icon}`} style={{ marginRight: '8px' }}></i>
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

