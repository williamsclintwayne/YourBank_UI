<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-lg w-96">
      <h1 class="text-3xl font-bold text-blue-600 text-center">Login</h1>
      <form @submit.prevent="login" class="mt-6">
        <div class="mb-4">
          <label for="email" class="block text-gray-700 font-medium">Email</label>
          <input
            v-model="form.email"
            id="email"
            type="email"
            class="w-full mt-2 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your email"
            required
          />
        </div>
        <div class="mb-4">
          <label for="password" class="block text-gray-700 font-medium">Password</label>
          <input
            v-model="form.password"
            id="password"
            type="password"
            class="w-full mt-2 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your password"
            required
          />
        </div>
        <button type="submit" class="btn primary w-full">Login</button>
      </form>
      <p v-if="errorMessage" class="text-red-500 mt-4 text-center">{{ errorMessage }}</p>
      <button @click="goBack" class="btn secondary w-full mt-4">Back to Homepage</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const form = ref({
  email: '',
  password: '',
});
const errorMessage = ref('');

const login = async () => {
  try {
    const response = await axios.post('http://localhost:5000/api/users/login', form.value);
    const token = response.data.token;

    if (!token) {
      throw new Error('Login failed. No token received.');
    }

    localStorage.setItem('token', token); // Store the token in localStorage
    router.push('/dashboard'); // Redirect to the dashboard
  } catch (error) {
    console.error('Error during login:', error.response?.data?.message || error.message);
    errorMessage.value = error.response?.data?.message || 'An error occurred during login.';
  }
};

const goBack = () => {
  router.push('/');
};
</script>

<style scoped>
.btn.primary {
  background: #6366f1;
  color: white;
  padding: 0.8rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.btn.secondary {
  background: transparent;
  border: 2px solid #6366f1;
  color: #6366f1;
  padding: 0.8rem 2rem;
  border-radius: 8px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn.secondary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.bg-gray-100 {
  background-color: #f7fafc;
}

.text-center {
  text-align: center;
}

.min-h-screen {
  min-height: 100vh;
}
</style>
