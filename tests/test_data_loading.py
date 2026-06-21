from pathlib import Path
import warnings

import pandas as pd

from titanic_project.data_loading import load_titanic_data


ROOT = Path(__file__).resolve().parents[1]


def test_loads_local_kaggle_training_data():
    frame, info = load_titanic_data(ROOT / "kaggle" / "train.csv")
    assert len(frame) == 891
    assert info.variant == "Kaggle 891-row training dataset"
    assert "Survived" in frame.columns


def test_external_fixture_path_is_supported(tmp_path):
    source = pd.read_csv(ROOT / "kaggle" / "train.csv").head(12)
    fixture = tmp_path / "titanic_fixture.csv"
    source.to_csv(fixture, index=False)
    with warnings.catch_warnings(record=True) as caught:
        frame, info = load_titanic_data(fixture)
    assert len(frame) == 12
    assert str(fixture) in info.source
    assert "Kaggle-style" in info.variant
    assert caught
