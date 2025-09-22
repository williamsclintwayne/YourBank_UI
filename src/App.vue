<script setup>
import { useNotifications } from './composables/useNotifications';

// Initialize real-time notifications
const { isConnected } = useNotifications();
</script>

<template>
  <div id="app-container">
    <router-view />
    
    <!-- Connection status indicator (optional - for debugging) -->
    <div 
      v-if="false" 
      class="fixed bottom-4 right-4 px-3 py-1 rounded-full text-xs"
      :class="isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
    >
      {{ isConnected ? 'Connected' : 'Disconnected' }}
    </div>
  </div>
</template>

<style>
</style>
