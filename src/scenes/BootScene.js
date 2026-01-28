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
            text: 'Loading Seismic Mag-Rush...',
            style: {
                font: '20px monospace',
                fill: '#c8a898'
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
            progressBar.fillStyle(0x8b4a3a, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
        });

        // Load the seismic crystal image
        this.load.image('crystal_image', 'assets/images/seismic-crystal.jpg');
    }

    create() {
        // Initialize sound manager
        soundManager.init();

        // Generate all game assets (except crystal if image loaded)
        AssetGenerator.generateAll(this);

        // Create crystal texture from loaded image (scaled down for game)
        if (this.textures.exists('crystal_image')) {
            this.createCrystalFromImage();
        }

        // Move to main menu
        this.scene.start('MainMenuScene');
    }

    createCrystalFromImage() {
        // The crystal image is loaded, now we need to create a properly sized texture
        // We'll use the image directly but scale it in the Crystal class
        // Create an alias so Crystal class can use either procedural or image texture

        // Get the source image
        const sourceTexture = this.textures.get('crystal_image');
        const sourceImage = sourceTexture.getSourceImage();

        // Create a canvas to resize the image to game-friendly dimensions
        const canvas = document.createElement('canvas');
        const size = 48; // Crystal size in pixels
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Draw the image scaled to fit
        ctx.drawImage(sourceImage, 0, 0, size, size);

        // Add a slight glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#c8a898';

        // Create new texture from canvas
        this.textures.addCanvas('crystal', canvas);

        console.log('Crystal texture created from seismic-crystal.jpg');
    }
}
