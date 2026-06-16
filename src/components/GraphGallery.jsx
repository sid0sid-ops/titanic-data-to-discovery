import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Section from './Section.jsx';
import { graphGallery } from '../data/notebookSteps.js';
import { links } from '../data/projectContent.js';

export default function GraphGallery() {
  const [activeGraph, setActiveGraph] = useState(null);
  const reduceMotion = useReducedMotion();

  return (
    <Section id="graphs" eyebrow="Notebook outputs" title="Graph Gallery and Downloads">
      <p className="lead">
        These figures are generated from the same OpenML Titanic dataset used in the notebook. Each card links to the PNG file so reviewers can inspect or download the visual output.
      </p>
      <div className="graph-grid">
        {graphGallery.map((graph) => {
          const src = `${import.meta.env.BASE_URL}${graph.image}`;
          return (
            <motion.article
              className="graph-card"
              key={graph.id}
              whileHover={reduceMotion ? undefined : { y: -8, scale: 1.01 }}
              transition={{ duration: 0.18 }}
            >
              <button type="button" className="graph-image-button" onClick={() => setActiveGraph(graph)}>
                <img src={src} alt={graph.title} loading="lazy" />
              </button>
              <div className="graph-card-body">
                <h3>{graph.title}</h3>
                <p>{graph.interpretation}</p>
                <div className="graph-actions">
                  <a href={src} download>Download PNG</a>
                  <a href={links.notebook} target="_blank" rel="noreferrer">View in Notebook</a>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>
      <AnimatePresence>
        {activeGraph && (
          <motion.div
            className="lightbox"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            onClick={() => setActiveGraph(null)}
          >
            <motion.div
              className="lightbox-panel"
              layoutId={`graph-${activeGraph.id}`}
              initial={reduceMotion ? false : { scale: 0.96, y: 18 }}
              animate={{ scale: 1, y: 0 }}
              exit={reduceMotion ? undefined : { scale: 0.96, y: 18 }}
              onClick={(event) => event.stopPropagation()}
            >
              <button type="button" className="lightbox-close" onClick={() => setActiveGraph(null)}>Close</button>
              <img src={`${import.meta.env.BASE_URL}${activeGraph.image}`} alt={activeGraph.title} />
              <h3>{activeGraph.title}</h3>
              <p>{activeGraph.interpretation}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Section>
  );
}
