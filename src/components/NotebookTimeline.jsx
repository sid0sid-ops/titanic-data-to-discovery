import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import Section from './Section.jsx';
import CodePreview from './CodePreview.jsx';
import { notebookSteps } from '../data/notebookSteps.js';

export default function NotebookTimeline() {
  const [activeId, setActiveId] = useState(notebookSteps[0].id);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progressScale = useTransform(scrollYProgress, [0.1, 0.75], [0, 1]);
  const activeStep = notebookSteps.find((step) => step.id === activeId) ?? notebookSteps[0];

  return (
    <Section id="notebook-steps" eyebrow="Notebook explainer" title="Step-by-Step Notebook Timeline">
      <p className="lead">
        This interactive timeline mirrors the Colab notebook from setup through final reflection. Click a step to expand the explanation, code concept, output summary, and lesson.
      </p>
      <div className="timeline-shell">
        <motion.div className="scroll-progress" style={{ scaleX: progressScale }} />
        <div className="step-list">
          {notebookSteps.map((step) => (
            <motion.button
              className={`step-button ${step.id === activeId ? 'active' : ''}`}
              key={step.id}
              type="button"
              onClick={() => setActiveId(step.id)}
              layoutId={`step-${step.id}`}
              whileHover={reduceMotion ? undefined : { y: -4, scale: 1.01 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            >
              <span>{step.stepNumber}</span>
              <strong>{step.title}</strong>
            </motion.button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.article
            className="step-detail"
            key={activeStep.id}
            layout
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
            transition={{ duration: 0.28 }}
          >
            <div className="step-detail-header">
              <span>Step {activeStep.stepNumber}</span>
              <h3>{activeStep.title}</h3>
              <p>{activeStep.subtitle}</p>
            </div>
            <div className="step-detail-grid">
              <div>
                <h4>What the notebook does</h4>
                <p>{activeStep.explanation}</p>
                <h4>Why it matters</h4>
                <p>{activeStep.whyItMatters}</p>
              </div>
              <CodePreview code={activeStep.codeSnippet} />
            </div>
            <div className="insight-row">
              <div>
                <span>Output concept</span>
                <p>{activeStep.outputSummary}</p>
              </div>
              <div>
                <span>Key insight</span>
                <p>{activeStep.keyInsight}</p>
              </div>
            </div>
          </motion.article>
        </AnimatePresence>
      </div>
    </Section>
  );
}
