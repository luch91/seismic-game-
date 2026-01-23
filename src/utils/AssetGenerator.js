// Asset Generator - Creates procedural graphics for the game
class AssetGenerator {
    static generatePlayer(scene) {
        const graphics = scene.add.graphics();

        // Create a 32x32 pixel art style character (Mario-inspired)
        graphics.fillStyle(0xff00ff, 1); // Pink/magenta color

        // Head
        graphics.fillRect(8, 4, 16, 8);

        // Body
        graphics.fillStyle(0xaa00ff, 1); // Purple
        graphics.fillRect(8, 12, 16, 12);

        // Arms
        graphics.fillRect(4, 14, 4, 8);
        graphics.fillRect(24, 14, 4, 8);

        // Legs
        graphics.fillRect(10, 24, 6, 8);
        graphics.fillRect(16, 24, 6, 8);

        // Eyes
        graphics.fillStyle(0xffffff, 1);
        graphics.fillRect(12, 6, 3, 3);
        graphics.fillRect(19, 6, 3, 3);

        graphics.generateTexture('player', 32, 32);
        graphics.destroy();
    }

    static generateCrystal(scene) {
        const graphics = scene.add.graphics();

        // Create a geometric pink/purple crystal
        const centerX = 16;
        const centerY = 16;

        // Main crystal body (diamond shape with facets)
        graphics.fillStyle(0xff66ff, 1);
        graphics.beginPath();
        graphics.moveTo(centerX, 4);
        graphics.lineTo(26, centerY);
        graphics.lineTo(centerX, 28);
        graphics.lineTo(6, centerY);
        graphics.closePath();
        graphics.fillPath();

        // Lighter facets
        graphics.fillStyle(0xffaaff, 1);
        graphics.beginPath();
        graphics.moveTo(centerX, 4);
        graphics.lineTo(26, centerY);
        graphics.lineTo(centerX, centerY);
        graphics.closePath();
        graphics.fillPath();

        // Darker facets
        graphics.fillStyle(0xaa00aa, 1);
        graphics.beginPath();
        graphics.moveTo(centerX, 28);
        graphics.lineTo(6, centerY);
        graphics.lineTo(centerX, centerY);
        graphics.closePath();
        graphics.fillPath();

        // Highlight
        graphics.fillStyle(0xffffff, 0.6);
        graphics.fillRect(centerX - 2, 8, 4, 4);

        graphics.generateTexture('crystal', 32, 32);
        graphics.destroy();
    }

    static generateEnemy(scene, type = 'goomba') {
        const graphics = scene.add.graphics();

        if (type === 'goomba') {
            // Goomba-style enemy (mushroom-like)
            graphics.fillStyle(0x660033, 1); // Dark purple

            // Body
            graphics.fillRect(4, 12, 24, 16);

            // Head/cap
            graphics.fillStyle(0x990055, 1);
            graphics.fillRect(2, 4, 28, 8);

            // Eyes
            graphics.fillStyle(0xffffff, 1);
            graphics.fillRect(8, 14, 4, 4);
            graphics.fillRect(20, 14, 4, 4);

            // Pupils
            graphics.fillStyle(0x000000, 1);
            graphics.fillRect(10, 16, 2, 2);
            graphics.fillRect(22, 16, 2, 2);

            // Feet
            graphics.fillStyle(0x440022, 1);
            graphics.fillRect(6, 28, 6, 4);
            graphics.fillRect(20, 28, 6, 4);

            graphics.generateTexture('enemy_goomba', 32, 32);
        } else if (type === 'koopa') {
            // Koopa-style enemy (turtle-like)
            graphics.fillStyle(0x00aa66, 1); // Green body

            // Shell
            graphics.fillStyle(0x990055, 1);
            graphics.fillRect(6, 10, 20, 14);

            // Shell pattern
            graphics.fillStyle(0xcc0077, 1);
            graphics.fillRect(10, 12, 4, 4);
            graphics.fillRect(18, 12, 4, 4);
            graphics.fillRect(14, 18, 4, 4);

            // Head
            graphics.fillStyle(0x66cc88, 1);
            graphics.fillRect(24, 14, 6, 8);

            // Eye
            graphics.fillStyle(0xffffff, 1);
            graphics.fillRect(26, 16, 3, 3);

            // Legs
            graphics.fillStyle(0x66cc88, 1);
            graphics.fillRect(8, 24, 4, 6);
            graphics.fillRect(20, 24, 4, 6);

            graphics.generateTexture('enemy_koopa', 32, 32);
        }

        graphics.destroy();
    }

    static generatePlatform(scene) {
        const graphics = scene.add.graphics();

        // Platform tile (32x32 brick-like)
        graphics.fillStyle(0x6600aa, 1);
        graphics.fillRect(0, 0, 32, 32);

        // Brick outline
        graphics.lineStyle(2, 0x8800cc, 1);
        graphics.strokeRect(1, 1, 30, 30);

        // Inner detail
        graphics.lineStyle(1, 0x4400688, 1);
        graphics.strokeRect(4, 4, 24, 24);

        graphics.generateTexture('platform', 32, 32);
        graphics.destroy();
    }

    static generateFlag(scene) {
        const graphics = scene.add.graphics();

        // Flag pole
        graphics.fillStyle(0x888888, 1);
        graphics.fillRect(2, 0, 4, 64);

        // Flag
        graphics.fillStyle(0xff00ff, 1);
        graphics.beginPath();
        graphics.moveTo(6, 4);
        graphics.lineTo(28, 12);
        graphics.lineTo(6, 20);
        graphics.closePath();
        graphics.fillPath();

        // Flag detail
        graphics.fillStyle(0xffffff, 1);
        graphics.fillRect(10, 10, 8, 4);

        graphics.generateTexture('flag', 32, 64);
        graphics.destroy();
    }

    static generateBackground(scene) {
        const graphics = scene.add.graphics();

        // Create a tiled background pattern
        graphics.fillStyle(0x1a0033, 1);
        graphics.fillRect(0, 0, 64, 64);

        // Stars/sparkles
        graphics.fillStyle(0x6600aa, 0.5);
        for (let i = 0; i < 5; i++) {
            const x = Math.random() * 64;
            const y = Math.random() * 64;
            graphics.fillRect(x, y, 2, 2);
        }

        graphics.generateTexture('background', 64, 64);
        graphics.destroy();
    }

    static generateAll(scene) {
        this.generatePlayer(scene);
        this.generateCrystal(scene);
        this.generateEnemy(scene, 'goomba');
        this.generateEnemy(scene, 'koopa');
        this.generatePlatform(scene);
        this.generateFlag(scene);
        this.generateBackground(scene);
    }
}
