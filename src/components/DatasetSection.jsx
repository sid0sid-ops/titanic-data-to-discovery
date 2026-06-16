import Section from './Section.jsx';
import { columns, datasetSources } from '../data/projectContent.js';

export default function DatasetSection() {
  return (
    <Section id="dataset" eyebrow="Dataset" title="Titanic Passenger Data">
      <p className="lead">
        The validated model uses the OpenML Titanic 1309-row dataset loaded with <code>pd.read_csv</code>. Optional 891-row sources are documented for comparison, but the model result should not mix dataset schemas blindly.
      </p>
      <div className="source-grid">
        {datasetSources.map((source) => (
          <article className="source-card" key={source.name}>
            <span>{source.rows} rows</span>
            <h3>{source.name}</h3>
            <p>{source.purpose}</p>
          </article>
        ))}
      </div>
      <div className="column-grid">
        {columns.map(([name, detail]) => (
          <article className="column-card" key={name}>
            <strong>{name}</strong>
            <span>{detail}</span>
          </article>
        ))}
      </div>
    </Section>
  );
}
