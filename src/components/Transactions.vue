<template>
  <div class="relative min-h-screen bg-slate-50">
    <!-- Background accents -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
    </div>

    <div class="relative z-10 p-6 md:p-8 mx-auto max-w-7xl">
      <!-- Header -->
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div class="space-y-1">
          <h1 class="text-3xl md:text-4xl font-heading font-bold text-deep-teal tracking-tight">
            Transactions
          </h1>
          <p class="text-medium-grey">
            Viewing transactions for
            <span class="font-semibold text-deep-teal">{{ accountName || 'Account' }}</span>.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <button class="btn btn-ghost" @click="navigateBack">← Back to Dashboard</button>
          <button class="btn btn-primary" @click="printBankStatement">Print Statement</button>
          <button class="btn btn-secondary" @click="emailBankStatement">Email Statement</button>
        </div>
      </div>

      <!-- Filters -->
      <div class="card-base p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 items-end">
          <div class="lg:col-span-2">
            <label class="label mb-1 block">Search</label>
            <input
              v-model="search"
              type="text"
              class="input-field"
              placeholder="Search by description or reference"
            />
          </div>

          <div>
            <label class="label mb-1 block">Type</label>
            <div class="flex gap-2">
              <button
                v-for="t in types"
                :key="t.value"
                class="chip flex-1 text-center"
                :class="{ 'chip-active': typeFilter === t.value }"
                @click="typeFilter = t.value"
              >
                {{ t.label }}
              </button>
            </div>
          </div>

          <div>
            <label class="label mb-1 block">From</label>
            <input v-model="dateFrom" type="date" class="input-field" />
          </div>
          <div>
            <label class="label mb-1 block">To</label>
            <input v-model="dateTo" type="date" class="input-field" />
          </div>
        </div>

        <div class="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <span class="label-muted">Sort by</span>
            <select v-model="sortBy" class="input-field h-9 py-1.5 w-36">
              <option value="date">Date</option>
              <option value="amount">Amount</option>
            </select>
            <button class="chip" @click="sortDir = sortDir === 'desc' ? 'asc' : 'desc'">
              {{ sortDir === 'desc' ? '↓' : '↑' }} {{ sortDir.toUpperCase() }}
            </button>
          </div>

          <div class="flex items-center gap-2">
            <button class="btn btn-ghost" @click="resetFilters">Reset</button>
            <button class="btn btn-ghost" @click="exportCSV" :disabled="!filteredTransactions.length">Export CSV</button>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Transactions Table -->
        <div class="lg:col-span-2 card-base">
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-2xl font-semibold font-heading text-deep-teal">Transaction History</h2>
            <div class="flex items-center gap-2">
              <span class="chip chip-soft">Total: {{ filteredTransactions.length }}</span>
              <span class="chip chip-soft text-emerald-700 border-emerald-200 bg-emerald-50">In: {{ formatCurrency(totalIn) }}</span>
              <span class="chip chip-soft text-rose-700 border-rose-200 bg-rose-50">Out: {{ formatCurrency(Math.abs(totalOut)) }}</span>
            </div>
          </div>

          <!-- Loading Skeleton -->
          <div v-if="loading" class="space-y-2">
            <div class="skeleton h-10 rounded-lg"></div>
            <div v-for="n in 6" :key="n" class="skeleton h-12 rounded-lg"></div>
          </div>

          <!-- Table -->
          <div v-else-if="filteredTransactions.length" class="overflow-hidden rounded-xl border border-slate-200">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-slate-50 sticky top-0 z-10">
                  <tr>
                    <th class="th">Date</th>
                    <th class="th">Description</th>
                    <th class="th text-right">Amount</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr
                    v-for="tx in pagedTransactions"
                    :key="tx._id"
                    class="hover:bg-slate-50/70 transition"
                  >
                    <td class="td whitespace-nowrap">{{ formatDate(tx.date) }}</td>
                    <td class="td">
                      <div class="flex items-center gap-2">
                        <span
                          class="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold"
                          :class="tx.amount < 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'"
                        >
                          {{ tx.amount < 0 ? '−' : '+' }}
                        </span>
                        <div class="min-w-0">
                          <p class="truncate text-slate-800">{{ tx.reference }}</p>
                          <p class="text-xs text-slate-500">{{ (tx.meta && tx.meta.counterparty) || 'Payment' }}</p>
                        </div>
                      </div>
                    </td>
                    <td
                      class="td text-right font-semibold"
                      :class="tx.amount < 0 ? 'text-rose-600' : 'text-emerald-600'"
                    >
                      {{ tx.amount < 0 ? '-' : '+' }}{{ formatCurrency(Math.abs(tx.amount)) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <div class="flex items-center justify-between p-3">
              <span class="text-sm text-slate-500">
                Showing
                <span class="font-medium text-slate-700">{{ pageStart + 1 }}</span>–
                <span class="font-medium text-slate-700">{{ Math.min(pageStart + pageSize, filteredTransactions.length) }}</span>
                of
                <span class="font-medium text-slate-700">{{ filteredTransactions.length }}</span>
              </span>

              <div class="flex items-center gap-2">
                <button class="chip" :disabled="page === 1" @click="page--">Prev</button>
                <span class="text-sm text-slate-700">Page {{ page }} / {{ totalPages }}</span>
                <button class="chip" :disabled="page === totalPages" @click="page++">Next</button>
              </div>
            </div>
          </div>

          <!-- Empty state -->
          <div v-else class="empty-state">
            <div class="empty-illustration">📭</div>
            <h3 class="text-lg font-semibold text-slate-800">No transactions found</h3>
            <p class="text-slate-500 text-center">
              Try adjusting filters or date range to see results.
            </p>
          </div>
        </div>

        <!-- Account Summary -->
        <div class="card-base h-fit">
          <h2 class="text-2xl font-semibold font-heading text-deep-teal mb-4">Account Summary</h2>
          <div class="space-y-2">
            <p class="text-medium-grey">
              Account Name:
              <span class="font-semibold text-deep-teal">{{ accountName }}</span>
            </p>
            <p class="text-medium-grey">
              Account Number:
              <span class="font-semibold text-deep-teal">{{ accountNumber }}</span>
            </p>
            <p class="text-medium-grey">
              Balance:
              <span class="font-semibold text-deep-teal">{{ formatCurrency(balance) }}</span>
            </p>
          </div>

          <div class="mt-6 grid grid-cols-2 gap-3">
            <div class="mini-stat bg-emerald-50 text-emerald-700 border-emerald-200">
              <span class="text-xs">Money in</span>
              <strong class="text-lg leading-none">{{ formatCurrency(totalIn) }}</strong>
            </div>
            <div class="mini-stat bg-rose-50 text-rose-700 border-rose-200">
              <span class="text-xs">Money out</span>
              <strong class="text-lg leading-none">{{ formatCurrency(Math.abs(totalOut)) }}</strong>
            </div>
          </div>

          <div class="mt-8 space-y-3">
            <button class="btn btn-primary w-full" @click="printBankStatement">Print Statement</button>
            <button class="btn btn-secondary w-full" @click="emailBankStatement">Email Statement</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'vue-toastification';
import axios from 'axios';
import NotificationService from '../services/notificationService';

const toast = useToast();
const transactions = ref([]);
const loading = ref(false);

const accountName = ref('');
const accountNumber = ref('');
const balance = ref(0);

const search = ref('');
const typeFilter = ref('all'); // all | in | out
const dateFrom = ref('');
const dateTo = ref('');

const sortBy = ref('date'); // date | amount
const sortDir = ref('desc'); // asc | desc

const page = ref(1);
const pageSize = 10;

const types = [
  { label: 'All', value: 'all' },
  { label: 'Money in', value: 'in' },
  { label: 'Money out', value: 'out' },
];

const router = useRouter();
const route = useRoute();

const fetchTransactions = async () => {
  try {
    loading.value = true;
    const token = localStorage.getItem('token');
    const accountId = route.params.accountId;
    const response = await axios.get(`/api/accounts/${accountId}/transactions`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    transactions.value = response.data.transactions || [];
    accountName.value = response.data.accountName;
    accountNumber.value = response.data.accountNumber;
    balance.value = response.data.balance;
    page.value = 1; // reset page on fresh fetch
  } catch (error) {
    console.error('Error fetching transactions:', error.response?.data?.message || error.message);
    alert(`Error fetching transactions: ${error.response?.data?.message || error.message}`);
  } finally {
    loading.value = false;
  }
};

const formatCurrency = (value) => {
  try {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(Number(value || 0));
  } catch {
    const num = Number(value || 0);
    return `R ${num.toFixed(2)}`;
  }
};

const formatDate = (value) => {
  try {
    const d = new Date(value);
    return d.toLocaleString();
  } catch {
    return value;
  }
};

const filteredTransactions = computed(() => {
  let list = [...transactions.value];

  // Search
  if (search.value.trim()) {
    const q = search.value.toLowerCase();
    list = list.filter(
      (t) =>
        String(t.reference || '').toLowerCase().includes(q) ||
        String(t.meta?.counterparty || '').toLowerCase().includes(q)
    );
  }

  // Type
  if (typeFilter.value === 'in') list = list.filter((t) => t.amount > 0);
  if (typeFilter.value === 'out') list = list.filter((t) => t.amount < 0);

  // Date range
  if (dateFrom.value) {
    const from = new Date(dateFrom.value);
    list = list.filter((t) => new Date(t.date) >= from);
  }
  if (dateTo.value) {
    const to = new Date(dateTo.value);
    to.setHours(23, 59, 59, 999);
    list = list.filter((t) => new Date(t.date) <= to);
  }

  // Sort
  list.sort((a, b) => {
    let cmp = 0;
    if (sortBy.value === 'date') {
      cmp = new Date(a.date) - new Date(b.date);
    } else if (sortBy.value === 'amount') {
      cmp = Number(a.amount) - Number(b.amount);
    }
    return sortDir.value === 'asc' ? cmp : -cmp;
  });

  return list;
});

const totalIn = computed(() =>
  filteredTransactions.value.reduce((sum, t) => (t.amount > 0 ? sum + Number(t.amount) : sum), 0)
);

const totalOut = computed(() =>
  filteredTransactions.value.reduce((sum, t) => (t.amount < 0 ? sum + Number(t.amount) : sum), 0)
);

// Pagination
const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredTransactions.value.length / pageSize))
);
const pageStart = computed(() => (page.value - 1) * pageSize);
const pagedTransactions = computed(() =>
  filteredTransactions.value.slice(pageStart.value, pageStart.value + pageSize)
);

