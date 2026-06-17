#!/usr/bin/env python3
"""
scripts/validate_kaggle_dataset.py
Validates the Kaggle Titanic local dataset files for structure, columns, and shape.
"""
from pathlib import Path
import pandas as pd
import sys

PROJECT_ROOT = Path(__file__).resolve().parents[1]
KAGGLE_DIR = PROJECT_ROOT / "titanic"

def validate_dataset():
    print("=== Validating Kaggle Titanic Dataset ===")
    
    files = {
        "train.csv": KAGGLE_DIR / "train.csv",
        "test.csv": KAGGLE_DIR / "test.csv",
        "gender_submission.csv": KAGGLE_DIR / "gender_submission.csv"
    }
    
    # 1. Check file existence
    for filename, path in files.items():
        if not path.is_file():
            print(f"ERROR: Missing file {filename} in {KAGGLE_DIR}", file=sys.stderr)
            sys.exit(1)
        print(f"✓ Found {filename} ({path.stat().st_size} bytes)")

    # 2. Load and inspect train.csv
    train = pd.read_csv(files["train.csv"])
    print(f"✓ Loaded train.csv successfully. Shape: {train.shape}")
    
    # Check Survived column
    if "Survived" not in train.columns:
        print("ERROR: train.csv must contain 'Survived' column!", file=sys.stderr)
        sys.exit(1)
    print("✓ train.csv contains 'Survived' column.")

    # 3. Load and inspect test.csv
    test = pd.read_csv(files["test.csv"])
    print(f"✓ Loaded test.csv successfully. Shape: {test.shape}")
    
    # Check Survived column NOT in test.csv
    if "Survived" in test.columns:
        print("ERROR: test.csv must NOT contain 'Survived' column!", file=sys.stderr)
        sys.exit(1)
    print("✓ test.csv does not contain 'Survived' column.")

    # 4. Load and inspect gender_submission.csv
    sub = pd.read_csv(files["gender_submission.csv"])
    print(f"✓ Loaded gender_submission.csv successfully. Shape: {sub.shape}")
    
    required_cols = ["PassengerId", "Survived"]
    for col in required_cols:
        if col not in sub.columns:
            print(f"ERROR: gender_submission.csv must contain '{col}' column!", file=sys.stderr)
            sys.exit(1)
    print("✓ gender_submission.csv contains required columns (PassengerId, Survived).")

    # 5. Check row align
    if len(test) != len(sub):
        print(f"ERROR: test.csv length ({len(test)}) does not match gender_submission.csv length ({len(sub)})!", file=sys.stderr)
        sys.exit(1)
    print("✓ Rows of test.csv and gender_submission.csv align perfectly.")

    print("\n✓ Kaggle dataset validation complete. All checks passed!")

if __name__ == "__main__":
    validate_dataset()
