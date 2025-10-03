import { Platform } from 'react-native';
import { Audio } from 'expo-av';

type SoundName = 'select' | 'transition' | 'win';

interface SoundItem {
  source: any;
  isLoaded: boolean;
  audio?: HTMLAudioElement; // For web
  sound?: Audio.Sound; // For native
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

      // Configure audio mode for native platforms
      if (Platform.OS !== 'web') {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });
      }

      // Preload all sounds
      await Promise.all([
        this.loadSound('select'),
        this.loadSound('transition'),
        this.loadSound('win'),
      ]);

      this.isInitialized = true;
      console.log('✅ SoundManager initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize SoundManager:', error);
    }
  }

  private async loadSound(name: SoundName): Promise<void> {
    try {
      if (this.sounds[name].isLoaded) return;

      const soundFiles = this.getSoundFiles();
      const soundFile = soundFiles[name];

      if (!soundFile) {
        console.warn(`❌ Sound file not found for '${name}'`);
        return;
      }

      // For web platform, create audio element
      if (Platform.OS === 'web') {
        const audio = new Audio(soundFile);
        audio.preload = 'auto';
        this.sounds[name] = {
          source: soundFile,
          isLoaded: true,
          audio: audio,
        };
      } else {
        // For native platforms, load with expo-av
        const { sound } = await Audio.Sound.createAsync(soundFile, {
          shouldPlay: false,
          volume: 1.0,
        });

        this.sounds[name] = {
          source: soundFile,
          isLoaded: true,
          sound: sound,
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
        await this.initialize();
      }

      const soundItem = this.sounds[name];

      if (!soundItem.isLoaded || !soundItem.source) {
        console.warn(`❌ Sound '${name}' not loaded, attempting to load...`);
        await this.loadSound(name);
        return this.playSound(name); // Retry after loading
      }

      // For web platform
      if (Platform.OS === 'web' && soundItem.audio) {
        soundItem.audio.currentTime = 0;
        soundItem.audio.play().catch(err => {
          console.error(`Failed to play ${name}:`, err);
        });
        console.log(`🔊 Playing sound (web): ${name}`);
      } else if (soundItem.sound) {
        // For native platforms
        await soundItem.sound.replayAsync();
        console.log(`🔊 Playing sound (native): ${name}`);
      }
    } catch (error) {
      console.error(`❌ Failed to play sound '${name}':`, error);
    }
  }

  async cleanup(): Promise<void> {
    try {
      // Cleanup audio elements for web
      if (Platform.OS === 'web') {
        Object.values(this.sounds).forEach(item => {
          if (item.audio) {
            item.audio.pause();
            item.audio = undefined;
          }
        });
      } else {
        // Cleanup expo-av sounds for native
        await Promise.all(
          Object.values(this.sounds).map(async item => {
            if (item.sound) {
              await item.sound.unloadAsync();
              item.sound = undefined;
            }
          })
        );
      }

      // Reset state
      this.sounds = {
        select: { source: null, isLoaded: false },
        transition: { source: null, isLoaded: false },
        win: { source: null, isLoaded: false },
      };
      this.isInitialized = false;

      console.log('✅ SoundManager cleaned up');
    } catch (error) {
      console.error('❌ Failed to cleanup SoundManager:', error);
    }
  }

  // Utility method to check if sounds are ready
  isReady(): boolean {
    return this.isInitialized && Object.values(this.sounds).every(item => item.isLoaded);
  }

  // Method to preload a specific sound if needed
  async preloadSound(name: SoundName): Promise<void> {
    if (!this.sounds[name].isLoaded) {
      await this.loadSound(name);
    }
  }
}

// Export singleton instance
export const soundManager = new SoundManager();

// Export convenience function for easy usage
export const playSound = (name: SoundName) => soundManager.playSound(name);
