import { api } from './api-client';

export async function getNotifications() {
  return api.get<Array<{ id: string; title: string; meta: string }>>('/notifications');
}
