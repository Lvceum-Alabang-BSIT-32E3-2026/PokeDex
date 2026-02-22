// src/utils/jwt.ts

export interface DecodedToken {
    nameid: string;      // User ID
    email: string;
    unique_name: string; // Username
    displayName: string;
    role: string | string[]; // Can be single or array
    exp: number;         // Expiration timestamp
}

export function decodeToken(token: string) {
    try {
        const payload = token.split('.')[1];
        const decoded: DecodedToken = JSON.parse(atob(payload));

        return {
            id: decoded.nameid,
            email: decoded.email,
            username: decoded.unique_name,
            displayName: decoded.displayName,
            // Requirement: Handles roles as string or array
            roles: Array.isArray(decoded.role)
                ? decoded.role
                : [decoded.role].filter(Boolean)
        };
    } catch (error) {
        return null;
    }
}

export function isTokenExpired(token: string): boolean {
    try {
        const decoded: DecodedToken = JSON.parse(atob(token.split('.')[1]));
        // Requirement: exp * 1000 to convert seconds to milliseconds
        return decoded.exp * 1000 < Date.now();
    } catch {
        return true;
    }
}