import { motion } from 'framer-motion';
import { badges, links, validatedResult } from '../data/projectContent.js';

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-copy">
        <motion.p className="hero-kicker" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          Python data science case study
        </motion.p>
        <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          From Data to Discovery — Lessons from the Titanic Project
        </motion.h1>
        <motion.p className="hero-subtitle" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
          Python transforms raw historical data into insight, prediction, and learning.
        </motion.p>
        <motion.div className="hero-actions" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
          <a className="button primary" href={links.colab} target="_blank" rel="noreferrer">Open in Colab</a>
          <a className="button secondary" href={links.notebook} target="_blank" rel="noreferrer">View Notebook</a>
          <a className="button secondary" href={links.github} target="_blank" rel="noreferrer">View GitHub</a>
          <a className="button ghost" href={links.live} target="_blank" rel="noreferrer">Live Demo</a>
          <a className="button ghost" href="#workflow">Explore Workflow</a>
        </motion.div>
        <motion.div className="badge-row" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.06 } } }}>
          {badges.map((badge) => (
            <motion.span key={badge} variants={{ hidden: { opacity: 0, scale: 0.88 }, show: { opacity: 1, scale: 1 } }}>
              {badge}
            </motion.span>
          ))}
        </motion.div>
      </div>
      <motion.div className="hero-card" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
        <img src={`${import.meta.env.BASE_URL}assets/titanic-placeholder.svg`} alt="Titanic data story illustration" />
        <div className="metric-strip">
          <div><strong>1309</strong><span>OpenML dataset rows</span></div>
          <div><strong>{validatedResult.testAccuracyPercent}</strong><span>validated test accuracy</span></div>
          <div><strong>0/1</strong><span>classification target</span></div>
        </div>
      </motion.div>
    </section>
  );
}
