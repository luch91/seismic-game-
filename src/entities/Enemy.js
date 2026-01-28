// Enemy class with multiple types and behaviors
class Enemy {
    constructor(scene, x, y, type = 'goomba', speed = 50) {
        this.scene = scene;
        this.type = type;
        this.speed = speed;
        this.isAlive = true;
        this.canBeStomped = true; // Most enemies can be stomped

        // Enemy stats based on type
        this.setupEnemyType();

        // Check if texture exists, fallback to goomba if not
        if (!scene.textures.exists(this.texture)) {
            console.warn(`Texture ${this.texture} not found, using enemy_goomba`);
            this.texture = 'enemy_goomba';
        }

        // Create sprite based on type
        this.sprite = scene.physics.add.sprite(x, y, this.texture);
        this.sprite.setCollideWorldBounds(true);
        this.sprite.setBounce(this.bounce);
        this.sprite.setGravityY(this.gravity);

        // Movement direction
        this.direction = Math.random() > 0.5 ? 1 : -1;
        this.sprite.setVelocityX(this.speed * this.direction);

        // For flying enemies
        this.startY = y;
        this.flyAmplitude = 50;
        this.flySpeed = 0.003;
        this.flyTimer = Math.random() * Math.PI * 2;

        // For hammer bro
        this.attackTimer = 0;
        this.attackCooldown = 2000; // 2 seconds between attacks
        this.lastAttackTime = 0;

        // Reference to this enemy instance
        this.sprite.enemyInstance = this;
    }

    setupEnemyType() {
        switch (this.type) {
            case 'goomba':
                this.texture = 'enemy_goomba';
                this.points = 100;
                this.bounce = 0;
                this.gravity = GameConfig.gravity;
                this.canBeStomped = true;
                break;

            case 'koopa':
                this.texture = 'enemy_koopa';
                this.points = 200;
                this.bounce = 0;
                this.gravity = GameConfig.gravity;
                this.canBeStomped = true;
                break;

            case 'spiny':
                this.texture = 'enemy_spiny';
                this.points = 300;
                this.bounce = 0;
                this.gravity = GameConfig.gravity;
                this.canBeStomped = false; // Can't stomp spiny!
                break;

            case 'flying_koopa':
                this.texture = 'enemy_flying_koopa';
                this.points = 400;
                this.bounce = 0;
                this.gravity = 0; // Floats
                this.canBeStomped = true;
                break;

            case 'hammer_bro':
                this.texture = 'enemy_hammer_bro';
                this.points = 800;
                this.bounce = 0;
                this.gravity = GameConfig.gravity;
                this.canBeStomped = true;
                this.speed = this.speed * 0.5; // Slower but throws hammers
                break;

            default:
                this.texture = 'enemy_goomba';
                this.points = 100;
                this.bounce = 0;
                this.gravity = GameConfig.gravity;
                this.canBeStomped = true;
        }
    }

    update() {
        if (!this.isAlive) return;

        // Type-specific behavior
        switch (this.type) {
            case 'flying_koopa':
                this.updateFlyingKoopa();
                break;
            case 'hammer_bro':
                this.updateHammerBro();
                break;
            default:
                this.updateGroundEnemy();
        }
    }

    updateGroundEnemy() {
        // Reverse direction at edges or when hitting walls
        if (this.sprite.body.touching.left || this.sprite.body.blocked.left) {
            this.direction = 1;
            this.sprite.setVelocityX(this.speed * this.direction);
            this.sprite.setFlipX(false);
        } else if (this.sprite.body.touching.right || this.sprite.body.blocked.right) {
            this.direction = -1;
            this.sprite.setVelocityX(this.speed * this.direction);
            this.sprite.setFlipX(true);
        }

        // Prevent enemy from getting stuck
        if (Math.abs(this.sprite.body.velocity.x) < 10) {
            this.direction *= -1;
            this.sprite.setVelocityX(this.speed * this.direction);
        }
    }

