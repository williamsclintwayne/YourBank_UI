<template>
  <div class="relative min-h-screen bg-slate-50">
    <!-- Decorative background shapes -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
    </div>

    <div class="relative z-10 p-6 md:p-8 mx-auto max-w-7xl">
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div class="space-y-1">
          <h1 class="text-3xl md:text-4xl font-heading font-bold text-deep-teal tracking-tight">
            Payments
          </h1>
          <p class="text-medium-grey">Manage your payments and beneficiaries.</p>
        </div>

        <div class="flex items-center gap-3">
          <button class="btn btn-ghost" @click="navigateBack">← Back to Dashboard</button>
          <button class="btn btn-primary" @click="showAddBeneficiaryModal = true">Add Beneficiary</button>
        </div>
      </div>

      <!-- Filters -->
      <section class="card-base p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 items-end">
          <div class="lg:col-span-3">
            <label class="label mb-1 block">Search beneficiaries</label>
            <input
              v-model="search"
              type="text"
              class="input-field"
              placeholder="Search by name or account number"
            />
          </div>

          <div>
            <label class="label mb-1 block">Sort by</label>
            <select v-model="sortBy" class="input-field">
              <option value="name">Name</option>
              <option value="accountNumber">Account number</option>
            </select>
          </div>

          <div class="flex md:block gap-2">
            <label class="sr-only">Actions</label>
            <button class="btn btn-ghost w-full" @click="refresh">Refresh</button>
          </div>
        </div>
      </section>

      <!-- Beneficiaries -->
      <section class="card-base">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-semibold font-heading text-deep-teal">Your Beneficiaries</h2>
          <span class="chip chip-soft">Total: {{ filteredBeneficiaries.length }}</span>
        </div>

        <!-- Loading state -->
        <div v-if="loadingBeneficiaries" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div v-for="n in 6" :key="n" class="skeleton h-20 rounded-xl"></div>
        </div>

        <!-- Grid -->
        <div v-else-if="filteredBeneficiaries.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div
            v-for="beneficiary in filteredBeneficiaries"
            :key="beneficiary._id"
            class="benef-card group"
          >
            <div class="flex items-center gap-3">
              <div class="avatar">{{ initials(beneficiary.name) }}</div>
              <div class="min-w-0">
                <p class="font-semibold text-slate-800 truncate">{{ beneficiary.name }}</p>
                <p class="text-sm text-slate-500 truncate">{{ maskAccountNumber(beneficiary.accountNumber) }}</p>
              </div>
            </div>

            <div class="mt-4 flex items-center justify-between">
              <span class="label-muted">Ready to pay</span>
              <button
                class="btn btn-secondary btn-sm"
                :disabled="!accounts.length"
                @click="openMakePaymentModal(beneficiary)"
              >
                Pay
              </button>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else class="empty-state">
          <div class="empty-illustration">🧾</div>
          <h3 class="text-lg font-semibold text-slate-800">No beneficiaries yet</h3>
          <p class="text-slate-500">Add a beneficiary to send your first payment.</p>
          <button class="btn btn-primary mt-4" @click="showAddBeneficiaryModal = true">
            Add Beneficiary
          </button>
        </div>
      </section>

      <!-- Add Beneficiary Modal -->
      <div v-if="showAddBeneficiaryModal" class="modal-overlay" @click.self="showAddBeneficiaryModal = false">
        <div class="modal-content card-base">
          <h2 class="modal-title">Add a Beneficiary</h2>
          <form @submit.prevent="addBeneficiary" class="space-y-4">
            <div>
              <label for="beneficiaryName" class="label">Beneficiary Name</label>
              <input
                v-model="newBeneficiary.name"
                id="beneficiaryName"
                type="text"
                class="input-field"
                placeholder="e.g. John Smith"
                required
              />
            </div>
            <div>
              <label for="beneficiaryAccount" class="label">Account Number</label>
              <input
                v-model="newBeneficiary.accountNumber"
                id="beneficiaryAccount"
                type="text"
                inputmode="numeric"
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

      <!-- Make Payment Modal -->
      <div v-if="showMakePaymentModal" class="modal-overlay" @click.self="closeMakePaymentModal">
        <div class="modal-content card-base">
          <h2 class="modal-title">Make a Payment</h2>

          <div class="mb-4 text-center">
            <p class="text-medium-grey">
              Paying
              <span class="font-semibold text-deep-teal">{{ selectedBeneficiary?.name }}</span>
              ({{ maskAccountNumber(selectedBeneficiary?.accountNumber) }})
            </p>
          </div>

          <form @submit.prevent="makePayment" class="space-y-5">
            <div>
              <label class="label mb-2 block">From Account</label>
              <div v-if="loadingAccounts" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div v-for="n in 2" :key="n" class="skeleton h-24 rounded-xl"></div>
              </div>

              <div v-else-if="accounts.length" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  v-for="acc in accounts"
                  :key="acc._id"
                  class="select-card"
                  :class="{ 'select-card-active': selectedAccountId === acc._id }"
                >
                  <input
                    class="sr-only"
                    type="radio"
                    :value="acc._id"
                    v-model="selectedAccountId"
                    name="fromAccount"
                  />
                  <div class="flex items-start justify-between">
                    <div>
                      <p class="font-semibold text-slate-800">{{ acc.name }}</p>
                      <p class="text-xs text-slate-500">{{ maskAccountNumber(acc.accountNumber) }}</p>
                    </div>
                    <span class="chip chip-soft">{{ acc.accountType }}</span>
                  </div>
                  <p class="mt-2 text-sm">
                    Balance: <span class="font-semibold">{{ formatCurrency(acc.balance) }}</span>
                  </p>
                </label>
              </div>

              <p v-else class="text-sm text-slate-500">
                No available accounts for payments.
              </p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label for="paymentAmount" class="label">Amount</label>
                <input
                  v-model.number="paymentAmount"
                  id="paymentAmount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  class="input-field"
                  placeholder="0.00"
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
                  placeholder="e.g. Rent August"
                  required
                />
              </div>
            </div>

            <div v-if="selectedAccount" class="text-sm text-slate-600">
              Remaining balance after payment:
              <span
                class="font-semibold"
                :class="remainingBalance >= 0 ? 'text-emerald-700' : 'text-rose-700'"
              >
                {{ formatCurrency(remainingBalance) }}
              </span>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary" :disabled="!canSubmitPayment">Send Payment</button>
              <button type="button" class="btn btn-secondary" @click="closeMakePaymentModal">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();

