import { Scene } from "phaser";
import PlayerAttack from '@/public/player/_Attack.png'
import PlayerIdle from '@/public/player/_Idle.png'
import PlayerHurt from '@/public/player/_Hit.png'

import EnemyAttack from '@/public/player/_Attack.png'
import EnemyIdle from '@/public/player/_Idle.png'
import EnemyHurt from '@/public/player/_Hit.png'

export class Preloader extends Scene {
  constructor() {
    super("Preloader");
  }

  init() {
  }

  preload() {
    //  Load the assets for the game - Replace with your own assets
    // this.load.setPath('assets');
    // this.load.setPath("player");

    this.load.spritesheet("PlayerIdle", PlayerIdle.src, {
      frameWidth: 120,
      frameHeight: 80,
    });
    this.load.spritesheet("PlayerAttack", PlayerAttack.src, {
      frameWidth: 120,
      frameHeight: 80,
    });
    this.load.spritesheet("PlayerHurt", PlayerHurt.src, {
      frameWidth: 120,
      frameHeight: 80,
    });

    this.load.spritesheet("EnemyIdle", EnemyIdle.src, {
      frameWidth: 120,
      frameHeight: 80,
    });
    this.load.spritesheet("EnemyAttack", EnemyAttack.src, {
      frameWidth: 120,
      frameHeight: 80,
    });
    this.load.spritesheet("EnemyHurt", EnemyHurt.src, {
      frameWidth: 120,
      frameHeight: 80,
    });

    // this.load.image('logo', 'logo.png');
    // this.load.image('star', 'star.png');
  }

  create() {
    const playerStore = this.game.registry.get('playerStore');
    const sessionId = this.game.registry.get('sessionId');
    console.log('Preloader got store:', playerStore);
    console.log('Preloader got sessionId:', sessionId);

    this.scene.start("Game", {playerStore, sessionId});
  }
}
