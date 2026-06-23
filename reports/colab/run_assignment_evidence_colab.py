"""Colab CLI wrapper for the assignment evidence generator."""

import os
import runpy
import sys
import tarfile
from pathlib import Path

archive = Path("/content/titanic-assignment-inputs.tar.gz")
project = Path("/content")
if not archive.exists():
    raise FileNotFoundError(f"Upload the project input archive to {archive}")

with tarfile.open(archive, "r:gz") as bundle:
    bundle.extractall("/content", filter="data")

os.chdir(project)
os.environ["MPLCONFIGDIR"] = "/tmp/matplotlib-cache"
for module_name in list(sys.modules):
    if module_name == "titanic_project" or module_name.startswith("titanic_project."):
        del sys.modules[module_name]
runpy.run_path(str(project / "scripts" / "generate_assignment_evidence.py"), run_name="__main__")

with tarfile.open("/content/assignment-evidence-colab.tar.gz", "w:gz") as bundle:
    bundle.add(project / "reports", arcname="reports")
    bundle.add(project / "public" / "reports", arcname="public/reports")

print("Remote evidence archive: /content/assignment-evidence-colab.tar.gz")
