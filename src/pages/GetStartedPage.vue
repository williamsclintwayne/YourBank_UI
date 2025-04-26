<template>
  <div class="min-h-screen bg-light-grey-bg flex flex-col items-center justify-center py-12 px-4">
    <h1 class="text-3xl md:text-4xl font-bold font-heading text-deep-teal">Register</h1>
    <p class="mt-3 text-medium-grey text-lg text-center max-w-xl">
      Create your profile to start banking with YourBank.
    </p>
    <form @submit.prevent="registerUser" class="mt-8 w-full max-w-lg card space-y-4">
      <div>
        <label for="name" class="label">Full Name</label>
        <input
          type="text"
          id="name"
          v-model="form.name"
          class="input-field"
          required
        />
      </div>
      <div>
        <label for="email" class="label">Email</label>
        <input
          type="email"
          id="email"
          v-model="form.email"
          class="input-field"
          required
        />
      </div>
      <div>
        <label for="password" class="label">Password</label>
        <input
          type="password"
          id="password"
          v-model="form.password"
          class="input-field"
          required
        />
      </div>

      <div>
        <label for="idNumber" class="label">ID Number</label>
        <input
          type="text"
          id="idNumber"
          v-model="form.idNumber"
          class="input-field"
          required
        />
      </div>
      <div>
        <label for="cellphone" class="label">Cellphone</label>
        <input
          type="text"
          id="cellphone"
          v-model="form.cellphone"
          class="input-field"
          required
        />
      </div>
      <div>
        <label for="address" class="label">Address</label>
        <input
          type="text"
          id="address"
          v-model="form.address"
          class="input-field"
          required
        />
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="title" class="label">Title</label>
            <select
              id="title"
              v-model="form.title"
              class="input-field"
              required
            >
              <option value="" disabled>Select Title</option>
              <option value="Mr">Mr</option>
              <option value="Ms">Ms</option>
              <option value="Mrs">Mrs</option>
              <option value="Dr">Dr</option>
            </select>
          </div>
          <div>
            <label for="gender" class="label">Gender</label>
            <select
              id="gender"
              v-model="form.gender"
              class="input-field"
              required
            >
              <option value="" disabled>Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
      </div>
      <div>
        <label for="employmentStatus" class="label">Employment Status</label>
        <select
          id="employmentStatus"
          v-model="form.employmentStatus"
          class="input-field"
          required
        >
          <option value="" disabled>Select Status</option>
          <option value="Employed">Employed</option>
          <option value="Unemployed">Unemployed</option>
          <option value="Student">Student</option>
        </select>
      </div>

      <button
        type="submit"
        class="btn btn-primary w-full mt-6"
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
    // Use relative URL assuming axios baseURL is set
    const response = await axios.post('/api/users/register', form.value);

    // Assuming registration doesn't return a token, but success message
    if (response.status === 201 || response.status === 200) { // Check for success status
      alert('Registration successful! Please log in.');
      router.push('/login'); // Redirect to login page after registration
    } else {
      // This path might not be reached if axios throws on non-2xx status
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
</style>
