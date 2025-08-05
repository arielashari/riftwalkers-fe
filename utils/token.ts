export class TokenUtil {
    static get accessToken(): string | null {
        if (typeof window === "undefined") return null;
        return localStorage.getItem('accessToken');
    }

    static set accessToken(token: string | null) {
        if (typeof window === "undefined") return;
        if (token) {
            localStorage.setItem('accessToken', token);
        } else {
            localStorage.removeItem('accessToken');
        }
    }

    static get refreshToken(): string | null {
        if (typeof window === "undefined") return null;
        return localStorage.getItem('refreshToken');
    }

    static set refreshToken(token: string | null) {
        if (typeof window === "undefined") return;
        if (token) {
            localStorage.setItem('refreshToken', token);
        } else {
            localStorage.removeItem('refreshToken');
        }
    }

    static clearAccessToken() {
        this.accessToken = null;
    }

    static clearRefreshToken() {
        this.refreshToken = null;
    }

    static persistToken(accessToken: string, refreshToken?: string) {
        this.accessToken = accessToken;
        if (refreshToken !== undefined) {
            this.refreshToken = refreshToken;
        }
    }
}
