#!/usr/bin/env python3
"""
Seed Data Script for AI Browser Agent
Populates the SQLite database (agent.db) with realistic demo tasks and steps
for dashboard testing, UI preview, and demonstration purposes.
"""

import os
import sys
import json
import sqlite3
import uuid
from datetime import datetime, timezone, timedelta

# Determine database path
DB_PATH = os.environ.get("DATABASE_URL", "sqlite:///./agent.db")
if DB_PATH.startswith("sqlite:///"):
    DB_FILE = DB_PATH.replace("sqlite:///", "")
else:
    DB_FILE = "agent.db"

# Adjust DB_FILE path relative to project root or backend
if not os.path.exists(os.path.dirname(DB_FILE)) and os.path.dirname(DB_FILE) != "":
    os.makedirs(os.path.dirname(DB_FILE), exist_ok=True)

print(f"[*] Target SQLite Database: {os.path.abspath(DB_FILE)}")

def get_connection(db_file: str):
    conn = sqlite3.connect(db_file)
    conn.row_factory = sqlite3.Row
    return conn

def init_tables(conn):
    """Ensure Task and Step tables exist with standard schema."""
    cursor = conn.cursor()
    
    # Tasks table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        goal TEXT NOT NULL,
        target_url TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        steps_json TEXT DEFAULT '[]',
        result_json TEXT,
        created_at TEXT NOT NULL,
        completed_at TEXT,
        total_tokens INTEGER DEFAULT 0,
        execution_time_ms INTEGER DEFAULT 0,
        require_approval INTEGER DEFAULT 0,
        max_steps INTEGER DEFAULT 15
    );
    """)

    # Steps table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS steps (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        step_number INTEGER NOT NULL,
        action TEXT NOT NULL,
        target TEXT NOT NULL,
        status TEXT NOT NULL,
        result TEXT,
        screenshot_path TEXT,
        screenshot_url TEXT,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
    );
    """)
    conn.commit()

