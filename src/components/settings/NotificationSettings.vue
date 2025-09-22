<template>
  <div class="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
    <h2 class="text-2xl font-bold mb-6 text-deep-teal">Notification Preferences</h2>
    
    <div v-if="isLoading" class="text-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-2 text-gray-500">Loading preferences...</p>
    </div>
    
    <div v-else class="space-y-4">
      <!-- Email Notifications -->
      <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div>
          <label class="text-sm font-medium text-gray-700">
            Email Notifications
          </label>
          <p class="text-xs text-gray-500">Receive notifications via email</p>
        </div>
        <input
          type="checkbox"
          v-model="preferences.email"
          class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
      </div>

      <!-- SMS Notifications -->
      <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div>
          <label class="text-sm font-medium text-gray-700">
            SMS Notifications
          </label>
          <p class="text-xs text-gray-500">Receive notifications via SMS</p>
        </div>
        <input
          type="checkbox"
          v-model="preferences.sms"
          class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
      </div>

      <!-- Phone Number (only show if SMS is enabled) -->
      <div v-if="preferences.sms" class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            v-model="phoneNumber"
            placeholder="1234567890"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p class="text-xs text-gray-500 mt-1">Enter digits only (no spaces or dashes)</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Carrier (for better SMS delivery)
          </label>
          <select
            v-model="carrier"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option
              v-for="c in carriers"
              :key="c.value"
              :value="c.value"
            >
              {{ c.label }}
            </option>
          </select>
        </div>
      </div>

      <!-- Notification Types -->
      <div class="space-y-3">
        <h3 class="text-sm font-medium text-gray-700">Notification Types</h3>
        
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Transaction Alerts</span>
            <input
              type="checkbox"
              v-model="notificationTypes.transactions"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
          
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Security Alerts</span>
            <input
              type="checkbox"
              v-model="notificationTypes.security"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
          
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Account Updates</span>
            <input
              type="checkbox"
              v-model="notificationTypes.account"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
          
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Promotions</span>
            <input
              type="checkbox"
              v-model="notificationTypes.promotions"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex space-x-3 mt-6">
        <button
          @click="handleSave"
          :disabled="isSaving"
          class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <span v-if="isSaving">Saving...</span>
          <span v-else>Save Preferences</span>
        </button>
        
        <button
          @click="handleTestNotification"
          :disabled="isTesting"
          class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <span v-if="isTesting">Testing...</span>
          <span v-else>Test</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import NotificationService from '../../services/notificationService';

const toast = useToast();

const preferences = ref({
  email: true,
  sms: false
});

const notificationTypes = ref({
  transactions: true,
  security: true,
  account: true,
  promotions: false
});

const phoneNumber = ref('');
const carrier = ref('verizon');
const isLoading = ref(false);
const isSaving = ref(false);
const isTesting = ref(false);

const carriers = [
  { value: 'verizon', label: 'Verizon' },
  { value: 'att', label: 'AT&T' },
  { value: 'tmobile', label: 'T-Mobile' },
  { value: 'sprint', label: 'Sprint' },
  { value: 'boost', label: 'Boost Mobile' },
  { value: 'cricket', label: 'Cricket' },
  { value: 'uscellular', label: 'US Cellular' }
];

const fetchPreferences = async () => {
  try {
    isLoading.value = true;
    const data = await NotificationService.getPreferences();
    preferences.value = data.preferences || preferences.value;
    notificationTypes.value = data.notificationTypes || notificationTypes.value;
    phoneNumber.value = data.phoneNumber || '';
    carrier.value = data.carrier || 'verizon';
  } catch (error) {
    console.error('Error loading preferences:', error);
    toast.error('Error loading preferences');
  } finally {
    isLoading.value = false;
  }
};

const handleSave = async () => {
  try {
    isSaving.value = true;
    await NotificationService.updatePreferences({
      email: preferences.value.email,
      sms: preferences.value.sms,
      phoneNumber: phoneNumber.value,
      carrier: carrier.value,
      notificationTypes: notificationTypes.value
    });
    toast.success('Notification preferences updated successfully');
  } catch (error) {
    console.error('Error updating preferences:', error);
    toast.error('Error updating preferences');
  } finally {
    isSaving.value = false;
  }
};

const handleTestNotification = async () => {
  try {
    isTesting.value = true;
    await NotificationService.sendTestNotification({
      title: 'Test Notification',
      message: 'This is a test notification from YourBank',
      sendEmail: preferences.value.email,
      sendSMS: preferences.value.sms
    });
    toast.success('Test notification sent!');
  } catch (error) {
    console.error('Error sending test notification:', error);
    toast.error('Error sending test notification');
  } finally {
    isTesting.value = false;
  }
};

onMounted(() => {
  fetchPreferences();
});
</script>
