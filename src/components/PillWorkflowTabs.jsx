import React from 'react';

export default function PillWorkflowTabs({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'kaggle', label: 'Kaggle Dataset', icon: 'fa-database' },
    { id: 'openml', label: 'OpenML Dataset', icon: 'fa-square-poll-vertical' }
  ];

  return (
    <div className="pill-tabs-container" style={{ width: '100%', display: 'block' }}>
      <div className="pill-tabs-scroll" style={{ display: 'flex', width: '100%' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pill-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            aria-selected={activeTab === tab.id}
            role="tab"
            style={{ flex: 1, textAlign: 'center', padding: '6px 8px', fontSize: '12px' }}
          >
            <i className={`fa-solid ${tab.icon}`} style={{ marginRight: '6px' }}></i>
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

