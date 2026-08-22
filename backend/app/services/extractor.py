"""
Extractor — lightweight page-content extraction utilities.

Used by the AI agent to pull structured data from raw HTML / page state
returned by the BrowserEngine.
"""

import re
from typing import Optional


def extract_text_from_html(html: str, max_length: int = 4000) -> str:
    """Strip HTML tags and return plain text, truncated to *max_length*."""
    text = re.sub(r"<[^>]+>", " ", html)
    text = re.sub(r"\s+", " ", text).strip()
    return text[:max_length]


def extract_links(html: str) -> list[dict]:
    """Return a list of {'text': ..., 'href': ...} dicts from anchor tags."""
    pattern = re.compile(r'<a\s[^>]*href=["\']([^"\']+)["\'][^>]*>(.*?)</a>', re.IGNORECASE)
    results = []
    for href, text in pattern.findall(html):
        clean_text = re.sub(r"<[^>]+>", "", text).strip()
        if clean_text:
            results.append({"text": clean_text, "href": href})
    return results


def summarise_page_state(page_state: dict, max_elements: int = 20) -> str:
    """Produce a compact text summary of a page state dict for the LLM prompt."""
    lines = [
        f"URL: {page_state.get('url', 'N/A')}",
        f"Title: {page_state.get('title', 'N/A')}",
    ]
    elements = page_state.get("interactive_elements", [])[:max_elements]
    if elements:
        lines.append("Interactive elements:")
        for el in elements:
            tag = el.get("tag", "?")
            text = el.get("text", "")
            sel = el.get("selector", "")
            lines.append(f"  - <{tag}> \"{text}\" → {sel}")
    return "\n".join(lines)
