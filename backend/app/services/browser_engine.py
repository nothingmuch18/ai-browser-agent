"""Playwright-based Browser Automation Engine for AI Browser Agent.

Member B — Browser Automation Lead
Implements the BrowserEngine class using Playwright async API with smart
fallback locator strategies for click, type, scroll, extract, and screenshot.
"""

import uuid
import asyncio
import aiofiles
from pathlib import Path
from bs4 import BeautifulSoup
from playwright.async_api import async_playwright, Playwright, Browser, BrowserContext, Page


class BrowserEngine:
    """Async browser engine powered by Playwright with resilient element locators."""

    def __init__(self):
        self.playwright: Playwright = None
        self.sessions: dict[str, dict] = {}  # session_id -> {browser, context, page}

    async def start_session(self) -> str:
        """Launch headless Chromium browser and create context + page."""
        try:
            if not self.playwright:
                self.playwright = await async_playwright().start()

            browser = await self.playwright.chromium.launch(
                headless=True,
                args=[
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage",
                    "--disable-gpu",
                ],
            )
            context = await browser.new_context(
                viewport={"width": 1280, "height": 720},
                user_agent=(
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/120.0.0.0 Safari/537.36"
                ),
                ignore_https_errors=True,
            )
            page = await context.new_page()
            session_id = str(uuid.uuid4())
            self.sessions[session_id] = {
                "browser": browser,
                "context": context,
                "page": page,
            }
            return session_id
        except Exception as e:
            return f"error: {str(e)}"

    async def navigate(self, session_id: str, url: str) -> dict:
        """Navigate to URL. Return status, URL, and page title."""
        if session_id not in self.sessions:
            return {"status": "failed", "error": f"Invalid session_id: {session_id}"}

        if not url.startswith(("http://", "https://", "file://", "about:", "data:")):
            url = "https://" + url

        page = self.sessions[session_id]["page"]
        try:
            await page.goto(url, wait_until="domcontentloaded", timeout=15000)
            return {"status": "success", "url": page.url, "title": await page.title()}
        except Exception as e:
            return {"status": "failed", "error": str(e)}

    async def click(self, session_id: str, selector: str) -> dict:
        """Click element using fallback locator strategy (CSS -> Text -> Role -> Aria)."""
        if session_id not in self.sessions:
            return {"status": "failed", "error": f"Invalid session_id: {session_id}"}

        page = self.sessions[session_id]["page"]
        strategies = [
            lambda: page.click(selector, timeout=4000),
            lambda: page.get_by_text(selector, exact=False).first.click(timeout=4000),
            lambda: page.get_by_role("button", name=selector).click(timeout=4000),
            lambda: page.get_by_role("link", name=selector).click(timeout=4000),
            lambda: page.locator(f"[aria-label*='{selector}']").first.click(timeout=4000),
        ]
        for strategy in strategies:
            try:
                await strategy()
                return {"status": "success", "clicked": selector}
            except Exception:
                continue
        return {"status": "failed", "error": f"Could not locate element: {selector}"}

    async def type_text(self, session_id: str, selector: str, text: str) -> dict:
        """Type text into input field using smart selector fallbacks."""
        if session_id not in self.sessions:
            return {"status": "failed", "error": f"Invalid session_id: {session_id}"}

        page = self.sessions[session_id]["page"]
        strategies = [
            lambda: page.fill(selector, text, timeout=4000),
            lambda: page.get_by_placeholder(selector).fill(text, timeout=4000),
            lambda: page.get_by_label(selector).fill(text, timeout=4000),
        ]
        for strategy in strategies:
            try:
                await strategy()
                return {"status": "success", "typed": text, "into": selector}
            except Exception:
                continue
        return {"status": "failed", "error": f"Could not fill input field: {selector}"}

    async def extract(self, session_id: str, instruction: str) -> dict:
        """Extract clean text content from page using BeautifulSoup."""
        if session_id not in self.sessions:
            return {"status": "failed", "error": f"Invalid session_id: {session_id}"}

        page = self.sessions[session_id]["page"]
        try:
            try:
                await page.wait_for_load_state("domcontentloaded", timeout=3000)
            except Exception:
                pass
            html = await page.content()
            soup = BeautifulSoup(html, "lxml")
            for tag in soup(["script", "style", "meta", "link", "noscript", "svg"]):
                tag.decompose()
            text = soup.get_text(separator="\n", strip=True)
            return {"status": "success", "data": text[:4000], "url": page.url}
        except Exception as e:
            return {"status": "failed", "error": str(e)}

    async def screenshot(self, session_id: str, path: str) -> str:
        """Take page screenshot and save to path."""
        if session_id not in self.sessions:
            return {"status": "failed", "error": f"Invalid session_id: {session_id}"}

        page = self.sessions[session_id]["page"]
        try:
            target_path = Path(path).resolve()
            target_path.parent.mkdir(parents=True, exist_ok=True)
            await page.screenshot(path=str(target_path), full_page=False)
            return str(target_path)
        except Exception as e:
            return f"error: {str(e)}"

    async def get_page_state(self, session_id: str) -> dict:
        """Get current URL, title, and simplified content + list of interactive elements."""
        if session_id not in self.sessions:
            return {"url": "", "title": "", "content": "No active browser session."}

        page = self.sessions[session_id]["page"]
        try:
            try:
                await page.wait_for_load_state("domcontentloaded", timeout=3000)
            except Exception:
                pass
            html = await page.content()
            soup = BeautifulSoup(html, "lxml")
            for tag in soup(["script", "style", "meta", "link", "noscript", "svg"]):
                tag.decompose()

            # Get interactive elements
            interactive = []
            for elem in soup.find_all(["a", "button", "input", "select", "textarea"]):
                tag_name = elem.name
                text_content = elem.get_text(strip=True)[:40]
                placeholder = elem.get("placeholder", "")
                aria = elem.get("aria-label", "")
                desc = f"[{tag_name}]"
                if text_content:
                    desc += f" text='{text_content}'"
                if placeholder:
                    desc += f" placeholder='{placeholder}'"
                if aria:
                    desc += f" aria-label='{aria}'"
                interactive.append(desc)

            simplified = soup.get_text(separator=" ", strip=True)[:2500]
            if interactive:
                simplified += "\n\n--- Interactive Elements ---\n" + "\n".join(interactive[:25])

            return {
                "url": page.url,
                "title": await page.title(),
                "content": simplified[:4000],
            }
        except Exception as e:
            return {"url": "", "title": "", "content": f"Error reading page state: {str(e)}"}

    async def scroll(self, session_id: str, direction: str) -> dict:
        """Scroll page down or up."""
        if session_id not in self.sessions:
            return {"status": "failed", "error": f"Invalid session_id: {session_id}"}

        page = self.sessions[session_id]["page"]
        try:
            if direction.strip().lower() in ("down", "bottom"):
                await page.evaluate("window.scrollBy(0, 500)")
            elif direction.strip().lower() in ("up", "top"):
                await page.evaluate("window.scrollBy(0, -500)")
            else:
                await page.locator(direction).first.scroll_into_view_if_needed(timeout=4000)
            return {"status": "success", "scrolled": direction}
        except Exception as e:
            return {"status": "failed", "error": str(e)}

    async def close_session(self, session_id: str) -> None:
        """Close context and browser for session."""
        if session_id in self.sessions:
            session = self.sessions.pop(session_id)
            try:
                await session["context"].close()
            except Exception:
                pass
            try:
                await session["browser"].close()
            except Exception:
                pass

    async def close_all(self) -> None:
        """Close all active sessions and stop Playwright instance."""
        for sid in list(self.sessions.keys()):
            await self.close_session(sid)
        if self.playwright:
            try:
                await self.playwright.stop()
            except Exception:
                pass
            self.playwright = None
