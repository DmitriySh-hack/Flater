import type { IUSER } from "../../models/IUser";

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: IUSER
}