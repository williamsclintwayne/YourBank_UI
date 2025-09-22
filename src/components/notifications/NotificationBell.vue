<template>
  <button
    @click="$emit('notificationClick')"
    class="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full transition-colors"
    :disabled="isLoading"
  >
    <BellIcon class="h-6 w-6" />
    <span
      v-if="unreadCount > 0"
      class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse"
    >
      {{ unreadCount > 99 ? '99+' : unreadCount }}
    </span>
    <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center">
      <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
    </div>
  </button>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { BellIcon } from '@heroicons/vue/24/outline';
import NotificationService from '../../services/notificationService';

defineEmits(['notificationClick']);

const unreadCount = ref(0);
const isLoading = ref(false);
let intervalId = null;

const fetchUnreadCount = async () => {
  try {
    isLoading.value = true;
    const data = await NotificationService.getNotifications(1, 1);
    unreadCount.value = data.pagination?.unreadCount || 0;
  } catch (error) {
    console.error('Error fetching notifications:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchUnreadCount();
  // Poll for new notifications every 30 seconds
  intervalId = setInterval(fetchUnreadCount, 30000);
});

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});
</script>
