// src/utils/jwt.ts

export interface DecodedToken {
    nameid: string;        // User ID
    email: string;
    unique_name: string;   // Username
    displayName: string;
    role?: string | string[]; // Can be single or array (optional for safety)
    exp: number;           // Expiration timestamp (seconds)
}

export interface NormalizedUser {
    id: string;
    email: string;
    username: string;
    displayName: string;
    roles: string[]; // ALWAYS array
}

export function decodeToken(token: string): NormalizedUser | null {
    try {
        const payload = token.split('.')[1];
        const decoded: DecodedToken = JSON.parse(atob(payload));

        // Normalize roles safely
        let roles: string[] = [];

        if (Array.isArray(decoded.role)) {
            roles = decoded.role;
        } else if (typeof decoded.role === 'string') {
            roles = [decoded.role];
        }

        return {
            id: decoded.nameid,
            email: decoded.email,
            username: decoded.unique_name,
            displayName: decoded.displayName,
            roles // Always array, never null/undefined
        };
    } catch (error) {
        console.error('Failed to decode token:', error);
        return null;
    }
}

export function isTokenExpired(token: string): boolean {
    try {
        const payload = token.split('.')[1];
        const decoded: DecodedToken = JSON.parse(atob(payload));

        // exp is in seconds → convert to milliseconds
        return decoded.exp * 1000 < Date.now();
    } catch {
        // If token is invalid, treat as expired
        return true;
    }
}