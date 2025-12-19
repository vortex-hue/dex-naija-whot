import React, { useState, useEffect, useRef, useCallback } from 'react';
import audioService from '../../utils/audioService';
import backgroundMusic from '../../utils/backgroundMusic';
import './AudioControls.module.css';

const AudioControls = () => {
  const [isMusicOn, setIsMusicOn] = useState(true);
  const [isInstructionsOn, setIsInstructionsOn] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [usingAudioFile, setUsingAudioFile] = useState(true);

  const musicRef = useRef(null);

  const backgroundMusicUrl = '/audio/Sakura-Girl-Yay-chosic.com_.mp3';

  useEffect(() => {
    try {
      // Initialize background music
      if (musicRef.current) {
        musicRef.current.volume = volume * 0.2;
        musicRef.current.loop = true;
      }

      // Start music automatically on load
      if (isMusicOn) {
        if (musicRef.current) {
          musicRef.current.play().catch(error => {
            console.log('Audio file failed, falling back to generated music:', error);
            setUsingAudioFile(false);
            backgroundMusic.setVolume(volume * 0.2);
            backgroundMusic.playRhythm();
          });
        } else {
          // Fallback to generated music if audio element not ready
          setUsingAudioFile(false);
          backgroundMusic.setVolume(volume * 0.2);
          backgroundMusic.playRhythm();
        }
      }

      const audioNode = musicRef.current;
      return () => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        if (audioNode) {
          audioNode.pause();
        }
        backgroundMusic.stop();
      };
    } catch (error) {
      console.log('Audio initialization failed:', error);
    }
  }, [volume, isMusicOn]);

  // Start music immediately when component mounts


  const toggleMusic = () => {
    try {
      if (isMusicOn) {
        if (musicRef.current) {
          musicRef.current.pause();
        }
        backgroundMusic.stop();
      } else {
        if (musicRef.current) {
          musicRef.current.play().catch(error => {
            console.log('Audio file failed, falling back to generated music:', error);
            setUsingAudioFile(false);
            backgroundMusic.setVolume(volume * 0.2);
            backgroundMusic.playRhythm();
          });
        } else {
          setUsingAudioFile(false);
          backgroundMusic.setVolume(volume * 0.2);
          backgroundMusic.playRhythm();
        }
      }
      setIsMusicOn(!isMusicOn);
    } catch (error) {
      console.log('Music toggle failed:', error);
    }
  };

  const toggleInstructions = () => {
    setIsInstructionsOn(!isInstructionsOn);
  };



  const playInstruction = useCallback((instructionType) => {
    if (!isInstructionsOn) return;

    audioService.setVolume(volume);

    switch (instructionType) {
      case 'gameStart':
        audioService.playGameStart();
        break;
      case 'yourTurn':
        audioService.playYourTurn();
        break;
      case 'opponentTurn':
        audioService.playOpponentTurn();
        break;
      case 'invalidMove':
        audioService.playInvalidMove();
        break;
      case 'gameOver':
        audioService.playGameOver();
        break;
      case 'cardPlayed':
        audioService.playCardPlayed();
        break;
      case 'market':
        audioService.playMarket();
        break;
      case 'hold':
        audioService.playHold();
        break;
      case 'general':
        audioService.playGeneralRules();
        break;
      case 'victory':
        audioService.playVictory();
        break;
      case 'defeat':
        audioService.playDefeat();
        break;
      default:
        break;
    }
  }, [isInstructionsOn, volume]);

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    try {
      if (musicRef.current) {
        musicRef.current.volume = newVolume * 0.2;
      }
      backgroundMusic.setVolume(newVolume * 0.2); // Scale down for background music
    } catch (error) {
      console.log('Volume change failed:', error);
    }
  };

  // Expose playInstruction function globally for other components to use
  useEffect(() => {
    window.playWhotInstruction = playInstruction;
    window.backgroundMusic = backgroundMusic;
    return () => {
      delete window.playWhotInstruction;
      delete window.backgroundMusic;
    };
  }, [isInstructionsOn, volume, playInstruction]);

  return (
    <div className="audio-controls">
      {/* Hidden audio element */}
      <audio ref={musicRef} src={backgroundMusicUrl} preload="auto" />

      {/* Audio Controls UI */}
      <div className="audio-controls-panel">
        <div className="control-group">
          <button
            className={`control-btn ${isMusicOn ? 'active' : ''}`}
            onClick={toggleMusic}
            title="Toggle Background Music"
          >
            {isMusicOn ? '🔊' : '🔇'} Music {usingAudioFile ? '(File)' : '(Generated)'}
          </button>

          <button
            className={`control-btn ${isInstructionsOn ? 'active' : ''}`}
            onClick={toggleInstructions}
            title="Toggle Audio Instructions"
          >
            {isInstructionsOn ? '📢' : '🔇'} Instructions
          </button>
        </div>

        <div className="volume-control">
          <label htmlFor="volume">Volume:</label>
          <input
            id="volume"
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="volume-slider"
          />
        </div>

        <button
          className="control-btn help-btn"
          onClick={() => playInstruction('general')}
          title="Listen to Game Rules"
        >
          📖 Rules
        </button>
      </div>
    </div>
  );
};

export default AudioControls; 