def generate_seed_tasks():
    now = datetime.now(timezone.utc)
    
    tasks = [
        {
            "id": "task-demo-001",
            "goal": "Search for remote Senior Python Engineer jobs on LinkedIn and extract salary details",
            "target_url": "https://www.linkedin.com/jobs",
            "status": "completed",
            "require_approval": 0,
            "max_steps": 15,
            "total_tokens": 3420,
            "execution_time_ms": 14250,
            "created_at": (now - timedelta(hours=2, minutes=15)).isoformat(),
            "completed_at": (now - timedelta(hours=2, minutes=13)).isoformat(),
            "result_json": json.dumps({
                "query": "Senior Python Engineer Remote",
                "total_jobs_found": 34,
                "featured_listings": [
                    {"title": "Senior Backend Engineer (Python/FastAPI)", "company": "Vercel", "location": "Remote (US)", "salary": "$175,000 - $210,000"},
                    {"title": "Lead Python Developer", "company": "Stripe", "location": "Remote (Global)", "salary": "$190,000 - $240,000"},
                    {"title": "AI Platform Engineer (Python)", "company": "Anthropic", "location": "Remote (US)", "salary": "$210,000 - $280,000"}
                ]
            }),
            "steps": [
                {"step_number": 1, "action": "navigate", "target": "https://www.linkedin.com/jobs", "status": "completed", "result": "Navigated to LinkedIn Jobs portal", "screenshot_url": "/screenshots/demo-step-1.png"},
                {"step_number": 2, "action": "type", "target": "input[aria-label='Search by title, skill, or company']", "status": "completed", "result": "Typed 'Senior Python Engineer'", "screenshot_url": "/screenshots/demo-step-2.png"},
                {"step_number": 3, "action": "type", "target": "input[aria-label='City, state, or zip code']", "status": "completed", "result": "Typed 'Remote'", "screenshot_url": "/screenshots/demo-step-3.png"},
                {"step_number": 4, "action": "click", "target": "button[type='submit']", "status": "completed", "result": "Clicked search button", "screenshot_url": "/screenshots/demo-step-4.png"},
                {"step_number": 5, "action": "wait", "target": "div.jobs-search-results-list", "status": "completed", "result": "Job search results loaded", "screenshot_url": "/screenshots/demo-step-5.png"},
                {"step_number": 6, "action": "scroll", "target": "window.scrollBy(0, 800)", "status": "completed", "result": "Scrolled 800px down to load dynamic listings", "screenshot_url": "/screenshots/demo-step-6.png"},
                {"step_number": 7, "action": "extract", "target": "ul.jobs-search__results-list li", "status": "completed", "result": "Extracted top 3 job cards with salary and requirements", "screenshot_url": "/screenshots/demo-step-7.png"},
                {"step_number": 8, "action": "screenshot", "target": "body", "status": "completed", "result": "Captured final results page snapshot", "screenshot_url": "/screenshots/demo-step-8.png"}
            ]
        },
        {
            "id": "task-demo-002",
            "goal": "Compare MacBook Pro M3 16-inch prices on Amazon and BestBuy",
            "target_url": "https://www.amazon.com",
            "status": "completed",
            "require_approval": 0,
            "max_steps": 15,
            "total_tokens": 4180,
            "execution_time_ms": 18900,
            "created_at": (now - timedelta(hours=1, minutes=40)).isoformat(),
            "completed_at": (now - timedelta(hours=1, minutes=37)).isoformat(),
            "result_json": json.dumps({
                "product": "Apple MacBook Pro 16-inch M3 Pro (36GB RAM, 512GB SSD)",
                "comparison": [
                    {"retailer": "Amazon", "price": "$2,299.00", "availability": "In Stock", "rating": "4.8/5 (1,240 reviews)", "delivery": "Next-Day Free Prime"},
                    {"retailer": "BestBuy", "price": "$2,499.00", "availability": "In Stock", "rating": "4.9/5 (890 reviews)", "delivery": "Free 2-Day Shipping"}
                ],
                "best_deal": "Amazon ($200 cheaper)"
            }),
            "steps": [
                {"step_number": 1, "action": "navigate", "target": "https://www.amazon.com", "status": "completed", "result": "Navigated to Amazon.com", "screenshot_url": "/screenshots/demo-amazon-1.png"},
                {"step_number": 2, "action": "type", "target": "#twotabsearchtextbox", "status": "completed", "result": "Entered 'MacBook Pro 16 M3 Pro 36GB'", "screenshot_url": "/screenshots/demo-amazon-2.png"},
                {"step_number": 3, "action": "click", "target": "#nav-search-submit-button", "status": "completed", "result": "Submitted search", "screenshot_url": "/screenshots/demo-amazon-3.png"},
                {"step_number": 4, "action": "extract", "target": "div[data-component-type='s-search-result']:first-of-type", "status": "completed", "result": "Extracted price $2,299.00 and stock status", "screenshot_url": "/screenshots/demo-amazon-4.png"},
                {"step_number": 5, "action": "navigate", "target": "https://www.bestbuy.com", "status": "completed", "result": "Navigated to BestBuy.com", "screenshot_url": "/screenshots/demo-bestbuy-1.png"},
                {"step_number": 6, "action": "type", "target": "input#gh-search-input", "status": "completed", "result": "Entered search query", "screenshot_url": "/screenshots/demo-bestbuy-2.png"},
                {"step_number": 7, "action": "click", "target": "button.header-search-button", "status": "completed", "result": "Triggered BestBuy search", "screenshot_url": "/screenshots/demo-bestbuy-3.png"},
                {"step_number": 8, "action": "extract", "target": "div.pricing-price", "status": "completed", "result": "Extracted price $2,499.00", "screenshot_url": "/screenshots/demo-bestbuy-4.png"},
                {"step_number": 9, "action": "screenshot", "target": "body", "status": "completed", "result": "Captured comparison snapshot", "screenshot_url": "/screenshots/demo-bestbuy-5.png"},
                {"step_number": 10, "action": "wait", "target": "2000ms", "status": "completed", "result": "Synthesized price comparison summary", "screenshot_url": "/screenshots/demo-bestbuy-6.png"}
            ]
        },
        {
            "id": "task-demo-003",
            "goal": "Extract the top 5 trending AI news headlines and URLs from Hacker News",
            "target_url": "https://news.ycombinator.com",
            "status": "completed",
            "require_approval": 0,
            "max_steps": 10,
            "total_tokens": 2150,
            "execution_time_ms": 7800,
            "created_at": (now - timedelta(minutes=45)).isoformat(),
            "completed_at": (now - timedelta(minutes=43)).isoformat(),
            "result_json": json.dumps({
                "source": "Hacker News (news.ycombinator.com)",
                "extracted_at": now.isoformat(),
                "stories": [
                    {"rank": 1, "title": "Google DeepMind open-sources new agentic reasoning framework", "points": 582, "comments": 214, "url": "https://deepmind.google/research"},
                    {"rank": 2, "title": "Show HN: Fast Playwright browser automation in WebAssembly", "points": 439, "comments": 98, "url": "https://github.com/example/wasm-playwright"},
                    {"rank": 3, "title": "Next.js 15: Deep dive into React Server Components caching", "points": 312, "comments": 145, "url": "https://nextjs.org/blog"},
                    {"rank": 4, "title": "SQLite as a vector database for local AI agents", "points": 289, "comments": 67, "url": "https://sqlite.org"},
                    {"rank": 5, "title": "Building resilient web scrapers with autonomous LLM loops", "points": 241, "comments": 53, "url": "https://example.com/llm-scrapers"}
                ]
            }),
            "steps": [
                {"step_number": 1, "action": "navigate", "target": "https://news.ycombinator.com", "status": "completed", "result": "Loaded Hacker News homepage", "screenshot_url": "/screenshots/demo-hn-1.png"},
                {"step_number": 2, "action": "wait", "target": "tr.athing", "status": "completed", "result": "Story items visible", "screenshot_url": "/screenshots/demo-hn-2.png"},
                {"step_number": 3, "action": "extract", "target": "tr.athing span.titleline > a", "status": "completed", "result": "Extracted top 30 story headlines and URLs", "screenshot_url": "/screenshots/demo-hn-3.png"},
                {"step_number": 4, "action": "extract", "target": "td.subtext span.score", "status": "completed", "result": "Extracted score and comment counts", "screenshot_url": "/screenshots/demo-hn-4.png"},
                {"step_number": 5, "action": "screenshot", "target": "body", "status": "completed", "result": "Captured front page screenshot", "screenshot_url": "/screenshots/demo-hn-5.png"},
                {"step_number": 6, "action": "wait", "target": "500ms", "status": "completed", "result": "Filtered top 5 AI-related discussions", "screenshot_url": "/screenshots/demo-hn-6.png"}
            ]
        },
        {
            "id": "task-demo-004",
            "goal": "Submit enterprise contact demo request form on SaaS platform",
            "target_url": "https://demo.saasplatform.example/contact",
            "status": "failed",
            "require_approval": 1,
            "max_steps": 10,
            "total_tokens": 1820,
            "execution_time_ms": 9400,
            "created_at": (now - timedelta(minutes=25)).isoformat(),
            "completed_at": (now - timedelta(minutes=23)).isoformat(),
            "result_json": json.dumps({
                "error": "Cloudflare Turnstile CAPTCHA detected. Autonomous submission halted to avoid violating terms of service.",
                "step_failed_at": 4
            }),
            "steps": [
                {"step_number": 1, "action": "navigate", "target": "https://demo.saasplatform.example/contact", "status": "completed", "result": "Loaded contact sales form page", "screenshot_url": "/screenshots/demo-saas-1.png"},
                {"step_number": 2, "action": "type", "target": "input[name='full_name']", "status": "completed", "result": "Filled full name: 'Alex Rivera'", "screenshot_url": "/screenshots/demo-saas-2.png"},
                {"step_number": 3, "action": "type", "target": "input[name='work_email']", "status": "completed", "result": "Filled work email: 'alex@enterprise-corp.io'", "screenshot_url": "/screenshots/demo-saas-3.png"},
                {"step_number": 4, "action": "click", "target": "iframe[title='Widget containing a Cloudflare security challenge']", "status": "failed", "result": "Security verification challenge encountered (Cloudflare CAPTCHA). Interaction aborted.", "screenshot_url": "/screenshots/demo-saas-4.png"}
            ]
        },
        {
            "id": "task-demo-005",
            "goal": "Monitor stock availability and price trends for NVIDIA RTX 4090 on Newegg",
            "target_url": "https://www.newegg.com/p/pl?d=rtx+4090",
            "status": "running",
            "require_approval": 0,
            "max_steps": 12,
            "total_tokens": 1240,
            "execution_time_ms": 4200,
            "created_at": (now - timedelta(minutes=5)).isoformat(),
            "completed_at": None,
            "result_json": None,
            "steps": [
                {"step_number": 1, "action": "navigate", "target": "https://www.newegg.com/p/pl?d=rtx+4090", "status": "completed", "result": "Navigated to Newegg RTX 4090 category page", "screenshot_url": "/screenshots/demo-newegg-1.png"},
                {"step_number": 2, "action": "wait", "target": "div.item-cells-wrap", "status": "completed", "result": "Product grid rendered", "screenshot_url": "/screenshots/demo-newegg-2.png"},
                {"step_number": 3, "action": "scroll", "target": "window.scrollBy(0, 1000)", "status": "running", "result": "Scanning available GPU variants...", "screenshot_url": None}
            ]
        }
    ]
    return tasks

