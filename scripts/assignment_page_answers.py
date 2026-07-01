"""Print the small code-backed values used on the Assignment page."""

from __future__ import annotations

import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.metrics import accuracy_score, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler


TRAIN_URL = "https://raw.githubusercontent.com/sid0sid-ops/titanic-data-to-discovery/main/kaggle/train.csv"


def main() -> None:
    df = pd.read_csv(TRAIN_URL)
    survived = int(df["Survived"].sum())
    not_survived = int((1 - df["Survived"]).sum())
    print(f"rows={len(df)} survived={survived} not_survived={not_survived}")
    print("missing_before=" + ", ".join(f"{k}:{int(v)}" for k, v in df[["Age", "Cabin", "Embarked"]].isna().sum().items()))

    clean = df.copy()
    clean["Age"] = clean["Age"].fillna(clean["Age"].median())
    clean["Embarked"] = clean["Embarked"].fillna(clean["Embarked"].mode()[0])
    clean["HasCabin"] = clean["Cabin"].notna().astype(int)
    print("missing_after=" + ", ".join(f"{k}:{int(v)}" for k, v in clean[["Age", "Embarked"]].isna().sum().items()))

    lin_features = ["Age", "Pclass", "SibSp"]
    X_train, X_test, y_train, y_test = train_test_split(
        clean[lin_features], clean["Fare"], test_size=0.2, random_state=42
    )
    linear = LinearRegression().fit(X_train, y_train)
    linear_pred = linear.predict(X_test)
    print(f"linear_mse={mean_squared_error(y_test, linear_pred):.2f} linear_r2={r2_score(y_test, linear_pred):.3f}")

    numeric = ["Age", "Pclass", "Fare", "SibSp", "Parch"]
    categorical = ["Sex", "Embarked"]
    X_train, X_test, y_train, y_test = train_test_split(
        clean[numeric + categorical], clean["Survived"], test_size=0.2, random_state=42, stratify=clean["Survived"]
    )
    preprocessor = ColumnTransformer(
        [
            ("num", Pipeline([("imputer", SimpleImputer(strategy="median")), ("scale", StandardScaler())]), numeric),
            ("cat", OneHotEncoder(handle_unknown="ignore"), categorical),
        ]
    )
    logistic = Pipeline([("prep", preprocessor), ("model", LogisticRegression(max_iter=1000))])
    logistic.fit(X_train, y_train)
    print(f"logistic_accuracy={accuracy_score(y_test, logistic.predict(X_test)):.3f}")

    for k in (3, 5, 7):
        knn = Pipeline([("prep", preprocessor), ("model", KNeighborsClassifier(n_neighbors=k))])
        knn.fit(X_train, y_train)
        print(f"knn_k{k}_accuracy={accuracy_score(y_test, knn.predict(X_test)):.3f}")


if __name__ == "__main__":
    main()
