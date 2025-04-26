<template>
  <div class="update-profile-container">
    <h1>Update Profile</h1>
    <form @submit.prevent="updateProfile">
      <div class="form-group">
        <label for="address">Address</label>
        <input v-model="profile.address" id="address" type="text" required />
      </div>
      <div class="form-group">
        <label for="cellphone">Cellphone Number</label>
        <input v-model="profile.cellphone" id="cellphone" type="text" required />
      </div>
      <div class="form-group">
        <label for="employmentStatus">Employment Status</label>
        <select v-model="profile.employmentStatus" id="employmentStatus">
          <option value="Employed">Employed</option>
          <option value="Unemployed">Unemployed</option>
          <option value="Student">Student</option>
        </select>
      </div>
      <button type="submit" class="btn primary">Save Changes</button>
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
    const response = await axios.get('http://localhost:5000/api/users/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
    profile.value = {
      address: response.data.userId.address || '',
      cellphone: response.data.userId.cellphone || '',
      employmentStatus: response.data.userId.employmentStatus || '',
    };
  } catch (error) {
    console.error('Error fetching profile:', error.message);
    alert('Failed to load profile. Please try again.');
  }
};

const updateProfile = async () => {
  try {
    const token = localStorage.getItem('token');
    await axios.put(
      '/api/users/profile', // Ensure this matches the backend route
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

onMounted(() => {
  fetchProfile();
});
</script>

<style scoped>
.update-profile-container {
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h1 {
  font-size: 2rem;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

input,
select {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
}

button {
  margin-top: 1rem;
  padding: 0.8rem 1.5rem;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #1e40af;
}
</style>
