"""Output mirroring helpers for GitHub Pages."""

import shutil
from pathlib import Path


def mirror_report_tree(report_root: Path, public_root: Path) -> None:
    for folder in ("figures", "tables", "metrics", "interactive"):
        source = report_root / folder
        target = public_root / folder
        target.mkdir(parents=True, exist_ok=True)
        if source.exists():
            for item in source.iterdir():
                if item.is_file():
                    shutil.copy2(item, target / item.name)
