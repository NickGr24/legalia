import { AudioPlayer, createAudioPlayer } from 'expo-audio';
import { Platform } from 'react-native';

type SoundName = 'select' | 'transition' | 'win';

interface SoundItem {
  player: AudioPlayer | null;
  isLoaded: boolean;
}

class SoundManager {
  private sounds: Record<SoundName, SoundItem> = {
    select: { player: null, isLoaded: false },
    transition: { player: null, isLoaded: false },
    win: { player: null, isLoaded: false },
  };

  private soundFiles: Record<SoundName, any> = {
    select: require('../../assets/sounds/select.wav'),
    transition: require('../../assets/sounds/transition.wav'),
    win: require('../../assets/sounds/win.mp3'),
  };

  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {

      // Preload all sounds
      await Promise.all([
        this.loadSound('select'),
        this.loadSound('transition'),
        this.loadSound('win'),
      ]);

      this.isInitialized = true;
    } catch (error) {
      console.error('❌ Failed to initialize SoundManager:', error);
    }
  }

  private async loadSound(name: SoundName): Promise<void> {
    try {
      if (this.sounds[name].isLoaded) return;

      const player = createAudioPlayer(this.soundFiles[name]);

      this.sounds[name] = {
        player,
        isLoaded: true,
      };

    } catch (error) {
      console.error(`❌ Failed to load sound '${name}':`, error);
      this.sounds[name] = { player: null, isLoaded: false };
    }
  }

  async playSound(name: SoundName): Promise<void> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const soundItem = this.sounds[name];
      
      if (!soundItem.isLoaded || !soundItem.player) {
        await this.loadSound(name);
        return this.playSound(name); // Retry after loading
      }

      // Stop any currently playing instance and replay from start
      if (soundItem.player.playing) {
        soundItem.player.pause();
      }
      soundItem.player.seekTo(0);
      soundItem.player.play();
      
    } catch (error) {
      console.error(`❌ Failed to play sound '${name}':`, error);
    }
  }

  async cleanup(): Promise<void> {
    try {
      const cleanupPromises = Object.entries(this.sounds).map(async ([name, soundItem]) => {
        if (soundItem.player) {
          try {
            soundItem.player.release();
          } catch (error) {
            console.error(`❌ Failed to unload sound '${name}':`, error);
          }
        }
      });

      await Promise.all(cleanupPromises);
      
      // Reset state
      this.sounds = {
        select: { player: null, isLoaded: false },
        transition: { player: null, isLoaded: false },
        win: { player: null, isLoaded: false },
      };
      this.isInitialized = false;
      
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