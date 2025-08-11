import { Scene } from 'phaser';
import { PlayerStore } from '@/store/player';
import { socket } from '@/app/socket';
import { EventBus } from '../EventBus';

interface MobData {
  id: string;
  name: string;
  maxHp: number;
  currentHp: number;
  state: 'idle' | 'attack' | 'hurt';
  container?: Phaser.GameObjects.Container;
  hpBar?: Phaser.GameObjects.Rectangle;
  sprite?: Phaser.GameObjects.Sprite;
}

export class Game extends Scene {
  private playerStore!: PlayerStore;
  private sessionId!: string;

  private player!: Phaser.GameObjects.Sprite;
  private playerNameText!: Phaser.GameObjects.Text;
  private playerHpBar!: Phaser.GameObjects.Rectangle;
  private playerManaBar!: Phaser.GameObjects.Rectangle;

  private mobs: Map<string, MobData> = new Map();
  private mobsContainer!: Phaser.GameObjects.Container;

  private playerState: 'idle' | 'attack' | 'hurt' = 'idle';

  constructor() {
    super('Game');
  }

  init(data: { playerStore: PlayerStore; sessionId: string }) {
    this.playerStore = data.playerStore;
    this.sessionId = data.sessionId;

    socket.on('connect', this.onConnect);
    socket.on('disconnect', this.onDisconnect);

    console.log('[JOIN] Sending join_battle', this.playerStore.id, this.sessionId);
    socket.emit('join_battle', { playerId: this.playerStore.id, sessionId: this.sessionId });
  }

