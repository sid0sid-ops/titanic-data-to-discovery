import Section from './Section.jsx';
import { workflow } from '../data/projectContent.js';

export default function Workflow() {
  return (
    <Section id="workflow" eyebrow="Project overview" title="A Complete Data Science Workflow">
      <p className="lead">
        This project uses the Titanic dataset to demonstrate how Python libraries integrate seamlessly from raw data loading to final communication.
      </p>
      <div className="timeline">
        {workflow.map((step, index) => (
          <div className="timeline-step" key={step}>
            <span>{index + 1}</span>
            <strong>{step}</strong>
          </div>
        ))}
      </div>
    </Section>
  );
}
