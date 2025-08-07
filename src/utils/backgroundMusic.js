// Background Music Generator for Whot Game
// Creates a simple background rhythm using Web Audio API

class BackgroundMusicGenerator {
  constructor() {
    this.audioContext = null;
    this.isPlaying = false;
    this.volume = 0.3;
    this.interval = null;
  }

  init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  createDrumSound(frequency, duration, type = 'sine') {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  playRhythm() {
    if (!this.audioContext) {
      this.init();
    }

    if (this.isPlaying) return;
    
    this.isPlaying = true;
    let beatCount = 0;
    
    this.interval = setInterval(() => {
      const time = this.audioContext.currentTime;
      
      // Rhythm pattern (simplified)
      if (beatCount % 4 === 0) {
        // Bass drum
        this.createDrumSound(60, 0.1, 'sine');
      }
      
      if (beatCount % 2 === 1) {
        // Snare
        this.createDrumSound(200, 0.05, 'square');
      }
      
      if (beatCount % 8 === 0) {
        // High hat
        this.createDrumSound(800, 0.02, 'triangle');
      }
      
      // Melody notes (pentatonic scale)
      if (beatCount % 16 === 0) {
        this.createDrumSound(220, 0.3, 'sine'); // A
      } else if (beatCount % 16 === 4) {
        this.createDrumSound(247, 0.3, 'sine'); // B
      } else if (beatCount % 16 === 8) {
        this.createDrumSound(277, 0.3, 'sine'); // C#
      } else if (beatCount % 16 === 12) {
        this.createDrumSound(330, 0.3, 'sine'); // E
      }
      
      beatCount++;
    }, 500); // 120 BPM
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isPlaying = false;
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  // Create a simple welcome sound
  playWelcomeSound() {
    if (!this.audioContext) {
      this.init();
    }

    const time = this.audioContext.currentTime;
    
    // Play a welcome melody
    const notes = [220, 247, 277, 330, 370, 415, 440]; // A, B, C#, E, F#, G#, A
    
    notes.forEach((note, index) => {
      setTimeout(() => {
        this.createDrumSound(note, 0.5, 'sine');
      }, index * 200);
    });
  }
}

// Create global instance
const backgroundMusic = new BackgroundMusicGenerator();

export default backgroundMusic; 