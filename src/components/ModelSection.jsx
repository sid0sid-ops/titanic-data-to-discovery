import Section from './Section.jsx';
import { features, validatedResult } from '../data/projectContent.js';

export default function ModelSection() {
  return (
    <Section id="model" eyebrow="Classification" title="Logistic Regression Model">
      <div className="two-column">
        <article className="info-card large">
          <h3>Classification, not regression</h3>
          <p>Regression predicts continuous values. Classification predicts classes.</p>
          <p>For Titanic survival, the classes are <code>0 = Not Survived</code> and <code>1 = Survived</code>.</p>
        </article>
        <article className="info-card large">
          <h3>Pipeline</h3>
          <p>Feature engineering to train/test split to preprocessing to Logistic Regression to prediction to evaluation.</p>
          <p>The model learned patterns from historical passenger data and used them to estimate survival probability.</p>
        </article>
      </div>
      <div className="chip-row">
        {features.map((feature) => <span key={feature}>{feature}</span>)}
      </div>
      <div className="results-panel">
        <div>
          <h3>ML pipeline</h3>
          <p>Numeric imputation and scaling are separated from categorical imputation and one-hot encoding with <code>ColumnTransformer</code>.</p>
        </div>
        <div className="matrix-placeholder" aria-label="Confusion matrix placeholder">
          <span>TN</span><span>FP</span><span>FN</span><span>TP</span>
        </div>
        <div>
          <h3>Evaluation</h3>
          <p>{validatedResult.note} {validatedResult.caveat}</p>
        </div>
      </div>
    </Section>
  );
}
