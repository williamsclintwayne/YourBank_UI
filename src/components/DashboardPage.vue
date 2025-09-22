<template>
  <div class="relative z-10 dashboard-container p-6 md:p-8 mx-auto max-w-7xl">
    <!-- Header / Hero -->
    <header class="dashboard-header">
      <div class="space-y-1">
        <h1 class="dashboard-title">
          Dashboard
        </h1>
        <p class="dashboard-welcome">
          Welcome back
          <span class="highlight">{{ userName || 'User' }}</span>!
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button class="btn btn-ghost hidden md:inline-flex" @click="showModal = true">
          <span class="i-plus">＋</span>
          Open account
        </button>
        <button class="btn btn-ghost hidden md:inline-flex" @click="navigateToPayments">
          <span class="i-send">➤</span>
          Pay someone
        </button>
        <button class="burger-button" @click="toggleMenu" aria-label="Open menu">☰</button>
      </div>
    </header>

    <!-- Quick actions (mobile-first) -->
    <section class="mb-8">
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button class="quick-card" @click="showModal = true">
          <div class="quick-icon bg-teal-500/10 text-teal-600">＋</div>
          <span class="quick-text">Open Account</span>
        </button>
        <button class="quick-card" @click="navigateToPayments">
          <div class="quick-icon bg-indigo-500/10 text-indigo-600">⇄</div>
          <span class="quick-text">Pay Someone</span>
        </button>
        <button class="quick-card" @click="navigateToProfileUpdate">
          <div class="quick-icon bg-amber-500/10 text-amber-600">⚙</div>
          <span class="quick-text">Update Profile</span>
        </button>
        <button class="quick-card" @click="fetchAccounts">
          <div class="quick-icon bg-rose-500/10 text-rose-600">⟳</div>
          <span class="quick-text">Refresh</span>
        </button>
      </div>
    </section>

    <!-- Accounts -->
    <section class="accounts-section">
      <div class="flex items-center justify-between mb-4">
        <h2 class="section-title">Your Accounts</h2>

        <div class="filter-row">
          <button v-for="f in filters" :key="f" class="chip" :class="{ 'chip-active': activeFilter === f }"
            @click="activeFilter = f">
            {{ f }}
          </button>
        </div>
      </div>

      <!-- Loading skeleton -->
      <div v-if="loading" class="accounts-grid">
        <div v-for="n in 3" :key="n" class="card-base skeleton h-36"></div>
      </div>

      <!-- Accounts grid -->
      <div v-else-if="displayAccounts && displayAccounts.length" class="accounts-grid">
        <div v-for="account in displayAccounts" :key="account._id" class="account-card card-base gradient-card"
          @click="navigateToAccount(account._id)">
          <div class="flex items-start justify-between">
            <h3 class="account-name">{{ account.name }}</h3>
            <span class="chip chip-soft">{{ account.accountType }}</span>
          </div>

          <div class="mt-2">
            <p class="label-muted">Account</p>
            <p class="account-detail font-medium">
              {{ maskAccountNumber(account.accountNumber) }}
            </p>
          </div>

          <div class="mt-3 flex items-end justify-between">
            <div>
              <p class="label-muted">Balance</p>
              <p class="balance-text">
                {{ formatCurrency(account.balance) }}
              </p>
            </div>

            <span class="view-link">View</span>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="empty-state card-base">
        <div class="empty-illustration">💳</div>
        <h3 class="text-lg font-semibold text-slate-800">No accounts yet</h3>
        <p class="text-slate-500 text-center">
          Open an account to get started with YourBank.
        </p>
        <button class="btn btn-primary mt-4" @click="showModal = true">
          Open a New Account
        </button>
      </div>
    </section>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-content card-base">
        <h2 class="modal-title">Open a New Account</h2>
        <form @submit.prevent="openAccount">
          <div class="form-group">
            <label for="accountName" class="label">Account Name</label>
            <input v-model="accountForm.name" id="accountName" type="text" class="input-field"
              placeholder="e.g. Holiday Savings" required />
          </div>

          <div class="form-group">
            <label for="accountType" class="label">Account Type</label>
            <select v-model="accountForm.accountType" id="accountType" class="input-field">
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

    <!-- Side Menu -->
    <SideMenu v-if="isMenuOpen" @close="toggleMenu" @navigate="handleNavigation" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import SideMenu from './SideMenu.vue';
