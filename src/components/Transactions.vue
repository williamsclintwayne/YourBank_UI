<template>
  <div class="p-8">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold text-blue-600">Transactions</h1>
      <button class="btn secondary" @click="navigateBack">Back to Dashboard</button>
    </div>
    <p class="mt-4 text-gray-600">
      Viewing transactions for <span class="font-bold text-blue-600">{{ accountName }}</span>.
    </p>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
      <!-- Transactions List -->
      <div class="col-span-2">
        <h2 class="text-2xl font-semibold text-gray-800">Transaction History</h2>
        <div v-if="transactions.length" class="mt-4">
          <table class="w-full border-collapse border border-gray-300">
            <thead>
              <tr class="bg-gray-100">
                <th class="border border-gray-300 p-2">Date</th>
                <th class="border border-gray-300 p-2">Description</th>
                <th class="border border-gray-300 p-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="transaction in transactions" :key="transaction._id">
                <td class="border border-gray-300 p-2">{{ new Date(transaction.date).toLocaleString() }}</td>
                <td class="border border-gray-300 p-2">{{ transaction.reference }}</td>
                <td class="border border-gray-300 p-2">{{ transaction.amount < 0 ? '-' : '+' }}R {{ Math.abs(transaction.amount) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="mt-4">
          <p class="text-gray-600">No transactions found for this account.</p>
        </div>
      </div>

      <!-- Account Summary -->
      <div class="p-6 bg-white rounded-lg shadow-md">
        <h2 class="text-2xl font-semibold text-gray-800">Account Summary</h2>
        <div class="mt-4">
          <p class="text-gray-600">Account Name: <span class="font-bold text-blue-600">{{ accountName }}</span></p>
          <p class="text-gray-600 mt-2">Account Number: <span class="font-bold text-blue-600">{{ accountNumber }}</span></p>
          <p class="text-gray-600 mt-2">Balance: <span class="font-bold text-blue-600">R {{ balance }}</span></p>
        </div>
        <div class="mt-8">
          <button class="btn primary w-full mb-4" @click="printBankStatement">Print Bank Statement</button>
          <button class="btn secondary w-full" @click="emailBankStatement">Email Bank Statement</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';

const transactions = ref([]);
const accountName = ref('');
const accountNumber = ref(''); // Track the account number
const balance = ref(0);

const router = useRouter();
const route = useRoute();

const fetchTransactions = async () => {
  try {
    const token = localStorage.getItem('token');
    const accountId = route.params.accountId;
    const response = await axios.get(`http://localhost:5000/api/accounts/${accountId}/transactions`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    transactions.value = response.data.transactions || [];
    accountName.value = response.data.accountName;
    accountNumber.value = response.data.accountNumber; // Set the account number
    balance.value = response.data.balance;
  } catch (error) {
    console.error('Error fetching transactions:', error.response?.data?.message || error.message);
    alert(`Error fetching transactions: ${error.response?.data?.message || error.message}`);
  }
};

const printBankStatement = async () => {
  try {
    const token = localStorage.getItem('token');
    const accountId = route.params.accountId;
    const response = await axios.get(
      `http://localhost:5000/api/accounts/${accountId}/statement/pdf`,
      { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'BankStatement.pdf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error generating bank statement PDF:', error.response?.data?.message || error.message);
    alert(`Error generating bank statement PDF: ${error.response?.data?.message || error.message}`);
  }
};

const emailBankStatement = async () => {
  try {
    const token = localStorage.getItem('token');
    const accountId = route.params.accountId;
    await axios.post(
      `http://localhost:5000/api/accounts/${accountId}/statement/email`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    alert('Bank statement emailed successfully.');
  } catch (error) {
    console.error('Error emailing bank statement:', error.response?.data?.message || error.message);
    alert(`Error emailing bank statement: ${error.response?.data?.message || error.message}`);
  }
};

const navigateBack = () => {
  router.push('/dashboard'); // Navigate back to the dashboard
};

onMounted(() => {
  fetchTransactions();
});
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
</style>