const beneficiaries = ref([]);
const loadingBeneficiaries = ref(false);

const accounts = ref([]);
const loadingAccounts = ref(false);

const search = ref('');
const sortBy = ref('name'); // name | accountNumber

const newBeneficiary = ref({ name: '', accountNumber: '' });

const selectedBeneficiary = ref(null);
const showAddBeneficiaryModal = ref(false);
const showMakePaymentModal = ref(false);

const selectedAccountId = ref(null);
const paymentAmount = ref(null);
const paymentReference = ref('');

const formatCurrency = (value) => {
  try {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(Number(value || 0));
  } catch {
    const num = Number(value || 0);
    return `R ${num.toFixed(2)}`;
  }
};

const maskAccountNumber = (num) => {
  if (!num) return '';
  const s = String(num);
  return `•••• ${s.slice(-4)}`;
};

const initials = (name = '') => {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('') || 'B';
};

const filteredBeneficiaries = computed(() => {
  let list = [...beneficiaries.value];
  const q = search.value.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (b) =>
        String(b.name || '').toLowerCase().includes(q) ||
        String(b.accountNumber || '').toLowerCase().includes(q)
    );
  }
  list.sort((a, b) => {
    const va = String(a[sortBy.value] || '').toLowerCase();
    const vb = String(b[sortBy.value] || '').toLowerCase();
    return va.localeCompare(vb);
  });
  return list;
});

const selectedAccount = computed(() =>
  accounts.value.find((a) => a._id === selectedAccountId.value) || null
);

const remainingBalance = computed(() => {
  if (!selectedAccount.value) return 0;
  const amt = Number(paymentAmount.value || 0);
  return Number(selectedAccount.value.balance || 0) - amt;
});

const canSubmitPayment = computed(() => {
  return (
    !!selectedAccount.value &&
    Number(paymentAmount.value) > 0 &&
    !!paymentReference.value.trim()
  );
});

const fetchBeneficiaries = async () => {
  try {
    loadingBeneficiaries.value = true;
    const token = localStorage.getItem('token');
    const response = await axios.get('/api/beneficiaries', {
      headers: { Authorization: `Bearer ${token}` },
    });
    beneficiaries.value = response.data || [];
  } catch (error) {
    console.error('Error fetching beneficiaries:', error.response?.data?.message || error.message);
  } finally {
    loadingBeneficiaries.value = false;
  }
};

const fetchAccounts = async () => {
  try {
    loadingAccounts.value = true;
    const token = localStorage.getItem('token');
    const response = await axios.get('/api/accounts', {
      headers: { Authorization: `Bearer ${token}` },
    });
    // Exclude fixed savings for payments
    accounts.value = (response.data || []).filter((a) => a.accountType !== 'Fixed Savings');
    // Preselect first account if available
    selectedAccountId.value = accounts.value[0]?._id ?? null;
  } catch (error) {
    console.error('Error fetching accounts:', error.response?.data?.message || error.message);
  } finally {
    loadingAccounts.value = false;
  }
};

