#!/usr/bin/env python3
"""
scripts/create_three_notebooks.py
Wrapper script that calls the three individual standalone scripts:
1. scripts/create_kaggle_workflow_notebook.py
2. scripts/create_model_comparison_notebook.py
3. scripts/create_openml_reference_notebook.py
"""
import sys
import subprocess
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
SCRIPTS_DIR = PROJECT_ROOT / "scripts"

def run_script(script_name):
    script_path = SCRIPTS_DIR / script_name
    print(f"Running standalone script: {script_name}...")
    result = subprocess.run([sys.executable, str(script_path)], capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error executing {script_name}:\n{result.stderr}")
        sys.exit(result.returncode)
    else:
        print(result.stdout.strip())

def main():
    # Parse arguments for modular selection
    target_notebooks = ["00", "01", "02"]
    if "--only" in sys.argv:
        try:
            idx = sys.argv.index("--only")
            val = sys.argv[idx + 1]
            if val not in ["00", "01", "02"]:
                raise ValueError
            target_notebooks = [val]
        except (IndexError, ValueError):
            print("Error: --only option requires a notebook identifier ('00', '01', or '02')")
            sys.exit(1)

    if "00" in target_notebooks:
        run_script("create_kaggle_workflow_notebook.py")
    if "01" in target_notebooks:
        run_script("create_model_comparison_notebook.py")
    if "02" in target_notebooks:
        run_script("create_openml_reference_notebook.py")
        
    print("✓ Successfully completed all updates.")

if __name__ == "__main__":
    main()
