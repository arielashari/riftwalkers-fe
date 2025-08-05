'use client'

import { usePlayerStore } from "@/store";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {observer} from "mobx-react-lite";

const PlayerStatus = observer(() => {
    const playerStore = usePlayerStore()

    const bars = [
        { label: "HP", value: playerStore.currentHp, max: playerStore.maxHp, color: "bg-red-500", labelColor: "text-red-300" },
        { label: "MP", value: playerStore.currentMana, max: playerStore.maxMana, color: "bg-blue-500", labelColor: "text-blue-300" },
        { label: "XP", value: playerStore.xp, max: playerStore.nextLevelXp + playerStore.xp, color: "bg-green-500", labelColor: "text-green-300" }
    ];

    return (
        <div className="absolute top-4 left-4 right-4 z-20 bg-black/80 backdrop-blur-md px-4 pt-4 pb-3 rounded-xl shadow-lg border border-white/10 max-w-md mx-auto">
            <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12 border-2 border-white/30 shadow">
                    <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop" />
                    <AvatarFallback className="bg-blue-500 text-white font-semibold">
                        {playerStore.avatarUrl}
                    </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="text-white font-medium text-sm truncate">{playerStore.nickname}</span>
                        <span className="bg-yellow-400 text-black text-xs px-2 py-0.5 rounded-full font-bold">Lv {playerStore.level}</span>
                    </div>

                    {bars.map(({ label, value, max, color, labelColor }) => (
                        <div key={label} className="flex items-center gap-2 text-xs">
                            <span className={`${labelColor} w-8`}>{label}</span>
                            <div className="flex-1 bg-white/10 h-2 rounded-full overflow-hidden">
                                <div
                                    className={`${color} h-full rounded-full transition-all duration-500`}
                                    style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
                                />
                            </div>
                            <span className="text-white w-14 text-right">{value}/{max}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
});

export default PlayerStatus;
