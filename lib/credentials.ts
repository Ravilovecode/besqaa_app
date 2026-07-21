import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Saved sign-in credentials for the "Remember me" option.
// Native: expo-secure-store (iOS Keychain / Android Keystore — encrypted).
// Web: SecureStore is unavailable, fall back to AsyncStorage.

const EMAIL_KEY = 'besqaa_saved_email';
const PASSWORD_KEY = 'besqaa_saved_password';

const useSecure = Platform.OS !== 'web';

async function setItem(key: string, value: string) {
  if (useSecure) return SecureStore.setItemAsync(key, value);
  return AsyncStorage.setItem(key, value);
}

async function getItem(key: string): Promise<string | null> {
  if (useSecure) return SecureStore.getItemAsync(key);
  return AsyncStorage.getItem(key);
}

async function deleteItem(key: string) {
  if (useSecure) return SecureStore.deleteItemAsync(key);
  return AsyncStorage.removeItem(key);
}

export async function saveCredentials(email: string, password: string): Promise<void> {
  try {
    await Promise.all([setItem(EMAIL_KEY, email), setItem(PASSWORD_KEY, password)]);
  } catch {
    // Saving convenience credentials must never break login.
  }
}

export async function loadCredentials(): Promise<{ email: string; password: string } | null> {
  try {
    const [email, password] = await Promise.all([getItem(EMAIL_KEY), getItem(PASSWORD_KEY)]);
    if (email && password) return { email, password };
    return null;
  } catch {
    return null;
  }
}

export async function clearCredentials(): Promise<void> {
  try {
    await Promise.all([deleteItem(EMAIL_KEY), deleteItem(PASSWORD_KEY)]);
  } catch {
    /* ignore */
  }
}
