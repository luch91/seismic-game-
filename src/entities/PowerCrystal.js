// PowerCrystal collectible class - Powers up the player (small -> big)
class PowerCrystal {
    constructor(scene, x, y) {
        this.scene = scene;
        this.collected = false;

        // Use power_crystal texture, fallback to crystal if not available
        const texture = scene.textures.exists('power_crystal') ? 'power_crystal' : 'crystal';

        // Create sprite using power_crystal texture
        this.sprite = scene.physics.add.sprite(x, y, texture);
        this.sprite.setScale(1);

        // Floating animation (more dramatic than regular crystals)
        scene.tweens.add({
            targets: this.sprite,
            y: y - 15,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Pulsing glow effect
        scene.tweens.add({
            targets: this.sprite,
            scale: 1.2,
            duration: 600,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Golden sparkle effect
        scene.tweens.add({
            targets: this.sprite,
            alpha: 0.7,
            duration: 300,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Reference to this power crystal instance
        this.sprite.powerCrystalInstance = this;
    }

    collect() {
        if (this.collected) return;

        this.collected = true;

        // Dramatic collection animation
        this.scene.tweens.add({
            targets: this.sprite,
            y: this.sprite.y - 80,
            alpha: 0,
            scale: 2,
            duration: 400,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.sprite.destroy();
            }
        });

        // Power up the player
        this.scene.powerCrystalCollected();
    }

    getSprite() {
        return this.sprite;
    }
}