def seed_database():
    conn = get_connection(DB_FILE)
    init_tables(conn)
    cursor = conn.cursor()

    tasks = generate_seed_tasks()
    print(f"[*] Seeding {len(tasks)} demo tasks into '{DB_FILE}'...")

    for t in tasks:
        # Build formatted steps list for JSON column
        steps_data = []
        for s in t["steps"]:
            step_obj = {
                "step_number": s["step_number"],
                "action": s["action"],
                "target": s["target"],
                "status": s["status"],
                "result": s.get("result"),
                "screenshot_url": s.get("screenshot_url"),
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            steps_data.append(step_obj)

        cursor.execute("""
        INSERT OR REPLACE INTO tasks (
            id, goal, target_url, status, steps_json, result_json,
            created_at, completed_at, total_tokens, execution_time_ms,
            require_approval, max_steps
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            t["id"],
            t["goal"],
            t["target_url"],
            t["status"],
            json.dumps(steps_data),
            t["result_json"],
            t["created_at"],
            t["completed_at"],
            t["total_tokens"],
            t["execution_time_ms"],
            t["require_approval"],
            t["max_steps"]
        ))

        # Insert individual step rows
        for s in t["steps"]:
            step_id = f"{t['id']}-s{s['step_number']}"
            cursor.execute("""
            INSERT OR REPLACE INTO steps (
                id, task_id, step_number, action, target,
                status, result, screenshot_path, screenshot_url, timestamp
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                step_id,
                t["id"],
                s["step_number"],
                s["action"],
                s["target"],
                s["status"],
                s.get("result"),
                s.get("screenshot_url"),
                s.get("screenshot_url"),
                datetime.now(timezone.utc).isoformat()
            ))

    conn.commit()
    conn.close()
    print("[+] Database seeding successfully completed!")
    print("    - 3 Completed tasks with rich metrics and structured outputs")
    print("    - 1 Failed task simulating realistic CAPTCHA detection")
    print("    - 1 Running task showing active execution state")

if __name__ == "__main__":
    seed_database()
