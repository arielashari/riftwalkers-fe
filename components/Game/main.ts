import * as Phaser from 'phaser';
import { Game } from './Scene/BattleScene';
import { Boot } from './Scene/BootScene';
import { Preloader } from './Scene/Preloader';
import {GameOver} from "@/components/Game/Scene/GameOver";

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: 'game-container',
    backgroundColor: '#028af8',
    scale: {
        mode: Phaser.Scale.FIT,        // Scale to fit while maintaining aspect ratio
        autoCenter: Phaser.Scale.CENTER_BOTH, // Center the game in the screen
        width: window.innerWidth,      // Start with full screen width
        height: window.innerHeight,    // Start with full screen height
    },
    scene: [
        Boot,
        Preloader,
        Game,
        GameOver
    ]
};

const StartGame = (parent: any) => {
    return new Phaser.Game({ ...config, parent });
};

export default StartGame;
