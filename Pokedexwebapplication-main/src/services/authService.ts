import type { RegisterDto, LoginDto, TokenResponse } from '../types/auth';

const API_URL = import.meta.env.VITE_IDENTITY_API_URL;

if (!API_URL) {
  throw new Error('VITE_IDENTITY_API_URL is not defined in your environment variables.');
}

export const authService = {
  async register(data: RegisterDto): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to register.');
      }

      const result = await response.json();
      return { message: result.message || 'Registration successful.' };
    } catch (error: any) {
      throw new Error(error.message || 'An unknown error occurred during registration.');
    }
  },

  async login(data: LoginDto): Promise<TokenResponse> {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to login.');
      }

      const result: TokenResponse = await response.json();
      return result;
    } catch (error: any) {
      throw new Error(error.message || 'An unknown error occurred during login.');
    }
  },
};
