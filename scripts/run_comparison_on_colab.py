import os
import sys
import tarfile
from pathlib import Path
import runpy

archive = Path("/content/titanic-assignment-inputs.tar.gz")
project = Path("/content")

if not archive.exists():
    raise FileNotFoundError(f"Upload the project input archive to {archive}")

with tarfile.open(archive, "r:gz") as bundle:
    bundle.extractall("/content", filter="data")

os.chdir(project)
os.environ["MPLCONFIGDIR"] = "/tmp/matplotlib-cache"

# Clear existing modules to avoid caching conflicts
for module_name in list(sys.modules):
    if module_name == "titanic_project" or module_name.startswith("titanic_project."):
        del sys.modules[module_name]

print("Starting model comparison script run...")
runpy.run_path(str(project / "notebooks" / "01_Titanic_Model_Comparison_Project.py"), run_name="__main__")
print("Model comparison run complete.")
