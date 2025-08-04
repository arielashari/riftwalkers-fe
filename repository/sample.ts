import useSWR from 'swr';
import {http} from "@/utils/http";


const url = {
    getJoke() {
        return '/random_joke'
    }
}

const hooks = {
    useJoke() {
        return useSWR(url.getJoke(), http.fetch)
    }
}

const api = {

}

export const sampleRepository = {
    url, hooks, api
}