// Game Configuration
const GameConfig = {
    width: 800,
    height: 600,
    gravity: 800,
    playerSpeed: 160,
    playerJump: -400,

    // Seismic branding colors (dark teal / maroon / warm beige gradient)
    colors: {
        primary: 0xc8a898,    // Warm beige
        secondary: 0x8b4a3a,  // Dusty rose
        accent: 0x6b2a2a,     // Maroon
        background: 0x0a1a1a, // Dark teal-black
        platform: 0x3a1a1a,   // Dark maroon
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
            crystalCount: 5,
            timeLimit: 120
        },
        mag2: {
            name: 'Mag2',
            difficulty: 2,
            enemyCount: 3,
            enemySpeed: 60,
            platformGaps: 'wide',
            movingPlatforms: false,
            crystalCount: 7,
            timeLimit: 110
        },
        mag3: {
            name: 'Mag3',
            difficulty: 3,
            enemyCount: 4,
            enemySpeed: 70,
            platformGaps: 'medium',
            movingPlatforms: false,
            crystalCount: 8,
            timeLimit: 100
        },
        mag4: {
            name: 'Mag4',
            difficulty: 4,
            enemyCount: 5,
            enemySpeed: 80,
            platformGaps: 'medium',
            movingPlatforms: true,
            crystalCount: 10,
            timeLimit: 95
        },
        mag5: {
            name: 'Mag5',
            difficulty: 5,
            enemyCount: 6,
            enemySpeed: 90,
            platformGaps: 'medium',
            movingPlatforms: true,
            crystalCount: 12,
            timeLimit: 90
        },
        mag6: {
            name: 'Mag6',
            difficulty: 6,
            enemyCount: 7,
            enemySpeed: 100,
            platformGaps: 'narrow',
            movingPlatforms: true,
            crystalCount: 15,
            timeLimit: 85
        },
        mag7: {
            name: 'Mag7',
            difficulty: 7,
            enemyCount: 8,
            enemySpeed: 120,
            platformGaps: 'narrow',
            movingPlatforms: true,
            crystalCount: 18,
            timeLimit: 75
        },
        mag8: {
            name: 'Mag8',
            difficulty: 8,
            enemyCount: 10,
            enemySpeed: 140,
            platformGaps: 'narrow',
            movingPlatforms: true,
            crystalCount: 20,
            timeLimit: 65
        },
        mag9: {
            name: 'Mag9',
            difficulty: 9,
            enemyCount: 12,
            enemySpeed: 160,
            platformGaps: 'very_narrow',
            movingPlatforms: true,
            crystalCount: 25,
            timeLimit: 60
        }
    },

    // Discord OAuth configuration
    // To enable real Discord auth:
    // 1. Create an app at https://discord.com/developers/applications
    // 2. Set the redirect URI to your hosted URL + '/discord-callback'
    // 3. Replace the IDs below with your actual values
    discord: {
        clientId: 'YOUR_DISCORD_CLIENT_ID',
        guildId: 'YOUR_SEISMIC_GUILD_ID',
        redirectUri: window.location.origin + '/discord-callback',
        scopes: ['identify', 'guilds.members.read'],
        // Map your Discord server role IDs to Mag levels
        roleMapping: {
            // 'ROLE_ID_HERE': 1,  // Mag1 role
            // 'ROLE_ID_HERE': 2,  // Mag2 role
            // ...etc
        }
    }
};