import NotificationBell from './notifications/NotificationBell.vue';
import NotificationList from './notifications/NotificationList.vue';

const accounts = ref([]);
const loading = ref(false);
const showModal = ref(false);
const isMenuOpen = ref(false);
const showNotifications = ref(false);

const accountForm = ref({
  name: '',
  accountType: 'Savings',
});

const userName = ref('');
const router = useRouter();

const filters = ['All', 'Savings', 'Fixed Savings'];
const activeFilter = ref('All');

const displayAccounts = computed(() => {
  if (activeFilter.value === 'All') return accounts.value;
  return accounts.value.filter(a => a.accountType === activeFilter.value);
});

const formatCurrency = (value) => {
  try {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  } catch {
    return `R ${Number(value || 0).toLocaleString()}`;
  }
};

const maskAccountNumber = (num) => {
  if (!num) return '';
  const s = String(num);
  const last4 = s.slice(-4);
  return `•••• ${last4}`;
};

const fetchUserName = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found. Please log in.');

    const response = await axios.get('/api/users/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
    userName.value = response.data.userId?.name || 'User';
  } catch (error) {
    console.error('Error fetching user profile:', error.message);
    if (error.message === 'No token found. Please log in.' || error.response?.status === 401) {
      alert('Session expired or not logged in. Redirecting to login.');
      localStorage.removeItem('token');
      router.push('/login');
    }
  }
};

const fetchAccounts = async () => {
  try {
    loading.value = true;
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found. Please log in.');

    const response = await axios.get('http://localhost:5000/api/accounts', {
      headers: { Authorization: `Bearer ${token}` },
    });
    accounts.value = response.data || [];
  } catch (error) {
    console.error('Error fetching accounts:', error.message);
    if (error.message === 'No token found. Please log in.' || error.response?.status === 401) {
      alert('Session expired or not logged in. Redirecting to login.');
      localStorage.removeItem('token');
      router.push('/login');
    }
  } finally {
    loading.value = false;
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
    accountForm.value = { name: '', accountType: 'Savings' };
    showModal.value = false;
    fetchAccounts();
  } catch (error) {
    alert(`Error creating account: ${error.response?.data?.message || error.message}`);
  }
};

const logout = () => {
  localStorage.removeItem('token');
  router.push('/');
};

const navigateToAccount = (accountId) => {
  router.push(`/transactions/${accountId}`);
};

const navigateToPayments = () => {
  router.push('/payments');
};

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value;
};

const navigateToProfileUpdate = () => {
  router.push('/update-profile');
};

const navigateToProfile = () => {
  router.push('/view-profile'); // Navigate to the Profile page
};

const navigateToNotificationSettings = () => {
  router.push('/notification-settings'); // Navigate to the Notification Settings page
};

const handleNavigation = (action) => {
  if (action === 'logout') {
    logout();
  } else if (action === 'openAccount') {
    showModal.value = true;
  } else if (action === 'paySomeone') {
    navigateToPayments();
  } else if (action === 'transactionHistory') {
    router.push('/transaction-history');
  } else if (action === 'updateProfile') {
    navigateToProfileUpdate();
  } else if (action === 'viewProfile') {
    navigateToProfile();
  } else if (action === 'notificationSettings') {
    navigateToNotificationSettings();
  }
};

onMounted(() => {
  fetchUserName();
  fetchAccounts();
});
</script>

