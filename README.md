# Seismic Mag-Rush

A Mario-style platformer game featuring 9 difficulty levels (Mag1-Mag9) built for the Seismic Discord community.

## Game Features

### Core Gameplay
- **Side-scrolling platformer** with Mario-inspired physics
- **9 difficulty levels** labeled Mag1 through Mag9
  - Mag1-3: Easy levels with simple platforms and few enemies
  - Mag4-6: Medium difficulty with moving platforms and more enemies
  - Mag7-9: Hard levels requiring precise jumps and fast reflexes
- **Player mechanics**: Run, jump, double jump (Mag3+), collect crystals, stomp enemies
- **Lives system**: 3 lives per attempt
- **Level timer**: Complete each level before time runs out
- **Score tracking**: Earn points from crystals, enemy kills, time bonus, and combo chains

### Power-Ups and Mechanics
- **Power Crystals**: Collect to grow big and absorb one hit
- **Double Jump**: Unlocked on Mag3+ levels with spin animation
- **Combo System**: Chain enemy stomps for multiplied points
- **Variable Jump Height**: Tap for short hops, hold for full jumps

### Victory Stats Screen
- Animated score breakdown with base score, crystal bonus, time bonus, and lives bonus
- Performance rank (S / A / B / C) based on total score
- Personal best tracking with "NEW BEST!" indicator

### Visual Style
- Retro pixel art aesthetic
- Dark teal / maroon / warm beige color scheme matching Seismic branding
- Procedurally generated graphics (no external sprite assets needed)
- Particle effects: landing dust, screen shake, enemy defeat particles
- Tiered backgrounds that shift color by difficulty

### Enemies
- **Goomba-style**: Basic ground patrol enemies
- **Koopa-style**: Turtle-like enemies with shells
- Jump on enemies from above to defeat them
- Enemy count and speed scales with Mag level

### Sound
- Procedurally generated sound effects via Web Audio API
- Jump, double jump, collect, stomp, power-up, hurt, and level complete sounds

### Additional Features
- **Pause menu** (ESC key) with resume and quit options
- **Mobile touch controls** with on-screen D-pad and jump button
- **Save/Load system** via localStorage (high scores, completed levels, Discord auth)
- **3-2-1 countdown** before each level starts
- **Discord integration** for role-based level unlocking

### Discord Integration
- **OAuth authentication** to connect with Discord
- **Role-based level unlocking**: Players with Mag5 role unlock levels 1-5
- **Display username and avatar** from Discord
- See `DISCORD_SETUP.md` for full configuration guide

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
│   │   ├── Crystal.js     # Collectible crystals
│   │   └── PowerCrystal.js # Power-up crystal (grow big)
│   ├── scenes/
│   │   ├── BootScene.js       # Asset loading & procedural generation
│   │   ├── MainMenuScene.js   # Main menu
│   │   ├── LevelSelectScene.js # Level selection grid
│   │   └── GameScene.js       # Main gameplay
│   ├── utils/
│   │   ├── AssetGenerator.js  # Procedural sprite generation
│   │   └── SoundManager.js    # Web Audio API sound effects
│   └── discord/
│       └── DiscordAuth.js     # Discord OAuth integration
└── assets/
    └── images/
        └── seismic-crystal.jpg # Crystal collectible reference
```

## Setup Instructions

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd seismic-game-
   ```

2. **Serve the game locally**

   Using Node.js (http-server):
   ```bash
   npx http-server -p 8000
   ```

   Using Python 3:
   ```bash
   python -m http.server 8000
   ```

3. **Open in browser**
   ```
   http://localhost:8000
   ```

### Discord OAuth Setup (Optional)

See [DISCORD_SETUP.md](DISCORD_SETUP.md) for the full Discord integration guide.

### Production Deployment

No build step required - this is a static HTML/JS/CSS project.

**GitHub Pages:**
Push to GitHub and enable Pages in repository settings.

**Vercel / Netlify:**
Connect repository, no build command needed, publish directory: `.` (root).

## Game Controls

- **Arrow Keys**: Move left/right
- **Space** or **Up Arrow**: Jump (press again in air for double jump on Mag3+)
- **ESC**: Pause game
- **Mouse**: Navigate menus
- **Touch**: On-screen D-pad and jump button (mobile)

## Gameplay Tips

### Mag1-3 (Easy)
- Wide platform gaps, slow enemies
- Double jump unlocks at Mag3

### Mag4-6 (Medium)
- Moving platforms introduced
- More enemies with faster speeds
- Narrower gaps require better timing

### Mag7-9 (Hard)
- Precise jumps required
- Fast enemies, complex platform layouts
- Moving platforms with tight timing
- Short time limits

### General Tips
- Jump on enemies from above to defeat them
- Chain stomps quickly for combo multiplier bonus
- Collect Power Crystals to grow big and survive one extra hit
- Collect all crystals for maximum score
- Complete levels quickly for time bonus points

## Customization

### Modify Difficulty Settings

Edit `src/config.js`:

```javascript
levels: {
    mag1: {
        enemyCount: 2,     // Number of enemies
        enemySpeed: 50,    // Enemy movement speed
        crystalCount: 5,   // Number of crystals
        timeLimit: 120     // Seconds to complete
    }
}
```

### Change Colors

Edit `src/config.js` colors:

```javascript
colors: {
    primary: 0xc8a898,    // Warm beige
    secondary: 0x8b4a3a,  // Dusty rose
    accent: 0x6b2a2a,     // Maroon
    background: 0x0a1a1a, // Dark teal-black
}
```

## Technologies Used

- **Phaser 3**: Game framework
- **HTML5 Canvas**: Rendering
- **JavaScript ES6**: Game logic
- **Web Audio API**: Procedural sound effects
- **Discord OAuth2**: User authentication
- **localStorage**: Save data persistence

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
- See `DISCORD_SETUP.md` for detailed troubleshooting

### Performance issues
- Disable browser extensions
- Close other tabs
- Try a different browser
- Check GPU acceleration is enabled

## Future Enhancements

- [ ] Create boss battles
- [ ] Leaderboard system
- [ ] Multiplayer race mode
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
