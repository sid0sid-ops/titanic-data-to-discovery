import Section from './Section.jsx';
import { mindset } from '../data/projectContent.js';

export default function Reflections() {
  return (
    <Section id="reflection" eyebrow="Mindset" title="Final Reflection">
      <div className="mindset">
        {mindset.map((line) => <span key={line}>{line}</span>)}
      </div>
      <div className="reflection-card">
        <p>
          Python transforms raw data into meaningful insight. The Titanic dataset shows that data is not just numbers; it reflects human stories, social structures, and survival patterns.
        </p>
        <p>
          Data science is not only coding — it is about asking questions, cleaning carefully, visualizing clearly, modeling responsibly, and communicating insight.
        </p>
        <p>
          Every dataset can be reframed into opportunity and foresight. Lessons from history can guide us toward future exploration. With science as our compass, the future is brighter, bolder, and boundless.
        </p>
      </div>
    </Section>
  );
}
