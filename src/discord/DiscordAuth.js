// Discord OAuth Integration
class DiscordAuth {
    constructor() {
        this.clientId = GameConfig.discord.clientId;
        this.redirectUri = GameConfig.discord.redirectUri;
        this.scopes = GameConfig.discord.scopes.join(' ');
        this.authenticated = false;
        this.userData = null;

        this.init();
    }

    init() {
        // Check if we have a stored auth token
        const storedAuth = localStorage.getItem('seismicDiscordAuth');
        if (storedAuth) {
            try {
                this.userData = JSON.parse(storedAuth);
                this.authenticated = true;
                this.updateUI();
            } catch (e) {
                console.error('Error parsing stored auth:', e);
                localStorage.removeItem('seismicDiscordAuth');
            }
        }

        // Check if we're returning from Discord OAuth
        this.handleOAuthCallback();

        // Setup Discord button
        this.setupButton();
    }

    setupButton() {
        const discordButton = document.getElementById('discord-connect');
        const discordPanel = document.getElementById('discord-panel');

        if (discordButton && discordPanel) {
            discordPanel.classList.remove('hidden');

            discordButton.addEventListener('click', () => {
                if (this.authenticated) {
                    this.logout();
                } else {
                    this.login();
                }
            });
        }
    }

    login() {
        // For demo purposes, simulate Discord auth
        // In production, this would redirect to Discord OAuth
        this.simulateDiscordAuth();

        // Uncomment below for real Discord OAuth
        /*
        const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${this.clientId}&redirect_uri=${encodeURIComponent(this.redirectUri)}&response_type=token&scope=${encodeURIComponent(this.scopes)}`;
        window.location.href = authUrl;
        */
    }

    simulateDiscordAuth() {
        // Simulate successful Discord authentication
        const mockUser = {
            id: '123456789',
            username: 'SeismicPlayer',
            discriminator: '0001',
            avatar: null,
            roles: ['Mag5', 'Mag3', 'Mag1'], // User has Mag1-5 unlocked
            unlockedLevels: [1, 2, 3, 4, 5] // Unlocked levels based on roles
        };

        this.userData = mockUser;
        this.authenticated = true;

        localStorage.setItem('seismicDiscordAuth', JSON.stringify(mockUser));
        this.updateUI();

        // Show success message
        alert('Connected to Discord!\nYou have unlocked Mag1-Mag5 levels.');
    }

    handleOAuthCallback() {
        // Check if we have an access token in the URL hash
        const hash = window.location.hash;
        if (hash && hash.includes('access_token=')) {
            const params = new URLSearchParams(hash.substring(1));
            const accessToken = params.get('access_token');

            if (accessToken) {
                this.fetchUserData(accessToken);
                // Clean up URL
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        }
    }

    async fetchUserData(accessToken) {
        try {
            // Fetch user data from Discord API
            const userResponse = await fetch('https://discord.com/api/users/@me', {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            const userData = await userResponse.json();

            // Fetch guild member data to get roles
            const guildId = 'YOUR_SEISMIC_GUILD_ID'; // Replace with actual guild ID
            const memberResponse = await fetch(`https://discord.com/api/users/@me/guilds/${guildId}/member`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            const memberData = await memberResponse.json();

            // Determine unlocked levels based on roles
            const unlockedLevels = this.calculateUnlockedLevels(memberData.roles);

            this.userData = {
                id: userData.id,
                username: userData.username,
                discriminator: userData.discriminator,
                avatar: userData.avatar,
                roles: memberData.roles,
                unlockedLevels: unlockedLevels
            };

            this.authenticated = true;
            localStorage.setItem('seismicDiscordAuth', JSON.stringify(this.userData));
            this.updateUI();

        } catch (error) {
            console.error('Error fetching Discord user data:', error);
            alert('Failed to authenticate with Discord. Please try again.');
        }
    }

    calculateUnlockedLevels(roleIds) {
        // Map role IDs to Mag levels
        // In production, you'd have actual role IDs from your Discord server
        const roleMapping = {
            'MAG1_ROLE_ID': 1,
            'MAG2_ROLE_ID': 2,
            'MAG3_ROLE_ID': 3,
            'MAG4_ROLE_ID': 4,
            'MAG5_ROLE_ID': 5,
            'MAG6_ROLE_ID': 6,
            'MAG7_ROLE_ID': 7,
            'MAG8_ROLE_ID': 8,
            'MAG9_ROLE_ID': 9
        };

        const unlockedLevels = [];
        let highestMag = 0;

        // Check which Mag roles the user has
        roleIds.forEach(roleId => {
            const magLevel = roleMapping[roleId];
            if (magLevel && magLevel > highestMag) {
                highestMag = magLevel;
            }
        });

        // Unlock all levels up to the highest Mag role
        for (let i = 1; i <= highestMag; i++) {
            unlockedLevels.push(i);
        }

        // Default: unlock at least the first level
        if (unlockedLevels.length === 0) {
            unlockedLevels.push(1);
        }

        return unlockedLevels;
    }

    updateUI() {
        const userNameElement = document.getElementById('user-name');
        const userAvatarElement = document.getElementById('user-avatar');
        const discordButton = document.getElementById('discord-connect');

        if (this.authenticated && this.userData) {
            const username = this.userData.username + '#' + this.userData.discriminator;
            userNameElement.textContent = username;

            // Set avatar if available
            if (this.userData.avatar) {
                const avatarUrl = `https://cdn.discordapp.com/avatars/${this.userData.id}/${this.userData.avatar}.png`;
                userAvatarElement.src = avatarUrl;
                userAvatarElement.style.display = 'block';
            } else {
                // Default Discord avatar
                const defaultAvatar = parseInt(this.userData.discriminator) % 5;
                userAvatarElement.src = `https://cdn.discordapp.com/embed/avatars/${defaultAvatar}.png`;
                userAvatarElement.style.display = 'block';
            }

            discordButton.textContent = 'Disconnect';
            discordButton.style.background = '#ed4245';
        } else {
            userNameElement.textContent = 'Guest';
            userAvatarElement.style.display = 'none';
            discordButton.textContent = 'Connect with Discord';
            discordButton.style.background = '#5865F2';
        }
    }

    logout() {
        this.authenticated = false;
        this.userData = null;
        localStorage.removeItem('seismicDiscordAuth');
        this.updateUI();
        alert('Disconnected from Discord.');
    }

    isAuthenticated() {
        return this.authenticated;
    }

    getUserData() {
        return this.userData;
    }
}

// Initialize Discord auth when the page loads
let discordAuth;
window.addEventListener('DOMContentLoaded', () => {
    discordAuth = new DiscordAuth();
});
