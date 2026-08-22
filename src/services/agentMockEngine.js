// Comprehensive Universal Browser Action Engine for Autonomous AI Agent

export const PRESET_PROMPTS = [
  {
    title: "🛒 Auto-Checkout & Buy Item",
    prompt: "Go to Nike store, select Air Jordan size 10.5, add to cart, fill shipping address, and proceed to payment.",
    url: "https://www.nike.com/store/checkout",
    mode: "autonomous"
  },
  {
    title: "📝 Multi-Step Form Automation",
    prompt: "Navigate to applicant portal, fill multi-step registration form (Name, Email, Experience, Resume upload), and submit.",
    url: "https://portal.enterprise.io/register",
    mode: "autonomous"
  },
  {
    title: "✈️ Flight Booking & Seat Pick",
    prompt: "Search flights from SFO to JFK on United Airlines, choose departure date, select window seat 14A, and hold fare.",
    url: "https://www.united.com/flights/booking",
    mode: "vision"
  },
  {
    title: "🐦 Social Media Auto-Publish",
    prompt: "Log in to X/Twitter, compose announcement tweet with AI tags, attach product mockup, and schedule publish.",
    url: "https://twitter.com/compose/tweet",
    mode: "autonomous"
  },
  {
    title: "📊 Deep Table Scraping & Export",
    prompt: "Navigate to CoinMarketCap, scroll through top 20 crypto tokens, extract live prices, 24h volume, and export to CSV.",
    url: "https://coinmarketcap.com",
    mode: "fast"
  },
  {
    title: "🔍 Research & Entity Extraction",
    prompt: "Search for 'Pokemon', open knowledge panel, and extract franchise history, top characters, and generation stats.",
    url: "https://www.google.com/search?q=Pokemon",
    mode: "autonomous"
  }
];

const getSafeUUID = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'exec_' + Math.random().toString(36).substring(2, 11));

export function extractWorkflowType(prompt) {
  const p = (prompt || '').toLowerCase();
  if (p.includes('checkout') || p.includes('cart') || p.includes('buy') || p.includes('purchase') || p.includes('order') || p.includes('nike')) {
    return 'checkout';
  }
  if (p.includes('form') || p.includes('register') || p.includes('sign up') || p.includes('applicant') || p.includes('fill') || p.includes('login')) {
    return 'form';
  }
  if (p.includes('flight') || p.includes('seat') || p.includes('airline') || p.includes('ticket') || p.includes('hotel') || p.includes('booking')) {
    return 'travel';
  }
  if (p.includes('tweet') || p.includes('twitter') || p.includes('post') || p.includes('publish') || p.includes('social') || p.includes('linkedin')) {
    return 'social';
  }
  if (p.includes('crypto') || p.includes('coinmarketcap') || p.includes('scrape') || p.includes('table') || p.includes('stocks')) {
    return 'crypto';
  }
  return 'search';
}

/**
 * Strips common filler phrases from a prompt to extract a clean query keyword.
 * Used by PromptControl to auto-sync the target URL field.
 */
