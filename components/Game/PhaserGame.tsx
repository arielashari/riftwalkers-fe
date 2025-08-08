import { forwardRef, useEffect, useLayoutEffect, useRef } from 'react';
import StartGame from './main';
import { EventBus } from './EventBus';
import type Phaser from 'phaser';
import {usePlayerStore} from "@/store";
import {socket} from "@/app/socket";

interface PhaserGameRef {
    game: Phaser.Game | null;
    scene: Phaser.Scene | null;
}

interface PhaserGameProps {
    currentActiveScene?: (scene: Phaser.Scene) => void;
    playerStore?: ReturnType<typeof usePlayerStore>;
    sessionId?: string;
}

export const PhaserGame = forwardRef<PhaserGameRef, PhaserGameProps>(
    function PhaserGame({ currentActiveScene, playerStore, sessionId }, ref) {
        const game = useRef<Phaser.Game | undefined>();

        // Create the game inside a useLayoutEffect hook to avoid creating it outside the DOM
        useLayoutEffect(() => {
            if (game.current === undefined && playerStore) {
                game.current = StartGame('game-container');
                game.current.registry.set('playerStore', playerStore)
                game.current.registry.set('sessionId', sessionId)

                if (ref && typeof ref !== 'function') {
                    ref.current = { game: game.current, scene: null };
                }
            }

            return () => {
                if (game.current) {
                    game.current.destroy(true);
                    game.current = undefined;
                }
            };
        }, [ref]);

        useEffect(() => {
            EventBus.on('current-scene-ready', (currentScene: Phaser.Scene) => {
                if (currentActiveScene) {
                    currentActiveScene(currentScene);
                }

                if (ref && typeof ref !== 'function' && ref.current) {
                    ref.current.scene = currentScene;
                }
            });

            return () => {
                EventBus.removeListener('current-scene-ready');
            };
        }, [currentActiveScene, ref]);

        useEffect(() => {
            if (game.current && playerStore) {
                game.current.registry.set('playerStore', playerStore);
            }
        }, [playerStore]);


        return <div id="game-container"></div>;
    }
);

export type { PhaserGameRef };
