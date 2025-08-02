<template>
  <div class="p-6 md:p-8 bg-light-grey-bg min-h-screen">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <h1 class="text-3xl font-bold font-heading text-deep-teal mb-2 md:mb-0">Profile View</h1>
      <button class="btn btn-secondary" @click="navigateBack">Back to Dashboard</button>
    </div>
    <p class="mb-8 text-medium-grey">
      Viewing profile for <span class="font-semibold text-deep-teal">{{ userName }}</span>.
    </p>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 card">
        <h2 class="text-2xl font-semibold font-heading text-deep-teal mb-4">Profile Details</h2>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-gray-100">
                <th class="border-b border-light-grey-border p-3 text-left text-sm font-semibold text-medium-grey uppercase">Field</th>
                <th class="border-b border-light-grey-border p-3 text-left text-sm font-semibold text-medium-grey uppercase">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="border-b border-light-grey-border p-3 text-sm text-charcoal">Name</td>
                <td class="border-b border-light-grey-border p-3 text-sm text-charcoal">{{ userName }}</td>
              </tr>
              <tr>
                <td class="border-b border-light-grey-border p-3 text-sm text-charcoal">Email</td>
                <td class="border-b border-light-grey-border p-3 text-sm text-charcoal">{{ userEmail }}</td>
              </tr>
              <tr>
                <td class="border-b border-light-grey-border p-3 text-sm text-charcoal">ID Number</td>
                <td class="border-b border-light-grey-border p-3 text-sm text-charcoal">{{ profile.idNumber }}</td>
              </tr>
              <tr>
                <td class="border-b border-light-grey-border p-3 text-sm text-charcoal">Cellphone</td>
                <td class="border-b border-light-grey-border p-3 text-sm text-charcoal">{{ profile.cellphone }}</td>
              </tr>
              <tr>
                <td class="border-b border-light-grey-border p-3 text-sm text-charcoal">Address</td>
                <td class="border-b border-light-grey-border p-3 text-sm text-charcoal">{{ profile.address }}</td>
              </tr>
              <tr>
                <td class="border-b border-light-grey-border p-3 text-sm text-charcoal">Title</td>
                <td class="border-b border-light-grey-border p-3 text-sm text-charcoal">{{ profile.title }}</td>
              </tr>
              <tr>
                <td class="border-b border-light-grey-border p-3 text-sm text-charcoal">Gender</td>
                <td class="border-b border-light-grey-border p-3 text-sm text-charcoal">{{ profile.gender }}</td>
              </tr>
              <tr>
                <td class="border-b border-light-grey-border p-3 text-sm text-charcoal">Employment Status</td>
                <td class="border-b border-light-grey-border p-3 text-sm text-charcoal">{{ profile.employmentStatus }}</td>
              </tr>
              <tr>
                <td class="border-b border-light-grey-border p-3 text-sm text-charcoal">Profile Picture</td>
                <td class="border-b border-light-grey-border p-3 text-sm text-charcoal">
                  <img v-if="profile.profilePicture" :src="profile.profilePicture" alt="Profile Picture" class="h-12 w-12 rounded-full object-cover" />
                  <span v-else>No picture</span>
                </td>
              </tr>
              <tr>
                <td class="border-b border-light-grey-border p-3 text-sm text-charcoal">Account Opened On</td>
                <td class="border-b border-light-grey-border p-3 text-sm text-charcoal">{{ profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const userName = ref('');
const userEmail = ref('');
const profile = ref({
  idNumber: '',
  address: '',
  cellphone: '',
  title: '',
  gender: '',
  employmentStatus: '',
  profilePicture: '',
  createdAt: '',
});

const router = useRouter();

const fetchProfile = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found. Please log in.');
    }

    // Fetch user basic info
    const userRes = await axios.get('/api/users/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
    userName.value = userRes.data.userId.name || 'User';
    userEmail.value = userRes.data.userId.email || 'user@example.com';

    // Fetch profile info for the logged-in user
    const profileRes = await axios.get('/api/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
    profile.value = {
      idNumber: profileRes.data.idNumber || '',
      address: profileRes.data.address || '',
      cellphone: profileRes.data.cellphone || '',
      title: profileRes.data.title || '',
      gender: profileRes.data.gender || '',
      employmentStatus: profileRes.data.employmentStatus || '',
      profilePicture: profileRes.data.profilePicture || '',
      createdAt: profileRes.data.createdAt || '',
    };
  } catch (error) {
    console.error('Error fetching profile:', error.response?.data?.message || error.message);
    alert(`Error fetching profile: ${error.response?.data?.message || error.message}`);
  }
};

const navigateBack = () => {
  router.push('/dashboard');
};

onMounted(() => {
  fetchProfile();
});
</script>

<style scoped>
</style>