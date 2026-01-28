// Discord OAuth Integration
class DiscordAuth {
    constructor() {
        this.clientId = GameConfig.discord.clientId;
        this.redirectUri = GameConfig.discord.redirectUri;
        this.scopes = GameConfig.discord.scopes.join(' ');
        this.authenticated = false;
        this.userData = null;
        this.useRealAuth = this.clientId && this.clientId !== 'YOUR_DISCORD_CLIENT_ID';

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
                // Resume audio context on user interaction
                if (typeof soundManager !== 'undefined') {
                    soundManager.resume();
                }

                if (this.authenticated) {
                    this.logout();
                } else {
                    this.login();
                }
            });
        }
    }

    login() {
        if (this.useRealAuth) {
            // Real Discord OAuth redirect
            const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${this.clientId}&redirect_uri=${encodeURIComponent(this.redirectUri)}&response_type=token&scope=${encodeURIComponent(this.scopes)}`;
            window.location.href = authUrl;
        } else {
            // Demo mode — simulate Discord auth
            this.simulateDiscordAuth();
        }
    }

    simulateDiscordAuth() {
        const mockUser = {
            id: '123456789',
            username: 'SeismicPlayer',
            discriminator: '0001',
            avatar: null,
            roles: ['Mag5', 'Mag3', 'Mag1'],
            unlockedLevels: [1, 2, 3, 4, 5]
        };

        this.userData = mockUser;
        this.authenticated = true;

        localStorage.setItem('seismicDiscordAuth', JSON.stringify(mockUser));
        this.updateUI();

        alert('Demo Mode: Connected as SeismicPlayer\nMag1-Mag5 unlocked. Complete levels to unlock more!');
    }

    handleOAuthCallback() {
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
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            if (!userResponse.ok) throw new Error('Failed to fetch user data');
            const userData = await userResponse.json();

            // Fetch guild member data to get roles
            const guildId = GameConfig.discord.guildId;
            let unlockedLevels = [1]; // Default: at least Mag1

            if (guildId && guildId !== 'YOUR_SEISMIC_GUILD_ID') {
                try {
                    const memberResponse = await fetch(
                        `https://discord.com/api/users/@me/guilds/${guildId}/member`,
                        { headers: { Authorization: `Bearer ${accessToken}` } }
                    );

                    if (memberResponse.ok) {
                        const memberData = await memberResponse.json();
                        unlockedLevels = this.calculateUnlockedLevels(memberData.roles);
                    }
                } catch (guildError) {
                    console.warn('Could not fetch guild roles, defaulting to Mag1:', guildError);
                }
            }

            this.userData = {
                id: userData.id,
                username: userData.username || userData.global_name,
                discriminator: userData.discriminator || '0',
                avatar: userData.avatar,
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
        // Map Discord role IDs to Mag levels
        // Replace these with your actual Discord server role IDs
        const roleMapping = GameConfig.discord.roleMapping || {};

        const unlockedLevels = [];
        let highestMag = 0;

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

        // Default: unlock at least Mag1
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
            // Modern Discord uses global_name, fallback to username#discriminator
            const displayName = this.userData.discriminator === '0'
                ? this.userData.username
                : this.userData.username + '#' + this.userData.discriminator;
            userNameElement.textContent = displayName;

            if (this.userData.avatar) {
                const avatarUrl = `https://cdn.discordapp.com/avatars/${this.userData.id}/${this.userData.avatar}.png`;
                userAvatarElement.src = avatarUrl;
                userAvatarElement.style.display = 'block';
            } else {
                const defaultIndex = this.userData.id
                    ? (BigInt(this.userData.id) >> 22n) % 6n
                    : 0n;
                userAvatarElement.src = `https://cdn.discordapp.com/embed/avatars/${defaultIndex}.png`;
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
