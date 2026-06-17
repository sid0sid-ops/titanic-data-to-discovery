export function sigmoid(value) {
  return 1 / (1 + Math.exp(-value));
}

function isMissing(value) {
  return value === undefined || value === null || value === '' || Number.isNaN(value);
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function normalizeCategory(value) {
  return String(value);
}

export function preparePassenger(input) {
  const sibsp = toNumber(input.sibsp);
  const parch = toNumber(input.parch);
  const familySize = sibsp + parch + 1;

  return {
    pclass: toNumber(input.pclass),
    sex: input.sex,
    age: toNumber(input.age),
    sibsp,
    parch,
    fare: toNumber(input.fare),
    embarked: input.embarked,
    family_size: familySize,
    is_alone: familySize === 1 ? 1 : 0,
    title: input.title,
    has_cabin: input.has_cabin ? 1 : 0,
  };
}

export function encodePassenger(model, passengerInput) {
  const passenger = preparePassenger(passengerInput);
  const encoded = [];

  model.numericFeatures.forEach((feature) => {
    const rawValue = passenger[feature];
    const imputed = isMissing(rawValue) ? model.numericImputerStatistics[feature] : rawValue;
    const scaled = (Number(imputed) - model.numericScalerMean[feature]) / model.numericScalerScale[feature];
    encoded.push(scaled);
  });

  model.categoricalFeatures.forEach((feature) => {
    const rawValue = passenger[feature];
    const imputed = isMissing(rawValue) ? model.categoricalImputerStatistics[feature] : rawValue;
    const categories = model.categoricalCategories[feature] ?? [];
    const encodedCategories = model.oneHotDropFirst ? categories.slice(1) : categories;

    encodedCategories.forEach((category) => {
      encoded.push(normalizeCategory(imputed) === normalizeCategory(category) ? 1 : 0);
    });
  });

  return { passenger, encoded };
}

export function predictPassenger(model, passengerInput) {
  const { passenger, encoded } = encodePassenger(model, passengerInput);
  const z = encoded.reduce((sum, value, index) => sum + value * model.coefficients[index], model.intercept);
  const probability = sigmoid(z);
  const prediction = probability >= 0.5 ? 1 : 0;

  return {
    passenger,
    probability,
    probabilityPercent: probability * 100,
    prediction,
    label: prediction === 1 ? 'Survived' : 'Not Survived',
  };
}

export function buildColabPassengerCode(input) {
  let titlePrefix = 'Mr';
  if (input.title === 'Mrs') titlePrefix = 'Mrs';
  else if (input.title === 'Miss') titlePrefix = 'Miss';
  else if (input.title === 'Master') titlePrefix = 'Master';
  else if (input.title === 'Rare') titlePrefix = 'Dr';

  const nameString = `Doe, ${titlePrefix}. Custom Passenger`;
  const cabinValue = input.has_cabin ? '"C85"' : 'np.nan';

  return `new_passenger = pd.DataFrame([{\n` +
         `    "pclass": ${input.pclass},\n` +
         `    "name": "${nameString}",\n` +
         `    "sex": "${input.sex}",\n` +
         `    "age": ${input.age},\n` +
         `    "sibsp": ${input.sibsp},\n` +
         `    "parch": ${input.parch},\n` +
         `    "fare": ${input.fare},\n` +
         `    "embarked": "${input.embarked}",\n` +
         `    "cabin": ${cabinValue}\n` +
         `}])\n\n` +
         `prediction = model.predict(new_passenger)\n` +
         `probability = model.predict_proba(new_passenger)[:, 1]\n` +
         `print(f"Prediction: {prediction[0]} | Survival Probability: {probability[0]:.4f}")`;
}
