import json
import sqlite3
from datetime import datetime, timedelta

def seed_database():
    conn = sqlite3.connect("agent.db")
    cursor = conn.cursor()

    # Create table if not exists
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        goal TEXT NOT NULL,
        target_url TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        steps_json TEXT DEFAULT '[]',
        extracted_data_json TEXT DEFAULT '[]',
        created_at TIMESTAMP,
        completed_at TIMESTAMP
    )
    """)

    # 3 Pre-filled completed tasks
    tasks = [
        (
            "task_demo_1",
            "Search for 'Wireless Noise Canceling Headphones' on Amazon, filter by 4+ stars, and extract top product details.",
            "https://www.amazon.com/s?k=Wireless+Noise+Canceling+Headphones",
            "completed",
            json.dumps([
                {"step_number": 1, "action": "navigate", "target": "https://www.amazon.com", "status": "completed", "result": "Loaded home portal", "timestamp": "11:15:02"},
                {"step_number": 2, "action": "type", "target": "#twotabsearchtextbox", "status": "completed", "result": "Typed 'Wireless Noise Canceling Headphones'", "timestamp": "11:15:03"},
                {"step_number": 3, "action": "click", "target": "#nav-search-submit-button", "status": "completed", "result": "Executed search query", "timestamp": "11:15:04"},
                {"step_number": 4, "action": "click", "target": "#p_72/1248879011", "status": "completed", "result": "Applied 4+ Star review filter", "timestamp": "11:15:06"},
                {"step_number": 5, "action": "extract", "target": ".s-result-item", "status": "completed", "result": "Extracted 3 top product cards", "timestamp": "11:15:08"}
            ]),
            json.dumps([
                {"id": 1, "title": "Sony WH-1000XM5 Wireless Headphones", "price": "$398.00", "rating": "4.7 / 5", "badge": "Best Seller"},
                {"id": 2, "title": "Bose QuietComfort Ultra Wireless", "price": "$429.00", "rating": "4.6 / 5", "badge": "Amazon's Choice"},
                {"id": 3, "title": "Sennheiser Momentum 4 Wireless", "price": "$299.95", "rating": "4.5 / 5", "badge": "Top Rated"}
            ]),
            (datetime.utcnow() - timedelta(minutes=45)).isoformat(),
            (datetime.utcnow() - timedelta(minutes=43)).isoformat()
        ),
        (
            "task_demo_2",
            "Search for 'IIT Bombay Coding Club members', locate WnCC portal, and extract executive council leads.",
            "https://www.wncc-iitb.org/team",
            "completed",
            json.dumps([
                {"step_number": 1, "action": "navigate", "target": "https://www.wncc-iitb.org", "status": "completed", "result": "Loaded WnCC Homepage", "timestamp": "11:30:10"},
                {"step_number": 2, "action": "click", "target": "nav a[href='/team']", "status": "completed", "result": "Navigated to Council Roster", "timestamp": "11:30:12"},
                {"step_number": 3, "action": "extract", "target": ".team-grid .member-card", "status": "completed", "result": "Extracted 5 Council Leads", "timestamp": "11:30:15"}
            ]),
            json.dumps([
                {"id": 1, "name": "Aarav Sharma", "role": "Overall Coordinator", "dept": "CSE B.Tech 4th Year", "github": "@aarav-iitb"},
                {"id": 2, "name": "Rohan Kulkarni", "role": "AI & ML Lead", "dept": "EE B.Tech 3rd Year", "github": "@rohan-ai-iitb"},
                {"id": 3, "name": "Sneha Patel", "role": "Web Dev Manager", "dept": "CSE B.Tech 3rd Year", "github": "@sneha-patel-dev"}
            ]),
            (datetime.utcnow() - timedelta(minutes=25)).isoformat(),
            (datetime.utcnow() - timedelta(minutes=24)).isoformat()
        ),
        (
            "task_demo_3",
            "Navigate to CoinMarketCap, scroll table rows, and extract top 3 cryptocurrency spot prices.",
            "https://coinmarketcap.com",
            "completed",
            json.dumps([
                {"step_number": 1, "action": "navigate", "target": "https://coinmarketcap.com", "status": "completed", "result": "Hydrated table DOM", "timestamp": "11:45:00"},
                {"step_number": 2, "action": "extract", "target": "table.cmc-table tr", "status": "completed", "result": "Captured spot prices", "timestamp": "11:45:03"}
            ]),
            json.dumps([
                {"id": 1, "token": "Bitcoin (BTC)", "price": "$96,420.50", "24h_change": "+3.84%", "market_cap": "$1.89T"},
                {"id": 2, "token": "Ethereum (ETH)", "price": "$3,410.20", "24h_change": "+5.12%", "market_cap": "$410B"},
                {"id": 3, "token": "Solana (SOL)", "price": "$214.80", "24h_change": "+8.90%", "market_cap": "$98.5B"}
            ]),
            (datetime.utcnow() - timedelta(minutes=10)).isoformat(),
            (datetime.utcnow() - timedelta(minutes=9)).isoformat()
        )
    ]

    for task in tasks:
        cursor.execute("""
        INSERT OR REPLACE INTO tasks (id, goal, target_url, status, steps_json, extracted_data_json, created_at, completed_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, task)

    conn.commit()
    conn.close()
    print("[SUCCESS] Successfully seeded agent.db with 3 completed demo tasks!")

if __name__ == "__main__":
    seed_database()
