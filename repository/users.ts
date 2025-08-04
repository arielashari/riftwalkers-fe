import useSWR from 'swr';
import {http} from "@/utils/http";


const url = {
    getUsers() {
        return '/api/users'
    },
    createUsers() {
        return '/api/users'
    }
}

const hooks = {
    useUsers() {
        return useSWR(url.getUsers(), http.fetch)
    }
}

const api = {
    createUsers() {
        return http.post(url.createUsers(), {d: ''});
    }
}

export const usersRepository = {
    url, hooks, api
}