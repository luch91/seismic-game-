// Asset Generator - Creates procedural graphics for the game
class AssetGenerator {
    static generatePlayer(scene) {
        const graphics = scene.add.graphics();

        // Create a 32x32 Mario-themed pixel art character

        // === CAP (Seismic maroon) ===
        graphics.fillStyle(0x6b2a2a, 1);
        graphics.fillRect(8, 0, 18, 4);   // Cap brim extends forward
        graphics.fillRect(10, 0, 14, 2);   // Cap top
        graphics.fillRect(8, 2, 16, 4);    // Cap body

        // Cap emblem - small "S" for Seismic (warm beige dot)
        graphics.fillStyle(0xc8a898, 1);
        graphics.fillRect(14, 3, 4, 2);

        // === FACE (skin tone) ===
        graphics.fillStyle(0xe8b888, 1);
        graphics.fillRect(10, 6, 14, 8);   // Face

        // Eyes
        graphics.fillStyle(0xffffff, 1);
        graphics.fillRect(12, 7, 3, 3);
        graphics.fillRect(19, 7, 3, 3);

        // Pupils
        graphics.fillStyle(0x000000, 1);
        graphics.fillRect(13, 8, 2, 2);
        graphics.fillRect(20, 8, 2, 2);

        // Mustache (dark brown)
        graphics.fillStyle(0x3a1a0a, 1);
        graphics.fillRect(12, 11, 10, 2);

        // Nose
        graphics.fillStyle(0xd4a070, 1);
        graphics.fillRect(16, 9, 3, 3);

        // === OVERALLS (Seismic dark teal) ===
        graphics.fillStyle(0x1a3a3a, 1);
        graphics.fillRect(8, 14, 16, 10);  // Overall body

        // Overall straps
        graphics.fillRect(10, 14, 3, 2);
        graphics.fillRect(19, 14, 3, 2);

        // Overall buttons (warm beige)
        graphics.fillStyle(0xc8a898, 1);
        graphics.fillRect(11, 16, 2, 2);
        graphics.fillRect(19, 16, 2, 2);

        // Shirt underneath (dusty rose)
        graphics.fillStyle(0x8b4a3a, 1);
        graphics.fillRect(12, 14, 8, 2);   // Collar area visible

        // === ARMS (shirt color - dusty rose) ===
        graphics.fillStyle(0x8b4a3a, 1);
        graphics.fillRect(4, 15, 4, 7);    // Left arm
        graphics.fillRect(24, 15, 4, 7);   // Right arm

        // Hands (skin)
        graphics.fillStyle(0xe8b888, 1);
        graphics.fillRect(4, 20, 4, 3);
        graphics.fillRect(24, 20, 4, 3);

        // === LEGS / BOOTS ===
        // Legs (overalls continue)
        graphics.fillStyle(0x1a3a3a, 1);
        graphics.fillRect(10, 24, 5, 4);
        graphics.fillRect(17, 24, 5, 4);

        // Boots (dark brown)
        graphics.fillStyle(0x3a1a0a, 1);
        graphics.fillRect(9, 28, 6, 4);
        graphics.fillRect(17, 28, 6, 4);

        graphics.generateTexture('player', 32, 32);
        graphics.destroy();
    }

