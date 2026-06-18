export const codeSnippets = {
  loadKaggle: `import pandas as pd
train = pd.read_csv('../kaggle/train.csv')
test = pd.read_csv('../kaggle/test.csv')
print("Train shape:", train.shape)
print("Test shape:", test.shape)`,
  featureEngineer: `df['FamilySize'] = df['SibSp'] + df['Parch'] + 1
df['IsAlone'] = (df['FamilySize'] == 1).astype(int)
df['CabinKnown'] = df['Cabin'].notna().astype(int)
df['FareLog'] = np.log1p(df['Fare'])`,
  tfdfModel: `import tensorflow_decision_forests as tfdf
model = tfdf.keras.GradientBoostedTreesModel()
model.fit(train_ds)
summary = model.summary()`,
  openmlLoad: `from sklearn.datasets import fetch_openml
titanic = fetch_openml('titanic', version=1, as_frame=True)
df = titanic.frame`
};
