// Boot Scene - Loads assets and initializes the game
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Create loading bar
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

        const loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Loading Seismic Platformer...',
            style: {
                font: '20px monospace',
                fill: '#ff00ff'
            }
        });
        loadingText.setOrigin(0.5, 0.5);

        const percentText = this.make.text({
            x: width / 2,
            y: height / 2,
            text: '0%',
            style: {
                font: '18px monospace',
                fill: '#ffffff'
            }
        });
        percentText.setOrigin(0.5, 0.5);

        // Update loading bar
        this.load.on('progress', (value) => {
            percentText.setText(parseInt(value * 100) + '%');
            progressBar.clear();
            progressBar.fillStyle(0xff00ff, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
        });

        // Load any external assets here
        // this.load.image('crystal', 'assets/images/seismic-crystal.png');

        // For now, we'll generate assets procedurally
    }

    create() {
        // Generate all game assets
        AssetGenerator.generateAll(this);

        // Create simple sound effects using Web Audio
        this.createSoundEffects();

        // Move to main menu
        this.scene.start('MainMenuScene');
    }

    createSoundEffects() {
        // Jump sound
        if (!this.sound.get('jump')) {
            const jumpSound = this.sound.add('jump', { volume: 0.3 });
            // Note: In a real game, you'd load actual audio files
            // For now, Phaser will use silence, but the code structure is ready
        }

        // Collect sound
        if (!this.sound.get('collect')) {
            const collectSound = this.sound.add('collect', { volume: 0.3 });
        }

        // Enemy defeat sound
        if (!this.sound.get('enemy_defeat')) {
            const defeatSound = this.sound.add('enemy_defeat', { volume: 0.3 });
        }

        // Level complete sound
        if (!this.sound.get('level_complete')) {
            const completeSound = this.sound.add('level_complete', { volume: 0.5 });
        }

        // Game over sound
        if (!this.sound.get('game_over')) {
            const gameOverSound = this.sound.add('game_over', { volume: 0.5 });
        }
    }
}
