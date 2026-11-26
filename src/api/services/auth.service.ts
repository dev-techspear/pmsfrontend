import { api } from '@/api/client';
import { AUTH_ENDPOINTS, STORAGE_KEYS } from '@/constants/constants';
import type { AuthUser } from '@/auth/AuthProvider';

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
}

export interface TokenResult extends AuthUser {
    access_token: string;
    refresh_token: string;
}

// `api` unwraps the { is_success, data } envelope, so error bodies are the only place the
// `message` field is still visible.
export const getAuthErrorMessage = (err: any, fallback: string): string => {
    const body = err?.response?.data;
    if (err?.response?.status === 429) return 'Too many attempts. Please wait a minute and try again.';
    return (typeof body?.message === 'string' && body.message)
        || (typeof body?.detail === 'string' && body.detail)
        || fallback;
};

export const authService = {
    async login(payload: LoginPayload): Promise<TokenResult> {
        const res = await api.post<TokenResult>(AUTH_ENDPOINTS.LOGIN, payload);
        return res.data;
    },

    async register(payload: RegisterPayload): Promise<string> {
        const res = await api.post<{ message: string }>(AUTH_ENDPOINTS.REGISTER, payload);
        return res.data.message;
    },

    /** Always resolves with the same message for any email; rejects (503) only when e-mail is not set up. */
    async forgotPassword(email: string): Promise<string> {
        const res = await api.post<{ message: string }>(AUTH_ENDPOINTS.FORGOT_PASSWORD, { email });
        return res.data.message;
    },

    /**
     * Changes the password. The server then ends every session of the account (old tokens are refused),
     * so this browser's stored login is cleared too.
     */
    async resetPassword(token: string, newPassword: string): Promise<string> {
        const res = await api.post<{ message: string }>(AUTH_ENDPOINTS.RESET_PASSWORD, { token, new_password: newPassword });
        authService.clearStoredSession();
        return res.data.message;
    },

    /** Forgets the login kept in this browser (the same keys the app clears on sign-out). */
    clearStoredSession(): void {
        [STORAGE_KEYS.TOKEN, STORAGE_KEYS.REFRESH_TOKEN, STORAGE_KEYS.USER, STORAGE_KEYS.USER_DATA]
            .forEach((key) => localStorage.removeItem(key));
    },
};
