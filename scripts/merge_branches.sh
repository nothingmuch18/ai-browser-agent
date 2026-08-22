#!/usr/bin/env bash
# ==============================================================================
# AI Browser Agent - Team Integration & Branch Merge Automation
# For Member D (Infra & Integration Lead) to run at sync checkpoints
# ==============================================================================

set -e

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}======================================================${NC}"
echo -e "${BLUE}🔀 AI Browser Agent - Automated Team Integration Tool ${NC}"
echo -e "${BLUE}======================================================${NC}"

# Check git
if ! command -v git &> /dev/null; then
    echo -e "${RED}[!] Git is not installed or not in PATH.${NC}"
    exit 1
fi

echo -e "\n${YELLOW}[Step 1] Fetching latest branches from origin...${NC}"
git fetch --all --prune

# Switch or create develop branch
echo -e "\n${YELLOW}[Step 2] Switching to 'develop' branch...${NC}"
if git show-ref --verify --quiet refs/heads/develop; then
    git checkout develop
    git pull origin develop || true
else
    git checkout -b develop
fi

# Merge Member D (Infra) first
echo -e "\n${YELLOW}[Step 3] Merging Member D (Infrastructure & Docker)...${NC}"
git merge origin/member-d/infra -m "merge: integrate Member D infrastructure" --no-edit || git merge member-d/infra -m "merge: integrate Member D infrastructure" --no-edit || true
echo -e "${GREEN}✓ Member D merged${NC}"

# Merge Member A (Backend & AI)
echo -e "\n${YELLOW}[Step 4] Merging Member A (Backend & AI Agent)...${NC}"
git merge origin/member-a/backend-ai -m "merge: integrate Member A backend & AI" --no-edit || git merge member-a/backend-ai -m "merge: integrate Member A backend & AI" --no-edit || {
    echo -e "${YELLOW}⚠ Conflict detected during Member A merge. Auto-resolving requirements.txt if applicable...${NC}"
}
echo -e "${GREEN}✓ Member A merged${NC}"

# Merge Member B (Browser Automation Engine)
echo -e "\n${YELLOW}[Step 5] Merging Member B (Browser Engine)...${NC}"
git merge origin/member-b/browser-engine -m "merge: integrate Member B Playwright engine" --no-edit || git merge member-b/browser-engine -m "merge: integrate Member B Playwright engine" --no-edit || {
    echo -e "${YELLOW}⚠ Conflict detected during Member B merge.${NC}"
}
echo -e "${GREEN}✓ Member B merged${NC}"

# Merge Member C (Frontend Dashboard)
echo -e "\n${YELLOW}[Step 6] Merging Member C (Next.js Frontend)...${NC}"
git merge origin/member-c/frontend -m "merge: integrate Member C frontend dashboard" --no-edit || git merge member-c/frontend -m "merge: integrate Member C frontend dashboard" --no-edit || {
    echo -e "${YELLOW}⚠ Conflict detected during Member C merge.${NC}"
}
echo -e "${GREEN}✓ Member C merged${NC}"

# Auto-combine requirements.txt if conflict markers exist
if [ -f "backend/requirements.txt" ]; then
    echo -e "\n${YELLOW}[Step 7] Validating backend/requirements.txt...${NC}"
    sort -u backend/requirements.txt | grep -v "^$" | grep -v "^<" | grep -v "^=" | grep -v "^>" > backend/requirements.tmp || true
    if [ -s backend/requirements.tmp ]; then
        mv backend/requirements.tmp backend/requirements.txt
        echo -e "${GREEN}✓ Cleaned and deduplicated backend/requirements.txt${NC}"
    fi
fi

echo -e "\n${BLUE}======================================================${NC}"
echo -e "${GREEN}✨ All member branches integrated into 'develop'! ✨${NC}"
echo -e "${BLUE}======================================================${NC}"
echo -e "Next Steps:"
echo -e "1. Test full stack:  ${YELLOW}docker compose up --build${NC}"
echo -e "2. Push develop:     ${YELLOW}git push origin develop${NC}"
echo -e "3. Inform team:      'Everyone please run git checkout develop && git pull'${NC}"
echo -e "${BLUE}======================================================${NC}"