    // Helper to draw the upper body (cap, face, torso, arms) — shared across frames
    static _drawPlayerUpperBody(graphics) {
        // Cap
        graphics.fillStyle(0x6b2a2a, 1);
        graphics.fillRect(8, 0, 18, 4);
        graphics.fillRect(10, 0, 14, 2);
        graphics.fillRect(8, 2, 16, 4);
        // Cap emblem
        graphics.fillStyle(0xc8a898, 1);
        graphics.fillRect(14, 3, 4, 2);
        // Face
        graphics.fillStyle(0xe8b888, 1);
        graphics.fillRect(10, 6, 14, 8);
        // Eyes
        graphics.fillStyle(0xffffff, 1);
        graphics.fillRect(12, 7, 3, 3);
        graphics.fillRect(19, 7, 3, 3);
        // Pupils
        graphics.fillStyle(0x000000, 1);
        graphics.fillRect(13, 8, 2, 2);
        graphics.fillRect(20, 8, 2, 2);
        // Mustache
        graphics.fillStyle(0x3a1a0a, 1);
        graphics.fillRect(12, 11, 10, 2);
        // Nose
        graphics.fillStyle(0xd4a070, 1);
        graphics.fillRect(16, 9, 3, 3);
        // Overalls
        graphics.fillStyle(0x1a3a3a, 1);
        graphics.fillRect(8, 14, 16, 10);
        graphics.fillRect(10, 14, 3, 2);
        graphics.fillRect(19, 14, 3, 2);
        // Buttons
        graphics.fillStyle(0xc8a898, 1);
        graphics.fillRect(11, 16, 2, 2);
        graphics.fillRect(19, 16, 2, 2);
        // Shirt collar
        graphics.fillStyle(0x8b4a3a, 1);
        graphics.fillRect(12, 14, 8, 2);
        // Arms
        graphics.fillStyle(0x8b4a3a, 1);
        graphics.fillRect(4, 15, 4, 7);
        graphics.fillRect(24, 15, 4, 7);
        // Hands
        graphics.fillStyle(0xe8b888, 1);
        graphics.fillRect(4, 20, 4, 3);
        graphics.fillRect(24, 20, 4, 3);
    }

    static generatePlayerWalk1(scene) {
        const graphics = scene.add.graphics();
        this._drawPlayerUpperBody(graphics);
        // Walk frame 1: left leg forward, right leg back
        graphics.fillStyle(0x1a3a3a, 1);
        graphics.fillRect(8, 24, 5, 4);   // Left leg forward
        graphics.fillRect(19, 24, 5, 4);  // Right leg back
        // Boots
        graphics.fillStyle(0x3a1a0a, 1);
        graphics.fillRect(7, 28, 6, 4);   // Left boot forward
        graphics.fillRect(19, 28, 6, 4);  // Right boot back
        graphics.generateTexture('player_walk1', 32, 32);
        graphics.destroy();
    }

    static generatePlayerWalk2(scene) {
        const graphics = scene.add.graphics();
        this._drawPlayerUpperBody(graphics);
        // Walk frame 2: right leg forward, left leg back
        graphics.fillStyle(0x1a3a3a, 1);
        graphics.fillRect(10, 24, 5, 4);  // Left leg back
        graphics.fillRect(17, 24, 5, 4);  // Right leg forward (neutral-ish)
        // Boots - legs closer together
        graphics.fillStyle(0x3a1a0a, 1);
        graphics.fillRect(10, 28, 5, 4);
        graphics.fillRect(17, 28, 5, 4);
        graphics.generateTexture('player_walk2', 32, 32);
        graphics.destroy();
    }

    static generatePlayerJump(scene) {
        const graphics = scene.add.graphics();
        this._drawPlayerUpperBody(graphics);
        // Jump: legs tucked, arms up
        // Override arms — raised position
        graphics.fillStyle(0x8b4a3a, 1);
        graphics.fillRect(3, 12, 4, 7);   // Left arm raised
        graphics.fillRect(25, 12, 4, 7);  // Right arm raised
        // Hands raised
        graphics.fillStyle(0xe8b888, 1);
        graphics.fillRect(3, 11, 4, 2);
        graphics.fillRect(25, 11, 4, 2);
        // Legs tucked together
        graphics.fillStyle(0x1a3a3a, 1);
        graphics.fillRect(11, 24, 4, 3);
        graphics.fillRect(17, 24, 4, 3);
        // Boots tucked
        graphics.fillStyle(0x3a1a0a, 1);
        graphics.fillRect(11, 27, 4, 4);
        graphics.fillRect(17, 27, 4, 4);
        graphics.generateTexture('player_jump', 32, 32);
        graphics.destroy();
    }

