import Section from './Section.jsx';
import { economicDomains } from '../data/projectContent.js';

export default function EconomicImpact() {
  return (
    <Section id="impact" eyebrow="Real-world relevance" title="From Titanic to Modern Risk Analytics">
      <div className="impact-grid">
        {economicDomains.map(([domain, target, impact]) => (
          <article className="impact-card" key={domain}>
            <span>{domain}</span>
            <h3>{target}</h3>
            <p>{impact}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}
