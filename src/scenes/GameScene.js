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
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background
        this.add.rectangle(0, 0, width * 3, height, 0x1a0033).setOrigin(0);

        // Add parallax background stars
        this.createBackground();

        // Create world bounds (3x screen width for scrolling)
        this.physics.world.setBounds(0, 0, width * 3, height);

        // Create platforms
        this.platforms = this.physics.add.staticGroup();
        this.movingPlatforms = [];
        this.createPlatforms();

        // Create player
        this.player = new Player(this, 100, height - 150);

        // Create enemies
        this.enemies = [];
        this.createEnemies();

        // Create crystals
        this.crystals = [];
        this.createCrystals();

        // Create flag at the end
        this.flag = this.physics.add.sprite(width * 3 - 100, height - 150, 'flag');
        this.flag.setImmovable(true);

        // Setup collisions
        this.physics.add.collider(this.player.getSprite(), this.platforms);
        this.physics.add.collider(this.enemies.map(e => e.getSprite()), this.platforms);

        // Player vs enemies
        this.physics.add.overlap(
            this.player.getSprite(),
            this.enemies.map(e => e.getSprite()),
            this.handlePlayerEnemyCollision,
            null,
            this
        );

        // Player vs crystals
        this.physics.add.overlap(
            this.player.getSprite(),
            this.crystals.map(c => c.getSprite()),
            this.handleCrystalCollection,
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

        // Fade in
        this.cameras.main.fadeIn(500);
        this.gameStarted = true;
    }

    update() {
        if (!this.gameStarted || this.levelCompleted) return;

        // Update player
        this.player.update();

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
        if (this.player.getSprite().y > this.cameras.main.height + 100) {
            this.loseLife();
        }
    }

    createBackground() {
        // Create animated background stars
        for (let i = 0; i < 100; i++) {
            const x = Phaser.Math.Between(0, this.cameras.main.width * 3);
            const y = Phaser.Math.Between(0, this.cameras.main.height);
            const size = Phaser.Math.Between(1, 2);
            const star = this.add.circle(x, y, size, 0xff00ff, 0.3);
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
        const platform = this.platforms.create(startX, y, 'platform');
        platform.setImmovable(true);
        platform.body.setAllowGravity(false);

        // Make it kinematic so it can move
        this.platforms.remove(platform);
        const movingPlatform = this.physics.add.sprite(startX, y, 'platform');
        movingPlatform.setImmovable(true);
        movingPlatform.body.setAllowGravity(false);

        movingPlatform.minX = startX - range / 2;
        movingPlatform.maxX = startX + range / 2;
        movingPlatform.velocityX = 1;

        this.movingPlatforms.push(movingPlatform);
        this.physics.add.collider(this.player.getSprite(), movingPlatform);
        this.physics.add.collider(this.enemies.map(e => e.getSprite()), movingPlatform);
    }

    createEnemies() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const count = this.levelConfig.enemyCount;
        const speed = this.levelConfig.enemySpeed;

        // Distribute enemies throughout the level
        for (let i = 0; i < count; i++) {
            const x = 400 + (i * (width * 2.2) / count);
            const type = Math.random() > 0.5 ? 'goomba' : 'koopa';
            const enemy = new Enemy(this, x, height - 100, type, speed);
            this.enemies.push(enemy);
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
            const crystal = new Crystal(this, x, y);
            this.crystals.push(crystal);
        }
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

        // Level name
        const levelStyle = {
            fontSize: '24px',
            fontFamily: 'monospace',
            fill: '#ff00ff',
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

    handlePlayerEnemyCollision(playerSprite, enemySprite) {
        const enemy = enemySprite.enemyInstance;
        if (!enemy || !enemy.isAlive) return;

        // Check if player jumped on enemy
        if (playerSprite.body.velocity.y > 0 && playerSprite.y < enemySprite.y - 10) {
            // Player jumped on enemy
            enemy.die(true);
            playerSprite.setVelocityY(-200); // Bounce
        } else {
            // Player hit enemy from side
            this.player.takeDamage();
        }
    }

    handleCrystalCollection(playerSprite, crystalSprite) {
        const crystal = crystalSprite.crystalInstance;
        if (crystal && !crystal.collected) {
            crystal.collect();
        }
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

        if (this.lives <= 0) {
            this.player.die();
        } else {
            // Respawn player
            this.player.getSprite().setPosition(100, this.cameras.main.height - 150);
            this.player.getSprite().setVelocity(0, 0);
        }
    }

    levelComplete() {
        this.levelCompleted = true;

        // Calculate completion bonus
        const crystalBonus = this.crystalsCollected * 50;
        const timeBonus = 1000;
        this.addScore(crystalBonus + timeBonus);

        // Show completion message
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const completeText = this.add.text(
            width / 2,
            height / 2 - 50,
            `${this.levelConfig.name} COMPLETE!\n\nFinal Score: ${this.score}\nCrystals: ${this.crystalsCollected}/${this.totalCrystals}`,
            {
                fontSize: '32px',
                fontFamily: 'monospace',
                fill: '#ff00ff',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 6
            }
        );
        completeText.setOrigin(0.5);
        completeText.setScrollFactor(0);

        const continueText = this.add.text(
            width / 2,
            height / 2 + 80,
            'Click to continue',
            {
                fontSize: '20px',
                fontFamily: 'monospace',
                fill: '#ffffff'
            }
        );
        continueText.setOrigin(0.5);
        continueText.setScrollFactor(0);

        this.tweens.add({
            targets: continueText,
            alpha: 0.3,
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        this.input.once('pointerdown', () => {
            this.cameras.main.fade(500);
            this.time.delayedCall(500, () => {
                this.scene.start('LevelSelectScene');
            });
        });
    }

    gameOver() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const gameOverText = this.add.text(
            width / 2,
            height / 2,
            'GAME OVER\n\nClick to retry',
            {
                fontSize: '48px',
                fontFamily: 'monospace',
                fill: '#ff0000',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 8
            }
        );
        gameOverText.setOrigin(0.5);
        gameOverText.setScrollFactor(0);

        this.input.once('pointerdown', () => {
            this.cameras.main.fade(500);
            this.time.delayedCall(500, () => {
                this.scene.restart();
            });
        });
    }
}
