import React, { useState } from 'react';
import { codeSnippets } from '../data/codeSnippets.js';

export default function CodeMeaningCard() {
  const [copiedKey, setCopiedKey] = useState(null);

  const handleCopy = (key, text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const snippets = [
    {
      key: 'loadKaggle',
      title: 'Kaggle Dataset Loading',
      code: codeSnippets.loadKaggle,
      explanation: 'Loads local training and test sets in Python using Pandas. Ensures paths are configured correctly.'
    },
    {
      key: 'featureEngineer',
      title: 'Feature Engineering logic',
      code: codeSnippets.featureEngineer,
      explanation: 'Computes family size, creates an indicator for solo travelers, and normalizes ticket prices.'
    },
    {
      key: 'tfdfModel',
      title: 'TensorFlow Decision Forests Model',
      code: codeSnippets.tfdfModel,
      explanation: 'Trains GradientBoostedTreesModel using TF-DF datasets. This runs exclusively inside Google Colab.'
    },
    {
      key: 'openmlLoad',
      title: 'OpenML Reference Loading',
      code: codeSnippets.openmlLoad,
      explanation: 'Fetches the Titanic dataset from OpenML servers as a Scikit-Learn bunch wrapper.'
    }
  ];

  return (
    <div className="snippets-grid">
      {snippets.map((snip) => (
        <div key={snip.key} className="code-card">
          <div className="code-card-header">
            <h4>{snip.title}</h4>
            <button
              onClick={() => handleCopy(snip.key, snip.code)}
              className="copy-btn"
            >
              {copiedKey === snip.key ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
          <pre className="code-block">
            <code>{snip.code}</code>
          </pre>
          <p className="code-explanation">{snip.explanation}</p>
        </div>
      ))}
    </div>
  );
}
