// Main Menu Scene
class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Restore the Discord panel (hidden during gameplay)
        const discordPanel = document.getElementById('discord-panel');
        if (discordPanel) discordPanel.style.display = '';

        // Resume audio context on any interaction (required by browsers)
        this.input.once('pointerdown', () => {
            soundManager.resume();
            soundManager.startMusic('menu');
        });

        // Try to start menu music (will work if audio already enabled)
        soundManager.stopMusic();
        soundManager.startMusic('menu');

        // Background - dark teal base
        this.add.rectangle(0, 0, width, height, 0x0a1a1a).setOrigin(0);

        // Add diagonal gradient overlay (maroon band)
        const gradient = this.add.graphics();
        gradient.fillStyle(0x6b2a2a, 0.3);
        gradient.beginPath();
        gradient.moveTo(0, 0);
        gradient.lineTo(width, 0);
        gradient.lineTo(width, height * 0.5);
        gradient.lineTo(0, height * 0.8);
        gradient.closePath();
        gradient.fillPath();

        // Warm beige glow in top-right
        gradient.fillStyle(0xc8a898, 0.15);
        gradient.fillCircle(width * 0.85, height * 0.15, 200);

        // Add some background particles
        for (let i = 0; i < 50; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const size = Phaser.Math.Between(1, 3);
            // Mix of warm and teal tones for stars
            const color = Phaser.Math.Between(0, 1) > 0.5 ? 0xc8a898 : 0x4a6a6a;
            const star = this.add.circle(x, y, size, color, 0.5);

            this.tweens.add({
                targets: star,
                alpha: 0.1,
                duration: Phaser.Math.Between(1000, 3000),
                yoyo: true,
                repeat: -1
            });
        }

        // Title
        const title = this.add.text(width / 2, height / 3, 'SEISMIC\nMAG-RUSH', {
            fontSize: '64px',
            fontFamily: 'monospace',
            fill: '#c8a898',
            align: 'center',
            fontStyle: 'bold'
        });
        title.setOrigin(0.5);
        title.setStroke('#6b2a2a', 8);

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
            fill: '#d4b8a8',
            align: 'center'
        });
        subtitle.setOrigin(0.5);

        // Start button
        const startButton = this.add.text(width / 2, height / 2 + 50, 'START GAME', {
            fontSize: '32px',
            fontFamily: 'monospace',
            fill: '#ffffff',
            backgroundColor: '#6b2a2a',
            padding: { x: 20, y: 10 }
        });
        startButton.setOrigin(0.5);
        startButton.setInteractive({ useHandCursor: true });

        startButton.on('pointerover', () => {
            startButton.setStyle({ fill: '#c8a898' });
            startButton.setScale(1.1);
            soundManager.playMenuHover();
        });

        startButton.on('pointerout', () => {
            startButton.setStyle({ fill: '#ffffff' });
            startButton.setScale(1);
        });

        startButton.on('pointerdown', () => {
            soundManager.playMenuSelect();
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
            fill: '#a09088',
            align: 'center'
        });
        instructions.setOrigin(0.5);

        // Credits
        const credits = this.add.text(width / 2, height - 30, 'Seismic Discord Community', {
            fontSize: '12px',
            fontFamily: 'monospace',
            fill: '#8b4a3a',
            align: 'center'
        });
        credits.setOrigin(0.5);

        // Fade in
        this.cameras.main.fadeIn(1000);
    }
}
