import { Scene } from 'phaser';

interface GameOverData {
    didWin: boolean;
}

export class GameOver extends Scene {
    private didWin: boolean = false;

    constructor() {
        super('GameOver');
    }

    init(data: GameOverData) {
        this.didWin = data.didWin;
    }

    create() {
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        // Background color (optional)
        this.cameras.main.setBackgroundColor('#000000');

        // Win or Lose Text
        this.add.text(centerX, centerY - 50, this.didWin ? 'You Win!' : 'You Lose!', {
            fontSize: '48px',
            color: this.didWin ? '#00ff00' : '#ff0000',
            fontFamily: 'Arial',
        }).setOrigin(0.5);

        // Restart button
        // const restartButton = this.add.text(centerX, centerY + 50, 'Restart', {
        //     fontSize: '32px',
        //     color: '#ffffff',
        //     backgroundColor: '#333',
        //     padding: { x: 20, y: 10 },
        //     fontFamily: 'Arial',
        // }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        //
        // restartButton.on('pointerdown', () => {
        //     // Restart the game scene
        //     this.scene.start('Game');
        // });

        // Optional: Main Menu button
        const menuButton = this.add.text(centerX, centerY + 50, 'Go Back', {
            fontSize: '24px',
            color: '#fff',
            backgroundColor: '#555',
            padding: { x: 15, y: 8 },
            fontFamily: 'Arial',
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        menuButton.on('pointerdown', () => {
            // this.scene.start('MainMenu');
            window.location.href = '/';
        });
    }
}
