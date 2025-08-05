import useSWR from 'swr';
import {http} from "@/utils/http";


const url = {
    createBattle() {
        return '/api/battles'
    }
}

const hooks = {

}

const api = {
    createBattle(riftId: string) {
        return http.post(url.createBattle(), {riftId});
    }
}

export const battlesRepository = {
    url, hooks, api
}
