import useSWR from 'swr';
import {http} from "@/utils/http";


const url = {
    getRifts() {
        return '/api/rifts'
    },
    createRift() {
        return '/api/rifts'
    }
}

const hooks = {
    useRift() {
        return useSWR(url.getRifts(), http.fetch)
    }
}

const api = {
    createRift() {
        return http.post(url.createRift(), {d: ''});
    }
}

export const riftsRepository = {
    url, hooks, api
}
