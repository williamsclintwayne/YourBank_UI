<template>
  <div class="update-profile-container p-6 md:p-8 bg-light-grey-bg min-h-screen">
    <h1 class="text-3xl font-bold font-heading text-deep-teal mb-6">Update Profile</h1>
    <form @submit.prevent="updateProfile" class="card max-w-lg mx-auto space-y-4">
      <div class="form-group">
        <label for="address" class="label">Address</label>
        <input v-model="profile.address" id="address" type="text" class="input-field" required />
      </div>
      <div class="form-group">
        <label for="cellphone" class="label">Cellphone Number</label>
        <input v-model="profile.cellphone" id="cellphone" type="text" class="input-field" required />
      </div>
      <div class="form-group">
        <label for="employmentStatus" class="label">Employment Status</label>
        <select v-model="profile.employmentStatus" id="employmentStatus" class="input-field">
          <option value="" disabled>Select Status</option>
          <option value="Employed">Employed</option>
          <option value="Unemployed">Unemployed</option>
          <option value="Student">Student</option>
        </select>
      </div>
      <div class="flex justify-between mt-6">
          <button type="button" class="btn btn-secondary" @click="goBack">Cancel</button>
          <button type="submit" class="btn btn-primary">Save Changes</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const profile = ref({
  address: '',
  cellphone: '',
  employmentStatus: '',
});

const router = useRouter();

const fetchProfile = async () => {
  try {
    const token = localStorage.getItem('token');
    // Use relative URL assuming axios baseURL is set
    const response = await axios.get('/api/users/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
    // Adjust based on actual API response structure
    const userData = response.data.userId || response.data; // Handle potential nesting
    profile.value = {
      address: userData.address || '',
      cellphone: userData.cellphone || '',
      employmentStatus: userData.employmentStatus || '',
    };
  } catch (error) {
    console.error('Error fetching profile:', error.message);
    alert('Failed to load profile. Please try again.');
     // Redirect if unauthorized
     if (error.response?.status === 401) {
        router.push('/login');
     }
  }
};

const updateProfile = async () => {
  try {
    const token = localStorage.getItem('token');
    // Use relative URL assuming axios baseURL is set
    await axios.put(
      '/api/users/profile',
      {
        address: profile.value.address,
        cellphone: profile.value.cellphone,
        employmentStatus: profile.value.employmentStatus,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    alert('Profile updated successfully!');
    router.push('/dashboard'); // Redirect to the dashboard
  } catch (error) {
    console.error('Error updating profile:', error.message);
    alert(`Error updating profile: ${error.response?.data?.message || error.message}`);
  }
};

const goBack = () => {
    router.push('/dashboard'); // Navigate back to dashboard on cancel
}

onMounted(() => {
  fetchProfile();
});
</script>

<style scoped>
.form-group {
  margin-bottom: 1rem;
}
</style>
