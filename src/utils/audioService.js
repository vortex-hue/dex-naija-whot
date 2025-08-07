// Audio Service for Whot Game
// Uses Web Speech API to generate audio instructions

class AudioService {
  constructor() {
    this.synth = window.speechSynthesis;
    this.voices = [];
    this.currentVoice = null;
    this.volume = 0.8;
    this.rate = 0.9;
    this.pitch = 1.1;
    
    this.initVoices();
  }

  initVoices() {
    // Wait for voices to load
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => {
        this.voices = this.synth.getVoices();
        // Try to find a good English voice
        this.currentVoice = this.voices.find(voice => 
          voice.lang.includes('en') && (
            voice.name.toLowerCase().includes('british') ||
            voice.name.toLowerCase().includes('australian') ||
            voice.name.toLowerCase().includes('american')
          )
        ) || this.voices.find(voice => voice.lang.includes('en')) || this.voices[0];
      };
    }
  }

  speak(text, callback = null) {
    try {
      if (this.synth.speaking) {
        this.synth.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = this.currentVoice;
      utterance.volume = this.volume;
      utterance.rate = this.rate;
      utterance.pitch = this.pitch;
      
      if (callback) {
        utterance.onend = callback;
      }

      this.synth.speak(utterance);
    } catch (error) {
      console.log('Speech synthesis failed:', error);
    }
  }

  // Game instructions
  playGameStart() {
    this.speak("Welcome to Whot! The card game. Let's play!");
  }

  playYourTurn() {
    this.speak("It's your turn now. Make your move!");
  }

  playOpponentTurn() {
    this.speak("It's your opponent's turn. Wait for them to play.");
  }

  playInvalidMove() {
    this.speak("That move is not valid. Try again!");
  }

  playGameOver() {
    this.speak("Game over! Well played!");
  }

  playCardPlayed() {
    this.speak("Card played successfully!");
  }

  playMarket() {
    this.speak("Market! You can pick any card from the deck.");
  }

  playHold() {
    this.speak("Hold! You must pick a card from the deck.");
  }

  playGeneralRules() {
    this.speak(`
      Welcome to Whot! Here are the basic rules:
      You can play cards that match the shape or number of the active card.
      Special cards: Market lets you pick any card, Hold forces you to pick.
      The goal is to get rid of all your cards first.
      Good luck and enjoy the game!
    `);
  }

  playWelcomeMessage() {
    this.speak(`
      Welcome to Whot! The beloved card game.
      This game brings families and friends together.
      Let's have fun and play with style!
    `);
  }

  playVictory() {
    this.speak("Congratulations! You won! Well done!");
  }

  playDefeat() {
    this.speak("Better luck next time! Keep practicing!");
  }

  // Set volume
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  // Stop all speech
  stop() {
    this.synth.cancel();
  }
}

// Create global instance
const audioService = new AudioService();

export default audioService; 