import { motion, useReducedMotion } from 'framer-motion';
import Section from './Section.jsx';

export default function RocAucSection() {
  const reduceMotion = useReducedMotion();
  const src = `${import.meta.env.BASE_URL}assets/plots/roc_curve.png`;

  return (
    <Section id="roc" eyebrow="Diagnostics" title="ROC-AUC and ROC Curve">
      <div className="roc-panel">
        <div>
          <p className="lead">
            ROC-AUC evaluates how well the classifier separates survived from not-survived passengers across decision thresholds. The ROC curve image is generated from the same leakage-safe model pipeline and real test predictions.
          </p>
          <p>
            This diagnostic complements accuracy because it focuses on ranking and threshold behavior, not only one fixed 0.5 classification cutoff.
          </p>
          <motion.a
            className="button primary"
            href={src}
            download
            whileHover={reduceMotion ? undefined : { scale: 1.04 }}
            whileTap={reduceMotion ? undefined : { scale: 0.97 }}
          >
            Download ROC PNG
          </motion.a>
        </div>
        <motion.img
          src={src}
          alt="ROC curve for Titanic logistic regression model"
          whileHover={reduceMotion ? undefined : { scale: 1.02 }}
        />
      </div>
    </Section>
  );
}
