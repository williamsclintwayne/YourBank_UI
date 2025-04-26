<template>
  <div class="flex items-center justify-center min-h-screen bg-light-grey-bg">
    <div class="card w-full max-w-md">
      <h1 class="text-3xl font-bold font-heading text-deep-teal text-center mb-6">Login</h1>
      <form @submit.prevent="login" class="mt-6 space-y-4">
        <div>
          <label for="email" class="label">Email</label>
          <input
            v-model="form.email"
            id="email"
            type="email"
            class="input-field"
            placeholder="Enter your email"
            required
          />
        </div>
        <div>
          <label for="password" class="label">Password</label>
          <input
            v-model="form.password"
            id="password"
            type="password"
            class="input-field"
            placeholder="Enter your password"
            required
          />
        </div>
        <button type="submit" class="btn btn-primary w-full">Login</button>
      </form>
      <p v-if="errorMessage" class="text-red-500 mt-4 text-center">{{ errorMessage }}</p>
      <button @click="goBack" class="btn btn-secondary w-full mt-4">Back to Homepage</button>
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
    const response = await axios.post('/api/users/login', form.value); // Use relative URL
    const token = response.data.token;

    if (!token) {
      throw new Error('Login failed. No token received.');
    }

    localStorage.setItem('token', token);
    router.push('/dashboard');
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
.min-h-screen {
  min-height: 100vh;
}
</style>
