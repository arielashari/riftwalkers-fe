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
  private playerHpBarBg!: Phaser.GameObjects.Rectangle;
  private playerManaBar!: Phaser.GameObjects.Rectangle;
  private playerManaBarBg!: Phaser.GameObjects.Rectangle;

  private mobs: Map<string, MobData> = new Map();
  private mobsContainer!: Phaser.GameObjects.Container;

  private playerState: 'idle' | 'attack' | 'hurt' = 'idle';
  
  // Responsive properties
  private spriteScale = 3;
  private isMobile = false;

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

    // Detect mobile
    this.isMobile = this.scale.width < 768;
    this.spriteScale = this.isMobile ? 2 : 3;

    // Background
    const bg = this.add.image(512, 384, 'background');
    bg.setInteractive();
    
    // Resize background
    this.resizeBackground(bg);

    // Animations
    this.createAnimations();

    // Player setup
    this.player = this.add.sprite(0, 0, 'PlayerIdle').setScale(this.spriteScale);
    this.player.play('player-idle');
    this.textures.get('PlayerIdle').setFilter(Phaser.Textures.NEAREST);

    this.playerNameText = this.add
      .text(0, 0, nickname, { 
        fontSize: this.isMobile ? '14px' : '16px', 
        color: '#fff', 
        fontFamily: 'Arial' 
      })
      .setOrigin(0.5);

    // HP and Mana bars for player
    const barWidth = this.isMobile ? 80 : 100;
    const barHeight = this.isMobile ? 8 : 10;
    
    this.playerHpBarBg = this.add.rectangle(0, 0, barWidth, barHeight, 0x000000).setOrigin(0, 0.5);
    this.playerHpBar = this.add.rectangle(0, 0, (currentHp / maxHp) * barWidth, barHeight, 0xff0000).setOrigin(0, 0.5);

    this.playerManaBarBg = this.add.rectangle(0, 0, barWidth, barHeight, 0x000000).setOrigin(0, 0.5);
    this.playerManaBar = this.add.rectangle(0, 0, (currentMana / maxMana) * barWidth, barHeight, 0x0000ff).setOrigin(0, 0.5);

    // Mobs container
    this.mobsContainer = this.add.container(0, 0);

    // Position all elements
    this.repositionElements();

    // Handle resize
    this.scale.on('resize', (gameSize: any) => {
      const { width, height } = gameSize;
      
      // Update mobile detection
      const wasMobile = this.isMobile;
      this.isMobile = width < 768;
      
      // Update sprite scale if device type changed
      if (wasMobile !== this.isMobile) {
        this.spriteScale = this.isMobile ? 2 : 3;
        this.player.setScale(this.spriteScale);
        
        // Update all mob sprites
        this.mobs.forEach(mob => {
          mob.sprite?.setScale(this.spriteScale);
        });
        
        // Update font size
        this.playerNameText.setFontSize(this.isMobile ? 14 : 16);
        
        // Update bar widths
        const barWidth = this.isMobile ? 80 : 100;
        const barHeight = this.isMobile ? 8 : 10;
        this.playerHpBarBg.setSize(barWidth, barHeight);
        this.playerManaBarBg.setSize(barWidth, barHeight);
      }
      
      // Resize background
      this.resizeBackground(bg);
      
      // Reposition all elements
      this.repositionElements();
    });

    // Socket event handlers
    socket.on('battle_state', this.onBattleState);
    socket.on('player_attacked', this.onPlayerAttacked);
    socket.on('mob_attacked', this.onMobAttacked);
    socket.on('skill_cast', this.onSkillCast);
    socket.on('skill_failed', this.onSkillFailed);
    socket.on('battle_end', this.onBattleEnd);

    EventBus.emit('current-scene-ready', this);

    this.updatePlayerHpBar();
    this.updatePlayerManaBar();
    this.events.on('shutdown', this.shutdown, this);
  }

  private createAnimations() {
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
  }

  private resizeBackground(bg: Phaser.GameObjects.Image) {
    const width = this.scale.width;
    const height = this.scale.height;
    bg.setPosition(width / 2, height / 2);
    const scaleX = width / bg.width;
    const scaleY = height / bg.height;
    const scale = Math.max(scaleX, scaleY);
    bg.setScale(scale);
  }

  private repositionElements() {
    const width = this.scale.width;
    const height = this.scale.height;
    const centerY = height / 2;
    
    // Calculate positions based on screen size
    let playerX: number;
    let mobBaseX: number;
    
    if (this.isMobile) {
      // On mobile, position closer together and vertically if needed
      if (width < 600) {
        // Very small screens - stack vertically
        playerX = width / 2;
        mobBaseX = width / 2;
      } else {
        // Small screens - closer horizontal positioning
        playerX = width * 0.25;
        mobBaseX = width * 0.75;
      }
    } else {
      // Desktop - use percentage-based positioning
      playerX = width * 0.3;
      mobBaseX = width * 0.7;
    }

    // Position player
    this.player.setPosition(playerX, centerY);
    
    // Position player name
    const nameOffsetY = this.isMobile ? -50 : -60;
    this.playerNameText.setPosition(playerX, centerY + nameOffsetY);
    
    // Position HP bar
    const barWidth = this.isMobile ? 80 : 100;
    const hpOffsetY = this.isMobile ? -32 : -40;
    const manaOffsetY = this.isMobile ? -22 : -28;
    
    this.playerHpBarBg.setPosition(playerX - barWidth / 2, centerY + hpOffsetY);
    this.playerHpBar.setPosition(playerX - barWidth / 2, centerY + hpOffsetY);
    
    this.playerManaBarBg.setPosition(playerX - barWidth / 2, centerY + manaOffsetY);
    this.playerManaBar.setPosition(playerX - barWidth / 2, centerY + manaOffsetY);

    // Reposition mobs
    this.repositionMobs(mobBaseX, centerY);
  }

  private repositionMobs(baseX: number, baseY: number) {
    let index = 0;
    const mobSpacing = this.isMobile ? 80 : 120;
    
    this.mobs.forEach((mob) => {
      if (mob.container) {
        // Position mobs horizontally or stack them
        const offsetX = index * mobSpacing;
        mob.container.setPosition(baseX + offsetX, baseY);
      }
      index++;
    });
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
    const width = this.scale.width;
    const height = this.scale.height;
    const centerY = height / 2;
    const mobBaseX = this.isMobile ? (width < 600 ? width / 2 : width * 0.75) : width * 0.7;

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

        mob.sprite = this.add.sprite(0, 0, 'EnemyIdle').setScale(this.spriteScale);
        mob.sprite.play('enemy-idle');
        this.textures.get('EnemyIdle').setFilter(Phaser.Textures.NEAREST);
        mob.sprite.setFlipX(true);

        const nameText = this.add
          .text(0, this.isMobile ? -50 : -60, mob.name, {
            fontSize: this.isMobile ? '14px' : '16px',
            color: '#ff4444',
            fontFamily: 'Arial',
          })
          .setOrigin(0.5);

        const barWidth = this.isMobile ? 80 : 100;
        const barHeight = this.isMobile ? 8 : 10;
        const hpOffsetY = this.isMobile ? -32 : -40;

        const hpBarBg = this.add.rectangle(barWidth / 2, hpOffsetY, barWidth, barHeight, 0x000000).setOrigin(1, 0.5);
        const hpBar = this.add.rectangle(barWidth / 2, hpOffsetY, barWidth, barHeight, 0xff0000).setOrigin(1, 0.5);

        const mobSpacing = this.isMobile ? 80 : 120;
        mob.container = this.add.container(mobBaseX + this.mobs.size * mobSpacing, centerY, [
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
    const barWidth = this.isMobile ? 80 : 100;
    const width = barWidth * (mob.currentHp / mob.maxHp);
    mob.hpBar.width = Phaser.Math.Clamp(width, 0, barWidth);
  }

  private updatePlayerHpBar() {
    const barWidth = this.isMobile ? 80 : 100;
    const width = barWidth * (this.playerStore.currentHp / this.playerStore.maxHp);
    this.playerHpBar.width = Phaser.Math.Clamp(width, 0, barWidth);
  }

  private updatePlayerManaBar() {
    const barWidth = this.isMobile ? 80 : 100;
    const width = barWidth * (this.playerStore.currentMana / this.playerStore.maxMana);
    this.playerManaBar.width = Phaser.Math.Clamp(width, 0, barWidth);
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