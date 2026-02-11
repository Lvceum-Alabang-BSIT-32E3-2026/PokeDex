

export interface DecodedToken {
    nameid: string;
    email: string;
    unique_name: string;
    displayName: string;
    role: string | string[];
    exp: number;
}

export interface User {
    id: string;
    email: string;
    username: string;
    displayName: string;
    roles: string[];
}

export function decodeToken(token: string): User {
    const payload = token.split('.')[1];
    const decoded: DecodedToken = JSON.parse(atob(payload));

    return {
        id: decoded.nameid,
        email: decoded.email,
        username: decoded.unique_name,
        displayName: decoded.displayName,
        roles: Array.isArray(decoded.role)
            ? decoded.role
            : [decoded.role].filter(Boolean),
    };
}

export function isTokenExpired(token: string): boolean {
    const payload = token.split('.')[1];
    const decoded: DecodedToken = JSON.parse(atob(payload));

    return decoded.exp * 1000 < Date.now();
}
