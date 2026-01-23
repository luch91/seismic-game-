// Level Selection Scene
class LevelSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LevelSelectScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background
        this.add.rectangle(0, 0, width, height, 0x1a0033).setOrigin(0);

        // Title
        const title = this.add.text(width / 2, 50, 'SELECT MAG LEVEL', {
            fontSize: '42px',
            fontFamily: 'monospace',
            fill: '#ff00ff',
            fontStyle: 'bold'
        });
        title.setOrigin(0.5);
        title.setStroke('#aa00ff', 6);

        // Get unlocked levels from Discord auth or use default
        const unlockedLevels = this.getUnlockedLevels();

        // Create level buttons in a grid
        const startY = 150;
        const spacing = 80;
        const cols = 3;

        for (let i = 1; i <= 9; i++) {
            const row = Math.floor((i - 1) / cols);
            const col = (i - 1) % cols;
            const x = width / 2 - 150 + col * 150;
            const y = startY + row * spacing;

            this.createLevelButton(x, y, i, unlockedLevels.includes(i));
        }

        // Back button
        const backButton = this.add.text(50, height - 50, '< BACK', {
            fontSize: '20px',
            fontFamily: 'monospace',
            fill: '#ffffff'
        });
        backButton.setOrigin(0, 0.5);
        backButton.setInteractive({ useHandCursor: true });

        backButton.on('pointerover', () => {
            backButton.setStyle({ fill: '#ff00ff' });
        });

        backButton.on('pointerout', () => {
            backButton.setStyle({ fill: '#ffffff' });
        });

        backButton.on('pointerdown', () => {
            this.scene.start('MainMenuScene');
        });

        // Discord info
        const discordInfo = this.getDiscordInfo();
        if (discordInfo.username) {
            const userText = this.add.text(width - 50, 50,
                `Player: ${discordInfo.username}\nUnlocked: Mag1-Mag${unlockedLevels.length}`, {
                fontSize: '14px',
                fontFamily: 'monospace',
                fill: '#ffffff',
                align: 'right'
            });
            userText.setOrigin(1, 0);
        }

        // Fade in
        this.cameras.main.fadeIn(500);
    }

    createLevelButton(x, y, level, unlocked) {
        const magName = 'Mag' + level;

        // Button container
        const button = this.add.container(x, y);

        // Button background
        const bg = this.add.rectangle(0, 0, 120, 60,
            unlocked ? 0x6600aa : 0x333333);
        bg.setStroke(unlocked ? 0xff00ff : 0x666666, 2);

        // Level text
        const text = this.add.text(0, -10, magName, {
            fontSize: '24px',
            fontFamily: 'monospace',
            fill: unlocked ? '#ffffff' : '#666666',
            fontStyle: 'bold'
        });
        text.setOrigin(0.5);

        // Difficulty indicator
        const difficulty = this.add.text(0, 15, '★'.repeat(level), {
            fontSize: '12px',
            fontFamily: 'monospace',
            fill: unlocked ? '#ff00ff' : '#444444'
        });
        difficulty.setOrigin(0.5);

        button.add([bg, text, difficulty]);

        if (unlocked) {
            button.setInteractive(
                new Phaser.Geom.Rectangle(-60, -30, 120, 60),
                Phaser.Geom.Rectangle.Contains
            );

            button.on('pointerover', () => {
                bg.setFillStyle(0x8800cc);
                button.setScale(1.1);
                this.tweens.add({
                    targets: button,
                    scale: 1.1,
                    duration: 100
                });
            });

            button.on('pointerout', () => {
                bg.setFillStyle(0x6600aa);
                this.tweens.add({
                    targets: button,
                    scale: 1,
                    duration: 100
                });
            });

            button.on('pointerdown', () => {
                this.cameras.main.fade(300, 0, 0, 0);
                this.time.delayedCall(300, () => {
                    this.scene.start('GameScene', { level: level });
                });
            });
        } else {
            // Lock icon for locked levels
            const lock = this.add.text(0, 30, '🔒', {
                fontSize: '16px'
            });
            lock.setOrigin(0.5);
            button.add(lock);
        }
    }

    getUnlockedLevels() {
        // Check localStorage for Discord auth data
        const discordData = localStorage.getItem('seismicDiscordAuth');
        if (discordData) {
            try {
                const data = JSON.parse(discordData);
                if (data.unlockedLevels) {
                    return data.unlockedLevels;
                }
            } catch (e) {
                console.error('Error parsing Discord data:', e);
            }
        }

        // Default: unlock first 3 levels for demo
        return [1, 2, 3, 4, 5, 6, 7, 8, 9]; // All levels unlocked for demo
    }

    getDiscordInfo() {
        const discordData = localStorage.getItem('seismicDiscordAuth');
        if (discordData) {
            try {
                const data = JSON.parse(discordData);
                return {
                    username: data.username || null,
                    avatar: data.avatar || null
                };
            } catch (e) {
                console.error('Error parsing Discord data:', e);
            }
        }
        return { username: null, avatar: null };
    }
}
