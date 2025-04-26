<template>
  <div class="dashboard-container p-6 md:p-8">
    <header class="dashboard-header">
      <h1 class="dashboard-title">Dashboard</h1>
      <button class="burger-button" @click="toggleMenu">☰</button>
    </header>
    <p class="dashboard-welcome">
      Welcome back <span class="highlight">{{ userName }}</span>!
    </p>

    <section class="accounts-section">
      <h2 class="section-title">Your Accounts</h2>
      <div v-if="accounts && accounts.length" class="accounts-grid">
        <div
          v-for="account in accounts"
          :key="account._id"
          class="account-card card"
          @click="navigateToAccount(account._id)"
        >
          <h3 class="account-name">{{ account.name }}</h3>
          <p class="account-detail">Account Number: {{ account.accountNumber }}</p>
          <p class="account-detail">Balance: R {{ account.balance }}</p>
        </div>
      </div>
      <p v-else class="no-accounts-message">No accounts found. Open a new account to get started!</p>
    </section>

    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <h2 class="modal-title">Open a New Account</h2>
        <form @submit.prevent="openAccount">
          <div class="form-group">
            <label for="accountName" class="label">Account Name</label>
            <input
              v-model="accountForm.name"
              id="accountName"
              type="text"
              class="input-field"
              placeholder="Enter account name"
              required
            />
          </div>
          <div class="form-group">
            <label for="accountType" class="label">Account Type</label>
            <select
              v-model="accountForm.accountType"
              id="accountType"
              class="input-field"
            >
              <option value="Savings">Savings</option>
              <option value="Fixed Savings">Fixed Savings</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Create Account</button>
            <button type="button" class="btn btn-secondary" @click="showModal = false">Cancel</button>
          </div>
        </form>
      </div>
    </div>

    <SideMenu v-if="isMenuOpen" @close="toggleMenu" @navigate="handleNavigation" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import SideMenu from './SideMenu.vue';

const accounts = ref([]);
const showModal = ref(false);
const isMenuOpen = ref(false);
const accountForm = ref({
  name: '',
  accountType: 'Savings',
});
const userName = ref('');
const router = useRouter();

const fetchUserName = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found. Please log in.');
    }

    const response = await axios.get('/api/users/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
    userName.value = response.data.userId.name || 'User'; // Fallback to 'User' if name is not available
  } catch (error) {
    console.error('Error fetching user profile:', error.message);
    if (error.message === 'No token found. Please log in.' || error.response?.status === 401) {
      alert('Session expired or not logged in. Redirecting to login.');
      localStorage.removeItem('token'); // Clear any invalid token
      router.push('/login'); // Redirect to login page
    }
  }
};

const fetchAccounts = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found. Please log in.');
    }

    const response = await axios.get('http://localhost:5000/api/accounts', {
      headers: { Authorization: `Bearer ${token}` },
    });
    accounts.value = response.data || []; // Ensure accounts is always an array
  } catch (error) {
    console.error('Error fetching accounts:', error.message);
    if (error.message === 'No token found. Please log in.' || error.response?.status === 401) {
      alert('Session expired or not logged in. Redirecting to login.');
      localStorage.removeItem('token'); // Clear any invalid token
      router.push('/login'); // Redirect to login page
    }
  }
};

const openAccount = async () => {
  try {
    if (!accountForm.value.name) {
      alert('Please specify an account name.');
      return;
    }

    const savingsAccounts = accounts.value.filter(account => account.accountType === 'Savings');
    if (accountForm.value.accountType === 'Savings' && savingsAccounts.length >= 5) {
      alert('You can only have a maximum of 5 savings accounts.');
      return;
    }

    const token = localStorage.getItem('token');
    await axios.post(
      'http://localhost:5000/api/accounts',
      accountForm.value,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    alert('Account created successfully!');
    accountForm.value = { name: '', accountType: 'Savings' }; // Reset form
    showModal.value = false; // Close modal
    fetchAccounts(); // Refresh accounts
  } catch (error) {
    alert(`Error creating account: ${error.response?.data?.message || error.message}`);
  }
};

const logout = () => {
  localStorage.removeItem('token'); // Remove token from localStorage
  router.push('/'); // Redirect to homepage
};

const navigateToAccount = (accountId) => {
  router.push(`/transactions/${accountId}`); // Navigate to the Transactions page for the selected account
};

const navigateToPayments = () => {
  router.push('/payments'); // Navigate to the Payments page
};

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const navigateToProfileUpdate = () => {
  router.push('/update-profile'); // Navigate to the Update Profile page
};

const handleNavigation = (action) => {
  if (action === 'logout') {
    logout();
  } else if (action === 'openAccount') {
    showModal.value = true;
  } else if (action === 'paySomeone') {
    navigateToPayments();
  } else if (action === 'updateProfile') {
    navigateToProfileUpdate();
  }
};

onMounted(() => {
  fetchUserName();
  fetchAccounts();
});
</script>

<style scoped>
.dashboard-container {
  background-color: var(--color-background);
  min-height: 100vh;
  position: relative;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  position: relative;
}

.dashboard-title {
  @apply text-3xl md:text-4xl font-heading font-bold text-deep-teal;
}

.burger-button {
  @apply text-2xl text-deep-teal bg-transparent border-none cursor-pointer absolute top-0 right-0 p-2 transition-transform duration-200 hover:scale-110;
}

.dashboard-welcome {
  @apply text-lg text-medium-grey mb-8;
}

.highlight {
  @apply font-semibold text-deep-teal;
}

.accounts-section {
  margin-bottom: 2rem;
}

.section-title {
  @apply text-2xl font-heading font-semibold text-deep-teal mb-4;
}

.accounts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.account-card {
  @apply cursor-pointer transition-transform duration-200 ease-in-out hover:-translate-y-1 hover:shadow-lg;
}

.account-name {
  @apply text-lg font-heading font-semibold text-deep-teal mb-2;
}

.account-detail {
  @apply text-sm text-medium-grey;
}

.no-accounts-message {
  @apply text-base text-medium-grey;
}

.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50;
}

.modal-content {
   width: 90%;
   max-width: 450px;
}

.modal-title {
  @apply text-xl font-heading font-semibold text-deep-teal mb-6 text-center;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-actions {
  @apply flex justify-end gap-4 mt-6;
}
</style>