const addBeneficiary = async () => {
  try {
    // Simple validation
    if (!newBeneficiary.value.name.trim()) {
      alert('Please enter a beneficiary name.');
      return;
    }
    if (!/^\d{6,}$/.test(String(newBeneficiary.value.accountNumber))) {
      alert('Please enter a valid account number (digits only).');
      return;
    }

    const token = localStorage.getItem('token');
    const response = await axios.post(
      '/api/beneficiaries',
      newBeneficiary.value,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    beneficiaries.value.unshift(response.data);
    newBeneficiary.value = { name: '', accountNumber: '' };
    showAddBeneficiaryModal.value = false;
    alert('Beneficiary added successfully!');
  } catch (error) {
    console.error('Error adding beneficiary:', error.response?.data?.message || error.message);
    alert(`Error adding beneficiary: ${error.response?.data?.message || error.message}`);
  }
};

const openMakePaymentModal = (beneficiary) => {
  selectedBeneficiary.value = beneficiary;
  paymentAmount.value = null;
  paymentReference.value = '';
  // Ensure accounts are loaded
  if (!accounts.value.length) fetchAccounts();
  showMakePaymentModal.value = true;
};

const closeMakePaymentModal = () => {
  showMakePaymentModal.value = false;
};

const makePayment = async () => {
  if (!selectedAccount.value) {
    alert('Please select a source account.');
    return;
  }
  const amt = Number(paymentAmount.value);
  if (!amt || amt <= 0) {
    alert('Please enter a valid positive amount.');
    return;
  }
  if (amt > Number(selectedAccount.value.balance)) {
    alert('Amount exceeds available balance.');
    return;
  }
  if (!paymentReference.value.trim()) {
    alert('Please enter a payment reference.');
    return;
  }

  try {
    const token = localStorage.getItem('token');
    await axios.post(
      '/api/payments',
      {
        beneficiaryAccountNumber: selectedBeneficiary.value.accountNumber,
        amount: amt,
        fromAccountId: selectedAccount.value._id,
        reference: paymentReference.value.trim(),
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    alert('Payment sent successfully!');
    closeMakePaymentModal();
    fetchAccounts(); // refresh balances
  } catch (error) {
    console.error('Error making payment:', error.response?.data?.message || error.message);
    alert(`Error making payment: ${error.response?.data?.message || error.message}`);
  }
};

const refresh = () => {
  fetchBeneficiaries();
  fetchAccounts();
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
/* Cards, labels, chips, buttons to match the Dashboard/Transactions style */
.card-base {
  @apply bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl p-5 shadow-sm;
}

.label {
  @apply text-sm text-slate-600;
}
.label-muted {
  @apply text-xs uppercase tracking-wide text-slate-400;
}

.input-field {
  @apply w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 placeholder-slate-400
    focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400;
}

.btn {
  @apply inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition border border-transparent;
}
.btn-primary {
  @apply bg-deep-teal text-white hover:opacity-95;
}
.btn-secondary {
  @apply bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200;
}
.btn-ghost {
  @apply bg-white text-slate-700 border border-slate-200 hover:bg-slate-50;
}
.btn-sm {
  @apply py-1 px-3 text-sm;
}

.chip {
  @apply px-3 py-1.5 rounded-full text-sm border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed;
}
.chip-active {
  @apply bg-teal-50 text-teal-700 border-teal-200;
}
.chip-soft {
  @apply px-2 py-1 rounded-full text-xs bg-teal-50 text-teal-700 border border-teal-200;
}

/* Beneficiary card */
.benef-card {
  @apply card-base p-4 transition hover:shadow-md;
}

/* Avatar bubble */
.avatar {
  @apply h-10 w-10 shrink-0 rounded-full bg-teal-600/10 text-teal-700 flex items-center justify-center font-semibold;
}

/* Selectable account cards */
.select-card {
  @apply card-base cursor-pointer transition;
}
.select-card-active {
  @apply ring-2 ring-teal-300 border-teal-300;
}

/* Empty state */
.empty-state {
  @apply flex flex-col items-center justify-center text-center p-10 gap-2;
}
.empty-illustration {
  @apply text-4xl md:text-5xl mb-2;
}

/* Modal */
.modal-overlay {
  @apply fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4;
}
.modal-content {
  width: 90%;
  max-width: 560px;
}
.modal-title {
  @apply text-xl font-heading font-semibold text-deep-teal mb-4 text-center;
}
.form-actions {
  @apply flex justify-end gap-3 mt-6;
}

/* Skeleton loading */
.skeleton {
  position: relative;
  overflow: hidden;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 37%, #f1f5f9 63%);
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
  border: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.4);
}
@keyframes shimmer {
  0% { background-position: 100% 0; }
  100% { background-position: 0 0; }
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