<style scoped>
/* Container and header */
.dashboard-container {
  background-color: var(--color-background, transparent);
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  position: relative;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.dashboard-title {
  /* keeps your custom color tokens */
  @apply text-3xl md:text-4xl font-heading font-bold text-deep-teal;
  letter-spacing: -0.02em;
}

.burger-button {
  @apply text-2xl text-deep-teal bg-white rounded-full shadow-sm border border-slate-200 cursor-pointer p-2 transition-transform duration-200 hover:scale-105 hover:shadow;
}

/* Typographic helpers */
.dashboard-welcome {
  @apply text-base md:text-lg text-medium-grey;
}

.highlight {
  @apply font-semibold text-deep-teal;
}

.label {
  @apply text-sm text-slate-600;
}

.label-muted {
  @apply text-xs uppercase tracking-wide text-slate-400;
}

/* Cards and visuals */
.card-base {
  @apply bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl p-5 shadow-sm;
}

.gradient-card {
  position: relative;
  overflow: hidden;
  transition: transform 180ms ease, box-shadow 180ms ease;
}

.gradient-card::before {
  content: "";
  position: absolute;
  inset: -2px;
  z-index: -1;
  background: conic-gradient(from 180deg,
      rgba(13, 148, 136, 0.2),
      rgba(59, 130, 246, 0.2),
      rgba(13, 148, 136, 0.2));
  filter: blur(12px);
  opacity: 0;
  transition: opacity 200ms ease;
  border-radius: 14px;
}

.gradient-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px -12px rgba(2, 6, 23, 0.2);
}

.gradient-card:hover::before {
  opacity: 1;
}

.accounts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem;
}

.account-name {
  @apply text-lg font-heading font-semibold text-deep-teal;
}

.account-detail {
  @apply text-sm text-slate-600;
}

.balance-text {
  @apply text-xl md:text-2xl font-bold text-slate-800;
  letter-spacing: -0.01em;
}

.view-link {
  @apply text-teal-700 text-sm font-medium;
}

.empty-state {
  @apply flex flex-col items-center justify-center text-center p-10 gap-2;
}

.empty-illustration {
  @apply text-4xl md:text-5xl mb-2;
}

/* Quick actions */
.quick-card {
  @apply card-base flex items-center gap-3 hover:shadow-md transition-shadow cursor-pointer;
}

.quick-icon {
  @apply h-9 w-9 rounded-lg flex items-center justify-center text-base font-semibold;
}

.quick-text {
  @apply text-sm font-medium text-slate-700;
}

/* Chips */
.filter-row {
  @apply flex items-center gap-2;
}

.chip {
  @apply px-3 py-1.5 rounded-full text-sm border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition;
}

.chip-active {
  @apply bg-teal-50 text-teal-700 border-teal-200;
}

.chip-soft {
  @apply px-2 py-1 rounded-full text-xs bg-teal-50 text-teal-700 border border-teal-200;
}

/* Buttons */
.btn {
  @apply inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition;
}

.btn-primary {
  @apply bg-deep-teal text-white hover:opacity-95;
}

.btn-secondary {
  @apply bg-slate-100 text-slate-700 hover:bg-slate-200;
}

.btn-ghost {
  @apply bg-white text-slate-700 border border-slate-200 hover:bg-slate-50;
}

/* Inputs */
.input-field {
  @apply w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400;
}

.form-group {
  margin-bottom: 1rem;
}

.form-actions {
  @apply flex justify-end gap-3 mt-6;
}

/* Modal */
.modal-overlay {
  @apply fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4;
}

.modal-content {
  width: 90%;
  max-width: 480px;
}

.modal-title {
  @apply text-xl font-heading font-semibold text-deep-teal mb-4 text-center;
}

/* Skeleton */
.skeleton {
  position: relative;
  overflow: hidden;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 37%, #f1f5f9 63%);
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
}

@keyframes shimmer {
  0% {
    background-position: 100% 0;
  }

  100% {
    background-position: 0 0;
  }
}

/* Decorative background shapes */
.shape {
  position: absolute;
  border-radius: 9999px;
  filter: blur(60px);
  opacity: 0.4;
  transform: translateZ(0);
}

.shape-1 {
  width: 420px;
  height: 420px;
  background: radial-gradient(circle at 30% 30%, rgba(20, 184, 166, 0.25), transparent 60%);
  top: -120px;
  left: -120px;
}

.shape-2 {
  width: 520px;
  height: 520px;
  background: radial-gradient(circle at 70% 70%, rgba(59, 130, 246, 0.22), transparent 60%);
  bottom: -160px;
  right: -160px;
}
</style>