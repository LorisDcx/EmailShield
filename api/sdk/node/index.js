/**
 * Minimal Node SDK for EmailShield.
 */

const DEFAULT_BASE_URL = process.env.EMAILSHIELD_API_URL ?? 'https://api.emailshield.dev';

class EmailShieldClient {
  constructor({ apiKey, baseUrl = DEFAULT_BASE_URL, timeoutMs = 5000 } = {}) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.timeoutMs = timeoutMs;
  }

  _headers() {
    const headers = { 'Content-Type': 'application/json' };
    if (this.apiKey) {
      headers.Authorization = `Bearer ${this.apiKey}`;
    }
    return headers;
  }

  async checkEmail(email) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await fetch(`${this.baseUrl}/v1/check-email`, {
        method: 'POST',
        headers: this._headers(),
        body: JSON.stringify({ email }),
        signal: controller.signal,
      });
      if (!res.ok) {
        throw new Error(`EmailShield error: ${res.status}`);
      }
      return await res.json();
    } finally {
      clearTimeout(timeout);
    }
  }

  async checkBulk(emails) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await fetch(`${this.baseUrl}/v1/check-bulk`, {
        method: 'POST',
        headers: this._headers(),
        body: JSON.stringify({
          emails: Array.from(emails, (email) => ({ email })),
        }),
        signal: controller.signal,
      });
      if (!res.ok) {
        throw new Error(`EmailShield error: ${res.status}`);
      }
      return await res.json();
    } finally {
      clearTimeout(timeout);
    }
  }
}

module.exports = { EmailShieldClient };
