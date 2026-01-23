// Game Configuration
const GameConfig = {
    width: 800,
    height: 600,
    gravity: 800,
    playerSpeed: 160,
    playerJump: -400,

    // Seismic branding colors
    colors: {
        primary: 0xff00ff,    // Magenta/Pink
        secondary: 0xaa00ff,  // Purple
        background: 0x1a0033, // Dark purple
        platform: 0x6600aa,   // Medium purple
        text: 0xffffff
    },

    // Level configurations
    levels: {
        mag1: {
            name: 'Mag1',
            difficulty: 1,
            enemyCount: 2,
            enemySpeed: 50,
            platformGaps: 'wide',
            movingPlatforms: false,
            crystalCount: 5
        },
        mag2: {
            name: 'Mag2',
            difficulty: 2,
            enemyCount: 3,
            enemySpeed: 60,
            platformGaps: 'wide',
            movingPlatforms: false,
            crystalCount: 7
        },
        mag3: {
            name: 'Mag3',
            difficulty: 3,
            enemyCount: 4,
            enemySpeed: 70,
            platformGaps: 'medium',
            movingPlatforms: false,
            crystalCount: 8
        },
        mag4: {
            name: 'Mag4',
            difficulty: 4,
            enemyCount: 5,
            enemySpeed: 80,
            platformGaps: 'medium',
            movingPlatforms: true,
            crystalCount: 10
        },
        mag5: {
            name: 'Mag5',
            difficulty: 5,
            enemyCount: 6,
            enemySpeed: 90,
            platformGaps: 'medium',
            movingPlatforms: true,
            crystalCount: 12
        },
        mag6: {
            name: 'Mag6',
            difficulty: 6,
            enemyCount: 7,
            enemySpeed: 100,
            platformGaps: 'narrow',
            movingPlatforms: true,
            crystalCount: 15
        },
        mag7: {
            name: 'Mag7',
            difficulty: 7,
            enemyCount: 8,
            enemySpeed: 120,
            platformGaps: 'narrow',
            movingPlatforms: true,
            crystalCount: 18
        },
        mag8: {
            name: 'Mag8',
            difficulty: 8,
            enemyCount: 10,
            enemySpeed: 140,
            platformGaps: 'narrow',
            movingPlatforms: true,
            crystalCount: 20
        },
        mag9: {
            name: 'Mag9',
            difficulty: 9,
            enemyCount: 12,
            enemySpeed: 160,
            platformGaps: 'very_narrow',
            movingPlatforms: true,
            crystalCount: 25
        }
    },

    // Discord OAuth configuration
    discord: {
        clientId: 'YOUR_DISCORD_CLIENT_ID', // Replace with actual client ID
        redirectUri: window.location.origin + '/discord-callback',
        scopes: ['identify', 'guilds.members.read']
    }
};
