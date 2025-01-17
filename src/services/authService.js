class AuthService {
  constructor() {
    this.baseUrl = '/api/auth';
    this.tokenKey = 'football_app_token';
  }

  async login(email, password) {
    try {
      const response = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const data = await response.json();
      this.setToken(data.token);
      return data.user;
    } catch (error) {
      throw error;
    }
  }

  async register(email, password, username) {
    try {
      const response = await fetch(`${this.baseUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, username }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const data = await response.json();
      this.setToken(data.token);
      return data.user;
    } catch (error) {
      throw error;
    }
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
  }

  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  setToken(token) {
    localStorage.setItem(this.tokenKey, token);
  }

  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;

    try {
      // JWT token'ın süresini kontrol et
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  }

  async getCurrentUser() {
    try {
      const token = this.getToken();
      if (!token) return null;

      const response = await fetch(`${this.baseUrl}/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        this.logout();
        throw new Error('Authentication failed');
      }

      return await response.json();
    } catch (error) {
      this.logout();
      throw error;
    }
  }
}

export const authService = new AuthService();
