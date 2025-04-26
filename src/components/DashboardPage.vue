<template>
  <div class="dashboard-container">
    <header class="dashboard-header">
      <h1 class="dashboard-title">Dashboard</h1>
      <button class="burger-button" @click="toggleMenu">☰</button>
    </header>
    <p class="dashboard-welcome">
      Welcome back <span class="highlight">{{ userName }}</span>, here is your hero profile. Conquer the day with awesomeness.
    </p>

    <section class="accounts-section">
      <h2 class="section-title">Your Accounts</h2>
      <div v-if="accounts && accounts.length" class="accounts-grid">
        <div
          v-for="account in accounts"
          :key="account._id"
          class="account-card"
          @click="navigateToAccount(account._id)"
        >
          <h3 class="account-name">{{ account.name }}</h3>
          <p class="account-detail">Account Number: {{ account.accountNumber }}</p>
          <p class="account-detail">Balance: R {{ account.balance }}</p>
        </div>
      </div>
      <p v-else class="no-accounts-message">No accounts found. Open a new account to get started!</p>
    </section>

    <!-- Open Account Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <h2 class="modal-title">Open a New Account</h2>
        <form @submit.prevent="openAccount">
          <div class="form-group">
            <label for="accountName" class="form-label">Account Name</label>
            <input
              v-model="accountForm.name"
              id="accountName"
              type="text"
              class="form-input"
              placeholder="Enter account name"
              required
            />
          </div>
          <div class="form-group">
            <label for="accountType" class="form-label">Account Type</label>
            <select
              v-model="accountForm.accountType"
              id="accountType"
              class="form-input"
            >
              <option value="Savings">Savings</option>
              <option value="Fixed Savings">Fixed Savings</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn primary">Create Account</button>
            <button type="button" class="btn secondary" @click="showModal = false">Cancel</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Side Menu -->
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
  padding: 2rem;
  background-color: #f9fafb;
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
  font-size: 2.5rem;
  font-weight: bold;
  color: #1f2937;
}

.burger-button {
  font-size: 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #1f2937;
  position: absolute;
  top: 1rem;
  right: 1rem;
  transition: transform 0.2s;
}

.burger-button:hover {
  transform: scale(1.1);
}

.dashboard-welcome {
  font-size: 1.2rem;
  color: #4b5563;
  margin-bottom: 2rem;
}

.highlight {
  font-weight: bold;
  color: #2563eb;
}

.accounts-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.8rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 1rem;
}

.accounts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.account-card {
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.account-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.account-name {
  font-size: 1.2rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.account-detail {
  font-size: 1rem;
  color: #6b7280;
}

.no-accounts-message {
  font-size: 1rem;
  color: #6b7280;
}

.actions-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: #ffffff;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 400px;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  font-size: 1rem;
  color: #4b5563;
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  color: #1f2937;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 1.5rem;
}
</style>
