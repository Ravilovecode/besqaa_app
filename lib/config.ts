import { Platform } from 'react-native';

/**
 * Base URL of the Besqaa backend.
 *
 * The right host depends on where the app runs:
 *  - iOS simulator / web           → localhost
 *  - Android emulator              → 10.0.2.2 (emulator alias for your machine)
 *  - Physical phone via Expo Go    → your computer's LAN IP, e.g. http://192.168.1.5:5000/api
 *
 * Override any time by creating a `.env` file at the project root with:
 *   EXPO_PUBLIC_API_URL=http://192.168.1.5:5000/api
 */
function defaultApiUrl(): string {
  if (Platform.OS === 'android') return 'http://10.0.2.2:5000/api';
  return 'http://localhost:5000/api';
}

export const API_URL = process.env.EXPO_PUBLIC_API_URL || defaultApiUrl();
