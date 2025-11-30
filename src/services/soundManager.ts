import { Platform } from 'react-native';
import { createAudioPlayer, AudioPlayer } from 'expo-audio';

type SoundName = 'select' | 'transition' | 'win';

interface SoundItem {
  source: any;
  isLoaded: boolean;
  audio?: HTMLAudioElement; // For web
  player?: AudioPlayer; // For native (expo-audio)
}

class SoundManager {
  private sounds: Record<SoundName, SoundItem> = {
    select: { source: null, isLoaded: false },
    transition: { source: null, isLoaded: false },
    win: { source: null, isLoaded: false },
  };

  private getSoundFiles(): Record<SoundName, any> {
    try {
      return {
        select: require('../../assets/sounds/select.wav'),
        transition: require('../../assets/sounds/transition.wav'),
        win: require('../../assets/sounds/win.mp3'),
      };
    } catch (error) {
      console.warn('Failed to load sound files:', error);
      return {
        select: null,
        transition: null,
        win: null,
      };
    }
  }

  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('🎵 Initializing SoundManager...');

      // Load all sound files
      const soundFiles = this.getSoundFiles();
      
      for (const [name, soundFile] of Object.entries(soundFiles) as Array<[SoundName, any]>) {
        if (soundFile) {
          await this.loadSound(name, soundFile);
        }
      }

      this.isInitialized = true;
      console.log('✅ SoundManager initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize SoundManager:', error);
      this.isInitialized = false; // Mark as not initialized so we can try again later
    }
  }

  private async loadSound(name: SoundName, soundFile: any): Promise<void> {
    try {
      if (!soundFile) {
        console.warn(`❌ Sound file not found for '${name}'`);
        return;
      }

      // For web platform, create audio element
      if (Platform.OS === 'web') {
        const audio = new (window as any).Audio(soundFile);
        audio.preload = 'auto';
        this.sounds[name] = {
          source: soundFile,
          isLoaded: true,
          audio: audio,
        };
      } else {
        // For native platforms, create AudioPlayer with expo-audio
        const player = createAudioPlayer(soundFile);
        
        this.sounds[name] = {
          source: soundFile,
          isLoaded: true,
          player: player,
        };
      }

      console.log(`✅ Loaded sound: ${name}`);
    } catch (error) {
      console.error(`❌ Failed to load sound '${name}':`, error);
      this.sounds[name] = { source: null, isLoaded: false };
    }
  }

  async playSound(name: SoundName): Promise<void> {
    try {
      if (!this.isInitialized) {
        try {
          await this.initialize();
        } catch (error) {
          console.warn(`Failed to initialize sound manager:`, error);
          return; // Gracefully fail without crashing
        }
      }

      const soundItem = this.sounds[name];

      if (!soundItem.isLoaded || !soundItem.source) {
        console.warn(`❌ Sound '${name}' not loaded, skipping playback`);
        return; // Don't retry, just skip
      }

      // For web platform
      if (Platform.OS === 'web' && soundItem.audio) {
        soundItem.audio.currentTime = 0;
        soundItem.audio.play().catch((err: any) => {
          console.warn(`Failed to play ${name}:`, err);
        });
        console.log(`🔊 Playing sound (web): ${name}`);
      } else if (soundItem.player) {
        // For native platforms using expo-audio
        try {
          // Reset to beginning and play
          soundItem.player.seekTo(0);
          soundItem.player.play();
          console.log(`🔊 Playing sound (native): ${name}`);
        } catch (error) {
          console.warn(`Failed to play ${name}:`, error);
        }
      }
    } catch (error) {
      console.error(`❌ Error playing sound '${name}':`, error);
      // Don't throw - just log and continue
    }
  }

  async unloadSounds(): Promise<void> {
    console.log('🧹 Unloading sounds...');
    
    try {
      for (const [name, soundItem] of Object.entries(this.sounds) as Array<[SoundName, SoundItem]>) {
        if (soundItem.player) {
          // Release the audio player to prevent memory leaks
          soundItem.player.release();
          console.log(`✅ Unloaded sound: ${name}`);
        }
        soundItem.isLoaded = false;
      }
      this.isInitialized = false;
    } catch (error) {
      console.error('❌ Error unloading sounds:', error);
    }
  }

  // Alias for unloadSounds for backward compatibility
  async cleanup(): Promise<void> {
    return this.unloadSounds();
  }
}

// Export the singleton instance
export const soundManager = new SoundManager();

// Export the playSound function for backward compatibility
export const playSound = (name: SoundName): Promise<void> => {
  return soundManager.playSound(name);
};