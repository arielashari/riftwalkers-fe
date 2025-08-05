// stores/PlayerStore.ts
import { makeAutoObservable } from "mobx";

export class PlayerStore {
    id: string = "";
    nickname: string = "";
    level: number = 1;
    xp: number = 0;
    currentHp: number = 100;
    currentMana: number = 50;
    avatarUrl: string = "";
    statPoints: number = 0;
    skillPoints: number = 0;
    str: number = 0;
    agi: number = 0;
    int: number = 0;
    vit: number = 0;
    maxHp: number = 100;
    maxMana: number = 50;
    attack: number = 0;
    defense: number = 0;
    nextLevelXp: number = 0;

    constructor() {
        makeAutoObservable(this);
    }

    setPlayer = (data: Partial<PlayerStore>) => {
        Object.assign(this, data);
    }

    setCurrentHp = (hp: number) => {
        this.currentHp = hp;
    }

    setCurrentMana = (mana: number) => {
        this.currentMana = mana;
    }

    clear = () => {
        this.id = "";
        this.nickname = "";
        this.level = 1;
        this.xp = 0;
        this.currentHp = 100;
        this.currentMana = 50;
        this.avatarUrl = "";
        this.statPoints = 0;
        this.skillPoints = 0;
        this.str = 0;
        this.agi = 0;
        this.int = 0;
        this.vit = 0;
        this.maxHp = 100;
        this.maxMana = 50;
        this.attack = 0;
        this.defense = 0;
        this.nextLevelXp = 0;
    }
}
