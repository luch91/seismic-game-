// Main game initialization
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#1a0033',
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
    }
};

// Load high scores on startup
window.SeismicGame.loadHighScores();

console.log('%c Seismic Platformer ', 'background: #ff00ff; color: #ffffff; font-size: 20px; font-weight: bold; padding: 10px;');
console.log('%c Game loaded successfully! ', 'background: #aa00ff; color: #ffffff; font-size: 14px; padding: 5px;');
console.log('Controls: Arrow Keys to move, Space/Up to jump');
console.log('Collect crystals, avoid enemies, reach the flag!');
