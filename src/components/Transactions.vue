<template>
  <div class="p-6 md:p-8 bg-light-grey-bg min-h-screen">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <h1 class="text-3xl font-bold font-heading text-deep-teal mb-2 md:mb-0">Transactions</h1>
      <button class="btn btn-secondary" @click="navigateBack">Back to Dashboard</button>
    </div>
    <p class="mb-8 text-medium-grey">
      Viewing transactions for <span class="font-semibold text-deep-teal">{{ accountName }}</span>.
    </p>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 card">
        <h2 class="text-2xl font-semibold font-heading text-deep-teal mb-4">Transaction History</h2>
        <div v-if="transactions.length" class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-gray-100">
                <th class="border-b border-light-grey-border p-3 text-left text-sm font-semibold text-medium-grey uppercase">Date</th>
                <th class="border-b border-light-grey-border p-3 text-left text-sm font-semibold text-medium-grey uppercase">Description</th>
                <th class="border-b border-light-grey-border p-3 text-right text-sm font-semibold text-medium-grey uppercase">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="transaction in transactions" :key="transaction._id" class="hover:bg-gray-50">
                <td class="border-b border-light-grey-border p-3 text-sm text-charcoal">{{ new Date(transaction.date).toLocaleString() }}</td>
                <td class="border-b border-light-grey-border p-3 text-sm text-charcoal">{{ transaction.reference }}</td>
                <td :class="['border-b border-light-grey-border p-3 text-sm text-right font-medium', transaction.amount < 0 ? 'text-red-600' : 'text-green-600']">
                    {{ transaction.amount < 0 ? '-' : '+' }}R {{ Math.abs(transaction.amount).toFixed(2) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="mt-4">
          <p class="text-medium-grey">No transactions found for this account.</p>
        </div>
      </div>

      <div class="card h-fit">
        <h2 class="text-2xl font-semibold font-heading text-deep-teal mb-4">Account Summary</h2>
        <div class="space-y-2">
          <p class="text-medium-grey">Account Name: <span class="font-semibold text-deep-teal">{{ accountName }}</span></p>
          <p class="text-medium-grey">Account Number: <span class="font-semibold text-deep-teal">{{ accountNumber }}</span></p>
          <p class="text-medium-grey">Balance: <span class="font-semibold text-deep-teal">R {{ balance.toFixed(2) }}</span></p>
        </div>
        <div class="mt-8 space-y-3">
          <button class="btn btn-primary w-full" @click="printBankStatement">Print Statement</button>
          <button class="btn btn-secondary w-full" @click="emailBankStatement">Email Statement</button>
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
const accountNumber = ref('');
const balance = ref(0);

const router = useRouter();
const route = useRoute();

const fetchTransactions = async () => {
  try {
    const token = localStorage.getItem('token');
    const accountId = route.params.accountId;
    const response = await axios.get(`/api/accounts/${accountId}/transactions`, { // Relative URL
      headers: { Authorization: `Bearer ${token}` },
    });
    transactions.value = response.data.transactions || [];
    accountName.value = response.data.accountName;
    accountNumber.value = response.data.accountNumber;
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
      `/api/accounts/${accountId}/statement/pdf`, // Relative URL
      { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' }
    );

    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' })); // Specify MIME type
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `BankStatement_${accountNumber.value}.pdf`); // Dynamic filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url); // Clean up blob URL
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
      `/api/accounts/${accountId}/statement/email`, // Relative URL
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
  router.push('/dashboard');
};


onMounted(() => {
  fetchTransactions();
});
</script>

<style scoped>
</style>
