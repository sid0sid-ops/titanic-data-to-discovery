import Section from './Section.jsx';
import { libraries } from '../data/projectContent.js';

export default function LibraryEcosystem() {
  return (
    <Section id="overview" eyebrow="Python's power" title="The Scientific Python Ecosystem">
      <div className="split">
        <img className="ecosystem-art" src={`${import.meta.env.BASE_URL}assets/python-ecosystem-placeholder.svg`} alt="Python ecosystem diagram" />
        <div className="card-grid">
          {libraries.map((library) => (
            <article className="info-card" key={library.name}>
              <h3>{library.name}</h3>
              <p className="card-role">{library.role}</p>
              <p>{library.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </Section>
  );
}
