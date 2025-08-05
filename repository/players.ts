import useSWR from 'swr';
import {http} from "@/utils/http";
import useSWRMutation from "swr/mutation";


const url = {
    getPlayers() {
        return '/api/players'
    },
    getInventory() {
        return '/api/players/inventory'
    },
    useOrEquipItem() {
        return '/api/players/use-or-equip'
    },
    updateStats() {
        return '/api/players/stats'
    },

}

const hooks = {
    useGetInventory() {
        return useSWR(url.getInventory(), http.fetch)
    },
        useEquipItem() {
            return useSWRMutation(
                url.useOrEquipItem(),
                async (url: string, { arg }: { arg: { itemId: string; isEquipped: boolean } }) => {
                    return await http.post(url, arg);
                }
            );
        }
}

const api = {
    getPlayers() {
        return http.fetch(url.getPlayers());
    },
    updateStats({
        str, agi, int, vit
                }: {
        str: number;
        agi: number;
        int: number;
        vit: number;
    }) {
        return http.patch(url.updateStats(), {str, agi, int, vit});
    }
}

export const playersRepository = {
    url, hooks, api
}
