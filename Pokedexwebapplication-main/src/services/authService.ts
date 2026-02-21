import type { RegisterDto, LoginDto, TokenResponse } from '../types/auth';

const API_URL = import.meta.env.VITE_IDENTITY_API_URL;

if (!API_URL) {
    throw new Error('VITE_IDENTITY_API_URL is not defined in your environment variables.');
}

export const authService = {
    // Register a new user
    async register(data: RegisterDto): Promise<{ message: string }> {
        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                let errorMessage = 'Failed to register.';
                try {
                    const errorData = await response.json();
                    if (errorData?.message) errorMessage = errorData.message;
                } catch {
                    // fallback if response is not JSON
                }
                throw new Error(errorMessage);
            }

            const result = await response.json();
            return { message: result.message || 'Registration successful.' };
        } catch (error: any) {
            if (error.name === 'TypeError') {
                throw new Error('Network error: Please check your connection.');
            }
            throw new Error(error.message || 'An unknown error occurred during registration.');
        }
    },

    // Login a user
    async login(data: LoginDto): Promise<TokenResponse> {
        try {
            // Technical Requirement endpoint: /api/auth/login
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            // Handle HTTP errors
            if (!response.ok) {
                let errorMessage = 'Invalid email or password';
                try {
                    const errorData = await response.json();
                    if (errorData?.message) errorMessage = errorData.message;
                } catch {
                    // fallback if response is not JSON
                }
                throw new Error(errorMessage);
            }

            // Return TokenResponse on success
            const result: TokenResponse = await response.json();
            return result;
        } catch (error: any) {
            // Network error handling
            if (error.name === 'TypeError') {
                throw new Error('Network error: Please check your connection.');
            }
            throw new Error(error.message || 'An unknown error occurred during login.');
        }
    },
};