watch([filteredTransactions], () => {
  // Clamp page when filters change and shrink data
  if (page.value > totalPages.value) page.value = totalPages.value;
});

const resetFilters = () => {
  search.value = '';
  typeFilter.value = 'all';
  dateFrom.value = '';
  dateTo.value = '';
  sortBy.value = 'date';
  sortDir.value = 'desc';
};

const exportCSV = () => {
  if (!filteredTransactions.value.length) return;
  const rows = [
    ['Date', 'Description', 'Amount'],
    ...filteredTransactions.value.map((t) => [
      new Date(t.date).toISOString(),
      `"${String(t.reference || '').replace(/"/g, '""')}"`,
      Number(t.amount).toFixed(2),
    ]),
  ];
  const csv = rows.map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `transactions_${accountNumber.value || 'account'}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const printBankStatement = async () => {
  try {
    const token = localStorage.getItem('token');
    const accountId = route.params.accountId;
    const response = await axios.get(
      `/api/accounts/${accountId}/statement/pdf`,
      { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' }
    );
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `BankStatement_${accountNumber.value}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating bank statement PDF:', error.response?.data?.message || error.message);
    alert(`Error generating bank statement PDF: ${error.response?.data?.message || error.message}`);
  }
};

const emailBankStatement = async () => {
  try {
    const token = localStorage.getItem('token');
    const accountId = route.params.accountId;
    
    // Use the notification service for better error handling
    await NotificationService.emailBankStatement(accountId, 'current_month');
    
    // Show success toast
    toast.success('Bank statement emailed successfully!');
    // Removed redundant axios.post and alert. Only NotificationService and toast are used.
  } catch (error) {
    console.error('Error emailing bank statement:', error);
    const message = error.message || 'Failed to email bank statement';
    toast.error(`Error: ${message}`);
  }
};

