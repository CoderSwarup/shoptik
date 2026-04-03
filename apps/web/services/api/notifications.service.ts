import { apiClient } from '@/lib/api-client'
import type { Notification } from '@/hooks/use-notifications'

interface ListNotificationsResponse {
  notifications: Notification[]
  total: number
  page: number
  limit: number
  unreadCount: number
}

interface UnreadCountResponse {
  count: number
}

export const notificationsService = {
  async getAll(page = 1, limit = 20): Promise<ListNotificationsResponse> {
    const { data } = await apiClient.get<ListNotificationsResponse>(
      `/notifications?page=${page}&limit=${limit}`
    )
    return data
  },

  async getUnreadCount(): Promise<number> {
    const { data } = await apiClient.get<UnreadCountResponse>('/notifications/unread-count')
    return data.count
  },

  async markAsRead(notificationId: string): Promise<void> {
    await apiClient.patch(`/notifications/${notificationId}/read`)
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.patch('/notifications/read-all')
  },
}
