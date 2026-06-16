import { motion, useReducedMotion } from 'framer-motion';
import Section from './Section.jsx';

const stages = [
  ['Candidate models', 'Logistic Regression and Random Forest configurations enter the search.'],
  ['Cross-validation folds', 'Stratified folds compare settings while preserving class balance.'],
  ['Best parameters', 'GridSearchCV selects the strongest candidate from the training process.'],
  ['Final test evaluation', 'The selected pipeline is evaluated on the holdout test split.'],
];

export default function GridSearchExplainer() {
  const reduceMotion = useReducedMotion();

  return (
    <Section id="gridsearch" eyebrow="Optimization" title="GridSearchCV Explained">
      <div className="gridsearch-flow">
        {stages.map(([title, detail], index) => (
          <motion.article
            className="gridsearch-card"
            key={title}
            initial={reduceMotion ? false : { opacity: 0, x: -18 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: reduceMotion ? 0 : index * 0.08 }}
          >
            <span>{index + 1}</span>
            <h3>{title}</h3>
            <p>{detail}</p>
          </motion.article>
        ))}
      </div>
    </Section>
  );
}
