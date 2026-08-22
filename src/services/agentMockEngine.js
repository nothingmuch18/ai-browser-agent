// Real-time Mock Simulation Engine for AI Browser Agent

export const PRESET_PROMPTS = [
  {
    title: "Amazon Product Scraper",
    prompt: "Search for 'Wireless Noise Canceling Headphones', filter by 4+ stars, and extract the top 3 product titles, prices, ratings, and buy links.",
    url: "https://www.amazon.com",
    mode: "autonomous"
  },
  {
    title: "Flight Search & Price Comparison",
    prompt: "Navigate to Kayak, search for flights from NYC to London departing next Friday, and extract the lowest non-stop roundtrip fare.",
    url: "https://www.kayak.com",
    mode: "vision"
  },
  {
    title: "E-Commerce Checkout Automation",
    prompt: "Add the first laptop item to cart, proceed to checkout form, and auto-fill contact credentials.",
    url: "https://demo-store.shop",
    mode: "autonomous"
  },
  {
    title: "GitHub Trending Repositories",
    prompt: "Go to github.com/trending, select Python language, and extract repository names, star counts, and author descriptions.",
    url: "https://github.com/trending",
    mode: "fast"
  }
];

export const MOCK_STEPS_SEQUENCE = [
  {
    id: 1,
    thought: "Initializing headless Chromium instance and navigating to target URL.",
    action: "NAVIGATE",
    target: "https://www.amazon.com",
    duration: "420ms",
    status: "success",
    timestamp: "11:15:02",
    cursor: { x: 120, y: 80 },
    bbox: null,
    snapshot: "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?auto=format&fit=crop&w=1200&q=90",
    parsedDOM: [
      { id: "nav-logo", tag: "a", text: "Amazon Home", selector: "#nav-logo-sprites" },
      { id: "twotabsearchtextbox", tag: "input", text: "", selector: "#twotabsearchtextbox" },
      { id: "nav-search-submit-button", tag: "input", text: "Go", selector: "#nav-search-submit-button" }
    ]
  },
  {
    id: 2,
    thought: "Locating primary search input box #twotabsearchtextbox using DOM vision tree.",
    action: "TYPE",
    target: "#twotabsearchtextbox",
    value: "Wireless Noise Canceling Headphones",
    duration: "680ms",
    status: "success",
    timestamp: "11:15:03",
    cursor: { x: 420, y: 140 },
    bbox: { x: 280, y: 120, width: 440, height: 42, label: '[1] INPUT #twotabsearchtextbox' },
    snapshot: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=90",
    parsedDOM: [
      { id: "twotabsearchtextbox", tag: "input", text: "Wireless Noise Canceling Headphones", selector: "#twotabsearchtextbox" }
    ]
  },
  {
    id: 3,
    thought: "Submitting search query by triggering click on #nav-search-submit-button.",
    action: "CLICK",
    target: "#nav-search-submit-button",
    duration: "310ms",
    status: "success",
    timestamp: "11:15:04",
    cursor: { x: 740, y: 140 },
    bbox: { x: 720, y: 120, width: 50, height: 42, label: '[2] BUTTON #nav-search-submit-button' },
    snapshot: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=90",
    parsedDOM: [
      { id: "filter-4star", tag: "a", text: "4 Stars & Up", selector: "#p_72/1248879011" },
      { id: "result-item-1", tag: "div", text: "Sony WH-1000XM5 Wireless Headphones", selector: "div[data-asin='B09XS7JWHH']" }
    ]
  },
  {
    id: 4,
    thought: "Applying customer review filter: 4 Stars & Up.",
    action: "CLICK",
    target: "#p_72/1248879011",
    duration: "520ms",
    status: "success",
    timestamp: "11:15:06",
    cursor: { x: 140, y: 380 },
    bbox: { x: 30, y: 365, width: 180, height: 30, label: '[3] LINK #p_72/1248879011' },
    snapshot: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1200&q=90",
    parsedDOM: [
      { id: "item-1-title", tag: "span", text: "Sony WH-1000XM5 ANC", selector: ".s-card-container:nth-child(1) h2" },
      { id: "item-1-price", tag: "span", text: "$398.00", selector: ".s-card-container:nth-child(1) .a-price" }
    ]
  },
  {
    id: 5,
    thought: "Parsing DOM search result grid and extracting structured product payload.",
    action: "EXTRACT",
    target: "DOM.SelectorList['.s-result-item']",
    duration: "190ms",
    status: "success",
    timestamp: "11:15:08",
    cursor: { x: 480, y: 320 },
    bbox: { x: 260, y: 220, width: 620, height: 400, label: '[4] GRID .s-search-results' },
    snapshot: "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1200&q=90",
    extractedData: [
      { id: 1, title: "Sony WH-1000XM5 Wireless Industry Leading Noise Canceling Headphones", price: "$398.00", rating: "4.7 / 5 (12,490 reviews)", badge: "Best Seller", stock: "In Stock" },
      { id: 2, title: "Bose QuietComfort Ultra Wireless Headphones with Spatial Audio", price: "$429.00", rating: "4.6 / 5 (8,310 reviews)", badge: "Amazon's Choice", stock: "In Stock" },
      { id: 3, title: "Sennheiser Momentum 4 Wireless Bluetooth Headphones", price: "$299.95", rating: "4.5 / 5 (5,120 reviews)", badge: "Top Rated", stock: "Only 4 left" }
    ]
  }
];

export const MOCK_NETWORK_LOGS = [
  { id: 1, method: "GET", url: "https://www.amazon.com/s?k=Wireless+Headphones", status: 200, time: "340ms", size: "142 KB" },
  { id: 2, method: "POST", url: "https://api.amazon.com/telemetry/event", status: 204, time: "45ms", size: "1.2 KB" },
  { id: 3, method: "GET", url: "https://images.amazon.com/images/I/71o8Q5XJS5L._AC_SL1500_.jpg", status: 200, time: "110ms", size: "84 KB" },
  { id: 4, method: "GET", url: "https://www.amazon.com/s/query-filter-refinements", status: 200, time: "280ms", size: "28 KB" }
];
