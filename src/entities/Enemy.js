// Enemy class (Goomba and Koopa style)
class Enemy {
    constructor(scene, x, y, type = 'goomba', speed = 50) {
        this.scene = scene;
        this.type = type;
        this.speed = speed;
        this.isAlive = true;

        // Create sprite based on type
        const texture = type === 'koopa' ? 'enemy_koopa' : 'enemy_goomba';
        this.sprite = scene.physics.add.sprite(x, y, texture);
        this.sprite.setCollideWorldBounds(true);
        this.sprite.setBounce(0);
        this.sprite.setGravityY(GameConfig.gravity);

        // Movement direction
        this.direction = Math.random() > 0.5 ? 1 : -1;
        this.sprite.setVelocityX(this.speed * this.direction);

        // Reference to this enemy instance
        this.sprite.enemyInstance = this;
    }

    update() {
        if (!this.isAlive) return;

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

    die(fromAbove = false) {
        if (!this.isAlive) return;

        this.isAlive = false;
        this.sprite.setVelocity(0, 0);

        if (fromAbove) {
            // Squash animation
            this.scene.tweens.add({
                targets: this.sprite,
                scaleY: 0.3,
                alpha: 0,
                duration: 200,
                onComplete: () => {
                    this.sprite.destroy();
                }
            });

            this.scene.sound.play('enemy_defeat', { volume: 0.3 });
            this.scene.addScore(200);
        } else {
            // Hit from side - spin away
            this.sprite.setVelocity(this.direction * -100, -200);
            this.sprite.setAngularVelocity(360);

            this.scene.tweens.add({
                targets: this.sprite,
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    this.sprite.destroy();
                }
            });
        }
    }

    getSprite() {
        return this.sprite;
    }
}
