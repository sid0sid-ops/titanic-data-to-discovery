import Section from './Section.jsx';

export default function DataLeakageWarning() {
  return (
    <Section id="leakage-warning" eyebrow="Model safety" title="Data Leakage Warning">
      <div className="leakage-warning">
        <h3>Do not train on <code>boat</code> or <code>body</code>.</h3>
        <p>
          These are post-disaster columns. They reveal information after the Titanic disaster, so using them would make the model cheat and produce misleading results.
        </p>
        <p>
          The notebook and website exclude these fields from training. The model uses only pre-disaster passenger attributes and leakage-safe engineered features.
        </p>
      </div>
    </Section>
  );
}
