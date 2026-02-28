export interface RegisterDto {
    email: string;
    username: string;
    password: string;
    displayName?: string;
}

export interface LoginDto {
    email: string;
    password: string;
}

export interface UserDto {
    id: string;
    email: string;
    username: string;
    displayName: string;
    roles: string[];
}

export interface TokenResponse {
    token: string;
    expiration: string;
    user: UserDto;
}