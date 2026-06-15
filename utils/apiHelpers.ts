import { APIRequestContext, APIResponse } from '@playwright/test';

export class ApiHelpers {
  private request: APIRequestContext;
  private baseUrl: string;
  private authToken: string = '';

  constructor(request: APIRequestContext, baseUrl: string) {
    this.request = request;
    this.baseUrl = baseUrl;
  }

  async get(endpoint: string, headers?: Record<string, string>): Promise<APIResponse> {
    return this.request.get(`${this.baseUrl}${endpoint}`, {
      headers: { ...this.getAuthHeader(), ...headers },
    });
  }

  async post(
    endpoint: string,
    body: Record<string, unknown>,
    headers?: Record<string, string>
  ): Promise<APIResponse> {
    return this.request.post(`${this.baseUrl}${endpoint}`, {
      data: body,
      headers: { ...this.getAuthHeader(), ...headers },
    });
  }

  async put(
    endpoint: string,
    body: Record<string, unknown>,
    headers?: Record<string, string>
  ): Promise<APIResponse> {
    return this.request.put(`${this.baseUrl}${endpoint}`, {
      data: body,
      headers: { ...this.getAuthHeader(), ...headers },
    });
  }

  async delete(endpoint: string, headers?: Record<string, string>): Promise<APIResponse> {
    return this.request.delete(`${this.baseUrl}${endpoint}`, {
      headers: { ...this.getAuthHeader(), ...headers },
    });
  }

  async loginViaApi(email: string, password: string): Promise<string> {
    const response = await this.request.post(`${this.baseUrl}/api/auth/login`, {
      data: { email, password },
    });
    const body = await response.json();
    this.authToken = body.token || body.accessToken || '';
    return this.authToken;
  }

  setAuthToken(token: string): void {
    this.authToken = token;
  }

  private getAuthHeader(): Record<string, string> {
    return this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {};
  }
}
