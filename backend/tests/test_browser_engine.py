"""Unit and contract validation tests for BrowserEngine and DataExtractor."""

import inspect
import os
import tempfile
import pytest
from app.services.browser_engine import BrowserEngine
from app.services.extractor import DataExtractor


def test_browser_engine_interface_signatures():
    """Verify BrowserEngine has all methods matching the guide's exact contract."""
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
    """Verify DataExtractor has extract_tables and extract_links (sync, takes html str)."""
    extractor = DataExtractor()

    required_methods = [
        "extract_tables",
        "extract_links",
        "extract_lists",
        "extract_text",
    ]

    for method_name in required_methods:
        assert hasattr(extractor, method_name), f"Missing method: {method_name}"


def test_extractor_tables():
    """Verify extract_tables parses HTML tables into structured dicts."""
    extractor = DataExtractor()
    html = """
    <html><body>
    <table>
        <thead><tr><th>Name</th><th>Role</th></tr></thead>
        <tbody>
            <tr><td>Alice</td><td>Engineer</td></tr>
            <tr><td>Bob</td><td>Designer</td></tr>
        </tbody>
    </table>
    </body></html>
    """
    tables = extractor.extract_tables(html)
    assert len(tables) == 1
    assert tables[0]["headers"] == ["Name", "Role"]
    assert tables[0]["row_count"] == 2
    assert tables[0]["rows"][0]["Name"] == "Alice"
    assert tables[0]["rows"][1]["Role"] == "Designer"


def test_extractor_links():
    """Verify extract_links returns {text, href} dicts."""
    extractor = DataExtractor()
    html = """
    <html><body>
    <a href="https://example.com">Example</a>
    <a href="https://google.com">Google</a>
    <a href="#">Skip</a>
    </body></html>
    """
    links = extractor.extract_links(html)
    assert len(links) == 2
    assert links[0]["text"] == "Example"
    assert links[0]["href"] == "https://example.com"
    assert links[1]["text"] == "Google"


def test_extractor_lists():
    """Verify extract_lists parses ul/ol elements."""
    extractor = DataExtractor()
    html = """
    <html><body>
    <ul><li>Alpha</li><li>Beta</li></ul>
    <ol><li>First</li><li>Second</li><li>Third</li></ol>
    </body></html>
    """
    lists = extractor.extract_lists(html)
    assert len(lists) == 2
    assert lists[0]["type"] == "ul"
    assert lists[0]["item_count"] == 2
    assert "Alpha" in lists[0]["items"]
    assert lists[1]["type"] == "ol"
    assert lists[1]["item_count"] == 3


@pytest.mark.asyncio
async def test_session_not_found_handling():
    """Verify operations on non-existent session return error dicts and don't crash."""
    engine = BrowserEngine()
    fake_id = "non-existent-session-id"

    nav_res = await engine.navigate(fake_id, "https://example.com")
    assert nav_res["status"] == "failed"

    click_res = await engine.click(fake_id, "button")
    assert click_res["status"] == "failed"

    type_res = await engine.type_text(fake_id, "input", "test")
    assert type_res["status"] == "failed"

    extract_res = await engine.extract(fake_id, "get data")
    assert extract_res["status"] == "failed"

    scroll_res = await engine.scroll(fake_id, "down")
    assert scroll_res["status"] == "failed"

    state = await engine.get_page_state(fake_id)
    assert state["url"] == ""
    assert "No active browser session" in state["content"]


@pytest.mark.asyncio
async def test_live_browser_lifecycle():
    """Full end-to-end: start session, navigate, interact, extract, screenshot, close."""
    engine = BrowserEngine()
    extractor = DataExtractor()
    session_id = await engine.start_session()
    assert session_id and not session_id.startswith("error")

    try:
        test_html = """
        <!DOCTYPE html>
        <html>
        <head><title>Test Playground</title></head>
        <body>
            <h1>Welcome to Agent Test</h1>
            <a href="https://example.com/pricing">Pricing</a>
            <form action="#" method="post">
                <label for="username">Username</label>
                <input id="username" name="user" placeholder="Enter username" />
                <button type="button" aria-label="Submit Form">Submit</button>
            </form>
            <ul><li>Feature A</li><li>Feature B</li></ul>
            <table>
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

            # Navigate
            nav = await engine.navigate(session_id, file_url)
            assert nav["status"] == "success"
            assert "Test Playground" in nav["title"]

            # Page state
            state = await engine.get_page_state(session_id)
            assert "Test Playground" in state["title"]
            assert len(state["content"]) <= 4000

            # Type
            type_res = await engine.type_text(session_id, "Enter username", "agent_user")
            assert type_res["status"] == "success"

            # Click
            click_res = await engine.click(session_id, "Submit")
            assert click_res["status"] == "success"

            # Extract
            extract_res = await engine.extract(session_id, "get content")
            assert extract_res["status"] == "success"
            assert "Welcome to Agent Test" in extract_res["data"]

            # DataExtractor on raw HTML
            tables = extractor.extract_tables(test_html)
            assert len(tables) == 1
            assert tables[0]["rows"][0]["Name"] == "Alice"

            links = extractor.extract_links(test_html)
            assert any("pricing" in l["href"] for l in links)

            lists = extractor.extract_lists(test_html)
            assert len(lists) == 1
            assert "Feature A" in lists[0]["items"]

            # Screenshot
            with tempfile.TemporaryDirectory() as tmpdir:
                shot_path = os.path.join(tmpdir, "test_shot.png")
                saved = await engine.screenshot(session_id, shot_path)
                assert os.path.exists(saved)
                assert os.path.getsize(saved) > 0

            # Scroll
            scroll_res = await engine.scroll(session_id, "down")
            assert scroll_res["status"] == "success"

        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

    finally:
        await engine.close_session(session_id)
        await engine.close_all()
