<template>
  <div class="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
    <h1 class="text-4xl font-bold text-blue-600">Register</h1>
    <p class="mt-4 text-gray-600 text-lg">
      Please fill out your profile to get started with our services.
    </p>
    <form @submit.prevent="registerUser" class="mt-8 w-full max-w-md bg-white p-6 rounded-lg shadow-md">
      <!-- Basic Info -->
      <div class="mb-4">
        <label for="name" class="block text-gray-700 font-bold mb-2">Full Name</label>
        <input
          type="text"
          id="name"
          v-model="form.name"
          class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          required
        />
      </div>
      <div class="mb-4">
        <label for="email" class="block text-gray-700 font-bold mb-2">Email</label>
        <input
          type="email"
          id="email"
          v-model="form.email"
          class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          required
        />
      </div>
      <div class="mb-4">
        <label for="password" class="block text-gray-700 font-bold mb-2">Password</label>
        <input
          type="password"
          id="password"
          v-model="form.password"
          class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          required
        />
      </div>

      <!-- Profile Info -->
      <div class="mb-4">
        <label for="idNumber" class="block text-gray-700 font-bold mb-2">ID Number</label>
        <input
          type="text"
          id="idNumber"
          v-model="form.idNumber"
          class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          required
        />
      </div>
      <div class="mb-4">
        <label for="cellphone" class="block text-gray-700 font-bold mb-2">Cellphone</label>
        <input
          type="text"
          id="cellphone"
          v-model="form.cellphone"
          class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          required
        />
      </div>
      <div class="mb-4">
        <label for="address" class="block text-gray-700 font-bold mb-2">Address</label>
        <input
          type="text"
          id="address"
          v-model="form.address"
          class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          required
        />
      </div>
      <div class="mb-4">
        <label for="title" class="block text-gray-700 font-bold mb-2">Title</label>
        <select
          id="title"
          v-model="form.title"
          class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          required
        >
          <option value="Mr">Mr</option>
          <option value="Ms">Ms</option>
          <option value="Mrs">Mrs</option>
          <option value="Dr">Dr</option>
        </select>
      </div>
      <div class="mb-4">
        <label for="gender" class="block text-gray-700 font-bold mb-2">Gender</label>
        <select
          id="gender"
          v-model="form.gender"
          class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          required
        >
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div class="mb-4">
        <label for="employmentStatus" class="block text-gray-700 font-bold mb-2">Employment Status</label>
        <select
          id="employmentStatus"
          v-model="form.employmentStatus"
          class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          required
        >
          <option value="Employed">Employed</option>
          <option value="Unemployed">Unemployed</option>
          <option value="Student">Student</option>
        </select>
      </div>

      <button
        type="submit"
        class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
      >
        Register
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();
const form = ref({
  name: '',
  email: '',
  password: '',
  idNumber: '',
  cellphone: '',
  address: '',
  title: '',
  gender: '',
  employmentStatus: '',
});

const registerUser = async () => {
  try {
    // Replace with your backend's base URL
    const baseURL = 'http://localhost:5000/api';

    // Send user and profile data in the registration request
    const response = await axios.post(`${baseURL}/users/register`, form.value);

    if (response.data && response.data.token) {
      alert('Registration successful!');
      router.push('/dashboard'); // Redirect to the dashboard
    } else {
      alert('Registration failed. Please try again.');
    }
  } catch (error) {
    console.error('Error registering user:', error.response?.data || error.message);
    alert(`Error: ${error.response?.data?.message || 'An error occurred while registering.'}`);
  }
};
</script>

<style scoped>
.min-h-screen {
  min-height: 100vh;
}

.bg-gray-100 {
  background-color: #f7fafc;
}

.text-center {
  text-align: center;
}
</style>
