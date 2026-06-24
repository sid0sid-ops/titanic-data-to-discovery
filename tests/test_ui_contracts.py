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


def test_model_comparison_table_is_scrollable_and_expandable():
    app_source = (ROOT / "src" / "App.jsx").read_text()
    styles_source = (ROOT / "src" / "styles.css").read_text()
    history_source = (ROOT / "src" / "data" / "modelComparisonHistory.js").read_text()

    assert 'aria-label="Scrollable model comparison table"' in app_source
    assert 'className="model-progress-button"' in app_source
    assert "aria-expanded={isExpanded}" in app_source
    assert 'id="model-progress-panel"' in app_source
    assert "previousModelMetrics" in app_source
    assert "droppedMetrics.length > 0" in app_source
    assert "Why did some metrics drop?" in app_source
    assert "metricExtremes" in app_source
    assert "higherIsBetter: false" in app_source
    assert "metric-best" in app_source
    assert "metric-worst" in app_source
    assert "overflow-x: auto" in styles_source
    assert "position: sticky" in styles_source
    assert "td.metric-best" in styles_source
    assert "td.metric-worst" in styles_source
    assert "grouped Age" in history_source
    assert "target-derived ticket survival feature" in history_source
