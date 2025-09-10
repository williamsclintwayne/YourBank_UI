<template>
  <div class="p-6 md:p-8 bg-light-grey-bg min-h-screen">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <h1 class="text-3xl font-bold font-heading text-deep-teal mb-2 md:mb-0">Notification Settings</h1>
      <button class="btn btn-secondary" @click="navigateBack">Back to Dashboard</button>
    </div>
    
    <div class="max-w-2xl mx-auto">
      <NotificationSettings />
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import NotificationSettings from '../components/settings/NotificationSettings.vue';

const router = useRouter();

const navigateBack = () => {
  router.push('/dashboard');
};
</script>
