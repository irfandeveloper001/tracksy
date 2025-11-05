import { Platform } from 'react-native';

// Voice prompts for navigation
// Note: Full Text-to-Speech requires expo-speech or react-native-tts

class VoiceService {
  private isEnabled: boolean = true;

  // Enable/disable voice prompts
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  isVoiceEnabled(): boolean {
    return this.isEnabled;
  }

  // Announce next stop (placeholder - requires TTS library)
  async announceNextStop(stopName: string, distance: number): Promise<void> {
    if (!this.isEnabled) return;

    const distanceText = distance < 1000 ? `${Math.round(distance)} meters` : `${(distance / 1000).toFixed(1)} kilometers`;
    const message = `Next stop: ${stopName} in ${distanceText}`;

    // TODO: Implement with expo-speech or react-native-tts
    console.log('Voice announcement:', message);
    
    // Example with expo-speech:
    // import * as Speech from 'expo-speech';
    // Speech.speak(message, {
    //   language: 'en',
    //   pitch: 1.0,
    //   rate: 1.0,
    // });
  }

  // Announce stop arrival
  async announceStopArrival(stopName: string): Promise<void> {
    if (!this.isEnabled) return;

    const message = `Arriving at ${stopName}`;
    console.log('Voice announcement:', message);
    
    // TODO: Implement with TTS library
  }

  // Announce route change
  async announceRouteChange(routeName: string): Promise<void> {
    if (!this.isEnabled) return;

    const message = `Route changed to ${routeName}`;
    console.log('Voice announcement:', message);
    
    // TODO: Implement with TTS library
  }

  // Announce emergency
  async announceEmergency(emergencyType: string): Promise<void> {
    if (!this.isEnabled) return;

    const message = `Emergency alert: ${emergencyType}`;
    console.log('Voice announcement:', message);
    
    // TODO: Implement with TTS library
  }
}

export default new VoiceService();

