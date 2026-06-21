from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_assignment_navigation_uses_hash_and_synchronizes_state():
    app_source = (ROOT / "src" / "App.jsx").read_text()
    assert "hashchange" in app_source
    assert 'href="#assignment"' in app_source
    assert 'id="workflow-panel-kaggle"' in app_source
    assert 'id="workflow-panel-openml"' in app_source


def test_assignment_page_exposes_tab_panels_and_labels():
    assignment_source = (ROOT / "src" / "components" / "AssignmentPage.jsx").read_text()
    assert 'role="tablist"' in assignment_source
    assert 'role="tabpanel"' in assignment_source
    assert 'aria-controls=' in assignment_source
    assert 'htmlFor=' in assignment_source
    assert 'type="button"' in assignment_source


def test_github_actions_installs_with_npm_ci():
    workflow_source = (ROOT / ".github" / "workflows" / "deploy.yml").read_text()
    assert "npm ci" in workflow_source
