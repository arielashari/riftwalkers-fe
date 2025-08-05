export type Rift = {
    id: string
    name: string
    difficulty: string
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

export const RiftDifficulty = {
    EASY: 'Easy',
    MEDIUM: 'Medium',
    HARD: 'Hard',
    VERY_HARD: 'Very Hard',
    EXTREME: 'Extreme'
}