    static generateCrystal(scene) {
        const graphics = scene.add.graphics();

        // Create a geometric crystal - Seismic warm tones
        const centerX = 16;
        const centerY = 16;

        // Main crystal body (diamond shape with facets) - dusty rose
        graphics.fillStyle(0x8b4a3a, 1);
        graphics.beginPath();
        graphics.moveTo(centerX, 4);
        graphics.lineTo(26, centerY);
        graphics.lineTo(centerX, 28);
        graphics.lineTo(6, centerY);
        graphics.closePath();
        graphics.fillPath();

        // Lighter facets - warm beige
        graphics.fillStyle(0xc8a898, 1);
        graphics.beginPath();
        graphics.moveTo(centerX, 4);
        graphics.lineTo(26, centerY);
        graphics.lineTo(centerX, centerY);
        graphics.closePath();
        graphics.fillPath();

        // Darker facets - maroon
        graphics.fillStyle(0x6b2a2a, 1);
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

    // Power crystal - larger with golden glow
    static generatePowerCrystal(scene) {
        const graphics = scene.add.graphics();
        const centerX = 20;
        const centerY = 20;

        // Outer glow
        graphics.fillStyle(0xffff00, 0.3);
        graphics.fillCircle(centerX, centerY, 18);

        // Main crystal body (larger diamond)
        graphics.fillStyle(0xffdd00, 1);
        graphics.beginPath();
        graphics.moveTo(centerX, 4);
        graphics.lineTo(34, centerY);
        graphics.lineTo(centerX, 36);
        graphics.lineTo(6, centerY);
        graphics.closePath();
        graphics.fillPath();

        // Lighter facets
        graphics.fillStyle(0xffff66, 1);
        graphics.beginPath();
        graphics.moveTo(centerX, 4);
        graphics.lineTo(34, centerY);
        graphics.lineTo(centerX, centerY);
        graphics.closePath();
        graphics.fillPath();

        // Darker facets
        graphics.fillStyle(0xcc9900, 1);
        graphics.beginPath();
        graphics.moveTo(centerX, 36);
        graphics.lineTo(6, centerY);
        graphics.lineTo(centerX, centerY);
        graphics.closePath();
        graphics.fillPath();

        // Highlight star
        graphics.fillStyle(0xffffff, 0.8);
        graphics.fillRect(centerX - 2, 10, 4, 4);

        graphics.generateTexture('power_crystal', 40, 40);
        graphics.destroy();
    }

    static generateEnemy(scene, type = 'goomba') {
        const graphics = scene.add.graphics();

        if (type === 'goomba') {
            // Goomba-style enemy (mushroom-like) - Seismic tones
            graphics.fillStyle(0x4a2020, 1); // Dark maroon-brown

            // Body
            graphics.fillRect(4, 12, 24, 16);

            // Head/cap
            graphics.fillStyle(0x6b3030, 1);
            graphics.fillRect(2, 4, 28, 8);

            // Eyes (angry)
            graphics.fillStyle(0xffffff, 1);
            graphics.fillRect(8, 14, 4, 4);
            graphics.fillRect(20, 14, 4, 4);

            // Pupils
            graphics.fillStyle(0x000000, 1);
            graphics.fillRect(10, 16, 2, 2);
            graphics.fillRect(22, 16, 2, 2);

            // Eyebrow scowl
            graphics.fillStyle(0x2a0e0e, 1);
            graphics.fillRect(8, 13, 5, 1);
            graphics.fillRect(19, 13, 5, 1);

            // Feet
            graphics.fillStyle(0x2a0e0e, 1);
            graphics.fillRect(6, 28, 6, 4);
            graphics.fillRect(20, 28, 6, 4);

            graphics.generateTexture('enemy_goomba', 32, 32);

        } else if (type === 'koopa') {
            // Koopa-style enemy (turtle-like) - Seismic tones
            // Shell
            graphics.fillStyle(0x6b2a2a, 1);
            graphics.fillRect(6, 10, 20, 14);

            // Shell pattern
            graphics.fillStyle(0x8b4a3a, 1);
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

        } else if (type === 'spiny') {
            // Spiny - has spikes on top, can't be stomped
            // Body (red/orange)
            graphics.fillStyle(0xcc3300, 1);
            graphics.fillRect(6, 14, 20, 14);

            // Spikes on top
            graphics.fillStyle(0xffff00, 1);
            for (let i = 0; i < 4; i++) {
                const x = 8 + i * 5;
                graphics.beginPath();
                graphics.moveTo(x, 14);
                graphics.lineTo(x + 3, 4);
                graphics.lineTo(x + 6, 14);
                graphics.closePath();
                graphics.fillPath();
            }

            // Eyes (angry)
            graphics.fillStyle(0xffffff, 1);
            graphics.fillRect(10, 18, 4, 3);
            graphics.fillRect(18, 18, 4, 3);

            // Pupils
            graphics.fillStyle(0x000000, 1);
            graphics.fillRect(12, 19, 2, 2);
            graphics.fillRect(20, 19, 2, 2);

            // Feet
            graphics.fillStyle(0x991100, 1);
            graphics.fillRect(8, 28, 5, 4);
            graphics.fillRect(19, 28, 5, 4);

            graphics.generateTexture('enemy_spiny', 32, 32);

        } else if (type === 'flying_koopa') {
            // Flying Koopa - has wings
            // Shell
            graphics.fillStyle(0x00aa99, 1);
            graphics.fillRect(6, 12, 20, 12);

            // Shell pattern
            graphics.fillStyle(0x00ddbb, 1);
            graphics.fillRect(10, 14, 4, 4);
            graphics.fillRect(18, 14, 4, 4);

            // Wings
            graphics.fillStyle(0xffffff, 1);
            // Left wing
            graphics.beginPath();
            graphics.moveTo(2, 14);
            graphics.lineTo(8, 8);
            graphics.lineTo(8, 14);
            graphics.closePath();
            graphics.fillPath();
            // Right wing
            graphics.beginPath();
            graphics.moveTo(30, 14);
            graphics.lineTo(24, 8);
            graphics.lineTo(24, 14);
            graphics.closePath();
            graphics.fillPath();

            // Head
            graphics.fillStyle(0x66cc88, 1);
            graphics.fillRect(24, 16, 6, 6);

            // Eye
            graphics.fillStyle(0xffffff, 1);
            graphics.fillRect(26, 17, 3, 3);

            // Legs (tucked up)
            graphics.fillStyle(0x66cc88, 1);
            graphics.fillRect(10, 24, 4, 4);
            graphics.fillRect(18, 24, 4, 4);

            graphics.generateTexture('enemy_flying_koopa', 32, 32);

        } else if (type === 'hammer_bro') {
            // Hammer Bro - throws hammers
            // Body (armored)
            graphics.fillStyle(0x228822, 1);
            graphics.fillRect(8, 10, 16, 16);

            // Helmet
            graphics.fillStyle(0x444444, 1);
            graphics.fillRect(6, 2, 20, 10);

            // Face opening
            graphics.fillStyle(0x66cc88, 1);
            graphics.fillRect(10, 6, 12, 6);

            // Eyes
            graphics.fillStyle(0xffffff, 1);
            graphics.fillRect(12, 7, 3, 3);
            graphics.fillRect(17, 7, 3, 3);

            // Pupils
            graphics.fillStyle(0x000000, 1);
            graphics.fillRect(13, 8, 2, 2);
            graphics.fillRect(18, 8, 2, 2);

            // Arm holding hammer
            graphics.fillStyle(0x66cc88, 1);
            graphics.fillRect(24, 12, 6, 4);

            // Hammer in hand
            graphics.fillStyle(0x885500, 1);
            graphics.fillRect(26, 6, 4, 8);
            graphics.fillStyle(0x666666, 1);
            graphics.fillRect(24, 2, 8, 6);

            // Legs
            graphics.fillStyle(0x66cc88, 1);
            graphics.fillRect(10, 26, 4, 6);
            graphics.fillRect(18, 26, 4, 6);

            graphics.generateTexture('enemy_hammer_bro', 32, 32);
        }

        graphics.destroy();
    }

    // Generate hammer projectile
    static generateHammer(scene) {
        const graphics = scene.add.graphics();

        // Handle
        graphics.fillStyle(0x885500, 1);
        graphics.fillRect(6, 10, 4, 12);

        // Head
        graphics.fillStyle(0x666666, 1);
        graphics.fillRect(2, 4, 12, 8);

        graphics.generateTexture('hammer', 16, 24);
        graphics.destroy();
    }

    static generatePlatform(scene) {
        const graphics = scene.add.graphics();

        // Platform tile (32x32 brick-like) - Seismic dark maroon
        graphics.fillStyle(0x3a1a1a, 1);
        graphics.fillRect(0, 0, 32, 32);

        // Brick outline
        graphics.lineStyle(2, 0x6b2a2a, 1);
        graphics.strokeRect(1, 1, 30, 30);

        // Inner detail
        graphics.lineStyle(1, 0x2a0e0e, 1);
        graphics.strokeRect(4, 4, 24, 24);

        // Brick mortar lines
        graphics.lineStyle(1, 0x4a1a1a, 0.5);
        graphics.lineBetween(0, 16, 32, 16);
        graphics.lineBetween(16, 0, 16, 16);
        graphics.lineBetween(0, 16, 0, 32);

        graphics.generateTexture('platform', 32, 32);
        graphics.destroy();
    }

    static generateMovingPlatform(scene) {
        const graphics = scene.add.graphics();

        // Moving platform - teal-accented to distinguish from static
        graphics.fillStyle(0x1a3a3a, 1);
        graphics.fillRect(0, 0, 32, 32);

        // Glowing border (brighter teal)
        graphics.lineStyle(2, 0x4a8a8a, 1);
        graphics.strokeRect(1, 1, 30, 30);

        // Arrow indicators showing it moves
        graphics.fillStyle(0x4a8a8a, 0.8);
        // Left arrow
        graphics.beginPath();
        graphics.moveTo(4, 16);
        graphics.lineTo(10, 10);
        graphics.lineTo(10, 22);
        graphics.closePath();
        graphics.fillPath();
        // Right arrow
        graphics.beginPath();
        graphics.moveTo(28, 16);
        graphics.lineTo(22, 10);
        graphics.lineTo(22, 22);
        graphics.closePath();
        graphics.fillPath();

        // Center dot
        graphics.fillStyle(0xc8a898, 0.6);
        graphics.fillCircle(16, 16, 3);

        graphics.generateTexture('moving_platform', 32, 32);
        graphics.destroy();
    }

    // Speed boost crystal — blue/cyan diamond
    static generateSpeedCrystal(scene) {
        const graphics = scene.add.graphics();
        const cx = 16, cy = 16;

        // Outer glow
        graphics.fillStyle(0x00ccff, 0.25);
        graphics.fillCircle(cx, cy, 14);

        // Main diamond body — cyan
        graphics.fillStyle(0x00aaff, 1);
        graphics.beginPath();
        graphics.moveTo(cx, 4);
        graphics.lineTo(26, cy);
        graphics.lineTo(cx, 28);
        graphics.lineTo(6, cy);
        graphics.closePath();
        graphics.fillPath();

        // Light facet
        graphics.fillStyle(0x66ddff, 1);
        graphics.beginPath();
        graphics.moveTo(cx, 4);
        graphics.lineTo(26, cy);
        graphics.lineTo(cx, cy);
        graphics.closePath();
        graphics.fillPath();

        // Speed lines
        graphics.lineStyle(1, 0xffffff, 0.6);
        graphics.lineBetween(2, 10, 8, 10);
        graphics.lineBetween(1, 16, 6, 16);
        graphics.lineBetween(2, 22, 8, 22);

        // Highlight
        graphics.fillStyle(0xffffff, 0.7);
        graphics.fillRect(cx - 2, 8, 3, 3);

        graphics.generateTexture('speed_crystal', 32, 32);
        graphics.destroy();
    }

    // Invincibility star — golden star shape
    static generateInvincibilityStar(scene) {
        const graphics = scene.add.graphics();
        const cx = 16, cy = 16;

        // Outer glow
        graphics.fillStyle(0xffff00, 0.3);
        graphics.fillCircle(cx, cy, 15);

        // Star shape (5-pointed)
        graphics.fillStyle(0xffdd00, 1);
        graphics.beginPath();
        for (let i = 0; i < 5; i++) {
            const outerAngle = (i * 72 - 90) * Math.PI / 180;
            const innerAngle = ((i * 72) + 36 - 90) * Math.PI / 180;
            const ox = cx + Math.cos(outerAngle) * 12;
            const oy = cy + Math.sin(outerAngle) * 12;
            const ix = cx + Math.cos(innerAngle) * 5;
            const iy = cy + Math.sin(innerAngle) * 5;
            if (i === 0) graphics.moveTo(ox, oy);
            else graphics.lineTo(ox, oy);
            graphics.lineTo(ix, iy);
        }
        graphics.closePath();
        graphics.fillPath();

        // Inner highlight
        graphics.fillStyle(0xffff88, 1);
        graphics.fillCircle(cx, cy, 4);

        // Sparkle
        graphics.fillStyle(0xffffff, 0.8);
        graphics.fillRect(cx - 1, 5, 2, 3);

        graphics.generateTexture('invincibility_star', 32, 32);
        graphics.destroy();
    }

    static generateParticle(scene) {
        const graphics = scene.add.graphics();
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(4, 4, 4);
        graphics.generateTexture('particle', 8, 8);
        graphics.destroy();
    }

    static generateFlag(scene) {
        const graphics = scene.add.graphics();

        // Flag pole
        graphics.fillStyle(0x888888, 1);
        graphics.fillRect(2, 0, 4, 64);

        // Flag - Seismic maroon
        graphics.fillStyle(0x6b2a2a, 1);
        graphics.beginPath();
        graphics.moveTo(6, 4);
        graphics.lineTo(28, 12);
        graphics.lineTo(6, 20);
        graphics.closePath();
        graphics.fillPath();

        // Flag detail - warm beige
        graphics.fillStyle(0xc8a898, 1);
        graphics.fillRect(10, 10, 8, 4);

        graphics.generateTexture('flag', 32, 64);
        graphics.destroy();
    }

    static generateBackground(scene) {
        const graphics = scene.add.graphics();

        // Create a tiled background pattern - Seismic dark teal
        graphics.fillStyle(0x0a1a1a, 1);
        graphics.fillRect(0, 0, 64, 64);

        // Subtle warm sparkles
        graphics.fillStyle(0x4a6a6a, 0.4);
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
        this.generatePlayerWalk1(scene);
        this.generatePlayerWalk2(scene);
        this.generatePlayerJump(scene);
        this.generateCrystal(scene);
        this.generatePowerCrystal(scene);
        this.generateSpeedCrystal(scene);
        this.generateInvincibilityStar(scene);
        this.generateEnemy(scene, 'goomba');
        this.generateEnemy(scene, 'koopa');
        this.generateEnemy(scene, 'spiny');
        this.generateEnemy(scene, 'flying_koopa');
        this.generateEnemy(scene, 'hammer_bro');
        this.generateHammer(scene);
        this.generatePlatform(scene);
        this.generateMovingPlatform(scene);
        this.generateParticle(scene);
        this.generateFlag(scene);
        this.generateBackground(scene);
    }
}
