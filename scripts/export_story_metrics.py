#!/usr/bin/env python3
"""
scripts/export_story_metrics.py
Exports basic Kaggle metrics JSON for compatibility check.
This wrapper ensures the data directory and JSON files exist.
"""
from pathlib import Path
import json
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parents[1]
KAGGLE_DIR = PROJECT_ROOT / "titanic"
DATA_DIR = PROJECT_ROOT / "public" / "assets" / "data"

def main():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    train_path = KAGGLE_DIR / "train.csv"
    if not train_path.is_file():
        print("Error: train.csv not found!")
        return

    df = pd.read_csv(train_path)
    df.columns = df.columns.str.strip().str.lower()
    
    story_metrics = {
        "total_passengers": int(len(df)),
        "survival_rate": float(df["survived"].mean()),
        "survival_rate_female": float(df[df["sex"] == "female"]["survived"].mean()),
        "survival_rate_male": float(df[df["sex"] == "male"]["survived"].mean()),
        "survival_rate_pclass1": float(df[df["pclass"] == 1]["survived"].mean()),
        "survival_rate_pclass2": float(df[df["pclass"] == 2]["survived"].mean()),
        "survival_rate_pclass3": float(df[df["pclass"] == 3]["survived"].mean()),
    }
    
    # Save path
    save_path = DATA_DIR / "titanic_story_metrics.json"
    with open(save_path, "w") as f:
        json.dump(story_metrics, f, indent=2)
    print(f"✓ Saved titanic_story_metrics.json to {save_path}")

if __name__ == "__main__":
    main()
