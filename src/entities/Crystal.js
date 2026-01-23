// Crystal collectible class
class Crystal {
    constructor(scene, x, y) {
        this.scene = scene;
        this.collected = false;

        // Create sprite
        this.sprite = scene.physics.add.sprite(x, y, 'crystal');
        this.sprite.setScale(0.8);

        // Floating animation
        scene.tweens.add({
            targets: this.sprite,
            y: y - 10,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Rotation animation
        scene.tweens.add({
            targets: this.sprite,
            angle: 360,
            duration: 2000,
            repeat: -1,
            ease: 'Linear'
        });

        // Glow effect
        scene.tweens.add({
            targets: this.sprite,
            alpha: 0.6,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Reference to this crystal instance
        this.sprite.crystalInstance = this;
    }

    collect() {
        if (this.collected) return;

        this.collected = true;

        // Collection animation
        this.scene.tweens.add({
            targets: this.sprite,
            y: this.sprite.y - 50,
            alpha: 0,
            scale: 1.5,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                this.sprite.destroy();
            }
        });

        this.scene.sound.play('collect', { volume: 0.3 });
        this.scene.crystalCollected();
    }

    getSprite() {
        return this.sprite;
    }
}
