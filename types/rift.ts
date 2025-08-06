export type Rift = {
    id: string
    name: string
    difficulty: RiftDifficulty
    status: string
    rewards: Array<{
        quantity: number
        item: {
            name: string
            description: string
            rarity: string
            type: string
            iconUrl: string
            hpBonus: number
            strBonus: number
            agiBonus: number
            intBonus: number
            vitBonus: number
        }
    }>
}

export type RiftDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'VERY_HARD' | 'EXTREME';
