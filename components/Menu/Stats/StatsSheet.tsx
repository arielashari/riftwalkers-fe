'use client'

import {Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle  } from "@/components/ui/sheet";
import {InventoryItem, rarityColors} from "@/types/item";
import { ScrollArea } from "../../ui/scroll-area";
import {useEffect, useState} from "react";
import {playersRepository} from "@/repository/players";
import {usePlayerStore} from "@/store";
import {observer} from "mobx-react-lite";
import AgilityIcon from "@/public/PlayerStat/Agility.png"
import IntelligenceIcon from "@/public/PlayerStat/Intelligence.png"
import AttackIcon from "@/public/PlayerStat/Attack.png"
import DefenseIcon from "@/public/PlayerStat/Defense.png"
import HPIcon from "@/public/PlayerStat/HP.png"
import ManaIcon from "@/public/PlayerStat/Mana.png"
import StrengthIcon from "@/public/PlayerStat/Strength.png"
import VitalityIcon from "@/public/PlayerStat/Vitality.png"
import Image from "next/image";

type StatsSheetProps = {
    open: boolean;
    onClose: () => void;
}

const StatsSheet = observer(({open, onClose}: StatsSheetProps) => {
    const playerStore = usePlayerStore();
    const [stats, setStats] = useState({
        str: playerStore.str,
        agi: playerStore.agi,
        int: playerStore.int,
        vit: playerStore.vit
    });

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Sync once the store has valid values
        if (playerStore.str !== 0 || playerStore.agi !== 0 || playerStore.int !== 0 || playerStore.vit !== 0) {
            setStats({
                str: playerStore.str,
                agi: playerStore.agi,
                int: playerStore.int,
                vit: playerStore.vit
            });
        }
    }, [playerStore.str, playerStore.agi, playerStore.int, playerStore.vit]);


    const handleIncrement = (stat: keyof typeof stats) => {
        if (playerStore.statPoints > 0) {
            setStats(prev => ({
                ...prev,
                [stat]: prev[stat] + 1
            }));
        }
    };

    const handleDecrement = (stat: keyof typeof stats) => {
        if (stats[stat] > playerStore[stat]) {
            setStats(prev => ({
                ...prev,
                [stat]: prev[stat] - 1
            }));
        }
    };

    const remainingPoints = playerStore.statPoints -
        (Object.entries(stats).reduce((acc, [key, value]) =>
            acc + (value - playerStore[key as keyof typeof stats]), 0));

    const handleConfirm = async () => {
        const statDeltas = {
            str: stats.str - playerStore.str,
            agi: stats.agi - playerStore.agi,
            int: stats.int - playerStore.int,
            vit: stats.vit - playerStore.vit
        };

        const hasChanges = Object.values(statDeltas).some(delta => delta !== 0);
        if (!hasChanges) {
            onClose();
            return;
        }

        try {
            setIsLoading(true);
            await playersRepository.api.updateStats(statDeltas);
            playerStore.clear();
            const resp = await playersRepository.api.getPlayers();
            playerStore.setPlayer(resp.data);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent className="bg-black/90 backdrop-blur-md shadow-lg text-white w-[90vw] sm:w-[400px]">
                <SheetHeader className="flex flex-row justify-between items-center border-b border-white/10 pb-4">
                    <SheetTitle className="text-white text-xl">Character Stats</SheetTitle>
                    <div className="text-sm text-gray-400">Points: {remainingPoints}</div>
                </SheetHeader>

                <div className="mt-6">
                    <h2 className="text-sm font-medium text-gray-200 mb-4">Base Stats</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/10 p-3 rounded-lg">
                            <div className="text-gray-400 text-xs mb-1">
                                <Image src={StrengthIcon} alt="StrengthIcon" className="w-6 h-6 inline-block"/>
                                Strength
                            </div>
                            <div className="text-lg font-medium flex items-center justify-between">
                                {stats.str}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleDecrement('str')}
                                        className="px-2 text-sm bg-white/20 rounded"
                                        disabled={stats.str <= playerStore.str}
                                    >-
                                    </button>
                                    <button
                                        onClick={() => handleIncrement('str')}
                                        className="px-2 text-sm bg-white/20 rounded"
                                        disabled={remainingPoints <= 0}
                                    >+
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/10 p-3 rounded-lg">
                            <div className="text-gray-400 text-xs mb-1">
                                <Image src={AgilityIcon} alt="AgilityIcon" className="w-6 h-6 inline-block"/>
                                Agility
                            </div>
                            <div className="text-lg font-medium flex items-center justify-between">
                                {stats.agi}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleDecrement('agi')}
                                        className="px-2 text-sm bg-white/20 rounded"
                                        disabled={stats.agi <= playerStore.agi}
                                    >-
                                    </button>
                                    <button
                                        onClick={() => handleIncrement('agi')}
                                        className="px-2 text-sm bg-white/20 rounded"
                                        disabled={remainingPoints <= 0}
                                    >+
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/10 p-3 rounded-lg">
                            <div className="text-gray-400 text-xs mb-1">
                                <Image src={IntelligenceIcon} alt="IntelligenceIcon" className="w-6 h-6 inline-block"/>
                                Intelligence
                            </div>
                            <div className="text-lg font-medium flex items-center justify-between">
                                {stats.int}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleDecrement('int')}
                                        className="px-2 text-sm bg-white/20 rounded"
                                        disabled={stats.int <= playerStore.int}
                                    >-
                                    </button>
                                    <button
                                        onClick={() => handleIncrement('int')}
                                        className="px-2 text-sm bg-white/20 rounded"
                                        disabled={remainingPoints <= 0}
                                    >+
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/10 p-3 rounded-lg">
                            <div className="text-gray-400 text-xs mb-1">
                                <Image src={VitalityIcon} alt="VitalityIcon" className="w-6 h-6 inline-block"/>
                                Vitality
                            </div>
                            <div className="text-lg font-medium flex items-center justify-between">
                                {stats.vit}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleDecrement('vit')}
                                        className="px-2 text-sm bg-white/20 rounded"
                                        disabled={stats.vit <= playerStore.vit}
                                    >-
                                    </button>
                                    <button
                                        onClick={() => handleIncrement('vit')}
                                        className="px-2 text-sm bg-white/20 rounded"
                                        disabled={remainingPoints <= 0}
                                    >+
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <h2 className="text-sm font-medium text-gray-200 mb-4">Derived Stats</h2>
                    <div className="space-y-3">
                        <div className="bg-white/10 p-3 rounded-lg flex justify-between items-center">
                            <div className="text-gray-400">
                                <Image src={AttackIcon} alt="AttackIcon" className="w-6 h-6 inline-block"/>
                                Attack
                            </div>
                            <div className="font-medium">{playerStore.attack}</div>
                        </div>
                        <div className="bg-white/10 p-3 rounded-lg flex justify-between items-center">
                            <div className="text-gray-400">
                                <Image src={DefenseIcon} alt="DefenseIcon" className="w-6 h-6 inline-block"/>
                                Defense
                            </div>
                            <div className="font-medium">{playerStore.defense}</div>
                        </div>
                        <div className="bg-white/10 p-3 rounded-lg flex justify-between items-center">
                            <div className="text-gray-400">
                                <Image src={HPIcon} alt="HPIcon" className="w-6 h-6 inline-block"/>
                                HP
                            </div>
                            <div className="font-medium">{playerStore.currentHp} / {playerStore.maxHp}</div>
                        </div>
                        <div className="bg-white/10 p-3 rounded-lg flex justify-between items-center">
                            <div className="text-gray-400">
                                <Image src={ManaIcon} alt="ManaIcon" className="w-6 h-6 inline-block"/>
                                Mana
                            </div>
                            <div className="font-medium">{playerStore.currentMana} / {playerStore.maxMana}</div>
                        </div>
                    </div>
                </div>

                {remainingPoints < playerStore.statPoints && (
                    <div className="mt-6">
                        <button
                            onClick={handleConfirm}
                            disabled={isLoading}
                            className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
                        >
                            {isLoading ? 'Confirming...' : 'Confirm Changes'}
                        </button>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
});

export default StatsSheet;
