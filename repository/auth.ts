import useSWR from 'swr';
import {http} from "@/utils/http";
import {TokenUtil} from "@/utils/token";

interface LoginDto {
    username: string;
    password: string;
}

const url = {
    login() {
        return '/api/auth/login'
    },
    refreshToken() {
        return '/api/auth/refresh-token'
    }
}

const hooks = {
}

const api = {
    login(dto: LoginDto) {
        return http.post(url.login(), {
            ...dto
        })
    },
    refreshToken() {
        return http.post(url.refreshToken(), {
            'refresh-token': TokenUtil.refreshToken,
        })
    }
}

export const authRepository = {
    url, hooks, api
}
