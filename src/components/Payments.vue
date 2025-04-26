<template>
  <div class="p-6 md:p-8 bg-light-grey-bg min-h-screen">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <h1 class="text-3xl font-bold font-heading text-deep-teal mb-2 md:mb-0">Payments</h1>
      <button class="btn btn-secondary" @click="navigateBack">Back to Dashboard</button>
    </div>
    <p class="mb-8 text-medium-grey">Manage your payments and beneficiaries.</p>

    <div class="card mb-8">
      <h2 class="text-2xl font-semibold font-heading text-deep-teal mb-4">Your Beneficiaries</h2>
      <div v-if="beneficiaries.length" class="mt-4 space-y-3">
        <div v-for="beneficiary in beneficiaries" :key="beneficiary._id" class="flex justify-between items-center p-3 bg-gray-50 rounded-sm">
            <div>
                <span class="font-semibold text-charcoal">{{ beneficiary.name }}</span>
                <span class="text-medium-grey text-sm block md:inline md:ml-2">{{ beneficiary.accountNumber }}</span>
            </div>
            <button class="btn btn-secondary btn-sm" @click="openMakePaymentModal(beneficiary)">Pay</button>
        </div>
      </div>
      <div v-else class="mt-4">
        <p class="text-medium-grey">No beneficiaries added yet.</p>
      </div>
      <button class="btn btn-primary mt-6" @click="showAddBeneficiaryModal = true">Add Beneficiary</button>
    </div>

    <div v-if="showAddBeneficiaryModal" class="modal-overlay">
      <div class="modal-content card">
        <h2 class="modal-title">Add a Beneficiary</h2>
        <form @submit.prevent="addBeneficiary" class="space-y-4">
          <div>
            <label for="beneficiaryName" class="label">Beneficiary Name</label>
            <input
              v-model="newBeneficiary.name"
              id="beneficiaryName"
              type="text"
              class="input-field"
              placeholder="Enter beneficiary name"
              required
            />
          </div>
          <div>
            <label for="beneficiaryAccount" class="label">Account Number</label>
            <input
              v-model="newBeneficiary.accountNumber"
              id="beneficiaryAccount"
              type="text"
              class="input-field"
              placeholder="Enter account number"
              required
            />
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Add</button>
            <button type="button" class="btn btn-secondary" @click="showAddBeneficiaryModal = false">Cancel</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showMakePaymentModal" class="modal-overlay">
      <div class="modal-content card">
        <h2 class="modal-title">Make a Payment</h2>
        <form @submit.prevent="makePayment" class="space-y-4">
          <p class="text-medium-grey text-center mb-4">
            Paying <span class="font-semibold text-deep-teal">{{ selectedBeneficiary.name }}</span> ({{ selectedBeneficiary.accountNumber }})
          </p>
          <div>
            <label for="paymentAccount" class="label">From Account</label>
            <select
              v-model="selectedAccount"
              id="paymentAccount"
              class="input-field"
              required
            >
              <option :value="null" disabled>Select Account</option>
              <option
                v-for="account in accounts"
                :key="account._id"
                :value="account"
              >
                {{ account.name }} - R {{ account.balance.toFixed(2) }}
              </option>
            </select>
          </div>
          <div>
            <label for="paymentAmount" class="label">Amount (R)</label>
            <input
              v-model="paymentAmount"
              id="paymentAmount"
              type="number"
              step="0.01"
              min="0.01"
              class="input-field"
              placeholder="Enter amount"
              required
            />
          </div>
          <div>
            <label for="paymentReference" class="label">Reference</label>
            <input
              v-model="paymentReference"
              id="paymentReference"
              type="text"
              class="input-field"
              placeholder="Reference for the payment"
              required
            />
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Send Payment</button>
            <button type="button" class="btn btn-secondary" @click="closeMakePaymentModal">Cancel</button>
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
const newBeneficiary = ref({ name: '', accountNumber: '' });
const selectedBeneficiary = ref(null);
const paymentAmount = ref(null); // Initialize as null or ''
const paymentReference = ref('');
const accounts = ref([]);
const selectedAccount = ref(null);
const showAddBeneficiaryModal = ref(false);
const showMakePaymentModal = ref(false);
const router = useRouter();

const fetchBeneficiaries = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('/api/beneficiaries', { // Relative URL
      headers: { Authorization: `Bearer ${token}` },
    });
    beneficiaries.value = response.data || [];
  } catch (error) {
    console.error('Error fetching beneficiaries:', error.response?.data?.message || error.message);
    // Avoid alert spam, maybe use a toast notification system later
  }
};

const fetchAccounts = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('/api/accounts', { // Relative URL
      headers: { Authorization: `Bearer ${token}` },
    });
    // Filter out fixed savings accounts as they might not be usable for payments
    accounts.value = response.data.filter(account => account.accountType !== 'Fixed Savings');
  } catch (error) {
    console.error('Error fetching accounts:', error.response?.data?.message || error.message);
     // Avoid alert spam
  }
};

const addBeneficiary = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      '/api/beneficiaries', // Relative URL
      newBeneficiary.value,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    beneficiaries.value.push(response.data);
    newBeneficiary.value = { name: '', accountNumber: '' };
    showAddBeneficiaryModal.value = false;
    alert('Beneficiary added successfully!'); // Keep success alert
  } catch (error) {
    console.error('Error adding beneficiary:', error.response?.data?.message || error.message);
    alert(`Error adding beneficiary: ${error.response?.data?.message || error.message}`);
  }
};

const openMakePaymentModal = (beneficiary) => {
  selectedBeneficiary.value = beneficiary;
  paymentAmount.value = null; // Reset amount
  paymentReference.value = ''; // Reset reference
  selectedAccount.value = accounts.value.length > 0 ? accounts.value[0] : null; // Pre-select first available account
  showMakePaymentModal.value = true;
};

const closeMakePaymentModal = () => {
  showMakePaymentModal.value = false;
  // No need to reset here, openMakePaymentModal does it
};

const makePayment = async () => {
  if (!selectedAccount.value) {
    alert('Please select an account to make the payment from.');
    return;
  }
   if (!paymentAmount.value || paymentAmount.value <= 0) {
    alert('Please enter a valid positive amount.');
    return;
  }
   if (!paymentReference.value.trim()) {
    alert('Please enter a payment reference.');
    return;
  }

  try {
    const token = localStorage.getItem('token');
    await axios.post(
      '/api/payments', // Relative URL
      {
        beneficiaryAccountNumber: selectedBeneficiary.value.accountNumber,
        amount: paymentAmount.value,
        fromAccountId: selectedAccount.value._id,
        reference: paymentReference.value,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    alert('Payment sent successfully!');
    closeMakePaymentModal();
    // Optionally refresh account balances if the API doesn't handle it
    fetchAccounts();
  } catch (error) {
    console.error('Error making payment:', error.response?.data?.message || error.message);
    alert(`Error making payment: ${error.response?.data?.message || error.message}`);
  }
};

const navigateBack = () => {
  router.push('/dashboard');
};


onMounted(() => {
  fetchBeneficiaries();
  fetchAccounts();
});
</script>

<style scoped>
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4;
}

.modal-content {
   width: 90%;
   max-width: 480px;
}

.modal-title {
  @apply text-xl font-heading font-semibold text-deep-teal mb-6 text-center;
}

.form-actions {
  @apply flex justify-end gap-4 mt-6;
}

.btn-sm {
    @apply py-1 px-3 text-sm;
}
</style>
