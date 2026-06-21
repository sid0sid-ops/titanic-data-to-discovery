from pathlib import Path

import pandas as pd

from titanic_project.features import build_feature_frame


ROOT = Path(__file__).resolve().parents[1]


def test_features_are_leakage_safe_and_include_family_size():
    frame = pd.read_csv(ROOT / "kaggle" / "train.csv")
    frame["boat"] = "post-outcome"
    frame["body"] = 1
    features, target = build_feature_frame(frame)
    assert "boat" not in features
    assert "body" not in features
    assert "survived" not in features
    assert "family_size" in features
    assert len(features) == len(target) == 891
