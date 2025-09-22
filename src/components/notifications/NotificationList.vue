<template>
  <div
    v-if="isOpen"
    class="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
  >
    <div class="p-4 border-b border-gray-200 flex justify-between items-center">
      <h3 class="text-lg font-semibold text-deep-teal">Notifications</h3>
      <div class="flex space-x-2">
        <button
          v-if="pagination.unreadCount > 0"
          @click="handleMarkAllAsRead"
          class="text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          Mark all read
        </button>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 text-xl leading-none"
        >
          ×
        </button>
      </div>
    </div>
    
    <div class="max-h-96 overflow-y-auto">
      <div v-if="isLoading" class="p-4 text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-2 text-gray-500">Loading...</p>
      </div>
      <div v-else-if="notifications.length === 0" class="p-4 text-center text-gray-500">
        <BellIcon class="h-12 w-12 mx-auto text-gray-300 mb-2" />
        <p>No notifications yet</p>
      </div>
      <div v-else>
        <NotificationItem
          v-for="notification in notifications"
          :key="notification._id"
          :notification="notification"
          @mark-as-read="handleMarkAsRead"
          @delete="handleDelete"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { BellIcon } from '@heroicons/vue/24/outline';
import NotificationService from '../../services/notificationService';
import NotificationItem from './NotificationItem.vue';

const props = defineProps({
  isOpen: Boolean
});

defineEmits(['close']);

const notifications = ref([]);
const isLoading = ref(false);
const pagination = ref({});

const fetchNotifications = async () => {
  try {
    isLoading.value = true;
    const data = await NotificationService.getNotifications();
    notifications.value = data.notifications || [];
    pagination.value = data.pagination || {};
  } catch (error) {
    console.error('Error fetching notifications:', error);
  } finally {
    isLoading.value = false;
  }
};

const handleMarkAsRead = async (notificationId) => {
  try {
    await NotificationService.markAsRead(notificationId);
    notifications.value = notifications.value.map(notif => 
      notif._id === notificationId 
        ? { ...notif, isRead: true }
        : notif
    );
    pagination.value.unreadCount = Math.max(0, pagination.value.unreadCount - 1);
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

const handleMarkAllAsRead = async () => {
  try {
    await NotificationService.markAllAsRead();
    notifications.value = notifications.value.map(notif => ({ ...notif, isRead: true }));
    pagination.value.unreadCount = 0;
  } catch (error) {
    console.error('Error marking all as read:', error);
  }
};

const handleDelete = async (notificationId) => {
  try {
    await NotificationService.deleteNotification(notificationId);
    notifications.value = notifications.value.filter(notif => notif._id !== notificationId);
  } catch (error) {
    console.error('Error deleting notification:', error);
  }
};

watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    fetchNotifications();
  }
});
</script>
