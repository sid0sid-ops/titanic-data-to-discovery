import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Section from './Section.jsx';
import { links } from '../data/projectContent.js';
import { buildColabPassengerCode, predictPassenger, preparePassenger } from '../utils/titanicPredictor.js';

const initialInput = {
  pclass: 3,
  sex: 'male',
  age: 25,
  sibsp: 0,
  parch: 0,
  fare: 7.25,
  embarked: 'S',
  title: 'Mr',
  has_cabin: false,
};

function interpretationFor(result) {
  if (!result) return '';
  const p = result.passenger;
  const higher = [];
  const lower = [];

  if (p.sex === 'female') higher.push('female sex');
  if (p.pclass === 1) higher.push('first class');
  if (p.fare >= 50) higher.push('higher fare');
  if (p.has_cabin === 1) higher.push('cabin recorded');
  if (p.title === 'Master') higher.push('child/title Master');

  if (p.sex === 'male') lower.push('male sex');
  if (p.pclass === 3) lower.push('third class');
  if (p.fare < 15) lower.push('low fare');
  if (p.has_cabin === 0) lower.push('no cabin record');

  const influence = result.prediction === 1 ? higher : lower;
  const fallback = result.prediction === 1
    ? 'features associated with higher survival in the training data'
    : 'features associated with lower survival in the training data';

  return `The ${result.label.toLowerCase()} estimate may be influenced by ${influence.length ? influence.join(', ') : fallback}. This is an educational model estimate, not historical certainty.`;
}

export default function PassengerPredictor() {
  const [model, setModel] = useState(null);
  const [input, setInput] = useState(initialInput);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}assets/model/titanic_logistic_model.json`)
      .then((response) => {
        if (!response.ok) throw new Error('Model JSON could not be loaded.');
        return response.json();
      })
      .then(setModel)
      .catch((err) => setError(err.message));
  }, []);

  const preparedPassenger = useMemo(() => preparePassenger(input), [input]);
  const result = useMemo(() => (model ? predictPassenger(model, input) : null), [model, input]);
  const colabCode = useMemo(() => buildColabPassengerCode(preparedPassenger), [preparedPassenger]);

  const update = (field, value) => {
    setInput((current) => ({ ...current, [field]: value }));
  };

  const copyCode = async () => {
    await navigator.clipboard?.writeText(colabCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <Section id="predict" eyebrow="Live predictor" title="Passenger Survival Predictor">
      <p className="lead">
        This browser-based predictor uses exported Logistic Regression parameters from the validated leakage-safe notebook pipeline. GitHub Pages cannot run Python, so the model preprocessing and logistic calculation are reproduced in JavaScript.
      </p>
      <div className="predictor-shell">
        <motion.form
          className="predictor-form"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          onSubmit={(event) => event.preventDefault()}
        >
          <label>
            Passenger Class
            <select value={input.pclass} onChange={(event) => update('pclass', Number(event.target.value))}>
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
            </select>
          </label>
          <label>
            Sex
            <select value={input.sex} onChange={(event) => update('sex', event.target.value)}>
              <option value="male">male</option>
              <option value="female">female</option>
            </select>
          </label>
          <label>
            Age
            <input type="number" min="0" value={input.age} onChange={(event) => update('age', Number(event.target.value))} />
          </label>
          <label>
            SibSp
            <input type="number" min="0" value={input.sibsp} onChange={(event) => update('sibsp', Number(event.target.value))} />
          </label>
          <label>
            Parch
            <input type="number" min="0" value={input.parch} onChange={(event) => update('parch', Number(event.target.value))} />
          </label>
          <label>
            Fare
            <input type="number" min="0" step="0.01" value={input.fare} onChange={(event) => update('fare', Number(event.target.value))} />
          </label>
          <label>
            Embarked
            <select value={input.embarked} onChange={(event) => update('embarked', event.target.value)}>
              <option value="C">C</option>
              <option value="Q">Q</option>
              <option value="S">S</option>
            </select>
          </label>
          <label>
            Title
            <select value={input.title} onChange={(event) => update('title', event.target.value)}>
              <option value="Mr">Mr</option>
              <option value="Mrs">Mrs</option>
              <option value="Miss">Miss</option>
              <option value="Master">Master</option>
              <option value="Rare">Rare</option>
            </select>
          </label>
          <label className="toggle-row">
            <input type="checkbox" checked={input.has_cabin} onChange={(event) => update('has_cabin', event.target.checked)} />
            Cabin recorded
          </label>
          <div className="derived-values">
            <span>family_size: {preparedPassenger.family_size}</span>
            <span>is_alone: {preparedPassenger.is_alone}</span>
            <span>has_cabin: {preparedPassenger.has_cabin}</span>
          </div>
        </motion.form>

        <AnimatePresence mode="wait">
          <motion.article
            className={`predictor-result ${result?.prediction === 1 ? 'survived' : 'not-survived'}`}
            key={result ? `${result.label}-${result.probability.toFixed(4)}` : 'loading'}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, scale: 0.96, y: -12 }}
          >
            {error && <p>{error}</p>}
            {!result && !error && <p>Loading model export...</p>}
            {result && (
              <>
                <span className="result-badge">{result.label}</span>
                <strong>{result.probabilityPercent.toFixed(1)}%</strong>
                <p>Survival probability estimate</p>
                <div className="probability-bar" aria-label="Survival probability">
                  <motion.span
                    initial={{ width: 0 }}
                    animate={{ width: `${result.probabilityPercent}%` }}
                    transition={{ duration: reduceMotion ? 0 : 0.55 }}
                  />
                </div>
                <p>{interpretationFor(result)}</p>
                <div className="predictor-actions">
                  <motion.button type="button" onClick={copyCode} whileHover={reduceMotion ? undefined : { scale: 1.04 }} whileTap={reduceMotion ? undefined : { scale: 0.97 }}>
                    {copied ? 'Copied Colab Code' : 'Copy Colab Code'}
                  </motion.button>
                  <motion.a href={links.colab} target="_blank" rel="noreferrer" whileHover={reduceMotion ? undefined : { scale: 1.04 }} whileTap={reduceMotion ? undefined : { scale: 0.97 }}>
                    Open in Colab
                  </motion.a>
                </div>
                <small>Open the notebook in Colab, then paste the copied passenger code after the model training cell.</small>
              </>
            )}
          </motion.article>
        </AnimatePresence>
      </div>
    </Section>
  );
}
