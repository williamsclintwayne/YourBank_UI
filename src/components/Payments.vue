<template>
  <div class="p-8">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold text-blue-600">Payments</h1>
      <button class="btn secondary" @click="navigateBack">Back to Dashboard</button>
    </div>
    <p class="mt-4 text-gray-600">Manage your payments and beneficiaries.</p>

    <!-- Beneficiaries Section -->
    <div class="mt-8">
      <h2 class="text-2xl font-semibold text-gray-800">Your Beneficiaries</h2>
      <div v-if="beneficiaries.length" class="mt-4">
        <ul class="list-disc pl-6">
          <li v-for="beneficiary in beneficiaries" :key="beneficiary._id" class="mb-2">
            <span class="font-bold">{{ beneficiary.name }}</span> - {{ beneficiary.accountNumber }}
            <button class="btn secondary ml-4" @click="openMakePaymentModal(beneficiary)">Pay</button>
          </li>
        </ul>
      </div>
      <div v-else class="mt-4">
        <p class="text-gray-600">No beneficiaries added yet.</p>
      </div>
      <button class="btn primary mt-4" @click="showAddBeneficiaryModal = true">Add Beneficiary</button>
    </div>

    <!-- Add Beneficiary Modal -->
    <div v-if="showAddBeneficiaryModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 class="text-xl font-bold mb-4">Add a Beneficiary</h2>
        <form @submit.prevent="addBeneficiary">
          <div class="mb-4">
            <label for="beneficiaryName" class="block text-gray-700 font-medium">Beneficiary Name</label>
            <input
              v-model="newBeneficiary.name"
              id="beneficiaryName"
              type="text"
              class="w-full mt-2 p-2 border rounded-lg"
              placeholder="Enter beneficiary name"
              required
            />
          </div>
          <div class="mb-4">
            <label for="beneficiaryAccount" class="block text-gray-700 font-medium">Account Number</label>
            <input
              v-model="newBeneficiary.accountNumber"
              id="beneficiaryAccount"
              type="text"
              class="w-full mt-2 p-2 border rounded-lg"
              placeholder="Enter account number"
              required
            />
          </div>
          <div class="flex justify-between">
            <button type="submit" class="btn primary">Add</button>
            <button type="button" class="btn secondary" @click="showAddBeneficiaryModal = false">Cancel</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Make Payment Modal -->
    <div v-if="showMakePaymentModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 class="text-xl font-bold mb-4">Make a Payment</h2>
        <form @submit.prevent="makePayment">
          <p class="text-gray-600">
            Paying <span class="font-bold">{{ selectedBeneficiary.name }}</span> - {{ selectedBeneficiary.accountNumber }}
          </p>
          <div class="mb-4">
            <label for="paymentAccount" class="block text-gray-700 font-medium">Select Account</label>
            <select
              v-model="selectedAccount"
              id="paymentAccount"
              class="w-full mt-2 p-2 border rounded-lg"
              required
            >
              <option
                v-for="account in accounts"
                :key="account._id"
                :value="account"
              >
                {{ account.name }} - R {{ account.balance }}
              </option>
            </select>
          </div>
          <div class="mb-4">
            <label for="paymentAmount" class="block text-gray-700 font-medium">Amount</label>
            <input
              v-model="paymentAmount"
              id="paymentAmount"
              type="number"
              class="w-full mt-2 p-2 border rounded-lg"
              placeholder="Enter amount"
              required
            />
          </div>
          <div class="mb-4">
            <label for="paymentReference" class="block text-gray-700 font-medium">Reference</label>
            <input
              v-model="paymentReference"
              id="paymentReference"
              type="text"
              class="w-full mt-2 p-2 border rounded-lg"
              placeholder="Enter reference for the payment"
              required
            />
          </div>
          <div class="flex justify-between">
            <button type="submit" class="btn primary">Send Payment</button>
            <button type="button" class="btn secondary" @click="closeMakePaymentModal">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const beneficiaries = ref([]);
const newBeneficiary = ref({
  name: '',
  accountNumber: '',
});
const selectedBeneficiary = ref(null); // Track the selected beneficiary for payment
const paymentAmount = ref(0); // Track the payment amount
const paymentReference = ref(''); // Track the payment reference
const accounts = ref([]); // Track the user's accounts
const selectedAccount = ref(null); // Track the selected account for payment
const showAddBeneficiaryModal = ref(false); // Track the visibility of the add beneficiary modal
const showMakePaymentModal = ref(false); // Track the visibility of the make payment modal
const router = useRouter();

const fetchBeneficiaries = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:5000/api/beneficiaries', {
      headers: { Authorization: `Bearer ${token}` },
    });
    beneficiaries.value = response.data || []; // Ensure beneficiaries is always an array
  } catch (error) {
    console.error('Error fetching beneficiaries:', error.response?.data?.message || error.message);
    alert(`Error fetching beneficiaries: ${error.response?.data?.message || error.message}`);
  }
};

const fetchAccounts = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:5000/api/accounts', {
      headers: { Authorization: `Bearer ${token}` },
    });
    accounts.value = response.data.filter(account => account.accountType !== 'Fixed Savings'); // Exclude fixed savings accounts
  } catch (error) {
    console.error('Error fetching accounts:', error.response?.data?.message || error.message);
    alert(`Error fetching accounts: ${error.response?.data?.message || error.message}`);
  }
};

const addBeneficiary = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      'http://localhost:5000/api/beneficiaries',
      newBeneficiary.value,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    beneficiaries.value.push(response.data); // Add the new beneficiary to the list
    newBeneficiary.value = { name: '', accountNumber: '' }; // Reset form
    showAddBeneficiaryModal.value = false; // Close modal
    alert('Beneficiary added successfully!');
  } catch (error) {
    console.error('Error adding beneficiary:', error.response?.data?.message || error.message);
    alert(`Error adding beneficiary: ${error.response?.data?.message || error.message}`);
  }
};

const openMakePaymentModal = (beneficiary) => {
  selectedBeneficiary.value = beneficiary;
  showMakePaymentModal.value = true;
};

const closeMakePaymentModal = () => {
  selectedBeneficiary.value = null;
  paymentAmount.value = 0;
  paymentReference.value = '';
  selectedAccount.value = null;
  showMakePaymentModal.value = false;
};

const makePayment = async () => {
  if (!selectedAccount.value) {
    alert('Please select an account to make the payment.');
    return;
  }

  try {
    const token = localStorage.getItem('token');
    await axios.post(
      'http://localhost:5000/api/payments',
      {
        beneficiaryAccountNumber: selectedBeneficiary.value.accountNumber,
        amount: paymentAmount.value,
        fromAccountId: selectedAccount.value._id, // Include the selected account ID
        reference: paymentReference.value, // Include the payment reference
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    alert('Payment sent successfully!');
    closeMakePaymentModal();
  } catch (error) {
    console.error('Error making payment:', error.response?.data?.message || error.message);
    alert(`Error making payment: ${error.response?.data?.message || error.message}`);
  }
};

const navigateBack = () => {
  router.push('/dashboard'); // Navigate back to the dashboard
};

onMounted(() => {
  fetchBeneficiaries(); // Fetch beneficiaries when the component is mounted
  fetchAccounts(); // Fetch accounts when the component is mounted
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

.fixed {
  z-index: 50;
}
</style>
