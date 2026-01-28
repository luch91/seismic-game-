// Main game initialization
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#0a1a1a',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }, // We'll set gravity on individual sprites
            debug: false
        }
    },
    scene: [BootScene, MainMenuScene, LevelSelectScene, GameScene],
    pixelArt: true,
    antialias: false
};

// Create the game instance
const game = new Phaser.Game(config);

// Global game state
window.SeismicGame = {
    highScores: {},
    completedLevels: [],

    saveHighScore: function(level, score) {
        const key = 'mag' + level;
        if (!this.highScores[key] || score > this.highScores[key]) {
            this.highScores[key] = score;
            localStorage.setItem('seismicHighScores', JSON.stringify(this.highScores));
            return true;
        }
        return false;
    },

    loadHighScores: function() {
        const saved = localStorage.getItem('seismicHighScores');
        if (saved) {
            try {
                this.highScores = JSON.parse(saved);
            } catch (e) {
                console.error('Error loading high scores:', e);
            }
        }
    },

    getHighScore: function(level) {
        const key = 'mag' + level;
        return this.highScores[key] || 0;
    },

    // Mark a level as completed and persist
    markLevelComplete: function(level) {
        if (!this.completedLevels.includes(level)) {
            this.completedLevels.push(level);
            this.completedLevels.sort((a, b) => a - b);
            localStorage.setItem('seismicCompletedLevels', JSON.stringify(this.completedLevels));
        }
    },

    loadProgress: function() {
        const saved = localStorage.getItem('seismicCompletedLevels');
        if (saved) {
            try {
                this.completedLevels = JSON.parse(saved);
            } catch (e) {
                console.error('Error loading progress:', e);
            }
        }
    },

    // Get unlocked levels — merges completion progress + Discord unlocks
    getUnlockedLevels: function() {
        const unlocked = new Set([1]); // Level 1 always unlocked

        // Each completed level unlocks itself + the next
        this.completedLevels.forEach(function(level) {
            unlocked.add(level);
            if (level + 1 <= 9) unlocked.add(level + 1);
        });

        // Merge Discord-based unlocks if connected
        var discordData = localStorage.getItem('seismicDiscordAuth');
        if (discordData) {
            try {
                var data = JSON.parse(discordData);
                if (data.unlockedLevels) {
                    data.unlockedLevels.forEach(function(l) { unlocked.add(l); });
                }
            } catch (e) { /* ignore */ }
        }

        return Array.from(unlocked).sort(function(a, b) { return a - b; });
    },

    unlockNextLevel: function(completedLevel) {
        // Persist completion
        this.markLevelComplete(completedLevel);

        // Also update Discord data if connected
        var nextLevel = completedLevel + 1;
        if (nextLevel > 9) return;

        var discordData = localStorage.getItem('seismicDiscordAuth');
        if (!discordData) return;

        try {
            var data = JSON.parse(discordData);
            if (!data.unlockedLevels) {
                data.unlockedLevels = [];
            }

            if (!data.unlockedLevels.includes(nextLevel)) {
                data.unlockedLevels.push(nextLevel);
                data.unlockedLevels.sort(function(a, b) { return a - b; });
                localStorage.setItem('seismicDiscordAuth', JSON.stringify(data));
            }
        } catch (e) {
            console.error('Error unlocking next level:', e);
        }
    }
};

// Load saved data on startup
window.SeismicGame.loadHighScores();
window.SeismicGame.loadProgress();

console.log('%c Seismic Mag-Rush ', 'background: #6b2a2a; color: #c8a898; font-size: 20px; font-weight: bold; padding: 10px;');
console.log('%c Game loaded successfully! ', 'background: #8b4a3a; color: #ffffff; font-size: 14px; padding: 5px;');
console.log('Controls: Arrow Keys to move, Space/Up to jump');
console.log('Collect crystals, avoid enemies, reach the flag!');
