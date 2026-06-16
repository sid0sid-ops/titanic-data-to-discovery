import { motion, useScroll } from 'framer-motion';
import { links } from '../data/projectContent.js';

const navItems = [
  ['Overview', '#overview'],
  ['Notebook Steps', '#notebook-steps'],
  ['Graphs', '#graphs'],
  ['Model', '#model'],
  ['Advanced ML', '#advanced-ml'],
  ['Results', '#results'],
  ['Predict', '#predict'],
  ['Downloads', '#downloads'],
];

export default function Navbar() {
  const { scrollYProgress } = useScroll();

  return (
    <header className="navbar">
      <motion.div className="nav-progress" style={{ scaleX: scrollYProgress }} />
      <a className="brand" href="#top" aria-label="Titanic project home">
        <span>t</span>
        Titanic Discovery
      </a>
      <nav aria-label="Primary navigation">
        {navItems.map(([label, href]) => (
          <a key={label} href={href}>
            {label}
          </a>
        ))}
        <a href={links.github} target="_blank" rel="noreferrer">GitHub</a>
      </nav>
    </header>
  );
}
