// API Client & WebSocket Connector for AI Browser Agent

export class AgentAPIClient {
  constructor(baseUrl = 'http://localhost:8000') {
    this.baseUrl = baseUrl;
    this.wsUrl = baseUrl.replace(/^http/, 'ws') + '/ws/agent';
    this.socket = null;
  }

  async startTask(prompt, url, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/agent/task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, url, ...options }),
      });
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      return await response.json();
    } catch (err) {
      console.warn('[AgentAPIClient] Live backend unreachable, operating in standalone mock mode:', err.message);
      return { status: 'mocked', taskId: 'task_' + Date.now() };
    }
  }

  connectWebSocket(onMessage, onError) {
    try {
      this.socket = new WebSocket(this.wsUrl);
      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch (e) {
          console.error('[AgentAPIClient] Error parsing WS message:', e);
        }
      };
      this.socket.onerror = (err) => {
        if (onError) onError(err);
      };
    } catch (e) {
      console.warn('[AgentAPIClient] WebSocket connection failed:', e.message);
    }
  }

  disconnectWebSocket() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

export const apiClient = new AgentAPIClient();
