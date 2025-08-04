import {config} from "@/config/app";
import {TokenUtil} from "@/utils/token";


const authFetch = async (url: string, options: RequestInit = {}) => {
    let opts: RequestInit = {
        ...options,
        headers: {
            'Content-Type': 'application/json'
        }
    }

    if (TokenUtil.accessToken) {
        opts.headers = {
            ...opts.headers,
            'Authorization': `Bearer ${TokenUtil.accessToken}`
        }
    }

    let req = await fetch(config.baseUrl + url, opts);
    const resp = await req.json();

    if (resp?.statusCode === 401 || resp?.message === 'Unauthorized') {
            TokenUtil.clearAccessToken()
            TokenUtil.persistToken()
            window.location.href = '/login';
            return ;
    }

    return resp;
}

export const http = {
    fetch: async (url: string) => {
        let opts: RequestInit = {
            method: 'GET'
        };

        let resp = await authFetch(url, opts);
        return resp
    },
    post: async (url: string, body: {}) => {
        let opts: RequestInit = {
            method: 'POST',
            body: JSON.stringify(body)
        }

        let resp = await authFetch(url, opts)
        return resp;
    }
}