import Section from './Section.jsx';
import { cleaningSteps } from '../data/projectContent.js';

export default function CleaningSection() {
  return (
    <Section id="cleaning" eyebrow="Preprocessing" title="Data Cleaning and Leakage Prevention">
      <div className="feature-panel">
        <div>
          <p className="quote">Clean data is the foundation of truth.</p>
          <p>
            OpenML missing values marked as <code>?</code>, missing age and fare values, sparse cabin entries, and categorical fields must be handled carefully before modeling. Professional preprocessing keeps transformations inside Scikit-Learn tools such as <code>Pipeline</code> and <code>ColumnTransformer</code>.
          </p>
          <p>
            The notebook excludes <code>boat</code> and <code>body</code> because they are post-disaster fields. Using them would leak the answer and produce misleading results.
          </p>
        </div>
        <div className="flow-card">
          {['Raw data', 'Imputation', 'Encoding', 'Scaling', 'Model-ready data'].map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>
      <div className="check-grid">
        {cleaningSteps.map((step) => <div key={step}>{step}</div>)}
      </div>
    </Section>
  );
}
