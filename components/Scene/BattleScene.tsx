"use client";
import { useEffect, useRef } from "react";
import PlayerIdle from '@/public/player/_Idle.png';
import EnemyIdle from '@/public/player/_Idle.png';
import Background from '@/public/background/orig_big.png';

let PhaserLib: typeof import("phaser");

async function loadPhaser() {
    if (!PhaserLib) {
        PhaserLib = await import("phaser");
    }
    return PhaserLib;
}

export default function BattleScene() {
    const gameRef = useRef<import("phaser").Game | null>(null);

    useEffect(() => {
        if (gameRef.current) return; // prevent double init

        loadPhaser().then((Phaser) => {
            class BattleScene extends Phaser.Scene {
                player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
                enemy!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

                preload() {
                    this.load.image("bg", Background.src);
                    this.load.spritesheet("player", PlayerIdle.src, { frameWidth: 32, frameHeight: 32 });
                    this.load.spritesheet("enemy", EnemyIdle.src, { frameWidth: 32, frameHeight: 32 });
                }

                create() {
                    const centerX = this.cameras.main.width / 2;
                    const centerY = this.cameras.main.height / 2;

                    // Background
                    const bg = this.add.image(centerX, centerY, "bg")
                        .setOrigin(0.5)
                        .setDisplaySize(this.cameras.main.width, this.cameras.main.height)
                        .setDepth(0); // background at depth 0

                    // Create player & enemy
                    this.player = this.physics.add.sprite(centerX - 200, centerY, "player", 0)
                        .setScale(4)
                        .setDepth(1);
                    this.enemy = this.physics.add.sprite(centerX + 200, centerY, "enemy", 0)
                        .setScale(4)
                        .setDepth(1);

                    // Player idle animation
                    this.anims.create({
                        key: "player_idle",
                        frames: this.anims.generateFrameNumbers("player", { start: 0, end: 3 }),
                        frameRate: 6,
                        repeat: -1
                    });

                    // Enemy idle animation
                    this.anims.create({
                        key: "enemy_idle",
                        frames: this.anims.generateFrameNumbers("enemy", { start: 0, end: 3 }),
                        frameRate: 6,
                        repeat: -1
                    });

                    this.player.play("player_idle");
                    this.enemy.play("enemy_idle");
                }
            }

            const config: Phaser.Types.Core.GameConfig = {
                type: Phaser.AUTO,
                width: window.innerWidth,  // use browser viewport width
                height: window.innerHeight, // use browser viewport height
                backgroundColor: "#000",
                scene: [BattleScene],
                physics: { default: "arcade" },
                parent: "game-container",
                scale: {
                    mode: Phaser.Scale.RESIZE, // auto-resize with window
                    autoCenter: Phaser.Scale.CENTER_BOTH
                }
            };
            gameRef.current = new Phaser.Game(config);
        });

        return () => {
            gameRef.current?.destroy(true);
            gameRef.current = null;
        };
    }, []);

    return <div id="game-container" />;
}
