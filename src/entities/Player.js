// Player class with Mario-style physics
class Player {
    constructor(scene, x, y) {
        this.scene = scene;

        // Create sprite
        this.sprite = scene.physics.add.sprite(x, y, 'player');
        this.sprite.setCollideWorldBounds(true);
        this.sprite.setBounce(0);
        this.sprite.setGravityY(GameConfig.gravity);

        // Player state
        this.isAlive = true;
        this.isJumping = false;
        this.canDoubleJump = false;
        this.hasDoubleJumped = false;

        // Double jump available on Mag3+ levels
        this.doubleJumpEnabled = (scene.currentLevel || 1) >= 3;

        // Power-up state: 'small' or 'big'
        this.powerState = 'small';
        this.isInvincible = false;
        this.invincibilityTimer = null;

        // Animation state
        this.walkFrame = 0;
        this.walkTimer = 0;
        this.walkInterval = 150; // ms between walk frames
        this.currentTexture = 'player';

        // Setup controls
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    update() {
        if (!this.isAlive) return;

        const onGround = this.sprite.body.touching.down;

        // Reset jump state when on ground
        if (onGround) {
            this.isJumping = false;
            this.canDoubleJump = true;
            this.hasDoubleJumped = false;
        }

        // Touch input from scene (mobile controls)
        const touch = this.scene.touchInput || {};

        // Horizontal movement
        if (this.cursors.left.isDown || touch.left) {
            this.sprite.setVelocityX(-GameConfig.playerSpeed);
            this.sprite.setFlipX(true);
        } else if (this.cursors.right.isDown || touch.right) {
            this.sprite.setVelocityX(GameConfig.playerSpeed);
            this.sprite.setFlipX(false);
        } else {
            // Apply friction when not moving
            this.sprite.setVelocityX(this.sprite.body.velocity.x * 0.85);
        }

        // Jumping (with coyote time for better feel)
        const touchJumpPressed = touch.jump && !this._lastTouchJump;
        this._lastTouchJump = !!touch.jump;

        if (Phaser.Input.Keyboard.JustDown(this.spaceKey) ||
            Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
            touchJumpPressed) {
            if (onGround && !this.isJumping) {
                this.jump();
            } else if (!onGround && this.doubleJumpEnabled && this.canDoubleJump && !this.hasDoubleJumped) {
                this.doubleJump();
            }
        }

        // Variable jump height (release early = shorter jump)
        if (this.sprite.body.velocity.y < 0 && !this.spaceKey.isDown && !this.cursors.up.isDown) {
            this.sprite.setVelocityY(this.sprite.body.velocity.y * 0.5);
        }

        // Animation frame switching
        this.updateAnimation(onGround);
    }

    updateAnimation(onGround) {
        let targetTexture;

        if (!onGround) {
            // Airborne — jump frame
            targetTexture = 'player_jump';
            this.walkTimer = 0;
        } else if (Math.abs(this.sprite.body.velocity.x) > 10) {
            // Moving on ground — alternate walk frames
            this.walkTimer += this.scene.game.loop.delta;
            if (this.walkTimer >= this.walkInterval) {
                this.walkTimer = 0;
                this.walkFrame = (this.walkFrame + 1) % 2;
            }
            targetTexture = this.walkFrame === 0 ? 'player_walk1' : 'player_walk2';
        } else {
            // Idle on ground
            targetTexture = 'player';
            this.walkTimer = 0;
            this.walkFrame = 0;
        }

        if (targetTexture !== this.currentTexture) {
            this.sprite.setTexture(targetTexture);
            this.currentTexture = targetTexture;
        }
    }

    jump() {
        this.sprite.setVelocityY(GameConfig.playerJump);
        this.isJumping = true;
        soundManager.playJump();
    }

    doubleJump() {
        this.sprite.setVelocityY(GameConfig.playerJump * 0.85);
        this.hasDoubleJumped = true;
        this.canDoubleJump = false;
        soundManager.playDoubleJump();

        // Air puff particles
        if (this.scene.spawnLandingDust) {
            this.scene.spawnLandingDust(this.sprite.x, this.sprite.y + 14);
        }

        // Quick spin effect
        this.scene.tweens.add({
            targets: this.sprite,
            angle: 360,
            duration: 300,
            ease: 'Linear',
            onComplete: () => { this.sprite.angle = 0; }
        });
    }

    // Power up - grow from small to big
    powerUp() {
        if (this.powerState === 'small') {
            this.powerState = 'big';

            // Play power-up sound
            soundManager.playPowerUp();

            // Visual growth animation
            this.scene.tweens.add({
                targets: this.sprite,
                scaleY: 1.5,
                scaleX: 1.2,
                duration: 300,
                ease: 'Back.easeOut'
            });

            // Update hitbox for bigger player
            this.sprite.setSize(28, 44);

            // Flash effect during power-up
            this.scene.tweens.add({
                targets: this.sprite,
                alpha: 0.5,
                duration: 50,
                yoyo: true,
                repeat: 5
            });

            // Brief invincibility after powering up
            this.setInvincible(1000);
        }
    }

    // Shrink from big to small (when hit while big)
    shrink() {
        if (this.powerState === 'big') {
            this.powerState = 'small';

            soundManager.playHurt();

            // Visual shrink animation
            this.scene.tweens.add({
                targets: this.sprite,
                scaleY: 1,
                scaleX: 1,
                duration: 200,
                ease: 'Back.easeIn'
            });

            // Reset hitbox
            this.sprite.setSize(24, 32);

            // Brief invincibility after shrinking
            this.setInvincible(2000);

            return true; // Damage absorbed
        }
        return false; // No protection
    }

    setInvincible(duration) {
        this.isInvincible = true;

        // Flash effect during invincibility
        this.scene.tweens.add({
            targets: this.sprite,
            alpha: 0.3,
            duration: 100,
            yoyo: true,
            repeat: Math.floor(duration / 200),
            onComplete: () => {
                this.sprite.setAlpha(1);
            }
        });

        // Clear existing timer
        if (this.invincibilityTimer) {
            this.invincibilityTimer.remove();
        }

        this.invincibilityTimer = this.scene.time.delayedCall(duration, () => {
            this.isInvincible = false;
        });
    }

    collectCrystal() {
        soundManager.playCollect();
        this.scene.addScore(100);
    }

    // Collect power-up crystal (special crystal that makes player grow)
    collectPowerCrystal() {
        this.powerUp();
        this.scene.addScore(500);
    }

    takeDamage() {
        if (!this.isAlive || this.isInvincible) return;

        // If big, shrink instead of losing life
        if (this.shrink()) {
            // Knockback
            this.sprite.setVelocityY(-200);
            return;
        }

        // Small player loses a life
        soundManager.playHurt();
        this.scene.loseLife();

        // Flash effect
        this.scene.tweens.add({
            targets: this.sprite,
            alpha: 0.3,
            duration: 100,
            yoyo: true,
            repeat: 5,
            onComplete: () => {
                this.sprite.setAlpha(1);
            }
        });

        // Knockback
        this.sprite.setVelocityY(-200);
    }

    die() {
        this.isAlive = false;
        this.sprite.body.setAllowGravity(false);
        this.sprite.setVelocity(0, 0);
        this.sprite.setTint(0xff4444);

        // Pause briefly, then spin and fall off screen
        this.scene.time.delayedCall(300, () => {
            this.sprite.body.setAllowGravity(true);
            this.sprite.setVelocityY(-350);
            this.sprite.setAngularVelocity(600);

            // Wait for player to fall off screen
            this.scene.time.delayedCall(1500, () => {
                this.sprite.setAlpha(0);
                this.scene.gameOver();
            });
        });
    }

    reachFlag() {
        this.isAlive = false;
        this.sprite.setVelocityX(0);

        // Victory animation
        this.scene.tweens.add({
            targets: this.sprite,
            y: this.sprite.y - 50,
            duration: 500,
            yoyo: true,
            onComplete: () => {
                this.scene.levelComplete();
            }
        });
    }

    // Reset player state (for respawning)
    reset() {
        this.powerState = 'small';
        this.sprite.setScale(1, 1);
        this.sprite.setSize(24, 32);
        this.hasDoubleJumped = false;
        this.canDoubleJump = false;
        this.isInvincible = false;
        this.sprite.setAlpha(1);
        this.sprite.clearTint();
    }

    isBig() {
        return this.powerState === 'big';
    }

    getSprite() {
        return this.sprite;
    }

    destroy() {
        if (this.invincibilityTimer) {
            this.invincibilityTimer.remove();
        }
        this.sprite.destroy();
    }
}