  create() {
    const scene = this;
    const { nickname, currentHp, maxHp, currentMana, maxMana } = this.playerStore;

    // Background
    const bg = this.add.image(512, 384, 'background');
    bg.setInteractive();
    this.scale.on('resize', (gameSize: any) => {
      const { width, height } = gameSize;
      bg.setPosition(width / 2, height / 2);
      const scaleX = width / bg.width;
      const scaleY = height / bg.height;
      const scale = Math.max(scaleX, scaleY);
      bg.setScale(scale);
    });

    // Animations
    this.anims.create({
      key: 'player-idle',
      frames: this.anims.generateFrameNumbers('PlayerIdle', { start: 0, end: 9 }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: 'player-attack',
      frames: this.anims.generateFrameNumbers('PlayerAttack', { start: 0, end: 3 }),
      frameRate: 4,
      repeat: 0,
    });
    this.anims.create({
      key: 'player-hurt',
      frames: this.anims.generateFrameNumbers('PlayerHurt', { start: 0, end: 0 }),
      frameRate: 1,
      repeat: 0,
    });

    this.anims.create({
      key: 'enemy-idle',
      frames: this.anims.generateFrameNumbers('EnemyIdle', { start: 0, end: 9 }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: 'enemy-attack',
      frames: this.anims.generateFrameNumbers('EnemyAttack', { start: 0, end: 3 }),
      frameRate: 4,
      repeat: 0,
    });
    this.anims.create({
      key: 'enemy-hurt',
      frames: this.anims.generateFrameNumbers('EnemyHurt', { start: 0, end: 0 }),
      frameRate: 1,
      repeat: 0,
    });

    // Player setup
    this.player = this.add.sprite(scene.scale.width / 2 - 500, scene.scale.height / 2, 'PlayerIdle').setScale(3);
    console.log('Has PlayerIdle texture?', this.textures.exists('PlayerIdle'));
    this.player.play('player-idle');
    this.textures.get('PlayerIdle').setFilter(Phaser.Textures.NEAREST);

    this.playerNameText = this.add
        .text(this.player.x, this.player.y - 60, nickname, { fontSize: '16px', color: '#fff', fontFamily: 'Arial' })
        .setOrigin(0.5);

    // HP and Mana bars for player
    const hpBarBg = this.add.rectangle(this.player.x - 50, this.player.y - 40, 100, 10, 0x000000).setOrigin(0, 0.5);
    this.playerHpBar = this.add.rectangle(this.player.x - 50, this.player.y - 40, (currentHp / maxHp) * 100, 10, 0xff0000).setOrigin(0, 0.5);

    const manaBarBg = this.add.rectangle(this.player.x - 50, this.player.y - 28, 100, 10, 0x000000).setOrigin(0, 0.5);
    this.playerManaBar = this.add.rectangle(this.player.x - 50, this.player.y - 28, (currentMana / maxMana) * 100, 10, 0x0000ff).setOrigin(0, 0.5);

    // Mobs container
    this.mobsContainer = this.add.container(0, 0);

    // Socket event handlers
    socket.on('battle_state', this.onBattleState);
    socket.on('player_attacked', this.onPlayerAttacked);
    socket.on('mob_attacked', this.onMobAttacked);
    socket.on('skill_cast', this.onSkillCast);
    socket.on('skill_failed', this.onSkillFailed);
    socket.on('battle_end', this.onBattleEnd);

    // Emit scene ready event for React or other parts
    EventBus.emit('current-scene-ready', this);

    // Initial update of player bars
    this.updatePlayerHpBar();
    this.updatePlayerManaBar();
    this.events.on('shutdown', this.shutdown, this);
  }

  private onConnect = () => {
    console.log('[WS] Connected');
  };

  private onDisconnect = () => {
    console.log('[WS] Disconnected');
  };

  private onBattleState = (data: { mobs: any[] }) => {
    this.syncMobs(data.mobs);
  };

  private onPlayerAttacked = ({ value, targetHP, targetMobId }: { value: number; targetHP: number; targetMobId: string }) => {
    const mob = this.mobs.get(targetMobId);
    if (mob) {
      mob.currentHp = targetHP;
      mob.state = 'hurt';
      this.updateMobHpBar(mob);
      this.playMobAnimation(mob, 'enemy-hurt');
      this.time.delayedCall(300, () => {
        mob.state = 'idle';
        this.playMobAnimation(mob, 'enemy-idle');
      });
    }
    this.playPlayerAnimation('player-attack');
  };

  private onMobAttacked = ({ value, targetHP, attackerMobId }: { value: number; targetHP: number; attackerMobId: string }) => {
    this.playerStore.currentHp = targetHP;
    this.updatePlayerHpBar();

    this.playPlayerAnimation('player-hurt');

    const attacker = this.mobs.get(attackerMobId);
    if (attacker) {
      attacker.state = 'attack';
      this.playMobAnimation(attacker, 'enemy-attack');
      this.time.delayedCall(300, () => {
        attacker.state = 'idle';
        this.playMobAnimation(attacker, 'enemy-idle');
      });
    }
  };

  private onSkillCast = ({
                           value,
                           skillName,
                           targetHP,
                           mpLeft,
                           targetMobId,
                         }: {
    value: number;
    skillName: string;
    targetHP: number;
    mpLeft: number;
    targetMobId: string;
  }) => {
    const mob = this.mobs.get(targetMobId);
    if (mob) {
      mob.currentHp = targetHP;
      mob.state = 'hurt';
      this.updateMobHpBar(mob);
      this.playMobAnimation(mob, 'enemy-hurt');
      this.time.delayedCall(300, () => {
        mob.state = 'idle';
        this.playMobAnimation(mob, 'enemy-idle');
      });
    }
    this.playerStore.currentMana = mpLeft;
    this.updatePlayerManaBar();
    this.playPlayerAnimation('player-attack');
  };

  private onSkillFailed = ({ reason }: { reason: string }) => {
    console.warn('Skill failed:', reason);
  };

  private onBattleEnd = ({ winner }: { winner: string }) => {
    const playerWon = winner === this.playerStore.id;
    console.log(`Battle ended! You ${playerWon ? 'won' : 'lost'}.`);
    this.scene.start('GameOver', { didWin: playerWon });
  };

  private syncMobs(mobsData: any[]) {
    mobsData.forEach((mobData) => {
      let mob = this.mobs.get(mobData.id);
      if (!mob) {
        mob = {
          id: mobData.id,
          name: mobData.name,
          maxHp: mobData.maxHp,
          currentHp: mobData.currentHp,
          state: 'idle',
        };

        mob.sprite = this.add.sprite(0, 0, 'EnemyIdle').setScale(3);
        mob.sprite.play('enemy-idle');
        this.textures.get('EnemyIdle').setFilter(Phaser.Textures.NEAREST);
        mob.sprite.setFlipX(true);

        const nameText = this.add
            .text(0, -60, mob.name, {
              fontSize: '16px',
              color: '#ff4444',
              fontFamily: 'Arial',
            })
            .setOrigin(0.5);

        const hpBarBg = this.add.rectangle(50, -40, 100, 10, 0x000000).setOrigin(1, 0.5);
        const hpBar = this.add.rectangle(50, -40, 100, 10, 0xff0000).setOrigin(1, 0.5);

        mob.container = this.add.container(this.scale.width / 2 + 500 + this.mobs.size * 120, this.scale.height / 2, [
          mob.sprite,
          nameText,
          hpBarBg,
          hpBar,
        ]);

        mob.hpBar = hpBar;

        this.mobs.set(mob.id, mob);
      } else {
        mob.currentHp = mobData.currentHp;
        mob.maxHp = mobData.maxHp;
        this.updateMobHpBar(mob);
      }
    });

    this.mobs.forEach((mob, id) => {
      if (!mobsData.find((m) => m.id === id)) {
        mob.container?.destroy();
        this.mobs.delete(id);
      }
    });
  }

  private updateMobHpBar(mob: MobData) {
    if (!mob.hpBar) return;
    const width = 100 * (mob.currentHp / mob.maxHp);
    mob.hpBar.width = Phaser.Math.Clamp(width, 0, 100);
  }

  private updatePlayerHpBar() {
    const width = 100 * (this.playerStore.currentHp / this.playerStore.maxHp);
    this.playerHpBar.width = Phaser.Math.Clamp(width, 0, 100);
  }

  private updatePlayerManaBar() {
    const width = 100 * (this.playerStore.currentMana / this.playerStore.maxMana);
    this.playerManaBar.width = Phaser.Math.Clamp(width, 0, 100);
  }

  private playPlayerAnimation(animKey: string) {
    this.player.play(animKey);
    if (animKey !== 'player-idle') {
      this.player.once('animationcomplete', () => {
        this.player.play('player-idle');
      });
    }
  }

  private playMobAnimation(mob: MobData, animKey: string) {
    mob.sprite?.play(animKey);
    if (animKey !== 'enemy-idle') {
      mob.sprite?.once('animationcomplete', () => {
        mob.sprite?.play('enemy-idle');
      });
    }
  }

  shutdown() {
    socket.off('connect', this.onConnect);
    socket.off('disconnect', this.onDisconnect);
    socket.off('battle_state', this.onBattleState);
    socket.off('player_attacked', this.onPlayerAttacked);
    socket.off('mob_attacked', this.onMobAttacked);
    socket.off('skill_cast', this.onSkillCast);
    socket.off('skill_failed', this.onSkillFailed);
    socket.off('battle_end', this.onBattleEnd);
  }
}
