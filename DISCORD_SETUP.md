# Discord Integration Setup Guide

This guide will help you set up Discord OAuth integration for the Seismic Mag-Rush game.

## Prerequisites

- A Discord account
- Admin access to your Discord server
- The game hosted on a web server (localhost or production)

## Step-by-Step Setup

### 1. Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **"New Application"**
3. Enter a name: "Seismic Mag-Rush"
4. Click **"Create"**

### 2. Get Your Client ID

1. In your application settings, go to **"General Information"**
2. Copy your **Client ID**
3. Save this for later

### 3. Configure OAuth2

1. In the left sidebar, click **"OAuth2"**
2. Under **"OAuth2 URL Generator"**:
   - Select scopes:
     - ✅ `identify` - To get user's Discord username and avatar
     - ✅ `guilds.members.read` - To read user's roles in your server
3. Under **"Redirects"**, click **"Add Redirect"**:
   - For local development: `http://localhost:8000`
   - For production: `https://yourdomain.com`
   - You can add multiple redirect URIs

### 4. Get Your Guild (Server) ID

1. Open Discord
2. Enable Developer Mode:
   - User Settings → Advanced → Developer Mode (toggle on)
3. Right-click your Seismic server icon
4. Click **"Copy Server ID"**
5. Save this Guild ID

### 5. Get Role IDs for Mag Levels

For each Mag role in your Discord server:

1. Go to Server Settings → Roles
2. Right-click on a role (e.g., "Mag1")
3. Click **"Copy Role ID"**
4. Repeat for all Mag1-Mag9 roles

### 6. Update Game Configuration

#### Update Client ID

Edit `src/config.js`:

```javascript
discord: {
    clientId: 'YOUR_CLIENT_ID_HERE', // Replace with your actual Client ID
    redirectUri: window.location.origin, // or specify exact URL
    scopes: ['identify', 'guilds.members.read']
}
```

#### Update Guild ID and Role Mapping

Edit `src/discord/DiscordAuth.js`:

1. Find the `fetchUserData` function
2. Replace `YOUR_SEISMIC_GUILD_ID`:

```javascript
const guildId = 'YOUR_GUILD_ID_HERE'; // Your server's ID
```

3. Find the `calculateUnlockedLevels` function
4. Update the role mapping with your actual role IDs:

```javascript
const roleMapping = {
    '123456789012345678': 1,  // Replace with actual Mag1 role ID
    '234567890123456789': 2,  // Replace with actual Mag2 role ID
    '345678901234567890': 3,  // Replace with actual Mag3 role ID
    '456789012345678901': 4,  // Replace with actual Mag4 role ID
    '567890123456789012': 5,  // Replace with actual Mag5 role ID
    '678901234567890123': 6,  // Replace with actual Mag6 role ID
    '789012345678901234': 7,  // Replace with actual Mag7 role ID
    '890123456789012345': 8,  // Replace with actual Mag8 role ID
    '901234567890123456': 9   // Replace with actual Mag9 role ID
};
```

### 7. Enable Real Discord OAuth

In `src/discord/DiscordAuth.js`, find the `login()` function and:

1. Comment out the `simulateDiscordAuth()` call
2. Uncomment the real OAuth redirect code:

```javascript
login() {
    // Comment out simulation
    // this.simulateDiscordAuth();

    // Uncomment real OAuth
    const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${this.clientId}&redirect_uri=${encodeURIComponent(this.redirectUri)}&response_type=token&scope=${encodeURIComponent(this.scopes)}`;
    window.location.href = authUrl;
}
```

### 8. Test the Integration

#### Local Testing

1. Start the local server:
   ```bash
   npm start
   ```

2. Open the game in your browser

3. Click **"Connect with Discord"**

4. You should be redirected to Discord's authorization page

5. Click **"Authorize"**

6. You'll be redirected back to the game with your Discord info

#### Verify Role-Based Unlocking

1. Check which Mag roles you have in Discord
2. The game should unlock corresponding levels
3. Example: If you have "Mag5" role, levels Mag1-Mag5 should be unlocked

## Troubleshooting

### "Invalid Redirect URI" Error

- Verify the redirect URI in Discord Developer Portal matches exactly
- Include protocol (http:// or https://)
- No trailing slash

### Can't Read User's Roles

- Ensure `guilds.members.read` scope is selected
- Verify the Guild ID is correct
- Check that the user is actually a member of your Discord server

### Role-Based Unlocking Not Working

- Verify role IDs are correct (copy them again from Discord)
- Check browser console for errors
- Ensure role mapping in code matches your server's roles

### CORS Errors

- Discord API should not cause CORS issues for OAuth
- If you see CORS errors, check your redirect URIs
- Ensure you're using the token flow (not code flow)

## Security Notes

### Production Considerations

1. **Never expose sensitive tokens**
   - Client ID is public and safe to expose
   - Don't commit client secrets if using bot features

2. **Use HTTPS in production**
   - Discord OAuth requires HTTPS for non-localhost URLs
   - Get a free SSL certificate from Let's Encrypt

3. **Validate tokens server-side**
   - Current implementation is client-side only
   - For production, validate tokens on your backend

4. **Rate limiting**
   - Discord API has rate limits
   - Cache user data to avoid repeated calls

## Advanced Features

### Save High Scores to Discord

You could extend the integration to:
- Post high scores to a Discord channel via webhook
- Create a leaderboard bot command
- Award roles based on achievements

### Example webhook implementation:

```javascript
async function postHighScore(username, level, score) {
    const webhookUrl = 'YOUR_WEBHOOK_URL';
    await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            content: `🏆 ${username} scored ${score} on ${level}!`
        })
    });
}
```

## Resources

- [Discord Developer Portal](https://discord.com/developers/applications)
- [Discord OAuth2 Documentation](https://discord.com/developers/docs/topics/oauth2)
- [Discord API Documentation](https://discord.com/developers/docs/intro)

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify all IDs are copied correctly
3. Ensure redirect URIs match exactly
4. Test with a fresh browser/incognito mode

---

Happy gaming!
