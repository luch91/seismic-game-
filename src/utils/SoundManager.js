// SoundManager - Procedural audio generation using Web Audio API
class SoundManager {
    constructor() {
        this.audioContext = null;
        this.initialized = false;
        this.musicPlaying = false;
        this.musicGain = null;
        this.musicOscillators = [];
    }

    init() {
        if (this.initialized) return;

        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
            console.log('SoundManager initialized');
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
        }
    }

    // Resume audio context (needed for browsers that require user interaction)
    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    // Play jump sound - quick ascending tone
    playJump() {
        if (!this.initialized) return;
        this.resume();

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.type = 'square';
        osc.frequency.setValueAtTime(300, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.1);

        gain.gain.setValueAtTime(0.15, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);

        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.15);
    }

    // Play collect sound - magical sparkle/chime
    playCollect() {
        if (!this.initialized) return;
        this.resume();

        // Play a nice arpeggio of notes
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

        notes.forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);

            const startTime = this.audioContext.currentTime + i * 0.05;
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.12, startTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

            osc.start(startTime);
            osc.stop(startTime + 0.3);
        });
    }

    // Play power-up sound - triumphant ascending melody
    playPowerUp() {
        if (!this.initialized) return;
        this.resume();

        // Ascending power-up melody
        const notes = [261.63, 329.63, 392, 523.25, 659.25, 783.99]; // C4 to G5

        notes.forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);

            const startTime = this.audioContext.currentTime + i * 0.08;
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.12, startTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);

            osc.start(startTime);
            osc.stop(startTime + 0.15);
        });
    }

    // Play enemy defeat sound - satisfying squash
    playEnemyDefeat(multiplier = 1) {
        if (!this.initialized) return;
        this.resume();

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        // Higher pitch for higher multipliers
        const baseFreq = 400 + (multiplier - 1) * 100;
        osc.type = 'square';
        osc.frequency.setValueAtTime(baseFreq, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.2);

        gain.gain.setValueAtTime(0.15, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);

        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.2);

        // Add extra "ding" for combo kills
        if (multiplier > 1) {
            const ding = this.audioContext.createOscillator();
            const dingGain = this.audioContext.createGain();
            ding.connect(dingGain);
            dingGain.connect(this.audioContext.destination);
            ding.type = 'sine';
            ding.frequency.setValueAtTime(880 * multiplier, this.audioContext.currentTime + 0.1);
            dingGain.gain.setValueAtTime(0.1, this.audioContext.currentTime + 0.1);
            dingGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
            ding.start(this.audioContext.currentTime + 0.1);
            ding.stop(this.audioContext.currentTime + 0.3);
        }
    }

    // Play hurt sound - ouch!
    playHurt() {
        if (!this.initialized) return;
        this.resume();

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, this.audioContext.currentTime + 0.3);

        gain.gain.setValueAtTime(0.12, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.3);
    }

    // Play level complete sound - victory fanfare
    playLevelComplete() {
        if (!this.initialized) return;
        this.resume();

        // Victory fanfare notes
        const melody = [
            { freq: 523.25, time: 0, duration: 0.15 },      // C5
            { freq: 659.25, time: 0.15, duration: 0.15 },   // E5
            { freq: 783.99, time: 0.3, duration: 0.15 },    // G5
            { freq: 1046.50, time: 0.45, duration: 0.4 },   // C6 (held)
        ];

        melody.forEach(note => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            osc.type = 'square';
            osc.frequency.setValueAtTime(note.freq, this.audioContext.currentTime);

            const startTime = this.audioContext.currentTime + note.time;
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.15, startTime + 0.02);
            gain.gain.setValueAtTime(0.15, startTime + note.duration - 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + note.duration);

            osc.start(startTime);
            osc.stop(startTime + note.duration);
        });
    }

    // Play game over sound - sad descending tones
    playGameOver() {
        if (!this.initialized) return;
        this.resume();

        const melody = [
            { freq: 392, time: 0, duration: 0.3 },      // G4
            { freq: 349.23, time: 0.3, duration: 0.3 }, // F4
            { freq: 329.63, time: 0.6, duration: 0.3 }, // E4
            { freq: 261.63, time: 0.9, duration: 0.5 }, // C4 (held)
        ];

        melody.forEach(note => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(note.freq, this.audioContext.currentTime);

            const startTime = this.audioContext.currentTime + note.time;
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.12, startTime + 0.02);
            gain.gain.setValueAtTime(0.12, startTime + note.duration - 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + note.duration);

            osc.start(startTime);
            osc.stop(startTime + note.duration);
        });
    }

    // Play menu select sound
    playMenuSelect() {
        if (!this.initialized) return;
        this.resume();

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, this.audioContext.currentTime);
        osc.frequency.setValueAtTime(880, this.audioContext.currentTime + 0.05);

        gain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.1);
    }

    // Play menu hover sound
    playMenuHover() {
        if (!this.initialized) return;
        this.resume();

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, this.audioContext.currentTime);

        gain.gain.setValueAtTime(0.05, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);

        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.05);
    }

    // Start background music - simple looping melody
    startMusic(type = 'menu') {
        if (!this.initialized || this.musicPlaying) return;
        this.resume();

        this.musicPlaying = true;
        this.musicGain = this.audioContext.createGain();
        this.musicGain.gain.setValueAtTime(0.08, this.audioContext.currentTime);
        this.musicGain.connect(this.audioContext.destination);

        if (type === 'menu') {
            this.playMenuMusic();
        } else if (type === 'game') {
            this.playGameMusic();
        }
    }

    playMenuMusic() {
        // Ambient pad sound for menu
        const baseFreq = 130.81; // C3
        const chordFreqs = [1, 1.25, 1.5, 2]; // C major-ish chord

        chordFreqs.forEach(mult => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(baseFreq * mult, this.audioContext.currentTime);

            gain.gain.setValueAtTime(0.03, this.audioContext.currentTime);

            osc.connect(gain);
            gain.connect(this.musicGain);

            osc.start(this.audioContext.currentTime);
            this.musicOscillators.push({ osc, gain });
        });

        // Add subtle LFO for movement
        const lfo = this.audioContext.createOscillator();
        const lfoGain = this.audioContext.createGain();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.5, this.audioContext.currentTime);
        lfoGain.gain.setValueAtTime(0.01, this.audioContext.currentTime);

        lfo.connect(lfoGain);
        if (this.musicOscillators[0]) {
            lfoGain.connect(this.musicOscillators[0].gain.gain);
        }
        lfo.start(this.audioContext.currentTime);
        this.musicOscillators.push({ osc: lfo, gain: lfoGain });
    }

    playGameMusic() {
        // More upbeat arpeggiated pattern for gameplay
        const bpm = 140;
        const beatDuration = 60 / bpm;

        // Simple bass line pattern
        const bassPattern = [130.81, 130.81, 164.81, 146.83]; // C3, C3, E3, D3
        let currentBeat = 0;

        const playBassNote = () => {
            if (!this.musicPlaying) return;

            const freq = bassPattern[currentBeat % bassPattern.length];
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);

            gain.gain.setValueAtTime(0.06, this.audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + beatDuration * 0.8);

            osc.connect(gain);
            gain.connect(this.musicGain);

            osc.start(this.audioContext.currentTime);
            osc.stop(this.audioContext.currentTime + beatDuration);

            currentBeat++;

            if (this.musicPlaying) {
                setTimeout(playBassNote, beatDuration * 1000);
            }
        };

        playBassNote();

        // Add hi-hat pattern
        let hihatBeat = 0;
        const playHihat = () => {
            if (!this.musicPlaying) return;

            // Create noise for hi-hat
            const bufferSize = this.audioContext.sampleRate * 0.05;
            const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noise = this.audioContext.createBufferSource();
            noise.buffer = buffer;

            const hihatFilter = this.audioContext.createBiquadFilter();
            hihatFilter.type = 'highpass';
            hihatFilter.frequency.setValueAtTime(8000, this.audioContext.currentTime);

            const hihatGain = this.audioContext.createGain();
            hihatGain.gain.setValueAtTime(hihatBeat % 2 === 0 ? 0.04 : 0.02, this.audioContext.currentTime);
            hihatGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.05);

            noise.connect(hihatFilter);
            hihatFilter.connect(hihatGain);
            hihatGain.connect(this.musicGain);

            noise.start(this.audioContext.currentTime);

            hihatBeat++;

            if (this.musicPlaying) {
                setTimeout(playHihat, (beatDuration / 2) * 1000);
            }
        };

        playHihat();
    }

    // Stop background music
    stopMusic() {
        if (!this.musicPlaying) return;

        this.musicPlaying = false;

        // Fade out and stop all oscillators
        this.musicOscillators.forEach(({ osc, gain }) => {
            try {
                gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5);
                osc.stop(this.audioContext.currentTime + 0.5);
            } catch (e) {
                // Oscillator might already be stopped
            }
        });

        this.musicOscillators = [];

        if (this.musicGain) {
            this.musicGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5);
        }
    }

    // Play landing thud — short low-frequency thump
    playLand() {
        if (!this.initialized) return;
        this.resume();

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(80, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, this.audioContext.currentTime + 0.08);

        gain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);

        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.1);
    }

    // Play pause open — soft descending whoosh
    playPauseOpen() {
        if (!this.initialized) return;
        this.resume();

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.15);

        gain.gain.setValueAtTime(0.08, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);

        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.2);
    }

    // Play pause close — soft ascending whoosh
    playPauseClose() {
        if (!this.initialized) return;
        this.resume();

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.15);

        gain.gain.setValueAtTime(0.08, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);

        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.2);
    }

    // Play speed boost — quick ascending shimmer
    playSpeedBoost() {
        if (!this.initialized) return;
        this.resume();

        const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
        notes.forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            osc.type = 'sawtooth';
            const startTime = this.audioContext.currentTime + i * 0.04;
            osc.frequency.setValueAtTime(freq, startTime);
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.08, startTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12);
            osc.start(startTime);
            osc.stop(startTime + 0.12);
        });
    }

    // Play invincibility star — triumphant repeating jingle
    playInvincibilityStar() {
        if (!this.initialized) return;
        this.resume();

        const melody = [
            { freq: 783.99, time: 0 },     // G5
            { freq: 987.77, time: 0.08 },   // B5
            { freq: 1174.66, time: 0.16 },  // D6
            { freq: 1567.98, time: 0.24 },  // G6
            { freq: 1174.66, time: 0.32 },  // D6
            { freq: 1567.98, time: 0.40 },  // G6
        ];

        melody.forEach(note => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            osc.type = 'square';
            const startTime = this.audioContext.currentTime + note.time;
            osc.frequency.setValueAtTime(note.freq, startTime);
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.1, startTime + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.1);
            osc.start(startTime);
            osc.stop(startTime + 0.1);
        });
    }

    // Play timer warning — urgent beep
    playTimerWarning() {
        if (!this.initialized) return;
        this.resume();

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        osc.type = 'square';
        osc.frequency.setValueAtTime(1000, this.audioContext.currentTime);
        gain.gain.setValueAtTime(0.08, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.1);
    }

    // Play double jump — higher-pitched airy whoosh
    playDoubleJump() {
        if (!this.initialized) return;
        this.resume();

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(900, this.audioContext.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.15);
        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.15);

        // Add a subtle noise burst for the "air puff" feel
        const osc2 = this.audioContext.createOscillator();
        const gain2 = this.audioContext.createGain();
        osc2.connect(gain2);
        gain2.connect(this.audioContext.destination);
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(300, this.audioContext.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.1);
        gain2.gain.setValueAtTime(0.06, this.audioContext.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.12);
        osc2.start(this.audioContext.currentTime);
        osc2.stop(this.audioContext.currentTime + 0.12);
    }

    // Set music volume (0-1)
    setMusicVolume(volume) {
        if (this.musicGain) {
            this.musicGain.gain.setValueAtTime(volume * 0.08, this.audioContext.currentTime);
        }
    }
}

// Create global sound manager instance
const soundManager = new SoundManager();
