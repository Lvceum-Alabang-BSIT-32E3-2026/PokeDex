import { apiFetch } from '../utils/api';
import type { RegisterDto, LoginDto, TokenResponse } from '../types/auth';

const API_URL = import.meta.env.VITE_IDENTITY_API_URL;

const parseError = async (response: Response, fallback: string) => {
    const body = await response.json().catch(() => ({}));
    const message = (body as { message?: string }).message;
    throw new Error(message || fallback);
};

export const authService = {
    async register(data: RegisterDto): Promise<{ message: string }> {
        const response = await apiFetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            await parseError(response, 'Registration failed');
        }

        return response.json();
    },

    async login(data: LoginDto): Promise<TokenResponse> {
        try {
            const response = await apiFetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                await parseError(response, 'Invalid email or password');
            }

            return response.json();
        } catch (error: any) {
            if (error.name === 'TypeError') {
                throw new Error('Network error. Please check your connection.');
            }
            throw error;
        }
    },
};
