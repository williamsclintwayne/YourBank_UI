<template>
  <div class="p-6 md:p-8 bg-light-grey-bg min-h-screen">
    <h1 class="text-3xl font-bold font-heading text-deep-teal mb-6">Open an Account</h1>
    <p class="mt-4 text-medium-grey mb-8">
      Start your banking journey by opening an account with us today.
    </p>

    <form @submit.prevent="createAccount" class="card max-w-lg mx-auto">
      <div class="mb-4">
        <label for="accountType" class="label">Account Type</label>
        <select
          v-model="accountForm.accountType"
          id="accountType"
          class="input-field mt-2"
        >
          <option value="Savings">Savings</option>
          <option value="Checking">Checking</option>
        </select>
      </div>
      <div class="mb-4">
        <label for="initialDeposit" class="label">Initial Deposit</label>
        <input
          v-model="accountForm.initialDeposit"
          type="number"
          id="initialDeposit"
          class="input-field mt-2"
          placeholder="Enter initial deposit amount"
          required
        />
      </div>
      <button type="submit" class="btn btn-primary w-full mt-6">Open Account</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router'; // Import useRouter

const router = useRouter(); // Initialize router

const accountForm = ref({
  accountType: 'Savings',
  initialDeposit: 0,
});

const createAccount = async () => {
  try {
    const token = localStorage.getItem('token'); // Retrieve token from localStorage
    if (!token) {
      alert('You must be logged in to open an account.');
      router.push('/login'); // Redirect to login if no token
      return;
    }
    // Removed userId decoding - backend should get it from the token
    const response = await axios.post(
      '/api/accounts', // Use relative URL
      accountForm.value, // Send only form data
      { headers: { Authorization: `Bearer ${token}` } }
    );
    alert(`Account created successfully! Account Number: ${response.data.accountNumber}`); // Show account number
    accountForm.value = { accountType: 'Savings', initialDeposit: 0 }; // Reset form
    router.push('/dashboard'); // Redirect to dashboard after success
  } catch (error) {
    console.error('Error creating account:', error.response?.data?.message || error.message);
    alert(`Error: ${error.response?.data?.message || 'Account creation failed'}`);
     if (error.response?.status === 401) {
        router.push('/login'); // Redirect if unauthorized
     }
  }
};
</script>

<style scoped>
.min-h-screen {
  min-height: 100vh;
}
</style>
