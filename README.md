# Seismic Platformer

A Mario-style platformer game featuring 9 difficulty levels (Mag1-Mag9) inspired by the Seismic Discord community roles.

## Game Features

### Core Gameplay
- **Side-scrolling platformer** with Mario-inspired physics
- **9 difficulty levels** labeled Mag1 through Mag9
  - Mag1-3: Easy levels with simple platforms and few enemies
  - Mag4-6: Medium difficulty with moving platforms and more enemies
  - Mag7-9: Hard levels requiring precise jumps and fast reflexes
- **Player mechanics**: Run, jump, collect crystals, avoid enemies
- **Lives system**: 3 lives per attempt
- **Score tracking**: Earn points by collecting crystals and defeating enemies

### Visual Style
- Retro 8-bit pixel art aesthetic
- Pink/purple color scheme matching Seismic branding
- Procedurally generated graphics
- Seismic crystal collectibles throughout levels

### Enemies
- **Goomba-style**: Basic ground enemies
- **Koopa-style**: Turtle-like enemies with shells
- Jump on enemies to defeat them
- Difficulty scales with Mag level

### Discord Integration
- **OAuth authentication** to connect with Discord
- **Role-based level unlocking**: Players with Mag5 role unlock levels 1-5
- **Display username and avatar** from Discord
- **High score tracking** tied to Discord ID (optional)

## Project Structure

```
seismic-game-/
├── index.html              # Main HTML file
├── css/
│   └── style.css          # Game styling
├── src/
│   ├── config.js          # Game configuration
│   ├── main.js            # Game initialization
│   ├── entities/
│   │   ├── Player.js      # Player class with Mario physics
│   │   ├── Enemy.js       # Enemy AI and behaviors
│   │   └── Crystal.js     # Collectible crystals
│   ├── scenes/
│   │   ├── BootScene.js   # Asset loading
│   │   ├── MainMenuScene.js   # Main menu
│   │   ├── LevelSelectScene.js # Level selection
│   │   └── GameScene.js   # Main gameplay
│   ├── utils/
│   │   └── AssetGenerator.js # Procedural graphics
│   └── discord/
│       └── DiscordAuth.js # Discord OAuth integration
└── assets/
    └── images/
        └── seismic-crystal.png # Crystal collectible sprite
```

## Setup Instructions

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd seismic-game-
   ```

2. **Place the seismic-crystal.png image**
   - Copy the seismic-crystal.png file to `assets/images/`
   - The game will use procedural graphics if the image is not found

3. **Serve the game locally**

   Using Python 3:
   ```bash
   python -m http.server 8000
   ```

   Using Node.js (http-server):
   ```bash
   npx http-server -p 8000
   ```

   Using PHP:
   ```bash
   php -S localhost:8000
   ```

4. **Open in browser**
   ```
   http://localhost:8000
   ```

### Discord OAuth Setup (Optional)

To enable Discord integration:

1. **Create a Discord Application**
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Click "New Application" and give it a name
   - Note your Client ID

2. **Configure OAuth2**
   - Go to OAuth2 settings
   - Add redirect URI: `http://localhost:8000/discord-callback` (or your domain)
   - Select scopes: `identify`, `guilds.members.read`

3. **Update configuration**
   - Open `src/config.js`
   - Replace `YOUR_DISCORD_CLIENT_ID` with your actual Client ID
   - Update the redirect URI if needed

4. **Configure Role Mapping**
   - Open `src/discord/DiscordAuth.js`
   - Update the `roleMapping` in `calculateUnlockedLevels()` with your Discord server's actual role IDs
   - To find role IDs: Right-click a role in Discord (with Developer Mode enabled) → Copy ID

5. **Update Guild ID**
   - Replace `YOUR_SEISMIC_GUILD_ID` in `DiscordAuth.js` with your Discord server's ID

### Production Deployment

1. **Build for production**
   - No build step required - static HTML/JS/CSS
   - Simply upload all files to your web server

2. **Update Discord OAuth**
   - Update redirect URI in Discord Developer Portal to your production domain
   - Update `redirectUri` in `src/config.js`

3. **Deploy to hosting**

   GitHub Pages:
   ```bash
   git add .
   git commit -m "Deploy game"
   git push origin main
   ```
   Then enable GitHub Pages in repository settings.

   Netlify/Vercel:
   - Connect repository
   - No build command needed
   - Publish directory: `.` (root)

## Game Controls

- **Arrow Keys** or **WASD**: Move left/right
- **Space** or **Up Arrow**: Jump
- **Mouse**: Navigate menus

## Gameplay Tips

### Mag1-3 (Easy)
- Wide platform gaps
- Slow-moving enemies
- Forgiving jump timing

### Mag4-6 (Medium)
- Moving platforms introduced
- More enemies with faster speeds
- Narrower gaps require better timing

### Mag7-9 (Hard)
- Precise jumps required
- Fast enemies
- Complex platform layouts
- Moving platforms with tight timing

### General Tips
- Jump on enemies from above to defeat them
- Collect all crystals for bonus points
- Use running jumps for longer distances
- Watch out for gaps and falling enemies

## Customization

### Modify Difficulty Settings

Edit `src/config.js`:

```javascript
levels: {
    mag1: {
        enemyCount: 2,     // Number of enemies
        enemySpeed: 50,    // Enemy movement speed
        crystalCount: 5,   // Number of crystals
        // ... more settings
    }
}
```

### Change Colors

Edit `src/config.js` colors:

```javascript
colors: {
    primary: 0xff00ff,    // Main pink color
    secondary: 0xaa00ff,  // Purple accent
    background: 0x1a0033, // Dark background
}
```

### Add Custom Levels

1. Add new level config in `src/config.js`
2. Create platform layouts in `GameScene.generateLevelPlatforms()`
3. Update level select to include new level

## Technologies Used

- **Phaser 3**: Game framework
- **HTML5 Canvas**: Rendering
- **JavaScript ES6**: Game logic
- **Discord OAuth2**: User authentication
- **LocalStorage**: Save data persistence

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires JavaScript enabled and HTML5 Canvas support.

## Troubleshooting

### Game doesn't load
- Check browser console for errors
- Ensure you're running from a web server (not `file://`)
- Clear browser cache and reload

### Discord login doesn't work
- Verify Client ID in `src/config.js`
- Check redirect URI matches Discord Developer Portal
- Ensure scopes are correctly set
- For local testing, use the "Connect with Discord" simulation

### Performance issues
- Disable browser extensions
- Close other tabs
- Try a different browser
- Check GPU acceleration is enabled

## Future Enhancements

- [ ] Add sound effects and music
- [ ] Implement power-ups (mushrooms, stars)
- [ ] Add more enemy types
- [ ] Create boss battles
- [ ] Leaderboard system
- [ ] Multiplayer race mode
- [ ] Mobile touch controls
- [ ] Level editor

## Credits

- Game developed for the Seismic Discord community
- Inspired by Super Mario Bros mechanics
- Built with Phaser 3 game framework

## License

MIT License - Feel free to modify and distribute

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

For issues or questions:
- Open a GitHub issue
- Contact via Discord
- Check the troubleshooting section above

---

**Enjoy playing Seismic Platformer!** 🎮✨
