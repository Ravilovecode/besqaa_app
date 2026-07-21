import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './config';

const TOKEN_KEY = 'besqaa_token';

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}
export async function setToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}
export async function clearToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

type Options = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  auth?: boolean; // attach token if available
};

async function request<T>(path: string, opts: Options = {}): Promise<T> {
  const { method = 'GET', body, auth = true } = opts;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (auth) {
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error(
      `Cannot reach the server at ${API_URL}. Is the backend running and the API URL correct?`
    );
  }

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    // Attach the response payload so callers can branch on structured errors
    // (e.g. login returning 403 requiresVerification with a pendingId).
    const err = new Error(data.message || `Request failed (${res.status})`) as Error & {
      status?: number;
      data?: unknown;
    };
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data as T;
}

export const api = {
  get: <T>(path: string, auth = true) => request<T>(path, { method: 'GET', auth }),
  post: <T>(path: string, body?: unknown, auth = true) =>
    request<T>(path, { method: 'POST', body, auth }),
  put: <T>(path: string, body?: unknown, auth = true) =>
    request<T>(path, { method: 'PUT', body, auth }),
  del: <T>(path: string, auth = true) => request<T>(path, { method: 'DELETE', auth }),
};

// Multipart upload of a local image (from expo-image-picker) to the backend.
// Note: don't set Content-Type manually — fetch adds the multipart boundary.
export async function uploadImage<T>(
  path: string,
  fieldName: string,
  localUri: string
): Promise<T> {
  const token = await getToken();
  const name = localUri.split('/').pop() || 'photo.jpg';
  const ext = (name.split('.').pop() || 'jpg').toLowerCase();
  const type = `image/${ext === 'jpg' ? 'jpeg' : ext}`;

  const form = new FormData();
  form.append(fieldName, { uri: localUri, name, type } as unknown as Blob);

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: form,
    });
  } catch {
    throw new Error(`Cannot reach the server at ${API_URL}.`);
  }

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(data.message || `Upload failed (${res.status})`);
  return data as T;
}
