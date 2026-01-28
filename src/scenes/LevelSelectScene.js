// Level Selection Scene
class LevelSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LevelSelectScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Restore the Discord panel (hidden during gameplay)
        const discordPanel = document.getElementById('discord-panel');
        if (discordPanel) discordPanel.style.display = '';

        // Background - dark teal
        this.add.rectangle(0, 0, width, height, 0x0a1a1a).setOrigin(0);

        // Subtle gradient overlay
        const gradient = this.add.graphics();
        gradient.fillStyle(0x6b2a2a, 0.15);
        gradient.fillRect(0, 0, width, height);

        // Title
        const title = this.add.text(width / 2, 40, 'SELECT MAG LEVEL', {
            fontSize: '36px',
            fontFamily: 'monospace',
            fill: '#c8a898',
            fontStyle: 'bold'
        });
        title.setOrigin(0.5);
        title.setStroke('#6b2a2a', 6);

        // Get unlocked levels from Discord auth or use default
        const unlockedLevels = this.getUnlockedLevels();

        // Create level buttons in a 3x3 grid (left side)
        const gridCenterX = width * 0.32;
        const startY = 120;
        const spacingY = 75;
        const spacingX = 140;
        const cols = 3;

        for (let i = 1; i <= 9; i++) {
            const row = Math.floor((i - 1) / cols);
            const col = (i - 1) % cols;
            const x = gridCenterX - spacingX + col * spacingX;
            const y = startY + row * spacingY;

            this.createLevelButton(x, y, i, unlockedLevels.includes(i));
        }

        // Leaderboard panel (right side)
        this.createLeaderboard(width * 0.74, 110);

        // Back button
        const backButton = this.add.text(50, height - 40, '< BACK', {
            fontSize: '20px',
            fontFamily: 'monospace',
            fill: '#ffffff'
        });
        backButton.setOrigin(0, 0.5);
        backButton.setInteractive({ useHandCursor: true });

        backButton.on('pointerover', () => {
            backButton.setStyle({ fill: '#c8a898' });
            soundManager.playMenuHover();
        });

        backButton.on('pointerout', () => {
            backButton.setStyle({ fill: '#ffffff' });
        });

        backButton.on('pointerdown', () => {
            soundManager.playMenuSelect();
            this.scene.start('MainMenuScene');
        });

        // Discord info
        const discordInfo = this.getDiscordInfo();
        if (discordInfo.username) {
            const userText = this.add.text(width - 20, height - 40,
                `${discordInfo.username} | Mag1-Mag${unlockedLevels.length}`, {
                fontSize: '12px',
                fontFamily: 'monospace',
                fill: '#d4b8a8',
                align: 'right'
            });
            userText.setOrigin(1, 0.5);
        }

        // Fade in
        this.cameras.main.fadeIn(500);
    }

    createLevelButton(x, y, level, unlocked) {
        const magName = 'Mag' + level;
        const highScore = window.SeismicGame.getHighScore(level);

        // Button container
        const button = this.add.container(x, y);

        // Button background
        const bg = this.add.rectangle(0, 0, 120, 55,
            unlocked ? 0x3a1a1a : 0x222222);
        bg.setStrokeStyle(2, unlocked ? 0x8b4a3a : 0x444444);

        // Level text
        const text = this.add.text(0, -12, magName, {
            fontSize: '22px',
            fontFamily: 'monospace',
            fill: unlocked ? '#c8a898' : '#666666',
            fontStyle: 'bold'
        });
        text.setOrigin(0.5);

        // High score or stars
        let subText;
        if (unlocked && highScore > 0) {
            subText = this.add.text(0, 10, highScore.toLocaleString(), {
                fontSize: '11px',
                fontFamily: 'monospace',
                fill: '#8b4a3a'
            });
        } else {
            subText = this.add.text(0, 10, '\u2605'.repeat(Math.min(level, 5)), {
                fontSize: '10px',
                fontFamily: 'monospace',
                fill: unlocked ? '#8b4a3a' : '#444444'
            });
        }
        subText.setOrigin(0.5);

        button.add([bg, text, subText]);

        if (unlocked) {
            button.setInteractive(
                new Phaser.Geom.Rectangle(-60, -27, 120, 55),
                Phaser.Geom.Rectangle.Contains
            );

            button.on('pointerover', () => {
                bg.setFillStyle(0x6b2a2a);
                this.tweens.add({
                    targets: button,
                    scale: 1.1,
                    duration: 100
                });
                soundManager.playMenuHover();
            });

            button.on('pointerout', () => {
                bg.setFillStyle(0x3a1a1a);
                this.tweens.add({
                    targets: button,
                    scale: 1,
                    duration: 100
                });
            });

            button.on('pointerdown', () => {
                soundManager.playMenuSelect();
                soundManager.stopMusic();
                this.cameras.main.fade(300, 0, 0, 0);
                this.time.delayedCall(300, () => {
                    this.scene.start('GameScene', { level: level });
                });
            });
        } else {
            const lock = this.add.text(0, 10, '\uD83D\uDD12', {
                fontSize: '14px'
            });
            lock.setOrigin(0.5);
            button.add(lock);
        }
    }

    createLeaderboard(x, y) {
        const panelWidth = 220;
        const panelHeight = 360;

        // Panel background
        const panelBg = this.add.rectangle(x, y + panelHeight / 2, panelWidth, panelHeight, 0x1a1a1a);
        panelBg.setStrokeStyle(2, 0x6b2a2a);

        // Panel title
        const panelTitle = this.add.text(x, y + 15, 'LEADERBOARD', {
            fontSize: '16px',
            fontFamily: 'monospace',
            fill: '#c8a898',
            fontStyle: 'bold'
        });
        panelTitle.setOrigin(0.5);

        // Divider line
        const divider = this.add.graphics();
        divider.lineStyle(1, 0x6b2a2a, 0.8);
        divider.lineBetween(x - panelWidth / 2 + 15, y + 32, x + panelWidth / 2 - 15, y + 32);

        // Column headers
        this.add.text(x - 85, y + 42, 'LVL', {
            fontSize: '11px', fontFamily: 'monospace', fill: '#8b4a3a', fontStyle: 'bold'
        });
        this.add.text(x + 5, y + 42, 'BEST', {
            fontSize: '11px', fontFamily: 'monospace', fill: '#8b4a3a', fontStyle: 'bold'
        });
        this.add.text(x + 65, y + 42, 'RANK', {
            fontSize: '11px', fontFamily: 'monospace', fill: '#8b4a3a', fontStyle: 'bold'
        });

        // List all 9 levels with scores
        const rowHeight = 30;
        let totalScore = 0;
        let completedCount = 0;

        for (let i = 1; i <= 9; i++) {
            const rowY = y + 62 + (i - 1) * rowHeight;
            const score = window.SeismicGame.getHighScore(i);

            if (score > 0) {
                totalScore += score;
                completedCount++;
            }

            // Alternating row bg
            if (i % 2 === 0) {
                const rowBg = this.add.rectangle(x, rowY + 5, panelWidth - 10, rowHeight - 2, 0x222222, 0.3);
            }

            // Level name
            this.add.text(x - 85, rowY, `Mag${i}`, {
                fontSize: '12px',
                fontFamily: 'monospace',
                fill: score > 0 ? '#c8a898' : '#555555'
            });

            // Score
            this.add.text(x + 5, rowY, score > 0 ? score.toLocaleString() : '---', {
                fontSize: '12px',
                fontFamily: 'monospace',
                fill: score > 0 ? '#ffffff' : '#444444'
            });

            // Rank medal based on score thresholds
            let rank = '';
            if (score >= 5000) rank = 'S';
            else if (score >= 3000) rank = 'A';
            else if (score >= 1500) rank = 'B';
            else if (score > 0) rank = 'C';

            const rankColor = rank === 'S' ? '#c8a898' : rank === 'A' ? '#8b4a3a' : rank === 'B' ? '#6b2a2a' : '#555555';
            this.add.text(x + 72, rowY, rank || '-', {
                fontSize: '12px',
                fontFamily: 'monospace',
                fill: rankColor,
                fontStyle: rank === 'S' ? 'bold' : 'normal'
            });
        }

        // Bottom divider
        const divider2 = this.add.graphics();
        divider2.lineStyle(1, 0x6b2a2a, 0.8);
        const bottomLineY = y + 62 + 9 * rowHeight - 5;
        divider2.lineBetween(x - panelWidth / 2 + 15, bottomLineY, x + panelWidth / 2 - 15, bottomLineY);

        // Total score
        this.add.text(x - 85, bottomLineY + 10, 'TOTAL', {
            fontSize: '12px', fontFamily: 'monospace', fill: '#c8a898', fontStyle: 'bold'
        });
        this.add.text(x + 5, bottomLineY + 10, totalScore > 0 ? totalScore.toLocaleString() : '---', {
            fontSize: '12px', fontFamily: 'monospace', fill: '#c8a898', fontStyle: 'bold'
        });
        this.add.text(x + 55, bottomLineY + 10, `${completedCount}/9`, {
            fontSize: '12px', fontFamily: 'monospace', fill: '#8b4a3a'
        });
    }

    getUnlockedLevels() {
        // Use centralized unlock logic (merges completion progress + Discord)
        return window.SeismicGame.getUnlockedLevels();
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
