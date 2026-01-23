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
        }

        // Horizontal movement
        if (this.cursors.left.isDown) {
            this.sprite.setVelocityX(-GameConfig.playerSpeed);
            this.sprite.setFlipX(true);
        } else if (this.cursors.right.isDown) {
            this.sprite.setVelocityX(GameConfig.playerSpeed);
            this.sprite.setFlipX(false);
        } else {
            // Apply friction when not moving
            this.sprite.setVelocityX(this.sprite.body.velocity.x * 0.85);
        }

        // Jumping (with coyote time for better feel)
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey) ||
            Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
            if (onGround && !this.isJumping) {
                this.jump();
            }
        }

        // Variable jump height (release early = shorter jump)
        if (this.sprite.body.velocity.y < 0 && !this.spaceKey.isDown && !this.cursors.up.isDown) {
            this.sprite.setVelocityY(this.sprite.body.velocity.y * 0.5);
        }
    }

    jump() {
        this.sprite.setVelocityY(GameConfig.playerJump);
        this.isJumping = true;
        this.scene.sound.play('jump', { volume: 0.3 });
    }

    collectCrystal() {
        this.scene.sound.play('collect', { volume: 0.3 });
        this.scene.addScore(100);
    }

    takeDamage() {
        if (!this.isAlive) return;

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
        this.sprite.setVelocity(0, -300);
        this.sprite.setTint(0xff0000);

        this.scene.tweens.add({
            targets: this.sprite,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                this.scene.gameOver();
            }
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

    getSprite() {
        return this.sprite;
    }

    destroy() {
        this.sprite.destroy();
    }
}
