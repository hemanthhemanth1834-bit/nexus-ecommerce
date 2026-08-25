const API_BASE = '/api'

class ApiClient {
  private token: string | null = null

  setToken(token: string | null) {
    this.token = token
    if (token) localStorage.setItem('nexus-token', token)
    else localStorage.removeItem('nexus-token')
  }

  getToken(): string | null {
    if (!this.token) this.token = localStorage.getItem('nexus-token')
    return this.token
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers })
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }))
      throw new Error(error.message || `HTTP ${response.status}`)
    }
    const json = await response.json()
    return (json.data !== undefined ? json.data : json) as T
  }

  get<T>(endpoint: string) { return this.request<T>(endpoint) }
  post<T>(endpoint: string, body?: unknown) { return this.request<T>(endpoint, { method: 'POST', body: body ? JSON.stringify(body) : undefined }) }
  put<T>(endpoint: string, body?: unknown) { return this.request<T>(endpoint, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }) }
  delete<T>(endpoint: string) { return this.request<T>(endpoint, { method: 'DELETE' }) }
}

export const api = new ApiClient()
