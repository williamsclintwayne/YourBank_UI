<template>
  <div class="p-8">
    <h1 class="text-3xl font-bold text-blue-600">Open an Account</h1>
    <p class="mt-4 text-gray-600">Start your banking journey by opening an account with us today.</p>

    <form @submit.prevent="createAccount" class="mt-8 max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md">
      <div class="mb-4">
        <label for="accountType" class="block text-gray-700 font-medium">Account Type</label>
        <select
          v-model="accountForm.accountType"
          id="accountType"
          class="w-full mt-2 p-2 border rounded-lg"
        >
          <option value="Savings">Savings</option>
          <option value="Checking">Checking</option>
        </select>
      </div>
      <div class="mb-4">
        <label for="initialDeposit" class="block text-gray-700 font-medium">Initial Deposit</label>
        <input
          v-model="accountForm.initialDeposit"
          type="number"
          id="initialDeposit"
          class="w-full mt-2 p-2 border rounded-lg"
          placeholder="Enter initial deposit amount"
          required
        />
      </div>
      <button type="submit" class="btn primary w-full">Open Account</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const accountForm = ref({
  accountType: 'Savings',
  initialDeposit: 0,
});

const createAccount = async () => {
  try {
    const token = localStorage.getItem('token'); // Retrieve token from localStorage
    const userId = JSON.parse(atob(token.split('.')[1])).id; // Decode userId from JWT
    const response = await axios.post(
      'http://localhost:5000/api/accounts',
      { ...accountForm.value, userId }, // Include userId in the payload
      { headers: { Authorization: `Bearer ${token}` } }
    );
    alert(`Account created successfully! Account ID: ${response.data._id}`);
    accountForm.value = { accountType: 'Savings', initialDeposit: 0 }; // Reset form
  } catch (error) {
    alert(`Error: ${error.response?.data?.message || 'Account creation failed'}`);
  }
};
</script>

<style scoped>
/* Add styles if needed */
</style>
