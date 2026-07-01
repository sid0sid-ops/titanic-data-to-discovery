# Study Material Update Guide

Use this folder as the source for classroom material, assignments, and future concept updates.

## Quick Entry Point

- Inventory and update rules: [material_index.md](material_index.md)
- Day mapping: [../docs/class_schedule.md](../docs/class_schedule.md)
- Exact professor prompts: [../docs/professor_questions.md](../docs/professor_questions.md)

## Main Rule

When new study material is added:

1. Add only the assignment questions and written answers to the webpage assignment section.
2. Add concepts, learning points, examples, and notebook exercises to `notebooks/00_Titanic_Kaggle_Main_Workflow.ipynb`.
3. Do not mix model-comparison content into the main Kaggle companion page unless it belongs to `00_Titanic_Kaggle_Main_Workflow.ipynb`.

## Assignment Page Content

The assignment page should contain only:

- The exact question from the study material.
- A clear student-style answer.
- The correct day/topic based on the class schedule.

Do not add extra prediction widgets, model comparison tables, or unrelated notebook outputs to the assignment page.

## Required Student Details

Every assignment notebook should include these fields at the top:

- `Name: Siddharth Tripathi`
- `Guardian Name: Manoj Tripathi`
- `Email ID: sidmsi532004@gmail.com`
- `Contact Number: 9412116374`
- `Enrollment No.: 473611`

## Dataset Source

For the assignment notebooks, load the Kaggle Titanic files directly from the GitHub raw URLs used in the study material:

- `https://raw.githubusercontent.com/sid0sid-ops/titanic-data-to-discovery/main/kaggle/train.csv`
- `https://raw.githubusercontent.com/sid0sid-ops/titanic-data-to-discovery/main/kaggle/test.csv`

## Notebook Content

Use `notebooks/00_Titanic_Kaggle_Main_Workflow.ipynb` for:

- Concepts taught in class.
- Learning notes.
- Code exercises.
- Dataset exploration.
- Statistics practice.
- Regression/classification examples that support the main Kaggle workflow.

Keep the notebook cell order clean:

1. Setup and imports
2. Data loading
3. Cleaning and leakage checks
4. Missing-value analysis
5. Exploratory data analysis
6. Classroom statistics/concept exercises
7. Feature engineering
8. Custom imputation
9. Train/test split
10. Preprocessing pipeline
11. Model training/search
12. Evaluation
13. Pipeline diagram and coefficients
14. Kaggle submission
15. Relevance, mindset, and reflection

## Future Updates

When a future study material file is added:

1. Read the file first.
2. Identify the class day from the schedule.
3. Put questions in the assignment page.
4. Put concepts and code learning into the notebook.
5. Keep all new cells near the matching topic, not at the end unless it is a final reflection.
6. Run notebook validation and the website build before committing.