    updateFlyingKoopa() {
        // Sinusoidal flying pattern
        this.flyTimer += this.flySpeed * 16; // Approximate delta time
        const newY = this.startY + Math.sin(this.flyTimer) * this.flyAmplitude;
        this.sprite.y = newY;

        // Horizontal movement
        this.sprite.setVelocityX(this.speed * this.direction);

        // Reverse at screen edges
        if (this.sprite.x < 50) {
            this.direction = 1;
            this.sprite.setFlipX(false);
        } else if (this.sprite.x > this.scene.cameras.main.width * 3 - 50) {
            this.direction = -1;
            this.sprite.setFlipX(true);
        }
    }

    updateHammerBro() {
        // Ground movement (slower, more deliberate)
        this.updateGroundEnemy();

        // Attack pattern - throw hammers at player
        const currentTime = this.scene.time.now;
        if (currentTime - this.lastAttackTime > this.attackCooldown) {
            this.throwHammer();
            this.lastAttackTime = currentTime;
        }
    }

    throwHammer() {
        if (!this.scene.player) return;
        if (!this.scene.textures.exists('hammer')) return;

        const playerX = this.scene.player.getSprite().x;
        const directionToPlayer = playerX > this.sprite.x ? 1 : -1;

        // Create hammer projectile
        const hammer = this.scene.physics.add.sprite(
            this.sprite.x + directionToPlayer * 10,
            this.sprite.y - 20,
            'hammer'
        );
        hammer.setGravityY(300);
        hammer.setVelocity(directionToPlayer * 150, -250);
        hammer.setAngularVelocity(360 * directionToPlayer);

        // Hammer damages player on contact
        this.scene.physics.add.overlap(
            this.scene.player.getSprite(),
            hammer,
            () => {
                if (this.scene.player.isAlive) {
                    this.scene.player.takeDamage();
                }
                hammer.destroy();
            }
        );

        // Destroy hammer after 3 seconds
        this.scene.time.delayedCall(3000, () => {
            if (hammer.active) hammer.destroy();
        });
    }

    die(fromAbove = false, multiplier = 1) {
        if (!this.isAlive) return;

        this.isAlive = false;
        this.sprite.setVelocity(0, 0);
        this.sprite.body.setAllowGravity(false);

        if (fromAbove) {
            // Squash animation — quick pop then flatten
            this.sprite.setTint(0xffffff);
            this.scene.tweens.add({
                targets: this.sprite,
                scaleX: 1.4,
                scaleY: 1.3,
                duration: 60,
                ease: 'Quad.easeOut',
                onComplete: () => {
                    // Flatten into the ground
                    this.scene.tweens.add({
                        targets: this.sprite,
                        scaleX: 1.6,
                        scaleY: 0.15,
                        alpha: 0,
                        y: this.sprite.y + 12,
                        duration: 250,
                        ease: 'Power2',
                        onComplete: () => {
                            this.sprite.destroy();
                        }
                    });
                }
            });

            // Calculate score with multiplier
            const score = this.points * multiplier;
            soundManager.playEnemyDefeat(multiplier);
            this.scene.addScore(score);

            // Show score popup
            this.showScorePopup(score, multiplier);
        } else {
            // Hit from side - spin away and tumble off screen
            this.sprite.setVelocity(this.direction * -150, -250);
            this.sprite.body.setAllowGravity(true);
            this.sprite.setAngularVelocity(720);
            this.sprite.setTint(0xff6666);

            this.scene.tweens.add({
                targets: this.sprite,
                alpha: 0,
                duration: 700,
                onComplete: () => {
                    this.sprite.destroy();
                }
            });
        }
    }

    showScorePopup(score, multiplier) {
        const color = multiplier > 1 ? '#ffff00' : '#ffffff';
        const text = multiplier > 1 ? `${score} x${multiplier}!` : `${score}`;

        const popup = this.scene.add.text(
            this.sprite.x,
            this.sprite.y - 20,
            text,
            {
                fontSize: multiplier > 1 ? '18px' : '14px',
                fontFamily: 'monospace',
                fill: color,
                stroke: '#000000',
                strokeThickness: 3
            }
        );
        popup.setOrigin(0.5);

        this.scene.tweens.add({
            targets: popup,
            y: popup.y - 50,
            alpha: 0,
            duration: 800,
            ease: 'Power2',
            onComplete: () => popup.destroy()
        });
    }

    // Check if player can stomp this enemy
    isStompable() {
        return this.canBeStomped;
    }

    getPoints() {
        return this.points;
    }

    getSprite() {
        return this.sprite;
    }
}
