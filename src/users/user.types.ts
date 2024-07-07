export interface User {
    _id: string;
    name: string;
    email: string;
    password: string;
    refreshToken?: string,
    generateAccessToken(): string;
    generateRefreshToken(): string;
}