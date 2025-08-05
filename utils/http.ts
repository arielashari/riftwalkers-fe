import { config } from "@/config/app";
import { TokenUtil } from "@/utils/token";

const authFetch = async (url: string, options: RequestInit = {}): Promise<any> => {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(TokenUtil.accessToken && {
            'Authorization': `Bearer ${TokenUtil.accessToken}`
        })
    };

    const opts: RequestInit = {
        ...options,
        headers
    };

    const response = await fetch(config.baseUrl + url, opts);
    const data = await response.json();

    if (data?.statusCode === 401 || data?.message === 'Unauthorized') {
        TokenUtil.clearAccessToken();
        TokenUtil.clearRefreshToken();
        window.location.href = '/login';
        return;
    }

    return data;
};

export const http = {
    fetch: async (url: string) => {
        return await authFetch(url, { method: 'GET' });
    },

    post: async (url: string, body: object) => {
        return await authFetch(url, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    },

    patch: async (url: string, body: object) => {
        return await authFetch(url, {
            method: 'PATCH',
            body: JSON.stringify(body)
        });
    }
};
