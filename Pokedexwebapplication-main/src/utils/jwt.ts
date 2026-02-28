// src/utils/jwt.ts
export interface DecodedToken {
    nameid: string;
    email: string;
    unique_name: string;
    displayName: string;
    role: string | string[];
    exp: number; // seconds
}

export interface UserFromToken {
    id: string;
    email: string;
    username: string;
    displayName: string;
    roles: string[];
}

function safeParseBase64(jsonBase64: string): DecodedToken {
    const decoded = atob(jsonBase64);
    return JSON.parse(decoded) as DecodedToken;
}

export function decodeToken(token: string): UserFromToken {
    const payload = token.split('.')[1];
    const decoded = safeParseBase64(payload);

    const roles = Array.isArray(decoded.role)
        ? decoded.role
        : [decoded.role].filter(Boolean);

    return {
        id: decoded.nameid,
        email: decoded.email,
        username: decoded.unique_name,
        displayName: decoded.displayName,
        roles,
    };
}

export function isTokenExpired(token: string): boolean {
    try {
        const payload = token.split('.')[1];
        const decoded = safeParseBase64(payload);
        return decoded.exp * 1000 < Date.now();
    } catch {
        return true;
    }
}