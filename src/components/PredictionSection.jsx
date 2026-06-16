import Section from './Section.jsx';
import { predictionExamples } from '../data/projectContent.js';

export default function PredictionSection() {
  return (
    <Section id="predictions" eyebrow="Prediction examples" title="Interpreting Model Outputs Responsibly">
      <div className="card-grid three">
        {predictionExamples.map((example) => (
          <article className="info-card prediction" key={example.profile}>
            <h3>{example.profile}</h3>
            <p>{example.interpretation}</p>
            <span>Example interpretation, not a confirmed probability</span>
          </article>
        ))}
      </div>
    </Section>
  );
}
