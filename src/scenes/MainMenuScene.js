// Main Menu Scene
class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background
        this.add.rectangle(0, 0, width, height, 0x1a0033).setOrigin(0);

        // Add some background stars
        for (let i = 0; i < 50; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const size = Phaser.Math.Between(1, 3);
            const star = this.add.circle(x, y, size, 0xff00ff, 0.5);

            this.tweens.add({
                targets: star,
                alpha: 0.1,
                duration: Phaser.Math.Between(1000, 3000),
                yoyo: true,
                repeat: -1
            });
        }

        // Title
        const title = this.add.text(width / 2, height / 3, 'SEISMIC\nPLATFORMER', {
            fontSize: '64px',
            fontFamily: 'monospace',
            fill: '#ff00ff',
            align: 'center',
            fontStyle: 'bold'
        });
        title.setOrigin(0.5);
        title.setStroke('#aa00ff', 8);

        // Animated title effect
        this.tweens.add({
            targets: title,
            scale: 1.05,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Subtitle
        const subtitle = this.add.text(width / 2, height / 3 + 100, 'Conquer the Mag Levels', {
            fontSize: '20px',
            fontFamily: 'monospace',
            fill: '#ffffff',
            align: 'center'
        });
        subtitle.setOrigin(0.5);

        // Start button
        const startButton = this.add.text(width / 2, height / 2 + 50, 'START GAME', {
            fontSize: '32px',
            fontFamily: 'monospace',
            fill: '#ffffff',
            backgroundColor: '#aa00ff',
            padding: { x: 20, y: 10 }
        });
        startButton.setOrigin(0.5);
        startButton.setInteractive({ useHandCursor: true });

        startButton.on('pointerover', () => {
            startButton.setStyle({ fill: '#ff00ff' });
            startButton.setScale(1.1);
        });

        startButton.on('pointerout', () => {
            startButton.setStyle({ fill: '#ffffff' });
            startButton.setScale(1);
        });

        startButton.on('pointerdown', () => {
            this.cameras.main.fade(500, 0, 0, 0);
            this.time.delayedCall(500, () => {
                this.scene.start('LevelSelectScene');
            });
        });

        // Instructions
        const instructions = this.add.text(width / 2, height - 100,
            'Arrow Keys: Move | Space/Up: Jump | Collect Crystals | Avoid Enemies', {
            fontSize: '14px',
            fontFamily: 'monospace',
            fill: '#ffffff',
            align: 'center'
        });
        instructions.setOrigin(0.5);

        // Credits
        const credits = this.add.text(width / 2, height - 30, 'Seismic Discord Community', {
            fontSize: '12px',
            fontFamily: 'monospace',
            fill: '#aa00ff',
            align: 'center'
        });
        credits.setOrigin(0.5);

        // Fade in
        this.cameras.main.fadeIn(1000);
    }
}
