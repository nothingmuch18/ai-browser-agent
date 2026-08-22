"""Step 4 test script from Member B guide — verify browser engine works end-to-end."""
import asyncio
from app.services.browser_engine import BrowserEngine

async def test():
    engine = BrowserEngine()
    sid = await engine.start_session()
    print("Session started:", sid)
    res = await engine.navigate(sid, "https://example.com")
    print("Navigated:", res)
    state = await engine.get_page_state(sid)
    print("State title:", state["title"])
    await engine.screenshot(sid, "test.png")
    print("Screenshot saved to test.png")
    await engine.close_session(sid)
    print("Session closed cleanly!")

asyncio.run(test())