const navigateBack = () => {
  router.push('/dashboard');
};

onMounted(() => {
  fetchTransactions();
});

// If account changes without page reload
watch(
  () => route.params.accountId,
  () => {
    fetchTransactions();
  }
);
</script>

<style scoped>
/* Base cards, labels, chips, buttons to match Dashboard styling */
.card-base {
  @apply bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl shadow-sm;
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
  @apply inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition border border-transparent;
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

.chip {
  @apply px-3 py-1.5 rounded-full text-sm border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed;
}
.chip-active {
  @apply bg-teal-50 text-teal-700 border-teal-200;
}
.chip-soft {
  @apply px-2 py-1 rounded-full text-xs bg-teal-50 text-teal-700 border border-teal-200;
}

.empty-state {
  @apply flex flex-col items-center justify-center text-center p-10 gap-2;
}
.empty-illustration {
  @apply text-4xl md:text-5xl mb-2;
}

/* Table */
.th {
  @apply text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-3 py-3 border-b border-slate-200;
}
.td {
  @apply px-3 py-3 text-sm text-slate-700;
}

/* Mini stats */
.mini-stat {
  @apply border rounded-xl px-3 py-3 flex flex-col gap-0.5;
}

/* Skeleton loading */
.skeleton {
  position: relative;
  overflow: hidden;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 37%, #f1f5f9 63%);
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
  border: 1px solid rgba(226, 232, 240, 0.8);
}
@keyframes shimmer {
  0% { background-position: 100% 0; }
  100% { background-position: 0 0; }
}

/* Background shapes for subtle depth */
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