"""Unit and contract validation tests for BrowserEngine and DataExtractor."""

import inspect
import os
import tempfile
import pytest
from app.services.browser_engine import BrowserEngine
from app.services.extractor import DataExtractor


def test_browser_engine_interface_signatures():
    """Verify BrowserEngine has all methods matching Member A's expected contract."""
    engine = BrowserEngine()

    required_methods = [
        "start_session",
        "navigate",
        "click",
        "type_text",
        "extract",
        "screenshot",
        "get_page_state",
        "scroll",
        "close_session",
    ]

    for method_name in required_methods:
        assert hasattr(engine, method_name), f"Missing method: {method_name}"
        method = getattr(engine, method_name)
        assert inspect.iscoroutinefunction(method), f"{method_name} must be an async coroutine"


def test_data_extractor_interface_signatures():
    """Verify DataExtractor has all required structured extraction methods."""
    extractor = DataExtractor()

    required_methods = [
        "extract_tables",
        "extract_links",
        "extract_forms",
        "extract_text_content",
    ]

    for method_name in required_methods:
        assert hasattr(extractor, method_name), f"Missing method: {method_name}"
        method = getattr(extractor, method_name)
        assert inspect.iscoroutinefunction(method), f"{method_name} must be an async coroutine"


@pytest.mark.asyncio
async def test_session_not_found_handling():
    """Verify operations on non-existent session return error dictionaries and don't crash."""
    engine = BrowserEngine()
    fake_session_id = "non-existent-session-id"

    nav_res = await engine.navigate(fake_session_id, "https://example.com")
    assert nav_res["status"] == "failed"
    assert "Invalid session_id" in nav_res["error"]

    click_res = await engine.click(fake_session_id, "button")
    assert click_res["status"] == "failed"
    assert "Invalid session_id" in click_res["error"]

    type_res = await engine.type_text(fake_session_id, "input", "test")
    assert type_res["status"] == "failed"
    assert "Invalid session_id" in type_res["error"]

    extract_res = await engine.extract(fake_session_id)
    assert extract_res["status"] == "failed"

    scroll_res = await engine.scroll(fake_session_id, "down")
    assert scroll_res["status"] == "failed"

    state = await engine.get_page_state(fake_session_id)
    assert state["url"] == ""
    assert "No active browser session" in state["content"]


@pytest.mark.asyncio
async def test_live_browser_lifecycle_and_actions():
    """Verify full end-to-end browser session, navigation, interactions, and cleanup."""
    engine = BrowserEngine()
    extractor = DataExtractor()
    session_id = await engine.start_session()
    assert session_id and not session_id.startswith("error")

    try:
        # Create a sample local HTML document
        test_html = """
        <!DOCTYPE html>
        <html>
        <head><title>Test Playground</title></head>
        <body>
            <h1>Welcome to Agent Test</h1>
            <nav><a href="https://example.com/pricing">Pricing</a></nav>
            <form action="#" method="post">
                <label for="username">Username</label>
                <input id="username" name="user" placeholder="Enter username" />
                <button type="button" aria-label="Submit Form">Submit Button</button>
            </form>
            <table id="data-table">
                <thead><tr><th>Name</th><th>Role</th></tr></thead>
                <tbody>
                    <tr><td>Alice</td><td>Engineer</td></tr>
                    <tr><td>Bob</td><td>Designer</td></tr>
                </tbody>
            </table>
        </body>
        </html>
        """

        with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False, encoding="utf-8") as f:
            f.write(test_html)
            temp_path = f.name

        try:
            file_url = f"file:///{temp_path.replace(os.sep, '/')}"
            # 1. Navigate
            nav_result = await engine.navigate(session_id, file_url)
            assert nav_result["status"] == "success"
            assert "Test Playground" in nav_result["title"]

            # 2. Get Page State (LLM context distillation)
            state = await engine.get_page_state(session_id)
            assert "Test Playground" in state["title"]
            assert "Welcome to Agent Test" in state["content"]
            assert "--- Interactive Elements ---" in state["content"]
            assert len(state["content"]) <= 4000

            # 3. Type into input using placeholder or label fallback
            type_result = await engine.type_text(session_id, "Enter username", "agent_user")
            assert type_result["status"] == "success"

            # 4. Click using aria-label / button role fallback
            click_result = await engine.click(session_id, "Submit Button")
            assert click_result["status"] == "success"

            # 5. Extract tables, links, forms with DataExtractor
            session = engine._get_session(session_id)
            page = session["page"]

            tables = await extractor.extract_tables(page)
            assert len(tables) == 1
            assert tables[0]["headers"] == ["Name", "Role"]
            assert len(tables[0]["rows"]) == 2
            assert tables[0]["rows"][0]["Name"] == "Alice"

            links = await extractor.extract_links(page)
            assert len(links) >= 1
            assert any("pricing" in l["href"] for l in links)

            forms = await extractor.extract_forms(page)
            assert len(forms) == 1
            assert forms[0]["method"] == "POST"

            # 6. Take screenshot
            with tempfile.TemporaryDirectory() as tmpdir:
                shot_path = os.path.join(tmpdir, "test_shot.png")
                saved_path = await engine.screenshot(session_id, shot_path)
                assert os.path.exists(saved_path)
                assert os.path.getsize(saved_path) > 0

            # 7. Scroll
            scroll_res = await engine.scroll(session_id, "down")
            assert scroll_res["status"] == "success"

        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

    finally:
        await engine.close_session(session_id)
        await engine.close_all()
