// Game Scene - Main gameplay
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init(data) {
        this.currentLevel = data.level || 1;
        this.levelConfig = GameConfig.levels[`mag${this.currentLevel}`];

        // Game state
        this.score = 0;
        this.lives = 3;
        this.crystalsCollected = 0;
        this.totalCrystals = this.levelConfig.crystalCount;
        this.gameStarted = false;
        this.levelCompleted = false;
        this.isPaused = false;

        // Combo system for enemy kills
        this.comboCount = 0;
        this.comboTimer = null;
        this.comboTimeout = 1500; // 1.5 seconds to chain kills

        // Landing dust tracking
        this.playerWasInAir = false;

        // Level timer
        this.timeRemaining = this.levelConfig.timeLimit || 120;
        this.timerAccumulator = 0;
        this.timerWarning = false;
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Hide the Discord panel during gameplay so it doesn't cover the timer
        const discordPanel = document.getElementById('discord-panel');
        if (discordPanel) discordPanel.style.display = 'none';

        // Background - color varies by Mag tier
        const tierColors = this.getBackgroundTier();
        this.add.rectangle(0, 0, width * 3, height, tierColors.bg).setOrigin(0);

        // Add parallax background stars
        this.createBackground();

        // Create world bounds (3x screen width for scrolling)
        this.physics.world.setBounds(0, 0, width * 3, height);

        // Create physics groups BEFORE platforms (moving platforms need enemyGroup)
        this.enemyGroup = this.physics.add.group();
        this.crystalGroup = this.physics.add.group();
        this.powerCrystalGroup = this.physics.add.group();
        this.bonusPowerUpGroup = this.physics.add.group();

        // Create platforms
        this.platforms = this.physics.add.staticGroup();
        this.movingPlatforms = [];
        this.createPlatforms();

        // Create player
        this.player = new Player(this, 100, height - 150);

        // Create enemies
        this.enemies = [];
        this.createEnemies();

        // Now set up moving platform collisions (after player and enemies exist)
        this.setupMovingPlatformCollisions();

        // Create crystals
        this.crystals = [];
        this.createCrystals();

        // Create power crystals
        this.powerCrystals = [];
        this.createPowerCrystals();

        // Create bonus power-ups (speed boost + invincibility star)
        this.createBonusPowerUps();

        // Create flag at the end
        this.flag = this.physics.add.sprite(width * 3 - 100, height - 150, 'flag');
        this.flag.setImmovable(true);

        // Setup collisions
        this.physics.add.collider(this.player.getSprite(), this.platforms);
        this.physics.add.collider(this.enemyGroup, this.platforms);

        // Player vs enemies (using group for dynamic collision)
        this.physics.add.overlap(
            this.player.getSprite(),
            this.enemyGroup,
            this.handlePlayerEnemyCollision,
            null,
            this
        );

        // Player vs crystals (using group)
        this.physics.add.overlap(
            this.player.getSprite(),
            this.crystalGroup,
            this.handleCrystalCollection,
            null,
            this
        );

        // Player vs power crystals (using group)
        this.physics.add.overlap(
            this.player.getSprite(),
            this.powerCrystalGroup,
            this.handlePowerCrystalCollection,
            null,
            this
        );

        // Player vs bonus power-ups
        this.physics.add.overlap(
            this.player.getSprite(),
            this.bonusPowerUpGroup,
            this.handleBonusPowerUp,
            null,
            this
        );

        // Player vs flag
        this.physics.add.overlap(
            this.player.getSprite(),
            this.flag,
            this.handleFlagReached,
            null,
            this
        );

        // Setup camera
        this.cameras.main.setBounds(0, 0, width * 3, height);
        this.cameras.main.startFollow(this.player.getSprite(), true, 0.1, 0.1);

        // Create UI
        this.createUI();

        // Create touch controls for mobile
        this.createTouchControls();

        // Setup pause menu (ESC key)
        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.escKey.on('down', () => {
            if (this.levelCompleted) return;
            this.togglePause();
        });

        // Start game music
        soundManager.startMusic('game');

        // Fade in
        this.cameras.main.fadeIn(500);
        this.gameStarted = true;
    }

    update() {
        if (!this.gameStarted || this.levelCompleted || this.isPaused) return;

        // Update player
        this.player.update();

        // Landing dust: detect when player lands
        const playerSprite = this.player.getSprite();
        const onGround = playerSprite.body.touching.down;
        if (onGround && this.playerWasInAir) {
            this.spawnLandingDust(playerSprite.x, playerSprite.y + 14);
            soundManager.playLand();
        }
        this.playerWasInAir = !onGround;

        // Update countdown timer
        this.timerAccumulator += this.game.loop.delta;
        if (this.timerAccumulator >= 1000) {
            this.timerAccumulator -= 1000;
            this.timeRemaining--;
            this.timerText.setText(this.formatTime(this.timeRemaining));

            // Warning state at 15 seconds
            if (this.timeRemaining <= 15 && !this.timerWarning) {
                this.timerWarning = true;
                this.timerText.setStyle({ fill: '#ff4444', stroke: '#000000', strokeThickness: 4, fontStyle: 'bold', fontSize: '22px', fontFamily: 'monospace' });
            }

            // Beep every second in warning
            if (this.timerWarning && this.timeRemaining > 0) {
                soundManager.playTimerWarning();
            }

            // Time's up
            if (this.timeRemaining <= 0) {
                this.timeRemaining = 0;
                this.player.die();
                this.cameras.main.shake(500, 0.025);
            }
        }

        // Update enemies
        this.enemies.forEach(enemy => {
            if (enemy.isAlive) {
                enemy.update();
            }
        });

        // Update moving platforms
        this.movingPlatforms.forEach(platform => {
            if (platform.body) {
                // Reverse direction at boundaries
                if (platform.x <= platform.minX || platform.x >= platform.maxX) {
                    platform.velocityX *= -1;
                }
                platform.x += platform.velocityX;
                platform.body.x = platform.x;
            }
        });

        // Check if player fell off the map
        if (playerSprite.y > this.cameras.main.height + 100) {
            this.loseLife();
        }
    }

    createBackground() {
        // Background tint varies by Mag tier
        const tierColors = this.getBackgroundTier();

        // Full-screen background tint overlay
        const bg = this.add.rectangle(
            this.cameras.main.width * 1.5, this.cameras.main.height / 2,
            this.cameras.main.width * 3, this.cameras.main.height,
            tierColors.bg, 1
        );
        bg.setScrollFactor(0.05);
        bg.setDepth(-1);

        // Create animated background stars
        for (let i = 0; i < 100; i++) {
            const x = Phaser.Math.Between(0, this.cameras.main.width * 3);
            const y = Phaser.Math.Between(0, this.cameras.main.height);
            const size = Phaser.Math.Between(1, 2);
            // Star colors match the tier
            const starColor = Math.random() > 0.5 ? tierColors.star1 : tierColors.star2;
            const star = this.add.circle(x, y, size, starColor, tierColors.starAlpha);
            star.setScrollFactor(0.2);

            this.tweens.add({
                targets: star,
                alpha: 0.1,
                duration: Phaser.Math.Between(1000, 3000),
                yoyo: true,
                repeat: -1
            });
        }
    }

    getBackgroundTier() {
        const level = this.currentLevel;
        if (level <= 3) {
            // Mag 1-3: Cool dark teal (default Seismic look)
            return {
                bg: 0x0a1a1a,
                star1: 0xc8a898,
                star2: 0x4a6a6a,
                starAlpha: 0.3
            };
        } else if (level <= 6) {
            // Mag 4-6: Warmer, slightly reddish-brown night sky
            return {
                bg: 0x1a1210,
                star1: 0xc8a898,
                star2: 0x8b4a3a,
                starAlpha: 0.4
            };
        } else {
            // Mag 7-9: Deep crimson-black, ominous
            return {
                bg: 0x1a0a0a,
                star1: 0xff6644,
                star2: 0x8b2a2a,
                starAlpha: 0.5
            };
        }
    }

    createPlatforms() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Ground platform
        for (let i = 0; i < width * 3; i += 32) {
            this.platforms.create(i, height - 16, 'platform');
        }

        // Generate platforms based on difficulty
        this.generateLevelPlatforms();
    }

    generateLevelPlatforms() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const difficulty = this.levelConfig.difficulty;

        // Starting platforms
        this.createPlatformRow(200, height - 100, 3);
        this.createPlatformRow(350, height - 180, 4);

        if (difficulty <= 3) {
            // Mag1-3: Easy levels with wide gaps
            this.createPlatformRow(550, height - 140, 5);
            this.createPlatformRow(750, height - 220, 4);
            this.createPlatformRow(950, height - 160, 6);
            this.createPlatformRow(1200, height - 240, 5);
            this.createPlatformRow(1450, height - 180, 7);
            this.createPlatformRow(1700, height - 260, 4);
            this.createPlatformRow(1900, height - 200, 6);
            this.createPlatformRow(2150, height - 140, 8);
        } else if (difficulty <= 6) {
            // Mag4-6: Medium difficulty with narrower gaps
            this.createPlatformRow(520, height - 160, 3);
            this.createPlatformRow(680, height - 240, 3);
            this.createPlatformRow(840, height - 180, 4);
            this.createPlatformRow(1020, height - 260, 3);
            this.createPlatformRow(1180, height - 200, 3);
            this.createPlatformRow(1360, height - 280, 4);
            this.createPlatformRow(1540, height - 220, 3);
            this.createPlatformRow(1720, height - 300, 3);
            this.createPlatformRow(1880, height - 240, 4);
            this.createPlatformRow(2060, height - 180, 5);

            // Add moving platforms for medium difficulty
            if (this.levelConfig.movingPlatforms) {
                this.createMovingPlatform(900, height - 320, 150);
                this.createMovingPlatform(1400, height - 340, 120);
                this.createMovingPlatform(1950, height - 360, 100);
            }
        } else {
            // Mag7-9: Hard levels with very narrow gaps and precise jumps
            this.createPlatformRow(500, height - 180, 2);
            this.createPlatformRow(630, height - 260, 2);
            this.createPlatformRow(760, height - 200, 2);
            this.createPlatformRow(890, height - 280, 2);
            this.createPlatformRow(1020, height - 220, 2);
            this.createPlatformRow(1150, height - 300, 2);
            this.createPlatformRow(1280, height - 240, 3);
            this.createPlatformRow(1430, height - 320, 2);
            this.createPlatformRow(1560, height - 260, 2);
            this.createPlatformRow(1690, height - 340, 2);
            this.createPlatformRow(1820, height - 280, 2);
            this.createPlatformRow(1950, height - 360, 2);
            this.createPlatformRow(2080, height - 300, 3);
            this.createPlatformRow(2230, height - 220, 4);

            // Add more moving platforms for hard difficulty
            this.createMovingPlatform(850, height - 350, 100);
            this.createMovingPlatform(1350, height - 380, 120);
            this.createMovingPlatform(1750, height - 400, 90);
            this.createMovingPlatform(2150, height - 380, 110);
        }

        // Final platform before flag
        this.createPlatformRow(width * 3 - 300, height - 100, 8);
    }

    createPlatformRow(x, y, count) {
        for (let i = 0; i < count; i++) {
            this.platforms.create(x + i * 32, y, 'platform');
        }
    }

    createMovingPlatform(startX, y, range) {
        // Create moving platform with distinct texture
        const texture = this.textures.exists('moving_platform') ? 'moving_platform' : 'platform';
        const movingPlatform = this.physics.add.sprite(startX, y, texture);
        movingPlatform.setImmovable(true);
        movingPlatform.body.allowGravity = false;

        movingPlatform.minX = startX - range / 2;
        movingPlatform.maxX = startX + range / 2;
        movingPlatform.velocityX = 1;

        // Subtle glow tween to make it stand out
        this.tweens.add({
            targets: movingPlatform,
            alpha: 0.7,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.movingPlatforms.push(movingPlatform);
    }

    // Called after player and enemies are created
    setupMovingPlatformCollisions() {
        this.movingPlatforms.forEach(movingPlatform => {
            this.physics.add.collider(this.player.getSprite(), movingPlatform);
            this.physics.add.collider(this.enemyGroup, movingPlatform);
        });
    }

    createEnemies() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const count = this.levelConfig.enemyCount;
        const speed = this.levelConfig.enemySpeed;
        const difficulty = this.levelConfig.difficulty;

        // Define enemy type distribution — new enemies introduced per Mag level
        const getEnemyType = (difficulty) => {
            const rand = Math.random();

            if (difficulty === 1) {
                // Mag1: Goombas only
                return 'goomba';
            } else if (difficulty === 2) {
                // Mag2: Introduce koopas
                return rand < 0.6 ? 'goomba' : 'koopa';
            } else if (difficulty === 3) {
                // Mag3: More koopas
                return rand < 0.4 ? 'goomba' : 'koopa';
            } else if (difficulty === 4) {
                // Mag4: Introduce flying koopas
                if (rand < 0.35) return 'goomba';
                if (rand < 0.65) return 'koopa';
                return 'flying_koopa';
            } else if (difficulty === 5) {
                // Mag5: Introduce spinies (can't stomp!)
                if (rand < 0.25) return 'goomba';
                if (rand < 0.50) return 'koopa';
                if (rand < 0.75) return 'flying_koopa';
                return 'spiny';
            } else if (difficulty === 6) {
                // Mag6: More spinies
                if (rand < 0.20) return 'goomba';
                if (rand < 0.40) return 'koopa';
                if (rand < 0.60) return 'flying_koopa';
                return 'spiny';
            } else if (difficulty === 7) {
                // Mag7: Introduce hammer bros
                if (rand < 0.15) return 'goomba';
                if (rand < 0.30) return 'koopa';
                if (rand < 0.50) return 'flying_koopa';
                if (rand < 0.70) return 'spiny';
                return 'hammer_bro';
            } else if (difficulty === 8) {
                // Mag8: Heavy hitters
                if (rand < 0.10) return 'goomba';
                if (rand < 0.25) return 'koopa';
                if (rand < 0.45) return 'flying_koopa';
                if (rand < 0.65) return 'spiny';
                return 'hammer_bro';
            } else {
                // Mag9: All enemies, more hammer bros
                if (rand < 0.10) return 'goomba';
                if (rand < 0.20) return 'koopa';
                if (rand < 0.40) return 'flying_koopa';
                if (rand < 0.60) return 'spiny';
                return 'hammer_bro';
            }
        };

        // Distribute enemies throughout the level
        for (let i = 0; i < count; i++) {
            const x = 400 + (i * (width * 2.2) / count);
            const type = getEnemyType(difficulty);

            // Flying koopas spawn higher
            const y = type === 'flying_koopa'
                ? height - 200 - Phaser.Math.Between(50, 100)
                : height - 100;

            try {
                const enemy = new Enemy(this, x, y, type, speed);
                this.enemies.push(enemy);
                this.enemyGroup.add(enemy.getSprite());
            } catch (e) {
                console.error('Failed to create enemy:', type, e);
            }
        }
    }

    createCrystals() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const count = this.levelConfig.crystalCount;

        // Place crystals throughout the level, some on platforms
        for (let i = 0; i < count; i++) {
            const x = 300 + (i * (width * 2.5) / count);
            const y = height - 150 - Phaser.Math.Between(50, 250);
            try {
                const crystal = new Crystal(this, x, y);
                this.crystals.push(crystal);
                this.crystalGroup.add(crystal.getSprite());
            } catch (e) {
                console.error('Failed to create crystal:', e);
            }
        }
    }

    createPowerCrystals() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Number of power crystals based on difficulty (fewer = harder)
        const difficulty = this.levelConfig.difficulty;
        const count = Math.max(1, 4 - Math.floor(difficulty / 3));

        // Place power crystals at strategic locations
        for (let i = 0; i < count; i++) {
            const x = 500 + (i * (width * 2) / count);
            const y = height - 200 - Phaser.Math.Between(80, 180);
            try {
                const powerCrystal = new PowerCrystal(this, x, y);
                this.powerCrystals.push(powerCrystal);
                this.powerCrystalGroup.add(powerCrystal.getSprite());
            } catch (e) {
                console.error('Failed to create power crystal:', e);
            }
        }
    }

    createBonusPowerUps() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const difficulty = this.levelConfig.difficulty;

        // Speed crystals: 1 per level, placed mid-level
        if (this.textures.exists('speed_crystal')) {
            const sx = width * 1 + Phaser.Math.Between(-100, 100);
            const sy = height - 200 - Phaser.Math.Between(50, 150);
            const speedSprite = this.physics.add.sprite(sx, sy, 'speed_crystal');
            speedSprite.setScale(0.9);
            speedSprite.body.setAllowGravity(false);
            speedSprite.powerUpType = 'speed';
            speedSprite.collected = false;
            this.bonusPowerUpGroup.add(speedSprite);

            // Float + pulse
            this.tweens.add({ targets: speedSprite, y: sy - 12, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
            this.tweens.add({ targets: speedSprite, alpha: 0.6, duration: 400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        }

        // Invincibility star: only on Mag3+ and placed late in level
        if (difficulty >= 3 && this.textures.exists('invincibility_star')) {
            const ix = width * 2 + Phaser.Math.Between(-100, 100);
            const iy = height - 250 - Phaser.Math.Between(30, 100);
            const starSprite = this.physics.add.sprite(ix, iy, 'invincibility_star');
            starSprite.setScale(1);
            starSprite.body.setAllowGravity(false);
            starSprite.powerUpType = 'invincibility';
            starSprite.collected = false;
            this.bonusPowerUpGroup.add(starSprite);

            // Float + spin
            this.tweens.add({ targets: starSprite, y: iy - 15, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
            this.tweens.add({ targets: starSprite, angle: 360, duration: 2000, repeat: -1, ease: 'Linear' });
        }
    }

    handleBonusPowerUp(playerSprite, powerUpSprite) {
        if (powerUpSprite.collected) return;
        powerUpSprite.collected = true;

        const type = powerUpSprite.powerUpType;

        // Collection animation
        this.tweens.add({
            targets: powerUpSprite,
            y: powerUpSprite.y - 60,
            alpha: 0,
            scale: 1.8,
            duration: 350,
            ease: 'Back.easeOut',
            onComplete: () => powerUpSprite.destroy()
        });

        if (type === 'speed') {
            soundManager.playSpeedBoost();
            this.addScore(200);
            this.activateSpeedBoost();
        } else if (type === 'invincibility') {
            soundManager.playInvincibilityStar();
            this.addScore(300);
            this.activateInvincibility();
        }
    }

    activateSpeedBoost() {
        const originalSpeed = GameConfig.playerSpeed;
        GameConfig.playerSpeed = originalSpeed * 1.5;

        // Show floating text
        const popup = this.add.text(
            this.player.getSprite().x,
            this.player.getSprite().y - 50,
            'SPEED BOOST!',
            { fontSize: '18px', fontFamily: 'monospace', fill: '#00ccff', stroke: '#000000', strokeThickness: 4, fontStyle: 'bold' }
        );
        popup.setOrigin(0.5);
        this.tweens.add({ targets: popup, y: popup.y - 60, alpha: 0, scale: 1.3, duration: 1000, ease: 'Power2', onComplete: () => popup.destroy() });

        // Blue tint on player during boost
        this.player.getSprite().setTint(0x66ddff);

        // Revert after 5 seconds
        this.time.delayedCall(5000, () => {
            GameConfig.playerSpeed = originalSpeed;
            if (this.player.isAlive) {
                this.player.getSprite().clearTint();
            }
        });
    }

    activateInvincibility() {
        this.player.setInvincible(6000);

        // Show floating text
        const popup = this.add.text(
            this.player.getSprite().x,
            this.player.getSprite().y - 50,
            'INVINCIBLE!',
            { fontSize: '20px', fontFamily: 'monospace', fill: '#ffdd00', stroke: '#000000', strokeThickness: 4, fontStyle: 'bold' }
        );
        popup.setOrigin(0.5);
        this.tweens.add({ targets: popup, y: popup.y - 60, alpha: 0, scale: 1.5, duration: 1200, ease: 'Power2', onComplete: () => popup.destroy() });

        // Golden tint + rainbow flash
        this.player.getSprite().setTint(0xffdd00);
        const flashColors = [0xffdd00, 0xff6600, 0xff00ff, 0x00ffff, 0x66ff66];
        let flashIndex = 0;
        const flashTimer = this.time.addEvent({
            delay: 150,
            callback: () => {
                if (this.player.isAlive && this.player.isInvincible) {
                    this.player.getSprite().setTint(flashColors[flashIndex % flashColors.length]);
                    flashIndex++;
                } else {
                    flashTimer.remove();
                    if (this.player.isAlive) this.player.getSprite().clearTint();
                }
            },
            loop: true
        });

        // Clear tint when invincibility ends
        this.time.delayedCall(6000, () => {
            flashTimer.remove();
            if (this.player.isAlive) this.player.getSprite().clearTint();
        });
    }

    createUI() {
        const uiStyle = {
            fontSize: '20px',
            fontFamily: 'monospace',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        };

        // Score
        this.scoreText = this.add.text(20, 20, 'Score: 0', uiStyle);
        this.scoreText.setScrollFactor(0);

        // Lives
        this.livesText = this.add.text(20, 50, 'Lives: ' + this.lives, uiStyle);
        this.livesText.setScrollFactor(0);

        // Crystals
        this.crystalsText = this.add.text(20, 80, `Crystals: 0/${this.totalCrystals}`, uiStyle);
        this.crystalsText.setScrollFactor(0);

        // Timer (right-aligned, bright gold for visibility)
        this.timerText = this.add.text(this.cameras.main.width - 20, 20, this.formatTime(this.timeRemaining), {
            fontSize: '22px',
            fontFamily: 'monospace',
            fill: '#ffdd44',
            stroke: '#000000',
            strokeThickness: 4,
            fontStyle: 'bold'
        });
        this.timerText.setOrigin(1, 0);
        this.timerText.setScrollFactor(0);

        // Level name
        const levelStyle = {
            fontSize: '24px',
            fontFamily: 'monospace',
            fill: '#c8a898',
            stroke: '#000000',
            strokeThickness: 4,
            fontStyle: 'bold'
        };
        this.levelText = this.add.text(
            this.cameras.main.width / 2,
            20,
            this.levelConfig.name,
            levelStyle
        );
        this.levelText.setOrigin(0.5, 0);
        this.levelText.setScrollFactor(0);
    }

    createTouchControls() {
        // Only show on touch-capable devices
        if (!this.sys.game.device.input.touch) return;

        this.touchInput = { left: false, right: false, jump: false };
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const btnAlpha = 0.5;
        const btnSize = Math.min(60, width * 0.08); // Scale button size based on screen width
        const depth = 200;

        // Position buttons with proportional spacing
        const margin = Math.max(15, width * 0.02);
        const bottomMargin = Math.max(20, height * 0.05);

        // Left button
        const leftX = margin + btnSize;
        const leftY = height - bottomMargin - btnSize;
        const leftBtn = this.add.circle(leftX, leftY, btnSize, 0xc8a898, btnAlpha);
        leftBtn.setScrollFactor(0).setDepth(depth).setInteractive();
        const leftArrow = this.add.text(leftX, leftY, '<', {
            fontSize: Math.floor(btnSize * 0.65) + 'px', fontFamily: 'monospace', fill: '#ffffff'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 1);

        leftBtn.on('pointerdown', () => { this.touchInput.left = true; });
        leftBtn.on('pointerup', () => { this.touchInput.left = false; });
        leftBtn.on('pointerout', () => { this.touchInput.left = false; });

        // Right button
        const rightX = leftX + btnSize * 2 + margin;
        const rightY = leftY;
        const rightBtn = this.add.circle(rightX, rightY, btnSize, 0xc8a898, btnAlpha);
        rightBtn.setScrollFactor(0).setDepth(depth).setInteractive();
        const rightArrow = this.add.text(rightX, rightY, '>', {
            fontSize: Math.floor(btnSize * 0.65) + 'px', fontFamily: 'monospace', fill: '#ffffff'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 1);

        rightBtn.on('pointerdown', () => { this.touchInput.right = true; });
        rightBtn.on('pointerup', () => { this.touchInput.right = false; });
        rightBtn.on('pointerout', () => { this.touchInput.right = false; });

        // Jump button (right side)
        const jumpX = width - margin - btnSize;
        const jumpY = leftY;
        const jumpBtn = this.add.circle(jumpX, jumpY, btnSize * 1.1, 0x6b2a2a, btnAlpha);
        jumpBtn.setScrollFactor(0).setDepth(depth).setInteractive();
        const jumpLabel = this.add.text(jumpX, jumpY, 'JUMP', {
            fontSize: Math.floor(btnSize * 0.28) + 'px', fontFamily: 'monospace', fill: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 1);

        jumpBtn.on('pointerdown', () => { this.touchInput.jump = true; });
        jumpBtn.on('pointerup', () => { this.touchInput.jump = false; });
        jumpBtn.on('pointerout', () => { this.touchInput.jump = false; });

        // Pause button (top-right)
        const pauseSize = Math.min(25, width * 0.035);
        const pauseBtn = this.add.circle(width - margin - pauseSize, margin + pauseSize, pauseSize, 0x3a1a1a, btnAlpha);
        pauseBtn.setScrollFactor(0).setDepth(depth).setInteractive({ useHandCursor: true });
        const pauseLabel = this.add.text(width - margin - pauseSize, margin + pauseSize, '||', {
            fontSize: Math.floor(pauseSize * 0.7) + 'px', fontFamily: 'monospace', fill: '#c8a898', fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 1);

        pauseBtn.on('pointerdown', () => {
            if (!this.levelCompleted) this.togglePause();
        });
    }

    handlePlayerEnemyCollision(playerSprite, enemySprite) {
        const enemy = enemySprite.enemyInstance;
        if (!enemy || !enemy.isAlive) return;

        // Check if player jumped on enemy
        if (playerSprite.body.velocity.y > 0 && playerSprite.y < enemySprite.y - 10) {
            // Check if enemy can be stomped
            if (enemy.isStompable()) {
                // Increment combo and get multiplier
                this.comboCount++;
                const multiplier = Math.min(this.comboCount, 8); // Max 8x multiplier

                // Reset combo timer
                if (this.comboTimer) {
                    this.comboTimer.remove();
                }
                this.comboTimer = this.time.delayedCall(this.comboTimeout, () => {
                    this.comboCount = 0;
                });

                // Kill enemy with multiplier
                enemy.die(true, multiplier);
                playerSprite.setVelocityY(-250); // Higher bounce for combo feedback

                // Screen shake on stomp (stronger for combos)
                const shakeIntensity = Math.min(0.005 + multiplier * 0.002, 0.02);
                this.cameras.main.shake(150, shakeIntensity);

                // Stomp particle burst
                this.spawnStompParticles(enemySprite.x, enemySprite.y);

                // Combo UI callout
                if (this.comboCount > 1) {
                    this.showComboUI(this.comboCount, enemySprite.x, enemySprite.y);
                }
            } else {
                // Can't stomp this enemy (spiny)! Take damage instead
                this.player.takeDamage();
                this.cameras.main.shake(200, 0.01);
            }
        } else {
            // Player hit enemy from side
            this.player.takeDamage();
            this.cameras.main.shake(200, 0.01);
        }
    }

    handleCrystalCollection(playerSprite, crystalSprite) {
        const crystal = crystalSprite.crystalInstance;
        if (crystal && !crystal.collected) {
            this.spawnCrystalSparkles(crystalSprite.x, crystalSprite.y);
            crystal.collect();
        }
    }

    handlePowerCrystalCollection(playerSprite, powerCrystalSprite) {
        const powerCrystal = powerCrystalSprite.powerCrystalInstance;
        if (powerCrystal && !powerCrystal.collected) {
            powerCrystal.collect();
        }
    }

    powerCrystalCollected() {
        // Power up the player (small -> big)
        this.player.powerUp();
        this.addScore(500);

        // Show power-up text
        const popup = this.add.text(
            this.player.getSprite().x,
            this.player.getSprite().y - 50,
            'POWER UP!',
            {
                fontSize: '20px',
                fontFamily: 'monospace',
                fill: '#ffff00',
                stroke: '#000000',
                strokeThickness: 4,
                fontStyle: 'bold'
            }
        );
        popup.setOrigin(0.5);

        this.tweens.add({
            targets: popup,
            y: popup.y - 60,
            alpha: 0,
            scale: 1.5,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => popup.destroy()
        });
    }

    handleFlagReached(playerSprite, flagSprite) {
        if (!this.levelCompleted) {
            this.levelCompleted = true;
            this.player.reachFlag();
        }
    }

    crystalCollected() {
        this.crystalsCollected++;
        this.addScore(100);
        this.crystalsText.setText(`Crystals: ${this.crystalsCollected}/${this.totalCrystals}`);
    }

    addScore(points) {
        this.score += points;
        this.scoreText.setText('Score: ' + this.score);
    }

    loseLife() {
        this.lives--;
        this.livesText.setText('Lives: ' + this.lives);

        // Screen shake on losing a life
        this.cameras.main.shake(300, 0.015);

        if (this.lives <= 0) {
            this.player.die();
            // Heavy shake on game over
            this.cameras.main.shake(500, 0.025);
        } else {
            // Respawn player
            this.player.getSprite().setPosition(100, this.cameras.main.height - 150);
            this.player.getSprite().setVelocity(0, 0);
            this.player.reset(); // Reset power-up state
            this.player.setInvincible(2000); // Brief invincibility after respawn
        }
    }

    levelComplete() {
        this.levelCompleted = true;

        // Celebratory screen shake
        this.cameras.main.shake(400, 0.01);

        // Stop game music and play victory sound
        soundManager.stopMusic();
        soundManager.playLevelComplete();

        // Calculate bonuses
        const baseScore = this.score;
        const crystalBonus = this.crystalsCollected * 50;
        const timeBonus = this.timeRemaining * 10;
        const livesBonus = this.lives * 200;
        const totalScore = baseScore + crystalBonus + timeBonus + livesBonus;

        // Apply bonuses
        this.score = totalScore;
        this.scoreText.setText('Score: ' + this.score);

        // Determine rank
        let rank, rankColor;
        if (totalScore >= 5000) { rank = 'S'; rankColor = '#ffdd44'; }
        else if (totalScore >= 3000) { rank = 'A'; rankColor = '#c8a898'; }
        else if (totalScore >= 1500) { rank = 'B'; rankColor = '#8b4a3a'; }
        else { rank = 'C'; rankColor = '#666666'; }

        // Check for new high score
        const previousBest = window.SeismicGame.getHighScore(this.currentLevel);
        const isNewBest = totalScore > previousBest;

        // Save high score and unlock next level
        window.SeismicGame.saveHighScore(this.currentLevel, totalScore);
        window.SeismicGame.unlockNextLevel(this.currentLevel);

        // --- Victory Stats Screen ---
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const uiDepth = 150;

        // Dim overlay
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.75);
        overlay.setScrollFactor(0).setDepth(uiDepth);

        // Panel background
        const panelW = 360;
        const panelH = 380;
        const panelX = width / 2;
        const panelY = height / 2 - 10;
        const panel = this.add.rectangle(panelX, panelY, panelW, panelH, 0x1a1a1a);
        panel.setStrokeStyle(3, 0x8b4a3a);
        panel.setScrollFactor(0).setDepth(uiDepth + 1);

        // Title
        const titleText = this.add.text(panelX, panelY - panelH / 2 + 30, `${this.levelConfig.name} COMPLETE!`, {
            fontSize: '26px', fontFamily: 'monospace', fill: '#c8a898', fontStyle: 'bold',
            stroke: '#6b2a2a', strokeThickness: 4
        });
        titleText.setOrigin(0.5).setScrollFactor(0).setDepth(uiDepth + 2);

        // Divider
        const divGfx = this.add.graphics();
        divGfx.lineStyle(1, 0x6b2a2a, 0.8);
        const divY1 = panelY - panelH / 2 + 52;
        divGfx.lineBetween(panelX - panelW / 2 + 20, divY1, panelX + panelW / 2 - 20, divY1);
        divGfx.setScrollFactor(0).setDepth(uiDepth + 2);

        // Stats rows — animated count-up
        const statStyle = { fontSize: '15px', fontFamily: 'monospace', fill: '#ffffff' };
        const labelStyle = { fontSize: '15px', fontFamily: 'monospace', fill: '#8b4a3a' };
        const rowStartY = panelY - panelH / 2 + 72;
        const rowSpacing = 28;
        const labelX = panelX - panelW / 2 + 30;
        const valueX = panelX + panelW / 2 - 30;

        const statsData = [
            { label: 'Base Score', value: baseScore },
            { label: 'Crystals (' + this.crystalsCollected + '/' + this.totalCrystals + ')', value: crystalBonus },
            { label: 'Time (' + this.formatTime(this.timeRemaining) + ')', value: timeBonus },
            { label: 'Lives (x' + this.lives + ')', value: livesBonus }
        ];

        statsData.forEach((row, i) => {
            const y = rowStartY + i * rowSpacing;
            const lbl = this.add.text(labelX, y, row.label, labelStyle);
            lbl.setOrigin(0, 0.5).setScrollFactor(0).setDepth(uiDepth + 2);
            lbl.setAlpha(0);

            const val = this.add.text(valueX, y, '0', statStyle);
            val.setOrigin(1, 0.5).setScrollFactor(0).setDepth(uiDepth + 2);
            val.setAlpha(0);

            // Staggered fade-in with count-up
            this.time.delayedCall(300 + i * 200, () => {
                lbl.setAlpha(1);
                val.setAlpha(1);
                const counter = { v: 0 };
                this.tweens.add({
                    targets: counter,
                    v: row.value,
                    duration: 600,
                    ease: 'Power2',
                    onUpdate: () => {
                        val.setText(Math.floor(counter.v).toLocaleString());
                    }
                });
                soundManager.playCollect();
            });
        });

        // Divider 2
        const div2Y = rowStartY + statsData.length * rowSpacing + 5;
        this.time.delayedCall(300 + statsData.length * 200, () => {
            const div2Gfx = this.add.graphics();
            div2Gfx.lineStyle(1, 0x6b2a2a, 0.8);
            div2Gfx.lineBetween(panelX - panelW / 2 + 20, div2Y, panelX + panelW / 2 - 20, div2Y);
            div2Gfx.setScrollFactor(0).setDepth(uiDepth + 2);
        });

        // Total score row
        const totalY = div2Y + 22;
        this.time.delayedCall(300 + statsData.length * 200 + 200, () => {
            const totalLabel = this.add.text(labelX, totalY, 'TOTAL', {
                fontSize: '18px', fontFamily: 'monospace', fill: '#c8a898', fontStyle: 'bold'
            });
            totalLabel.setOrigin(0, 0.5).setScrollFactor(0).setDepth(uiDepth + 2);

            const totalVal = this.add.text(valueX, totalY, '0', {
                fontSize: '18px', fontFamily: 'monospace', fill: '#ffdd44', fontStyle: 'bold'
            });
            totalVal.setOrigin(1, 0.5).setScrollFactor(0).setDepth(uiDepth + 2);

            const totalCounter = { v: 0 };
            this.tweens.add({
                targets: totalCounter,
                v: totalScore,
                duration: 800,
                ease: 'Power2',
                onUpdate: () => {
                    totalVal.setText(Math.floor(totalCounter.v).toLocaleString());
                }
            });
            soundManager.playLevelComplete();
        });

        // Rank display
        const rankY = totalY + 40;
        this.time.delayedCall(300 + statsData.length * 200 + 600, () => {
            const rankLabel = this.add.text(panelX, rankY, 'RANK: ' + rank, {
                fontSize: '32px', fontFamily: 'monospace', fill: rankColor, fontStyle: 'bold',
                stroke: '#000000', strokeThickness: 5
            });
            rankLabel.setOrigin(0.5).setScrollFactor(0).setDepth(uiDepth + 2);
            rankLabel.setScale(0.3);
            this.tweens.add({
                targets: rankLabel,
                scaleX: 1, scaleY: 1,
                duration: 400,
                ease: 'Back.easeOut'
            });

            // New best indicator
            if (isNewBest) {
                const bestLabel = this.add.text(panelX, rankY + 30, 'NEW BEST!', {
                    fontSize: '14px', fontFamily: 'monospace', fill: '#ffdd44', fontStyle: 'bold'
                });
                bestLabel.setOrigin(0.5).setScrollFactor(0).setDepth(uiDepth + 2);
                this.tweens.add({
                    targets: bestLabel,
                    alpha: 0.4,
                    duration: 400,
                    yoyo: true,
                    repeat: -1
                });
            }
        });

        // Buttons — appear after all stats animate in
        const buttonDelay = 300 + statsData.length * 200 + 1000;
        const btnY = panelY + panelH / 2 - 30;
        const hasNextLevel = this.currentLevel < 9;

        this.time.delayedCall(buttonDelay, () => {
            if (hasNextLevel) {
                this.createVictoryButton(panelX - 80, btnY, 'NEXT >', 0x6b2a2a, 0x8b4a3a, uiDepth, () => {
                    this.cameras.main.fade(300);
                    this.time.delayedCall(300, () => {
                        this.scene.start('GameScene', { level: this.currentLevel + 1 });
                    });
                });

                this.createVictoryButton(panelX + 80, btnY, 'LEVELS', 0x3a1a1a, 0x6b2a2a, uiDepth, () => {
                    this.cameras.main.fade(300);
                    this.time.delayedCall(300, () => {
                        this.scene.start('LevelSelectScene');
                    });
                });
            } else {
                const congratsLabel = this.add.text(panelX, btnY - 20, 'ALL LEVELS COMPLETE!', {
                    fontSize: '14px', fontFamily: 'monospace', fill: '#c8a898', fontStyle: 'bold'
                });
                congratsLabel.setOrigin(0.5).setScrollFactor(0).setDepth(uiDepth + 2);

                this.createVictoryButton(panelX, btnY + 10, 'LEVEL SELECT', 0x6b2a2a, 0x8b4a3a, uiDepth, () => {
                    this.cameras.main.fade(300);
                    this.time.delayedCall(300, () => {
                        this.scene.start('LevelSelectScene');
                    });
                });
            }
        });
    }

    createVictoryButton(x, y, label, bgColor, borderColor, baseDepth, callback) {
        const bg = this.add.rectangle(x, y, 140, 36, bgColor);
        bg.setStrokeStyle(2, borderColor);
        bg.setScrollFactor(0).setDepth(baseDepth + 2);
        bg.setInteractive({ useHandCursor: true });

        const text = this.add.text(x, y, label, {
            fontSize: '14px', fontFamily: 'monospace', fill: '#c8a898', fontStyle: 'bold'
        });
        text.setOrigin(0.5).setScrollFactor(0).setDepth(baseDepth + 3);

        bg.on('pointerover', () => {
            bg.setFillStyle(borderColor);
            text.setStyle({ fill: '#ffffff' });
            soundManager.playMenuHover();
        });
        bg.on('pointerout', () => {
            bg.setFillStyle(bgColor);
            text.setStyle({ fill: '#c8a898' });
        });
        bg.on('pointerdown', () => {
            soundManager.playMenuSelect();
            callback();
        });
    }

    gameOver() {
        // Stop game music and play game over sound
        soundManager.stopMusic();
        soundManager.playGameOver();

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const gameOverText = this.add.text(
            width / 2,
            height / 2,
            'GAME OVER\n\nClick to retry',
            {
                fontSize: '48px',
                fontFamily: 'monospace',
                fill: '#8b4a3a',
                align: 'center',
                stroke: '#0a1a1a',
                strokeThickness: 8
            }
        );
        gameOverText.setOrigin(0.5);
        gameOverText.setScrollFactor(0);

        this.input.once('pointerdown', () => {
            soundManager.playMenuSelect();
            this.cameras.main.fade(500);
            this.time.delayedCall(500, () => {
                this.scene.restart();
            });
        });
    }

    formatTime(seconds) {
        const mins = Math.floor(Math.max(0, seconds) / 60);
        const secs = Math.max(0, seconds) % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // --- Combo UI ---

    showComboUI(combo, x, y) {
        const comboLabels = ['', '', 'DOUBLE!', 'TRIPLE!', 'QUAD!', 'PENTA!', 'HEXA!', 'MEGA!', 'ULTRA!'];
        const label = comboLabels[Math.min(combo, 8)] || `${combo}x COMBO!`;
        const fontSize = Math.min(16 + combo * 4, 40);
        const colors = ['', '', '#ffff00', '#ffaa00', '#ff6600', '#ff3300', '#ff00ff', '#00ffff', '#ffffff'];
        const color = colors[Math.min(combo, 8)] || '#ffffff';

        const comboText = this.add.text(x, y - 40, label, {
            fontSize: `${fontSize}px`,
            fontFamily: 'monospace',
            fill: color,
            stroke: '#000000',
            strokeThickness: 5,
            fontStyle: 'bold'
        });
        comboText.setOrigin(0.5);

        // Punch-in scale effect + float up
        comboText.setScale(0.2);
        this.tweens.add({
            targets: comboText,
            scaleX: 1,
            scaleY: 1,
            y: y - 100,
            alpha: 0,
            duration: 1000,
            ease: 'Back.easeOut',
            onComplete: () => comboText.destroy()
        });

        // Combo multiplier number beneath
        const multText = this.add.text(x, y - 20, `${combo}x`, {
            fontSize: '14px',
            fontFamily: 'monospace',
            fill: '#c8a898',
            stroke: '#000000',
            strokeThickness: 3
        });
        multText.setOrigin(0.5);
        this.tweens.add({
            targets: multText,
            y: y - 70,
            alpha: 0,
            duration: 800,
            ease: 'Power2',
            onComplete: () => multText.destroy()
        });
    }

    // --- Particle Effects ---

    spawnCrystalSparkles(x, y) {
        const colors = [0xc8a898, 0x8b4a3a, 0xffdd00, 0xffffff];
        for (let i = 0; i < 8; i++) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            const sparkle = this.add.circle(x, y, Phaser.Math.Between(2, 4), color, 1);
            this.tweens.add({
                targets: sparkle,
                x: x + Phaser.Math.Between(-40, 40),
                y: y + Phaser.Math.Between(-50, -10),
                alpha: 0,
                scale: 0,
                duration: Phaser.Math.Between(300, 600),
                ease: 'Power2',
                onComplete: () => sparkle.destroy()
            });
        }
    }

    spawnStompParticles(x, y) {
        const colors = [0x6b2a2a, 0x8b4a3a, 0xc8a898];
        for (let i = 0; i < 10; i++) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            const particle = this.add.circle(x, y, Phaser.Math.Between(2, 5), color, 1);
            this.tweens.add({
                targets: particle,
                x: x + Phaser.Math.Between(-50, 50),
                y: y + Phaser.Math.Between(-60, 10),
                alpha: 0,
                scale: 0.3,
                duration: Phaser.Math.Between(300, 500),
                ease: 'Power2',
                onComplete: () => particle.destroy()
            });
        }
    }

    spawnLandingDust(x, y) {
        for (let i = 0; i < 5; i++) {
            const dust = this.add.circle(
                x + Phaser.Math.Between(-8, 8),
                y,
                Phaser.Math.Between(2, 4),
                0xc8a898, 0.6
            );
            this.tweens.add({
                targets: dust,
                x: dust.x + Phaser.Math.Between(-20, 20),
                y: y - Phaser.Math.Between(5, 15),
                alpha: 0,
                scale: 0,
                duration: Phaser.Math.Between(200, 400),
                ease: 'Power1',
                onComplete: () => dust.destroy()
            });
        }
    }

    // --- Pause Menu ---

    togglePause() {
        if (this.isPaused) {
            this.resumeGame();
        } else {
            this.pauseGame();
        }
    }

    pauseGame() {
        this.isPaused = true;
        this.physics.pause();
        soundManager.playPauseOpen();

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Dim overlay
        this.pauseOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
        this.pauseOverlay.setScrollFactor(0);
        this.pauseOverlay.setDepth(100);

        // Pause title
        this.pauseTitle = this.add.text(width / 2, height / 2 - 60, 'PAUSED', {
            fontSize: '48px', fontFamily: 'monospace', fill: '#c8a898',
            stroke: '#6b2a2a', strokeThickness: 6, fontStyle: 'bold'
        });
        this.pauseTitle.setOrigin(0.5);
        this.pauseTitle.setScrollFactor(0);
        this.pauseTitle.setDepth(101);

        // Resume button
        this.resumeBg = this.add.rectangle(width / 2, height / 2 + 10, 180, 40, 0x6b2a2a);
        this.resumeBg.setStrokeStyle(2, 0x8b4a3a);
        this.resumeBg.setScrollFactor(0);
        this.resumeBg.setDepth(101);
        this.resumeBg.setInteractive({ useHandCursor: true });

        this.resumeText = this.add.text(width / 2, height / 2 + 10, 'RESUME', {
            fontSize: '18px', fontFamily: 'monospace', fill: '#c8a898', fontStyle: 'bold'
        });
        this.resumeText.setOrigin(0.5);
        this.resumeText.setScrollFactor(0);
        this.resumeText.setDepth(101);

        this.resumeBg.on('pointerover', () => {
            this.resumeBg.setFillStyle(0x8b4a3a);
            this.resumeText.setStyle({ fill: '#ffffff' });
        });
        this.resumeBg.on('pointerout', () => {
            this.resumeBg.setFillStyle(0x6b2a2a);
            this.resumeText.setStyle({ fill: '#c8a898' });
        });
        this.resumeBg.on('pointerdown', () => {
            soundManager.playMenuSelect();
            this.resumeGame();
        });

        // Quit button
        this.quitBg = this.add.rectangle(width / 2, height / 2 + 60, 180, 40, 0x3a1a1a);
        this.quitBg.setStrokeStyle(2, 0x6b2a2a);
        this.quitBg.setScrollFactor(0);
        this.quitBg.setDepth(101);
        this.quitBg.setInteractive({ useHandCursor: true });

        this.quitText = this.add.text(width / 2, height / 2 + 60, 'QUIT TO MENU', {
            fontSize: '16px', fontFamily: 'monospace', fill: '#8b4a3a'
        });
        this.quitText.setOrigin(0.5);
        this.quitText.setScrollFactor(0);
        this.quitText.setDepth(101);

        this.quitBg.on('pointerover', () => {
            this.quitBg.setFillStyle(0x6b2a2a);
            this.quitText.setStyle({ fill: '#c8a898' });
        });
        this.quitBg.on('pointerout', () => {
            this.quitBg.setFillStyle(0x3a1a1a);
            this.quitText.setStyle({ fill: '#8b4a3a' });
        });
        this.quitBg.on('pointerdown', () => {
            soundManager.playMenuSelect();
            this.cameras.main.fade(300);
            this.time.delayedCall(300, () => {
                this.scene.start('LevelSelectScene');
            });
        });

        // ESC hint
        this.pauseHint = this.add.text(width / 2, height / 2 + 110, 'Press ESC to resume', {
            fontSize: '12px', fontFamily: 'monospace', fill: '#4a6a6a'
        });
        this.pauseHint.setOrigin(0.5);
        this.pauseHint.setScrollFactor(0);
        this.pauseHint.setDepth(101);
    }

    resumeGame() {
        this.isPaused = false;
        this.physics.resume();
        soundManager.playPauseClose();

        // Destroy pause UI elements
        if (this.pauseOverlay) this.pauseOverlay.destroy();
        if (this.pauseTitle) this.pauseTitle.destroy();
        if (this.resumeBg) this.resumeBg.destroy();
        if (this.resumeText) this.resumeText.destroy();
        if (this.quitBg) this.quitBg.destroy();
        if (this.quitText) this.quitText.destroy();
        if (this.pauseHint) this.pauseHint.destroy();
    }
}
