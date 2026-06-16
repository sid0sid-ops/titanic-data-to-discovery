import { motion, useReducedMotion } from 'framer-motion';
import Section from './Section.jsx';

const comparison = [
  {
    title: 'Logistic Regression',
    label: 'Interpretable baseline',
    detail: 'A linear classification model that estimates survival probability and supports coefficient and odds-ratio interpretation.',
  },
  {
    title: 'Random Forest',
    label: 'Non-linear comparison',
    detail: 'An ensemble model that can capture feature interactions. The advanced notebook section evaluates it through GridSearchCV rather than assuming it is better.',
  },
  {
    title: 'GridSearchCV',
    label: 'Cross-validated selection',
    detail: 'Candidate model settings are compared across stratified folds before the selected estimator is evaluated on the holdout test split.',
  },
];

export default function ModelComparison() {
  const reduceMotion = useReducedMotion();

  return (
    <Section id="model-comparison" eyebrow="Model comparison" title="Logistic Regression vs Random Forest">
      <p className="lead">
        Logistic Regression remains the validated baseline for the website result. The advanced notebook extension also compares it with Random Forest through GridSearchCV, so model choice is evaluated systematically instead of guessed.
      </p>
      <div className="comparison-grid">
        {comparison.map((item) => (
          <motion.article
            className="comparison-card"
            key={item.title}
            whileHover={reduceMotion ? undefined : { y: -8, scale: 1.015 }}
          >
            <span>{item.label}</span>
            <h3>{item.title}</h3>
            <p>{item.detail}</p>
          </motion.article>
        ))}
      </div>
    </Section>
  );
}
