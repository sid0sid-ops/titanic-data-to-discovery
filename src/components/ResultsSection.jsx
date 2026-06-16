import Section from './Section.jsx';
import { validatedResult } from '../data/projectContent.js';

export default function ResultsSection() {
  return (
    <Section id="results" eyebrow="Validated result" title="Current Notebook Result">
      <div className="result-hero">
        <div>
          <span className="result-label">Test accuracy</span>
          <strong>{validatedResult.testAccuracyPercent}</strong>
          <p>{validatedResult.note}</p>
          <p>{validatedResult.caveat}</p>
        </div>
        <div className="result-notes">
          <h3>Evaluation outputs</h3>
          <p>The notebook computes the confusion matrix, classification report, cross-validation scores, and odds ratios during execution.</p>
          <p>{validatedResult.metricPolicy}</p>
        </div>
      </div>
    </Section>
  );
}
