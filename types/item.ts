export const rarityColors: Record<string, string> = {
    COMMON: 'text-white',
    UNCOMMON: 'text-green-400',
    RARE: 'text-blue-400',
    EPIC: 'text-purple-400',
    LEGENDARY: 'text-yellow-400',
};

export type Item = {
    id: string;
    name: string;
    description: string;
    type: string;
    slot: string | null;
    rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
    iconUrl: string;
}

export type InventoryItem = {
    id: string;
    quantity: number;
    isEquipped: boolean;
    item: Item;
}
