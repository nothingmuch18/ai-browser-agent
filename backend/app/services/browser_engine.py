"""
Mock Browser Engine — placeholder for Member B's Playwright implementation.

Every method is async and returns realistic dummy data so the ReAct loop
can be tested end-to-end without a real browser session.
"""

import base64
import logging
import os
from datetime import datetime, timezone
from typing import Optional

logger = logging.getLogger(__name__)

SCREENSHOTS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "screenshots")
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)


class BrowserEngine:
    """Mock browser engine — will be replaced by Playwright in Member B's branch."""

    def __init__(self) -> None:
        self._session_active = False
        self._current_url: str = ""
        self._page_title: str = ""

    # ------------------------------------------------------------------
    # Session lifecycle
    # ------------------------------------------------------------------
    async def start_session(self, headless: bool = True) -> dict:
        """Start a (mock) browser session."""
        self._session_active = True
        logger.info("Mock browser session started (headless=%s)", headless)
        return {"status": "session_started", "headless": headless}

    async def close_session(self) -> dict:
        """Close the (mock) browser session."""
        self._session_active = False
        logger.info("Mock browser session closed")
        return {"status": "session_closed"}

    # ------------------------------------------------------------------
    # Navigation
    # ------------------------------------------------------------------
    async def navigate(self, url: str) -> dict:
        """Navigate to *url*."""
        self._current_url = url
        self._page_title = f"Page — {url.split('//')[-1][:40]}"
        logger.info("Mock navigate → %s", url)
        return {
            "status": "navigated",
            "url": url,
            "title": self._page_title,
        }

    # ------------------------------------------------------------------
    # Interactions
    # ------------------------------------------------------------------
    async def click(self, selector: str) -> dict:
        """Click an element identified by *selector*."""
        logger.info("Mock click → %s", selector)
        return {"status": "clicked", "selector": selector}

    async def type_text(self, selector: str, text: str) -> dict:
        """Type *text* into the element identified by *selector*."""
        logger.info("Mock type '%s' → %s", text, selector)
        return {"status": "typed", "selector": selector, "text": text}

    async def scroll(self, direction: str = "down", amount: int = 500) -> dict:
        """Scroll the page."""
        logger.info("Mock scroll %s by %d px", direction, amount)
        return {"status": "scrolled", "direction": direction, "amount": amount}

    # ------------------------------------------------------------------
    # Extraction
    # ------------------------------------------------------------------
    async def extract(self, selector: Optional[str] = None) -> dict:
        """Extract text content from the page or a specific element."""
        logger.info("Mock extract (selector=%s)", selector)
        return {
            "status": "extracted",
            "selector": selector,
            "content": f"[Mock extracted content from {self._current_url}]",
            "text_length": 256,
        }

    async def get_page_state(self) -> dict:
        """Return a summary of the current page state."""
        return {
            "url": self._current_url,
            "title": self._page_title,
            "session_active": self._session_active,
            "interactive_elements": [
                {"tag": "a", "text": "Example Link", "selector": "a.example"},
                {"tag": "button", "text": "Submit", "selector": "button#submit"},
                {"tag": "input", "text": "", "selector": "input#search"},
            ],
        }

    # ------------------------------------------------------------------
    # Screenshots
    # ------------------------------------------------------------------
    async def screenshot(self, task_id: str, step_number: int) -> dict:
        """Take a (mock) screenshot and save to the screenshots directory."""
        filename = f"{task_id}_step_{step_number}.png"
        filepath = os.path.join(SCREENSHOTS_DIR, filename)

        # Create a tiny 1×1 white PNG as placeholder
        _TINY_PNG = (
            b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01"
            b"\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00"
            b"\x00\x00\x0cIDATx\x9cc\xf8\x0f\x00\x00\x01\x01\x00"
            b"\x05\x18\xd8N\x00\x00\x00\x00IEND\xaeB`\x82"
        )

        with open(filepath, "wb") as f:
            f.write(_TINY_PNG)

        screenshot_url = f"/screenshots/{filename}"
        screenshot_b64 = base64.b64encode(_TINY_PNG).decode("utf-8")

        logger.info("Mock screenshot saved → %s", filepath)
        return {
            "status": "screenshot_taken",
            "url": screenshot_url,
            "base64": screenshot_b64,
            "filepath": filepath,
        }
