'use client'

import { useEffect, useState, useRef } from "react";
import { socket } from "@/app/socket";
import {useParams, useRouter} from "next/navigation";
import {AuthStore} from "@/store/auth";
import {useAuthStore, usePlayerStore} from "@/store";
import { observer } from "mobx-react-lite";
import PlayerAttack from '@/public/player/_Attack.png'
import PlayerIdle from '@/public/player/_Idle.png'
import PlayerHurt from '@/public/player/_Hit.png'

import EnemyAttack from '@/public/player/_Attack.png'
import EnemyIdle from '@/public/player/_Idle.png'
import EnemyHurt from '@/public/player/_Hit.png'

const BattleScene = observer(() => {
        const player = usePlayerStore()
        const auth = useAuthStore()

        const searchParams = useParams();
        const sessionId = searchParams?.sessionId as string;

        const playerId = auth.userData.playerId
        const currentHp = player.currentHp;
        const maxHp = player.maxHp;
        const setCurrentHp = player.setCurrentHp;
        const currentMana = player.currentMana;
        const setCurrentMana = player.setCurrentMana;

        const [mobs, setMobs] = useState<
            { id: string; name: string; hp: number; maxHp: number; state: 'idle' | 'hurt' | 'attack' }[]
        >([]);
        const [selectedMobId, setSelectedMobId] = useState<string | null>(null);
        const [logs, setLogs] = useState<string[]>([]);
        const [playerState, setPlayerState] = useState<'idle' | 'attack' | 'hurt'>('idle');
        const [enemyState, setEnemyState] = useState<'idle' | 'attack' | 'hurt'>('idle');
        const [isBattleOver, setIsBattleOver] = useState(false);
        const [battleResult, setBattleResult] = useState<'victory' | 'defeat' | null>(null);

        const getSprite = (state: 'idle' | 'attack' | 'hurt', role: 'player' | 'enemy') => {
            if (role === 'player') {
                if (state === 'attack') return PlayerAttack.src;
                if (state === 'hurt') return PlayerHurt.src;
                return PlayerIdle.src;
            } else {
                if (state === 'attack') return EnemyAttack.src;
                if (state === 'hurt') return EnemyHurt.src;
                return EnemyIdle.src;
            }
        };

        const animatePlayerAttack = () => {
            setPlayerState('attack');
            setTimeout(() => setPlayerState('idle'), 300);
        };

        const animateEnemyAttack = () => {
            setEnemyState('attack');
            setTimeout(() => setEnemyState('idle'), 300);
        };

        const addLog = (text: string) => {
            setLogs((prev) => [text, ...prev.slice(0, 20)]);
        };

        useEffect(() => {
            let unsubscribed = false;

            const init = async () => {
                // Connect listeners
                socket.on('connect', () => console.log('[WS] Connected'));
                socket.on('disconnect', () => console.log('[WS] Disconnected'));

                socket.on('player_attacked', ({ value, targetHP, targetMobId }) => {
                    setMobs((prev) =>
                        prev.map((mob) =>
                            mob.id === targetMobId
                                ? { ...mob, hp: targetHP, state: 'hurt' }
                                : mob,
                        ),
                    );
                    animatePlayerAttack();
                    setTimeout(() => {
                        setMobs((prev) =>
                            prev.map((mob) =>
                                mob.id === targetMobId ? { ...mob, state: 'idle' } : mob,
                            ),
                        );
                    }, 200);
                    addLog(`You dealt ${value} damage to mob!`);
                });

                socket.on('mob_attacked', ({ value, targetHP, attackerMobId }) => {
                    setPlayerState('hurt');
                    setCurrentHp(targetHP);
                    addLog(`Mob ${attackerMobId} dealt ${value} damage to you!`);
                    setMobs((prev) =>
                        prev.map((mob) =>
                            mob.id === attackerMobId ? { ...mob, state: 'attack' } : mob,
                        ),
                    );

                    setTimeout(() => {
                        setMobs((prev) =>
                            prev.map((mob) =>
                                mob.id === attackerMobId ? { ...mob, state: 'idle' } : mob,
                            ),
                        );
                    }, 200);
                });
                ;

                socket.on('skill_cast', ({ value, skillName, targetHP, mpLeft, targetMobId }) => {
                    setMobs((prev) =>
                        prev.map((mob) =>
                            mob.id === targetMobId
                                ? { ...mob, hp: targetHP, state: 'hurt' }
                                : mob,
                        ),
                    );
                    setCurrentMana(mpLeft);
                    animatePlayerAttack();
                    setTimeout(() => {
                        setMobs((prev) =>
                            prev.map((mob) =>
                                mob.id === targetMobId ? { ...mob, state: 'idle' } : mob,
                            ),
                        );
                    }, 200);
                    addLog(`You used ${skillName} for ${value} damage!`);
                });

                socket.on('skill_failed', ({ reason }) => {
                    addLog(`Skill failed: ${reason}`);
                });

                // socket.on('drops_received', ({ items }) => {
                //     const dropText = items.map((item: Item) => 1x ${item.name}).join(', ');
                //     addLog(`You received: ${dropText}`);
                // });

                socket.on('battle_end', ({ winner }) => {
                    setIsBattleOver(true);
                    const won = winner === playerId;
                    setBattleResult(won ? 'victory' : 'defeat');
                    addLog(`Battle ended! ${won ? 'You won!' : 'You lost!'}`);
                });

                socket.on('battle_state', ({ mobs }) => {
                    console.log('[BATTLE_STATE]', mobs); // ⬅️ Add this
                    setMobs(
                        mobs.map((mob: any) => ({
                            id: mob.id,
                            name: mob.name,
                            hp: mob.currentHp,
                            maxHp: mob.maxHp,
                            state: 'idle',
                        })),
                    );
                    setSelectedMobId(mobs[0]?.id || null);
                });
                ;


                // Load player
                // await loadPlayerFromAPI();

                // Wait until Zustand is updated with playerId
                let retries = 0;
                while (!playerId && retries < 20) {
                    await new Promise((res) => setTimeout(res, 100));
                    retries++;
                }

                if (!playerId || !sessionId || unsubscribed) {
                // if (!sessionId || unsubscribed) {
                    console.warn('[JOIN] Missing playerId or sessionId', playerId, sessionId);
                    return;
                }

                console.log('[JOIN] Sending join_battle', playerId, sessionId);
                socket.emit('join_battle', { playerId, sessionId });
            };

            init();

            return () => {
                unsubscribed = true;
                socket.off('connect');
                socket.off('disconnect');
                socket.off('player_attacked');
                socket.off('mob_attacked');
                socket.off('skill_cast');
                socket.off('skill_failed');
                socket.off('drops_received');
                socket.off('battle_end');
                socket.off('battle_state');
            };
        }, [sessionId]);

        const handleAttack = () => {
            if (!selectedMobId) return;
            socket.emit('player_action', {
                sessionId,
                action: {
                    actor: 'player',
                    type: 'attack',
                    targetMobId: selectedMobId,
                },
            });
        };

        const handleSkill = () => {
            if (!selectedMobId) return;
            socket.emit('use_skill', {
                sessionId,
                skillId: '8f7d7012-c6e8-4429-8d5f-f2f68e61d67d',
                targetMobId: selectedMobId,
            });
        };

        const playerSprite = getSprite(playerState, 'player');
        const enemySprite = getSprite(enemyState, 'enemy');

        if (!playerId || mobs.length === 0) {
            return (
                <div className="w-full h-screen flex items-center justify-center bg-black text-white">
                    Loading battle...
                </div>
            );
        }


        return (
            <div
                className="relative w-full h-screen bg-cover bg-center flex flex-col items-center justify-between"
                // style={{ backgroundImage: `url(${background.src})` }}
            >
                {/* Characters */}
                <div className="absolute bottom-62 left-1/2 -translate-x-1/2 w-full max-w-[640px] flex justify-between items-end gap-4 px-4 sm:px-8">
                    <div className="flex flex-col items-center text-white">
                        <div className="text-lg font-bold mb-1">Player</div>
                        <div className="w-32 h-4 bg-gray-700 rounded">
                            <div className="bg-green-500 h-4 rounded" style={{ width: `${(currentHp / maxHp) * 100}%` }} />
                        </div>
                        <div
                            className={`w-[120px] h-[80px] scale-150 sprite-walk ${playerState === 'hurt' ? 'hurt-flash' : ''}`}
                            style={{ backgroundImage: `url(${playerSprite})`, backgroundRepeat: 'no-repeat' }}
                        />
                    </div>

                    {mobs.map((mob) => {
                        const enemySprite = getSprite(mob.state, 'enemy');
                        return (
                            <div
                                key={mob.id}
                                className="flex flex-col items-center text-white cursor-pointer"
                                onClick={() => setSelectedMobId(mob.id)}
                            >
                                <div className="text-lg font-bold mb-1">{mob.name}</div>
                                <div className="w-32 h-4 bg-gray-700 rounded">
                                    <div
                                        className="bg-red-500 h-4 rounded"
                                        style={{ width: `${(mob.hp / mob.maxHp) * 100}%` }}
                                    />
                                </div>
                                <div
                                    className={`w-[120px] h-[80px] scale-150 sprite-walk ${
                                        mob.state === 'hurt' ? 'hurt-flash' : ''
                                    } ${selectedMobId === mob.id ? 'outline outline-blue-400' : ''}`}
                                    style={{
                                        backgroundImage: `url(${enemySprite})`,
                                        backgroundRepeat: 'no-repeat',
                                        transform: 'scaleX(-1)',
                                    }}
                                />
                            </div>
                        )
                    })}

                </div>

                {/* Controls */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
                    <button className="w-[264px] px-4 py-2 mb-2 bg-green-500 hover:bg-green-600 text-white rounded">
                        Auto
                    </button>
                    <div className="flex gap-2">
                        <button className="w-[84px] px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded">
                            Defense
                        </button>
                        <button
                            className="w-[84px] px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
                            onClick={handleAttack}
                        >
                            Attack
                        </button>
                        <button
                            className="w-[84px] px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded"
                            onClick={handleSkill}
                        >
                            Skill
                        </button>
                    </div>
                </div>

                {battleResult && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
                        <div className="text-center text-white space-y-4">
                            <h1 className="text-4xl font-bold">
                                {battleResult === 'victory' ? 'Victory!' : 'Defeat!'}
                            </h1>
                            <button
                                onClick={() => (window.location.href = '/')}
                                className="px-6 py-2 bg-white text-black rounded hover:bg-gray-200 transition"
                            >
                                Return
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }
)

export default BattleScene;
