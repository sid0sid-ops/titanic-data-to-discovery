import Section from './Section.jsx';
import { edaPlots } from '../data/projectContent.js';

export default function EDASection() {
  return (
    <Section id="eda" eyebrow="Visualization" title="Exploratory Data Analysis">
      <p className="lead">
        EDA reveals the human stories behind the numbers: female passengers had higher survival rates, first-class passengers had higher survival rates, and gender and class strongly influenced survival.
      </p>
      <div className="plot-grid">
        {edaPlots.map(([name, detail]) => (
          <article className="plot-card" key={name}>
            <div className="plot-placeholder">
              <span></span><span></span><span></span><span></span>
            </div>
            <h3>{name}</h3>
            <p>{detail}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}
