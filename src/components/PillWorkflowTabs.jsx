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
            style={{ 
              flex: 1, 
              textAlign: 'center', 
              padding: 'clamp(4px, 0.7vh, 8px) clamp(6px, 1vw, 10px)', 
              fontSize: 'clamp(11px, 1.3vh, 13px)' 
            }}
          >
            <i className={`fa-solid ${tab.icon}`} style={{ marginRight: '6px' }}></i>
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

