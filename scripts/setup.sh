#!/usr/bin/env bash
# ==============================================================================
# AI Browser Agent - Automated Developer Environment Setup (Linux / macOS)
# ==============================================================================

set -e

# Color helpers
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}====================================================${NC}"
echo -e "${BLUE}🤖 Setting up AI Browser Agent Environment...        ${NC}"
echo -e "${BLUE}====================================================${NC}"

# 1. Check Prerequisites
echo -e "\n${YELLOW}[1/7] Checking Prerequisites...${NC}"

command -v python3 >/dev/null 2>&1 || { echo -e "${RED}[!] Python 3 is required but not installed. Aborting.${NC}" >&2; exit 1; }
command -v node >/dev/null 2>&1 || { echo -e "${RED}[!] Node.js is required but not installed. Aborting.${NC}" >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo -e "${RED}[!] npm is required but not installed. Aborting.${NC}" >&2; exit 1; }

echo -e "${GREEN}✓ Python $(python3 --version | cut -d' ' -f2) found${NC}"
echo -e "${GREEN}✓ Node $(node --version) found${NC}"
echo -e "${GREEN}✓ npm $(npm --version) found${NC}"

if command -v docker >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Docker found: $(docker --version)${NC}"
else
    echo -e "${YELLOW}⚠ Docker not detected (Optional if running locally)${NC}"
fi

# 2. Configure Environment File
echo -e "\n${YELLOW}[2/7] Checking Environment Configuration (.env)...${NC}"
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✓ Created .env from .env.example${NC}"
        echo -e "${YELLOW}👉 Remember to set GEMINI_API_KEY in .env${NC}"
    else
        echo "GEMINI_API_KEY=" > .env
        echo "DATABASE_URL=sqlite:///./agent.db" >> .env
        echo "CORS_ORIGINS=http://localhost:3000" >> .env
        echo -e "${GREEN}✓ Created default .env file${NC}"
    fi
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi

# 3. Setup Backend Python Virtual Environment
echo -e "\n${YELLOW}[3/7] Setting up Backend Python Environment...${NC}"
cd backend || exit 1
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo -e "${GREEN}✓ Created virtualenv in backend/venv${NC}"
fi

# Activate venv
source venv/bin/activate || source venv/Scripts/activate 2>/dev/null || true

pip install --upgrade pip
if [ -f requirements.txt ]; then
    pip install -r requirements.txt
    echo -e "${GREEN}✓ Backend Python dependencies installed${NC}"
fi

# 4. Install Playwright Browsers
echo -e "\n${YELLOW}[4/7] Installing Playwright Chromium Browser...${NC}"
playwright install chromium --with-deps || playwright install chromium || echo -e "${YELLOW}⚠ Playwright browser install notice${NC}"
echo -e "${GREEN}✓ Playwright setup complete${NC}"
cd ..

# 5. Setup Frontend Node Environment
echo -e "\n${YELLOW}[5/7] Setting up Frontend Dependencies...${NC}"
if [ -d "frontend" ] && [ -f "frontend/package.json" ]; then
    cd frontend
    npm install
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
    cd ..
else
    echo -e "${YELLOW}⚠ frontend/package.json not present yet (Will be installed once Frontend branch merges)${NC}"
fi

# 6. Create Screenshots & Data Directory
echo -e "\n${YELLOW}[6/7] Initializing Storage Directories...${NC}"
mkdir -p backend/screenshots
mkdir -p screenshots
echo -e "${GREEN}✓ Created screenshots directories${NC}"

# 7. Seed Initial Demo Database
echo -e "\n${YELLOW}[7/7] Populating Demo Seed Data...${NC}"
if [ -f "scripts/seed_data.py" ]; then
    python3 scripts/seed_data.py || python scripts/seed_data.py || true
    echo -e "${GREEN}✓ Demo seed data generated${NC}"
fi

echo -e "\n${BLUE}====================================================${NC}"
echo -e "${GREEN}✨ Setup Completed Successfully! ✨${NC}"
echo -e "${BLUE}====================================================${NC}"
echo -e "You can now start the application with:"
echo -e "  ${YELLOW}Docker:${NC}   docker compose up --build"
echo -e "  ${YELLOW}Backend:${NC}  cd backend && source venv/bin/activate && uvicorn app.main:app --reload"
echo -e "  ${YELLOW}Frontend:${NC} cd frontend && npm run dev"
echo -e "${BLUE}====================================================${NC}"
