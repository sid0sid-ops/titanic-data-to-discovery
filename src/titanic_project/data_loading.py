"""Dataset loading with explicit source identification."""

from dataclasses import dataclass
from pathlib import Path
import warnings

import pandas as pd


@dataclass(frozen=True)
class DatasetInfo:
    source: str
    path: Path
    row_count: int
    variant: str


def _project_root() -> Path:
    return Path(__file__).resolve().parents[2]


def load_titanic_data(path: str | Path | None = None, *, strict: bool = False) -> tuple[pd.DataFrame, DatasetInfo]:
    """Load one local Titanic dataset without combining dataset variants."""
    selected = Path(path) if path else _project_root() / "kaggle" / "train.csv"
    if not selected.is_absolute():
        selected = _project_root() / selected
    if not selected.exists():
        raise FileNotFoundError(
            f"Titanic data not found at {selected}. Add Kaggle train.csv locally; "
            "automatic network fallback is intentionally disabled."
        )

    frame = pd.read_csv(selected)
    lowered = {column.lower() for column in frame.columns}
    if {"passengerid", "survived", "pclass"}.issubset(lowered):
        variant = f"Kaggle-style training dataset ({len(frame)} rows)"
        expected_rows = 891
    elif {"boat", "body", "survived"}.issubset(lowered):
        variant = f"OpenML-style reference dataset ({len(frame)} rows)"
        expected_rows = 1309
    else:
        raise ValueError(
            "Unsupported or ambiguous Titanic schema. Do not mix Kaggle, Seaborn, "
            "and OpenML rows without an explicit analysis design."
        )

    if len(frame) != expected_rows:
        message = f"Recognized {variant}; canonical source normally has {expected_rows} rows."
        if strict:
            raise ValueError(message)
        warnings.warn(message, UserWarning, stacklevel=2)
    elif expected_rows == 891:
        variant = "Kaggle 891-row training dataset"
    else:
        variant = "OpenML 1309-row reference dataset"

    try:
        display_path = selected.relative_to(_project_root())
    except ValueError:
        display_path = selected

    info = DatasetInfo(
        source=f"Local file: {display_path}",
        path=selected,
        row_count=len(frame),
        variant=variant,
    )
    return frame, info
