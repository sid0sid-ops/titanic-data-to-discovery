import { motion, useReducedMotion } from 'framer-motion';
import Section from './Section.jsx';
import { pipelineDiagramNodes } from '../data/notebookSteps.js';

export default function PipelineDiagram() {
  const reduceMotion = useReducedMotion();

  return (
    <Section id="pipeline-diagram" eyebrow="Pipeline diagram" title="How the Static Site Explains the Colab Pipeline">
      <p className="lead">
        Colab can render the actual Scikit-Learn pipeline interactively with <code>set_config(display="diagram")</code>. The static website mirrors that idea with a React diagram.
      </p>
      <div className="pipeline-diagram">
        {pipelineDiagramNodes.map((node, index) => (
          <motion.div
            className="pipeline-node"
            key={node}
            layoutId={`pipeline-${node}`}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: reduceMotion ? 0 : index * 0.06 }}
            whileHover={reduceMotion ? undefined : { y: -6, scale: 1.03 }}
          >
            <span>{index + 1}</span>
            <strong>{node}</strong>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
