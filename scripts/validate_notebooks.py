"""Validate project notebooks and fail if any saved output contains errors."""

from pathlib import Path

import nbformat
from nbformat.validator import validate


NOTEBOOKS = [
    "notebooks/00_Titanic_Kaggle_Main_Workflow.ipynb",
    "notebooks/01_Titanic_Model_Comparison_Project.ipynb",
    "notebooks/02_Titanic_OpenML_Reference_Workflow.ipynb",
    "notebooks/Linear Regression on Titanic Dataset Python Program code.ipynb",
    "notebooks/Python demo snippet for Logistic Regression on the Titanic dataset.ipynb",
    "notebooks/Jupytor Notebook exercise.ipynb",
]


def main() -> None:
    failures = []
    for notebook_path in NOTEBOOKS:
        path = Path(notebook_path)
        nb = nbformat.read(path, as_version=4)
        validate(nb)
        for index, cell in enumerate(nb.cells):
            for output in cell.get("outputs", []):
                if output.get("output_type") == "error":
                    failures.append(
                        f"{notebook_path}: cell {index} "
                        f"{output.get('ename')}: {output.get('evalue')}"
                    )

    if failures:
        details = "\n".join(failures)
        raise SystemExit(f"Notebook validation failed:\n{details}")

    print(f"Validated {len(NOTEBOOKS)} notebooks.")


if __name__ == "__main__":
    main()
