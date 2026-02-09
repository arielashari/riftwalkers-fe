'use client';

import { PhaserGame, type PhaserGameRef } from "@/components/Game/PhaserGame";
import {useEffect, useRef, useState} from "react";
import type Phaser from "phaser";
import {usePlayerStore} from "@/store";
import {observer} from "mobx-react-lite";
import {playersRepository} from "@/repository/players";
import {useParams} from "next/navigation";

const BattlePage = observer(() => {
    const searchParams = useParams();
    const sessionId = searchParams?.sessionId as string;
    const playerStore = usePlayerStore();
    const phaserRef = useRef<PhaserGameRef>(null);
    const [canMoveSprite, setCanMoveSprite] = useState(true);

    // Event emitted from the PhaserGame component
    const currentScene = (scene: Phaser.Scene) => {
        setCanMoveSprite(scene.scene.key !== 'MainMenu');
    };

    useEffect(() => {
        playerStore.loadPlayer()
    }, [playerStore]);

    return (
        <div id="phaseGame">
            <PhaserGame ref={phaserRef} currentActiveScene={currentScene} playerStore={playerStore} sessionId={sessionId}/>
        </div>
    );
});

export default BattlePage;
