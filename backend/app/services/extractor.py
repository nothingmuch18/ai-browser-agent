"""Structured Data Extractor using BeautifulSoup for AI Browser Agent.

Member B — Parses tables, links, and lists from raw HTML strings.
Used by the AI agent to extract structured data from page content.
"""

from bs4 import BeautifulSoup


class DataExtractor:
    """Extracts structured tables, links, lists, and text from raw HTML."""

    def extract_tables(self, html: str) -> list[dict]:
        """Parse HTML table rows into JSON dicts.

        Returns a list of table objects, each with headers, row_count, and rows.
        """
        try:
            soup = BeautifulSoup(html, "lxml")
            tables_data = []

            for idx, table in enumerate(soup.find_all("table")):
                headers = []
                thead = table.find("thead")
                if thead:
                    headers = [th.get_text(strip=True) for th in thead.find_all(["th", "td"])]

                rows = []
                tbody = table.find("tbody") or table
                for tr in tbody.find_all("tr"):
                    cells = [td.get_text(strip=True) for td in tr.find_all(["td", "th"])]
                    if not cells:
                        continue
                    if not headers and not rows:
                        headers = cells
                        continue
                    if headers and len(cells) == len(headers):
                        rows.append(dict(zip(headers, cells)))
                    else:
                        rows.append({f"col_{i+1}": cell for i, cell in enumerate(cells)})

                tables_data.append({
                    "table_index": idx,
                    "headers": headers,
                    "row_count": len(rows),
                    "rows": rows[:100],
                })

            return tables_data
        except Exception as e:
            return [{"status": "failed", "error": f"Failed to extract tables: {str(e)}"}]

    def extract_links(self, html: str) -> list[dict]:
        """Get list of {text, href} for all links on the page."""
        try:
            soup = BeautifulSoup(html, "lxml")
            links = []
            seen = set()

            for a in soup.find_all("a", href=True):
                href = a["href"].strip()
                text = a.get_text(strip=True)
                if not href or href.startswith(("#", "javascript:")):
                    continue

                dedup_key = (href, text)
                if dedup_key in seen:
                    continue
                seen.add(dedup_key)

                links.append({"text": text, "href": href})

            return links
        except Exception as e:
            return [{"status": "failed", "error": f"Failed to extract links: {str(e)}"}]

    def extract_lists(self, html: str) -> list[dict]:
        """Extract ordered (ol) and unordered (ul) lists from HTML."""
        try:
            soup = BeautifulSoup(html, "lxml")
            lists_data = []

            for idx, lst in enumerate(soup.find_all(["ul", "ol"])):
                items = [li.get_text(strip=True) for li in lst.find_all("li", recursive=False)]
                if items:
                    lists_data.append({
                        "list_index": idx,
                        "type": lst.name,
                        "item_count": len(items),
                        "items": items[:100],
                    })

            return lists_data
        except Exception as e:
            return [{"status": "failed", "error": f"Failed to extract lists: {str(e)}"}]

    def extract_text(self, html: str) -> str:
        """Extract clean readable text from HTML, stripping boilerplate."""
        try:
            soup = BeautifulSoup(html, "lxml")
            for tag in soup(["script", "style", "nav", "footer", "header", "aside", "noscript", "svg", "iframe"]):
                tag.decompose()

            main_content = soup.find(["main", "article"])
            target = main_content if main_content else soup.body or soup

            paragraphs = [p.get_text(strip=True) for p in target.find_all(["p", "h1", "h2", "h3", "h4", "li"])]
            clean_text = "\n\n".join([p for p in paragraphs if len(p) > 20])
            return clean_text if clean_text else target.get_text(separator="\n", strip=True)
        except Exception as e:
            return f"Failed to extract text: {str(e)}"
