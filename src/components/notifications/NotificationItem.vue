<template>
  <div
    class="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
    :class="{ 'bg-blue-50': !notification.isRead }"
    @click="handleClick"
  >
    <div class="flex justify-between items-start">
      <div class="flex-1 min-w-0">
        <div class="flex items-center space-x-2">
          <div
            v-if="!notification.isRead"
            class="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"
          ></div>
          <h4 class="text-sm font-medium text-gray-900 truncate">
            {{ notification.title }}
          </h4>
          <span
            class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
            :class="getTypeClass(notification.type)"
          >
            {{ notification.type }}
          </span>
        </div>
        <p class="mt-1 text-sm text-gray-600 line-clamp-2">
          {{ notification.message }}
        </p>
        <p class="mt-1 text-xs text-gray-400">
          {{ formatDate(notification.createdAt) }}
        </p>
      </div>
      <div class="flex items-center space-x-1 ml-2">
        <button
          v-if="!notification.isRead"
          @click.stop="$emit('markAsRead', notification._id)"
          class="p-1 text-blue-600 hover:text-blue-800 rounded"
          title="Mark as read"
        >
          <CheckIcon class="h-4 w-4" />
        </button>
        <button
          @click.stop="$emit('delete', notification._id)"
          class="p-1 text-red-600 hover:text-red-800 rounded"
          title="Delete"
        >
          <TrashIcon class="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { CheckIcon, TrashIcon } from '@heroicons/vue/24/outline';

const props = defineProps({
  notification: {
    type: Object,
    required: true
  }
});

defineEmits(['markAsRead', 'delete']);

const handleClick = () => {
  if (!props.notification.isRead) {
    // Auto-mark as read when clicked
    // This will be handled by the parent component
  }
};

const getTypeClass = (type) => {
  const classes = {
    'transaction': 'bg-green-100 text-green-800',
    'security': 'bg-red-100 text-red-800',
    'account': 'bg-blue-100 text-blue-800',
    'system': 'bg-gray-100 text-gray-800',
    'promotion': 'bg-purple-100 text-purple-800'
  };
  return classes[type] || 'bg-gray-100 text-gray-800';
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return date.toLocaleDateString();
};
</script>
