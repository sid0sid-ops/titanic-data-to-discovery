from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
GENERATOR = ROOT / "scripts" / "create_model_comparison_notebook.py"


def test_model_comparison_uses_leakage_safe_features_and_fold_preprocessing():
    source = GENERATOR.read_text()

    assert "Group_Survival_Rate" not in source
    assert "class GroupedAgeImputer" in source
    assert '["Pclass", "Sex"]' in source
    assert 'result["CabinKnown"]' in source
    assert 'result["FarePerPerson"]' in source
    assert '("grouped_age", GroupedAgeImputer())' in source
    assert '"preprocessor",' in source
    assert '("model", estimator)' in source
    assert 'scoring="roc_auc"' in source
    assert "StratifiedKFold(n_splits=5, shuffle=True" in source


def test_model_selection_does_not_rank_on_holdout_metrics():
    source = GENERATOR.read_text()

    assert '.sort_values("CV ROC-AUC", ascending=False)' in source
    assert 'selected_name = comparison_df.iloc[0]["Model"]' in source
    assert "Training accuracy is not" in source


def test_requested_learning_families_are_present():
    source = GENERATOR.read_text()

    required_terms = [
        "LinearRegression",
        "LogisticRegression",
        "KNeighborsClassifier",
        "DecisionTreeClassifier",
        "RandomForestClassifier",
        "RandomForestLearner",
        "XGBClassifier",
        "LGBMClassifier",
        "CatBoostClassifier",
        "build_neural_network",
        "KMeans",
        "IsolationForest",
        "VotingClassifier",
    ]
    for term in required_terms:
        assert term in source