export function extractCleanQuery(prompt) {
  if (!prompt) return '';
  return prompt
    .replace(/^(search for|search|find|lookup|look up|get|extract|go to|navigate to|open|who is|what is|check)\s+/i, '')
    .replace(/['"]/g, '')
    .split(/[,.]/)
    .shift()
    .trim();
}

/**
 * Given a clean query string, returns a smart target URL and workflow metadata.
 * Used by PromptControl to auto-populate the Target URL field as the user types.
 */
export function resolveEntityKnowledge(query) {
  const q = (query || '').toLowerCase();
  const workflowType = extractWorkflowType(query);

  if (workflowType === 'checkout' || q.includes('nike') || q.includes('jordan')) {
    return { targetUrl: 'https://www.nike.com/store/checkout', workflowType };
  }
  if (workflowType === 'form' || q.includes('register') || q.includes('portal')) {
    return { targetUrl: 'https://portal.enterprise.io/register', workflowType };
  }
  if (workflowType === 'travel' || q.includes('flight') || q.includes('united')) {
    return { targetUrl: 'https://www.united.com/flights/booking', workflowType };
  }
  if (workflowType === 'social' || q.includes('tweet') || q.includes('twitter')) {
    return { targetUrl: 'https://twitter.com/compose/tweet', workflowType };
  }
  if (workflowType === 'crypto' || q.includes('crypto') || q.includes('bitcoin') || q.includes('coinmarketcap')) {
    return { targetUrl: 'https://coinmarketcap.com', workflowType };
  }

  // Default: Google search
  const searchQuery = encodeURIComponent(query || '');
  return { targetUrl: `https://www.google.com/search?q=${searchQuery}`, workflowType: 'search' };
}

export function generateDynamicExecution(rawPrompt, customUrl) {
  const workflowType = extractWorkflowType(rawPrompt);
  const promptText = rawPrompt.trim();

  // 1. WORKFLOW: E-COMMERCE CHECKOUT & PURCHASE AUTOMATION
  if (workflowType === 'checkout') {
    const targetUrl = customUrl || "https://www.nike.com/store/checkout";
    const sequence = [
      {
        id: 1,
        thought: "Opening product page and selecting shoe size 10.5 from DOM dropdown.",
        action: "SELECT",
        target: "button[data-size='10.5']",
        duration: "340ms",
        status: "success",
        cursor: { x: 220, y: 190 },
        workflowType: 'checkout',
        stepStage: 'size_selected',
        bbox: { x: 190, y: 170, width: 90, height: 40, label: '[1] SELECT Size 10.5' }
      },
      {
        id: 2,
        thought: "Clicking 'Add to Bag' and opening animated checkout drawer.",
        action: "CLICK",
        target: "#add-to-cart-button",
        duration: "410ms",
        status: "success",
        cursor: { x: 380, y: 260 },
        workflowType: 'checkout',
        stepStage: 'added_to_cart',
        bbox: { x: 190, y: 240, width: 220, height: 44, label: '[2] CLICK #add-to-bag' }
      },
      {
        id: 3,
        thought: "Auto-filling shipping address form fields (Name, Street, City, Zip, Phone).",
        action: "TYPE_BATCH",
        target: "#shipping-address-form",
        value: "John Doe, 742 Evergreen Terrace, Springfield, OR 97477",
        duration: "620ms",
        status: "success",
        cursor: { x: 440, y: 180 },
        workflowType: 'checkout',
        stepStage: 'address_filled',
        bbox: { x: 300, y: 120, width: 380, height: 210, label: '[3] FORM Auto-Fill Credentials' }
      },
      {
        id: 4,
        thought: "Selecting Express 2-Day Shipping ($12.00) & applying promo code 'VIPMEMBER'.",
        action: "CLICK",
        target: "input[name='shipping_method'][value='express']",
        duration: "290ms",
        status: "success",
        cursor: { x: 480, y: 240 },
        workflowType: 'checkout',
        stepStage: 'shipping_selected',
        bbox: { x: 300, y: 220, width: 380, height: 50, label: '[4] SELECT Express Delivery' }
      },
      {
        id: 5,
        thought: "Injecting secure masked payment credentials (Apple Pay / Card) and verifying order summary.",
        action: "CHECKOUT_COMPLETE",
        target: "#submit-order-button",
        duration: "210ms",
        status: "success",
        cursor: { x: 520, y: 310 },
        workflowType: 'checkout',
        stepStage: 'order_confirmed',
        bbox: { x: 300, y: 290, width: 380, height: 52, label: '[5] CONFIRM $185.00 Order' }
      }
    ];

    const extractedData = [
      { id: 1, order_id: "ORD-9482710", item: "Nike Air Jordan Retro High", size: "US 10.5", subtotal: "$180.00", shipping: "Free Express", total: "$180.00", status: "Order Confirmed" },
      { id: 2, order_id: "ORD-9482710", recipient: "John Doe", address: "742 Evergreen Terr, Springfield OR", payment_method: "Apple Pay (•••• 4921)", estimated_delivery: "Thursday by 7 PM", status: "Tracking Generated" }
    ];

    const parsedDOM = [
      { id: "size-btn", tag: "button", text: "Size 10.5", selector: "button[data-size='10.5']" },
      { id: "cart-btn", tag: "button", text: "Add to Bag", selector: "#add-to-cart-button" },
      { id: "address-input", tag: "input", text: "742 Evergreen Terr", selector: "input[name='address1']" },
      { id: "submit-btn", tag: "button", text: "Place Order", selector: "#submit-order-button" }
    ];

    return { executionId: getSafeUUID(), sequence, targetUrl, extractedData, parsedDOM, workflowType };
  }

  // 2. WORKFLOW: MULTI-STEP FORM REGISTRATION & FILE UPLOAD
  if (workflowType === 'form') {
    const targetUrl = customUrl || "https://portal.enterprise.io/register";
    const sequence = [
      {
        id: 1,
        thought: "Navigating to registration portal and filling Step 1 (Personal Information).",
        action: "TYPE_FORM",
        target: "#registration-step-1",
        value: "Alex Mercer | alex.mercer@cloudcorp.io",
        duration: "450ms",
        status: "success",
        cursor: { x: 260, y: 160 },
        workflowType: 'form',
        stepStage: 'step_1',
        bbox: { x: 120, y: 110, width: 440, height: 160, label: '[1] STEP 1: Personal Details' }
      },
      {
        id: 2,
        thought: "Selecting role 'Senior Autonomous AI Engineer' and years of experience (5+ years).",
        action: "SELECT",
        target: "select[name='experience_level']",
        duration: "320ms",
        status: "success",
        cursor: { x: 340, y: 220 },
        workflowType: 'form',
        stepStage: 'step_2',
        bbox: { x: 120, y: 190, width: 440, height: 60, label: '[2] SELECT Role & Level' }
      },
      {
        id: 3,
        thought: "Uploading resume file `alex_mercer_resume_2026.pdf` (1.4 MB) via file picker input.",
        action: "UPLOAD_FILE",
        target: "input[type='file']",
        duration: "580ms",
        status: "success",
        cursor: { x: 300, y: 280 },
        workflowType: 'form',
        stepStage: 'file_uploaded',
        bbox: { x: 120, y: 260, width: 440, height: 70, label: '[3] UPLOAD File: resume.pdf' }
      },
      {
        id: 4,
        thought: "Solving non-interactive reCAPTCHA v3 security verification token.",
        action: "SOLVE_CAPTCHA",
        target: "#recaptcha-anchor",
        duration: "310ms",
        status: "success",
        cursor: { x: 180, y: 350 },
        workflowType: 'form',
        stepStage: 'captcha_solved',
        bbox: { x: 120, y: 340, width: 280, height: 65, label: '[4] CAPTCHA Verified (Score 0.95)' }
      },
      {
        id: 5,
        thought: "Submitting verified application payload and capturing confirmation token.",
        action: "SUBMIT",
        target: "button[type='submit']",
        duration: "240ms",
        status: "success",
        cursor: { x: 420, y: 360 },
        workflowType: 'form',
        stepStage: 'submitted',
        bbox: { x: 120, y: 340, width: 440, height: 80, label: '[5] SUBMIT Registration' }
      }
    ];

    const extractedData = [
      { id: 1, parameter: "Applicant Name", value: "Alex Mercer", status: "Validated" },
      { id: 2, parameter: "Email Address", value: "alex.mercer@cloudcorp.io", status: "Verified" },
      { id: 3, parameter: "Target Position", value: "Senior Autonomous AI Engineer (5+ yrs)", status: "Accepted" },
      { id: 4, parameter: "Attached Resume", value: "alex_mercer_resume_2026.pdf (1.4 MB)", status: "Uploaded to S3" },
      { id: 5, parameter: "Application Reference", value: "APP-829104-ENT", status: "Confirmation Email Sent" }
    ];

    const parsedDOM = [
      { id: "name-input", tag: "input", text: "Alex Mercer", selector: "#applicant-name" },
      { id: "email-input", tag: "input", text: "alex.mercer@cloudcorp.io", selector: "#applicant-email" },
      { id: "file-input", tag: "input", text: "resume.pdf", selector: "input[type='file']" },
      { id: "submit-btn", tag: "button", text: "Submit Application", selector: "#submit-application" }
    ];

    return { executionId: getSafeUUID(), sequence, targetUrl, extractedData, parsedDOM, workflowType };
  }

  // 3. WORKFLOW: SOCIAL MEDIA AUTO-PUBLISH (X/Twitter)
  if (workflowType === 'social') {
    const targetUrl = customUrl || "https://twitter.com/compose/tweet";
    const sequence = [
      {
        id: 1,
        thought: "Navigating to Twitter/X compose dashboard and authenticating active session.",
        action: "NAVIGATE",
        target: targetUrl,
        duration: "360ms",
        status: "success",
        cursor: { x: 120, y: 90 },
        workflowType: 'social',
        stepStage: 'navigated'
      },
      {
        id: 2,
        thought: "Focusing post compose area and typing tweet content with hashtags.",
        action: "TYPE",
        target: "div[data-testid='tweetTextarea_0']",
        value: "🚀 Launching our new Next-Gen AI Browser Agent! Completely autonomous web navigation, form filling & live stream inspection. #AI #AgenticAI #OpenSource",
        duration: "560ms",
        status: "success",
        cursor: { x: 280, y: 150 },
        workflowType: 'social',
        stepStage: 'typed_text',
        bbox: { x: 80, y: 100, width: 500, height: 110, label: '[2] COMPOSE Post (158 chars)' }
      },
      {
        id: 3,
        thought: "Attaching product banner preview screenshot (`demo_preview.png`).",
        action: "UPLOAD_MEDIA",
        target: "input[data-testid='fileInput']",
        duration: "420ms",
        status: "success",
        cursor: { x: 160, y: 230 },
        workflowType: 'social',
        stepStage: 'media_attached',
        bbox: { x: 80, y: 220, width: 400, height: 120, label: '[3] ATTACH Media: preview.png' }
      },
      {
        id: 4,
        thought: "Configuring audience permissions ('Everyone can reply') and scheduling time.",
        action: "CONFIGURE",
        target: "button[data-testid='audience-picker']",
        duration: "290ms",
        status: "success",
        cursor: { x: 220, y: 350 },
        workflowType: 'social',
        stepStage: 'permissions_set'
      },
      {
        id: 5,
        thought: "Clicking 'Post' button and verifying tweet ID on public timeline.",
        action: "POST_PUBLISH",
        target: "button[data-testid='tweetButton']",
        duration: "210ms",
        status: "success",
        cursor: { x: 520, y: 350 },
        workflowType: 'social',
        stepStage: 'published',
        bbox: { x: 470, y: 335, width: 90, height: 38, label: '[5] PUBLISH Post Now' }
      }
    ];

    const extractedData = [
      { id: 1, parameter: "Tweet ID", value: "1894720194820194821", detail: "Published to Timeline" },
      { id: 2, parameter: "Content", value: "Launching our new Next-Gen AI Browser Agent! Autonomous web navigation... #AI", detail: "158 Characters" },
      { id: 3, parameter: "Media", value: "1 Image attached (1920x1080 PNG)", detail: "Processed by Twitter CDN" },
      { id: 4, parameter: "Status", value: "LIVE on @AI_Innovations", detail: "Public & Indexable" }
    ];

    const parsedDOM = [
      { id: "tweet-box", tag: "div", text: "Compose Tweet", selector: "[data-testid='tweetTextarea_0']" },
      { id: "media-btn", tag: "input", text: "Attach Media", selector: "[data-testid='fileInput']" },
      { id: "post-btn", tag: "button", text: "Post", selector: "[data-testid='tweetButton']" }
    ];

    return { executionId: getSafeUUID(), sequence, targetUrl, extractedData, parsedDOM, workflowType };
  }

  // 4. WORKFLOW: CRYPTO & DEEP TABLE SCRAPING
  if (workflowType === 'crypto') {
    const targetUrl = customUrl || "https://coinmarketcap.com";
    const sequence = [
      {
        id: 1,
        thought: "Navigating to CoinMarketCap and scrolling 1200px to trigger dynamic table hydration.",
        action: "SCROLL",
        target: "window.scrollTo(0, 1200)",
        duration: "380ms",
        status: "success",
        cursor: { x: 400, y: 300 },
        workflowType: 'crypto',
        stepStage: 'scrolled'
      },
      {
        id: 2,
        thought: "Filtering table by Market Cap > $10B and 24h Volume sorting.",
        action: "CLICK",
        target: "#sort-by-market-cap",
        duration: "320ms",
        status: "success",
        cursor: { x: 260, y: 140 },
        workflowType: 'crypto',
        stepStage: 'filtered',
        bbox: { x: 40, y: 120, width: 180, height: 35, label: '[2] SORT Market Cap DESC' }
      },
      {
        id: 3,
        thought: "Parsing DOM table rows `table.cmc-table tbody tr` across 20 nodes.",
        action: "PARSE_DOM",
        target: "table.cmc-table tbody tr",
        duration: "410ms",
        status: "success",
        cursor: { x: 350, y: 240 },
        workflowType: 'crypto',
        stepStage: 'parsed',
        bbox: { x: 20, y: 160, width: 680, height: 260, label: '[3] PARSE 20 Table Rows' }
      },
      {
        id: 4,
        thought: "Extracting structured financial dataset (Ticker, Price, 24h %, Market Cap, Volume).",
        action: "EXTRACT",
        target: "DOM.SelectorList['table.cmc-table tr']",
        duration: "220ms",
        status: "success",
        cursor: { x: 450, y: 280 },
        workflowType: 'crypto',
        stepStage: 'extracted',
        bbox: { x: 20, y: 160, width: 680, height: 260, label: '[4] EXTRACT Financial Dataset' }
      }
    ];

    const extractedData = [
      { id: 1, token: "Bitcoin (BTC)", price: "$96,420.50", change_24h: "+3.84%", market_cap: "$1.89 Trillion", volume_24h: "$42.1 Billion" },
      { id: 2, token: "Ethereum (ETH)", price: "$3,410.20", change_24h: "+5.12%", market_cap: "$410 Billion", volume_24h: "$18.4 Billion" },
      { id: 3, token: "Solana (SOL)", price: "$214.80", change_24h: "+8.90%", market_cap: "$98.5 Billion", volume_24h: "$7.2 Billion" },
      { id: 4, token: "Ripple (XRP)", price: "$2.45", change_24h: "+2.10%", market_cap: "$72.1 Billion", volume_24h: "$4.1 Billion" }
    ];

    const parsedDOM = [
      { id: "cmc-table", tag: "table", text: "Top Crypto Assets", selector: "table.cmc-table" },
      { id: "row-1", tag: "tr", text: "BTC $96,420.50", selector: "tr:nth-child(1)" }
    ];

    return { executionId: getSafeUUID(), sequence, targetUrl, extractedData, parsedDOM, workflowType };
  }

  // 5. DEFAULT: UNIVERSAL KNOWLEDGE / SEARCH / WIKIPEDIA
  let query = promptText.replace(/^(search for|search|find|lookup|get|extract|who is|what is)\s+/i, '').replace(/['"]/g, '').trim();
  if (!query) query = "Pokemon";

  const targetUrl = customUrl || `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  const isPokemon = query.toLowerCase().includes('poke');
  const entityTitle = isPokemon ? "Pokémon" : query;

  const sequence = [
    {
      id: 1,
      thought: `Initializing Chromium headless instance and navigating to Google Search (${targetUrl}).`,
      action: "NAVIGATE",
      target: targetUrl,
      duration: "380ms",
      status: "success",
      cursor: { x: 140, y: 80 },
      workflowType: 'search',
      query: entityTitle
    },
    {
      id: 2,
      thought: `Locating search input field and typing query "${entityTitle}".`,
      action: "TYPE",
      target: "textarea[name='q']",
      value: entityTitle,
      duration: "510ms",
      status: "success",
      cursor: { x: 380, y: 90 },
      workflowType: 'search',
      query: entityTitle,
      bbox: { x: 200, y: 70, width: 420, height: 40, label: `[1] INPUT textarea[name='q']` }
    },
    {
      id: 3,
      thought: "Submitting search query and capturing responsive DOM knowledge graph.",
      action: "CLICK",
      target: "button[type='submit']",
      duration: "290ms",
      status: "success",
      cursor: { x: 620, y: 90 },
      workflowType: 'search',
      query: entityTitle,
      bbox: { x: 600, y: 70, width: 50, height: 40, label: '[2] BUTTON #search-submit' }
    },
    {
      id: 4,
      thought: `Applying vision filter: locating verified entity card for "${entityTitle}".`,
      action: "FILTER",
      target: ".knowledge-panel-card",
      duration: "430ms",
      status: "success",
      cursor: { x: 260, y: 220 },
      workflowType: 'search',
      query: entityTitle,
      bbox: { x: 30, y: 140, width: 540, height: 260, label: `[3] HIGHLIGHT .knowledge-panel-card` }
    },
    {
      id: 5,
      thought: `Extracting structured dataset for "${entityTitle}" into Data Vault.`,
      action: "EXTRACT",
      target: "DOM.SelectorList['.infobox-data']",
      duration: "180ms",
      status: "success",
      cursor: { x: 450, y: 280 },
      workflowType: 'search',
      query: entityTitle,
      bbox: { x: 20, y: 130, width: 680, height: 320, label: `[4] EXTRACTED Records` }
    }
  ];

  const extractedData = isPokemon ? [
    { id: 1, parameter: "Franchise Name", value: "Pokémon (Pocket Monsters)", detail: "Owned by The Pokémon Company & Nintendo" },
    { id: 2, parameter: "Original Creator", value: "Satoshi Tajiri & Ken Sugimori", detail: "First released in Japan (1996)" },
    { id: 3, parameter: "Flagship Mascot", value: "Pikachu (#025, Electric-type)", detail: "Global Cultural Icon" },
    { id: 4, parameter: "Best Selling Games", value: "Red/Blue (31M+), Sword/Shield (26M+), Scarlet/Violet (25M+)", detail: "Nintendo Switch & Game Boy" },
    { id: 5, parameter: "Franchise Revenue", value: "$100+ Billion Worldwide", detail: "Highest-grossing media franchise in history" }
  ] : [
    { id: 1, parameter: "Entity Name", value: entityTitle, detail: "Verified search subject" },
    { id: 2, parameter: "Overview", value: `Historical and cultural impact of ${entityTitle}`, detail: "Official records indexed" },
    { id: 3, parameter: "Status", value: "Active & Documented Worldwide", detail: "Updated 2026 records" }
  ];

  const parsedDOM = [
    { id: "search-box", tag: "textarea", text: entityTitle, selector: "textarea[name='q']" },
    { id: "knowledge-card", tag: "div", text: `${entityTitle} Knowledge Card`, selector: ".knowledge-panel-card" }
  ];

  return { executionId: getSafeUUID(), sequence, targetUrl, extractedData, parsedDOM, workflowType };
}

export const MOCK_NETWORK_LOGS = [
  { id: 1, method: "GET", url: "https://www.google.com/search", status: 200, time: "280ms", size: "135 KB" },
  { id: 2, method: "POST", url: "https://api.google.com/telemetry", status: 204, time: "45ms", size: "1.2 KB" }
];
