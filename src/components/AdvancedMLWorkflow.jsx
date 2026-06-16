import { motion, useReducedMotion } from 'framer-motion';
import Section from './Section.jsx';
import CodePreview from './CodePreview.jsx';
import { advancedWorkflowCards } from '../data/notebookSteps.js';

const workflow = [
  'Robust Data Loading',
  'Missing Value Handling',
  'Leakage-Safe Feature Engineering',
  'Train/Test Split',
  'Pipeline + ColumnTransformer',
  'Logistic Regression / Random Forest',
  'GridSearchCV',
  'Accuracy + ROC-AUC + Confusion Matrix',
  'Prediction Simulation',
];

export default function AdvancedMLWorkflow() {
  const reduceMotion = useReducedMotion();

  return (
    <Section id="advanced-ml" eyebrow="Advanced ML workflow" title="Engineering the Notebook Like a Real ML Project">
      <p className="lead">
        This project is not only a Titanic prediction notebook. It is a complete data science workflow showing how Python loads data, cleans it, visualizes patterns, prevents leakage, trains models, compares performance, and communicates insight.
      </p>
      <div className="advanced-flow">
        {workflow.map((step, index) => (
          <motion.div
            className="advanced-flow-step"
            key={step}
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: reduceMotion ? 0 : index * 0.035 }}
            whileHover={reduceMotion ? undefined : { y: -5, scale: 1.02 }}
          >
            <span>{index + 1}</span>
            <strong>{step}</strong>
          </motion.div>
        ))}
      </div>
      <div className="advanced-card-grid">
        {advancedWorkflowCards.map((card) => (
          <motion.article
            className="advanced-card"
            key={card.title}
            whileHover={reduceMotion ? undefined : { y: -7, scale: 1.01 }}
            transition={{ duration: 0.18 }}
          >
            <h3>{card.title}</h3>
            <p>{card.detail}</p>
            <CodePreview code={card.code} label="Code concept" />
          </motion.article>
        ))}
      </div>
    </Section>
  );
}
