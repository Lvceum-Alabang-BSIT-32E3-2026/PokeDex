const API_URL = '/api';
const USE_LIVE_API = import.meta.env.VITE_USE_LIVE_API === 'true';

// Task: Simulate real JWT for mock mode (encodes nameid, email, unique_name, displayName, role, exp)
const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiIxIiwiZW1haWwiOiJhc2hAa2V0Y2h1bS5jb20iLCJ1bmlxdWVfbmFtZSI6ImFzaCIsImRpc3BsYXlOYW1lIjoiQXNoIEtldGNodW0iLCJyb2xlIjpbIlVzZXIiXSwiZXhwIjoyNTI0NjA4MDAwfQ==.fake_signature";

export const authService = {
    async login(credentials: any) {
        if (!USE_LIVE_API) {
            console.log('Mock: login called with', credentials);
            if (credentials.email === 'ash@ketchum.com' && credentials.password === 'pikachu') {
                return {
                    token: mockToken,
                    user: { id: '1', email: 'ash@ketchum.com', username: 'ash', displayName: 'Ash Ketchum', roles: ['User'] }
                };
            }
            throw new Error('Invalid email or password');
        }

        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Login failed' }));
            throw new Error(error.message || 'Login failed');
        }

        return response.json(); // { token: string, user: { ... } }
    },

    async register(userData: any) {
        if (!USE_LIVE_API) {
            console.log('Mock: register called with', userData);
            return {
                token: mockToken,
                user: { id: '2', email: userData.email, username: userData.username, roles: ['User'] }
            };
        }

        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Registration failed' }));
            throw new Error(error.message || 'Registration failed');
        }

        return response.json();
    },

    async changePassword(data: { currentPassword: string; newPassword: string }) {
        if (!USE_LIVE_API) {
            console.log('Mock: changePassword called with', data);
            // Simulate common validation or failure
            if (data.currentPassword === 'pikachu') {
                return { message: 'Password changed successfully' };
            }
            throw new Error('Wrong current password');
        }

        const response = await fetch(`${API_URL}/users/me/change-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to change password' }));
            throw new Error(error.message || 'Failed to change password');
        }

        return response.json();
    }
};
