import { api } from './api-client';

export async function getSettings() {
  return api.get<{ darkMode: boolean; notificationPreferences: string[]; language: string; security: string }>('/settings');
}

export async function updateSettings(payload: unknown) {
  return api.patch<unknown>('/settings', payload);
}
