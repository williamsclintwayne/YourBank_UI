<template>
  <div class="relative min-h-screen bg-slate-50 overflow-x-hidden">
    <!-- Decorative background -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
    </div>

    <div class="relative z-10 p-6 md:p-8 mx-auto max-w-7xl">
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div class="space-y-1">
          <h1 class="text-3xl md:text-4xl font-heading font-bold text-deep-teal tracking-tight">
            Transaction History
          </h1>
          <p class="text-medium-grey">
            Viewing all transactions across
            <span class="font-semibold text-deep-teal">{{ accounts.length }}</span>
            account<span v-if="accounts.length!==1">s</span>.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button @click="refreshAll" class="btn btn-secondary" :disabled="isLoading">
            <span v-if="isLoading">Refreshing...</span>
            <span v-else>Refresh</span>
          </button>
          <button @click="showBulkActions = !showBulkActions" class="btn btn-ghost">
            {{ showBulkActions ? 'Hide' : 'Bulk Actions' }}
          </button>
          <button @click="exportCSV" class="btn btn-ghost" :disabled="!filteredTransactions.length">
            Export CSV
          </button>
          <button @click="navigateBack" class="btn btn-ghost">← Back to Dashboard</button>
        </div>
      </div>

      <!-- Filters -->
      <section class="card-base p-4 mb-6">
        <h3 class="text-lg font-semibold text-deep-teal mb-3">Filters</h3>

        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 items-end">
          <div class="lg:col-span-2">
            <label class="label mb-1 block">Search</label>
            <input
              v-model="filters.search"
              @input="debouncedSearch"
              type="text"
              class="input-field"
              placeholder="Description, reference, counterparty..."
            />
          </div>

          <div>
            <label class="label mb-1 block">Account</label>
            <select v-model="filters.accountId" @change="applyFilters" class="input-field">
              <option value="">All accounts</option>
              <option v-for="acc in accounts" :key="acc._id" :value="acc._id">
                {{ acc.name }} • {{ maskAccount(acc.accountNumber) }}
              </option>
            </select>
          </div>

          <div>
            <label class="label mb-1 block">Type</label>
            <select v-model="filters.type" @change="applyFilters" class="input-field">
              <option value="">All types</option>
              <option value="in">Money in</option>
              <option value="out">Money out</option>
              <option value="payment">Payment</option>
              <option value="transfer">Transfer</option>
              <option value="deposit">Deposit</option>
              <option value="withdrawal">Withdrawal</option>
            </select>
          </div>

          <div>
            <label class="label mb-1 block">Status</label>
            <select v-model="filters.status" @change="applyFilters" class="input-field">
              <option value="">All statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label class="label mb-1 block">Proof</label>
            <select v-model="filters.proofGenerated" @change="applyFilters" class="input-field">
              <option value="">All</option>
              <option value="true">Has proof</option>
              <option value="false">No proof</option>
            </select>
          </div>

          <div>
            <label class="label mb-1 block">From</label>
            <input type="date" v-model="filters.dateFrom" @change="applyFilters" class="input-field" />
          </div>
          <div>
            <label class="label mb-1 block">To</label>
            <input type="date" v-model="filters.dateTo" @change="applyFilters" class="input-field" />
          </div>

          <div>
            <label class="label mb-1 block">Sort by</label>
            <select v-model="sortBy" class="input-field">
              <option value="date">Date</option>
              <option value="amount">Amount</option>
              <option value="account">Account</option>
            </select>
          </div>
          <div>
            <label class="label mb-1 block">Direction</label>
            <button class="chip w-full" @click="sortDir = sortDir === 'desc' ? 'asc' : 'desc'">
              {{ sortDir === 'desc' ? '↓' : '↑' }} {{ sortDir.toUpperCase() }}
            </button>
          </div>

          <div class="md:col-span-3 lg:col-span-2 flex items-center gap-2">
            <button class="btn btn-ghost" @click="resetFilters">Reset</button>
            <span class="text-sm text-slate-500">Results: <span class="font-medium text-slate-700">{{ filteredTransactions.length }}</span></span>
          </div>
        </div>
      </section>

      <!-- Stats -->
      <div class="flex flex-wrap items-center gap-2 mb-4">
        <span class="chip chip-soft">Total: {{ filteredTransactions.length }}</span>
        <span class="chip chip-soft text-emerald-700 border-emerald-200 bg-emerald-50">In: {{ formatCurrency(totalIn) }}</span>
        <span class="chip chip-soft text-rose-700 border-rose-200 bg-rose-50">Out: {{ formatCurrency(Math.abs(totalOut)) }}</span>
        <span v-if="filters.accountId" class="chip chip-soft">Account filtered</span>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="space-y-2">
        <div class="skeleton h-10 rounded-lg"></div>
        <div v-for="n in 8" :key="n" class="skeleton h-12 rounded-lg"></div>
      </div>

      <!-- Table -->
      <section v-else-if="filteredTransactions.length" class="overflow-hidden rounded-xl border border-slate-200">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th v-if="showBulkActions" class="th w-10">
                  <input
                    type="checkbox"
                    :checked="allVisibleCompletedSelected"
                    :indeterminate.prop="someVisibleCompletedSelected"
                    @change="toggleSelectAllVisible"
                  />
                </th>
                <th class="th">Date</th>
                <th class="th">Description</th>
                <th class="th">Account</th>
                <th class="th">Status</th>
                <th class="th text-right">Amount</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr
                v-for="tx in pagedTransactions"
                :key="tx._id || tx.transactionId"
                class="hover:bg-slate-50/70 transition outline-none"
                :class="!showBulkActions ? 'cursor-pointer focus:bg-slate-50 focus:ring-2 focus:ring-teal-200' : ''"
                tabindex="0"
                role="button"
                :aria-label="'View proof for transaction ' + (tx.transactionId || tx._id)"
                @click="onRowClick(tx, $event)"
                @keydown.enter.prevent="onRowClick(tx, $event)"
              >
                <td v-if="showBulkActions" class="td">
                  <input
                    v-if="tx.status === 'completed'"
                    type="checkbox"
                    :value="tx.transactionId"
                    v-model="selectedTransactions"
                    :disabled="selectedTransactions.length >= 10 && !selectedTransactions.includes(tx.transactionId)"
                  />
                </td>
                <td class="td whitespace-nowrap">{{ formatDate(tx.date) }}</td>
                <td class="td">
                  <div class="min-w-0">
                    <p class="truncate text-slate-800">{{ tx.reference || tx.description || 'Transaction' }}</p>
                    <p class="text-xs text-slate-500">{{ tx.meta?.counterparty || tx.type || '—' }}</p>
                  </div>
                </td>
                <td class="td">
                  <div class="min-w-0">
                    <p class="truncate text-slate-800">{{ tx.accountName }}</p>
                    <p class="text-xs text-slate-500">{{ maskAccount(tx.accountNumber) }}</p>
                  </div>
                </td>
                <td class="td">
                  <span
                    class="px-2 py-0.5 rounded-full text-xs border"
                    :class="{
                      'bg-emerald-50 text-emerald-700 border-emerald-200': tx.status === 'completed',
                      'bg-amber-50 text-amber-700 border-amber-200': tx.status === 'pending',
                      'bg-rose-50 text-rose-700 border-rose-200': tx.status === 'failed' || tx.status === 'cancelled',
                      'bg-slate-50 text-slate-600 border-slate-200': !tx.status
                    }"
                  >
                    {{ (tx.status || '—') }}
                  </span>
                </td>
                <td class="td text-right font-semibold" :class="tx.amount < 0 ? 'text-rose-600' : 'text-emerald-600'">
                  {{ tx.amount < 0 ? '-' : '+' }}{{ formatCurrency(Math.abs(Number(tx.amount))) }}
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
      </section>

      <!-- Empty state -->
      <div v-else class="empty-state">
        <div class="empty-illustration">📭</div>
        <h3 class="text-lg font-semibold text-slate-800">No transactions found</h3>
        <p class="text-slate-500 text-center">
          Try adjusting filters or date range to see results.
        </p>
      </div>

      <!-- Bulk Actions footer -->
      <section v-if="showBulkActions" class="card-base mt-6">
        <div class="flex flex-wrap items-center gap-3">
          <span class="label-muted">Bulk actions</span>
          <button
            class="btn btn-primary"
            @click="bulkGenerateProofs"
            :disabled="selectedTransactions.length === 0 || isBulkGenerating"
          >
            <span v-if="isBulkGenerating">Generating...</span>
            <span v-else>Generate Proofs ({{ selectedTransactions.length }})</span>
          </button>
          <span class="text-sm text-slate-600">Selected: {{ selectedTransactions.length }} / Max: 10</span>
        </div>
      </section>

      <!-- Bulk results modal -->
      <div v-if="bulkResults" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="card-base w-full max-w-md">
          <h3 class="text-lg font-semibold text-deep-teal mb-4">Bulk Generation Results</h3>

          <div class="space-y-2 mb-4 max-h-60 overflow-auto">
            <div v-for="result in bulkResults.results" :key="result.transactionId" class="flex justify-between items-center text-sm">
              <span class="truncate">{{ result.transactionId }}</span>
              <span :class="result.success ? 'text-emerald-700' : 'text-rose-700'">
                {{ result.success ? 'Success' : 'Failed' }}
              </span>
            </div>
          </div>

          <div class="text-sm text-slate-600 mb-4">
            <p>Successful: {{ bulkResults.summary.successful }}</p>
            <p>Failed: {{ bulkResults.summary.failed }}</p>
            <p>Total: {{ bulkResults.summary.total }}</p>
          </div>

          <button class="btn btn-primary w-full" @click="closeBulkResults">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useToast } from 'vue-toastification';
import NotificationService from '../services/notificationService'; // for bulk proofs, if available

const router = useRouter();
const toast = useToast();

// State
const accounts = ref([]);
const transactions = ref([]); // aggregated
const isLoading = ref(false);

const filters = ref({
  accountId: '',
  type: '',
  status: '',
  proofGenerated: '',
  search: '',
  dateFrom: '',
  dateTo: '',
});

const sortBy = ref('date'); // date | amount | account
const sortDir = ref('desc');

const showBulkActions = ref(false);
const selectedTransactions = ref([]);
const isBulkGenerating = ref(false);
const bulkResults = ref(null);

// Pagination
const page = ref(1);
const pageSize = 12;

// Fetch accounts and all transactions
const fetchAccounts = async () => {
  const token = localStorage.getItem('token');
  const res = await axios.get('/api/accounts', { headers: { Authorization: `Bearer ${token}` } });
  return res.data || [];
};

const fetchAccountTransactions = async (account) => {
  const token = localStorage.getItem('token');
  const res = await axios.get(`/api/accounts/${account._id}/transactions`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const list = res.data.transactions || [];
  // Decorate with account info
  return list.map((t) => ({
    ...t,
    accountId: account._id,
    accountName: account.name,
    accountNumber: account.accountNumber,
  }));
};

const fetchAll = async () => {
  try {
    isLoading.value = true;
    selectedTransactions.value = [];

    // Load accounts
    accounts.value = await fetchAccounts();

    // If filtered by a single account, only fetch that one
    const targetAccounts = filters.value.accountId
      ? accounts.value.filter((a) => a._id === filters.value.accountId)
      : accounts.value;

    // Parallel fetch
    const chunks = await Promise.all(targetAccounts.map((acc) => fetchAccountTransactions(acc)));
    const all = chunks.flat();

    // Sort newest first
    all.sort((a, b) => new Date(b.date) - new Date(a.date));
    transactions.value = all;
    page.value = 1;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    const msg = error.response?.data?.message || error.message || 'Failed to fetch transactions';
    toast.error(msg);
    if (error.response?.status === 401) router.push('/login');
  } finally {
    isLoading.value = false;
  }
};

const refreshAll = () => fetchAll();

// Filters and formatting
const maskAccount = (num) => {
  if (!num) return '';
  const s = String(num);
  return `•••• ${s.slice(-4)}`;
};

const formatCurrency = (value) => {
  try {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(Number(value || 0));
  } catch {
    const n = Number(value || 0);
    return `R ${n.toFixed(2)}`;
  }
};

const formatDate = (value) => {
  const d = new Date(value);
  return isNaN(d.getTime()) ? value : d.toLocaleString();
};

const filteredTransactions = computed(() => {
  let list = [...transactions.value];

  // account
  if (filters.value.accountId) {
    list = list.filter((t) => t.accountId === filters.value.accountId);
  }
  // type (generic)
  if (filters.value.type) {
    if (filters.value.type === 'in') list = list.filter((t) => Number(t.amount) > 0);
    else if (filters.value.type === 'out') list = list.filter((t) => Number(t.amount) < 0);
    else list = list.filter((t) => (t.type || '').toLowerCase() === filters.value.type);
  }
  // status
  if (filters.value.status) {
    list = list.filter((t) => (t.status || '').toLowerCase() === filters.value.status);
  }
  // proof
  if (filters.value.proofGenerated) {
    const flag = filters.value.proofGenerated === 'true';
    list = list.filter((t) => Boolean(t.proofGenerated) === flag);
  }
  // search
  if (filters.value.search.trim()) {
    const q = filters.value.search.toLowerCase();
    list = list.filter((t) =>
      String(t.reference || t.description || '')
        .toLowerCase()
        .includes(q) ||
      String(t.meta?.counterparty || '')
        .toLowerCase()
        .includes(q) ||
      String(t.transactionId || t._id || '').toLowerCase().includes(q)
    );
  }
  // date range
  if (filters.value.dateFrom) {
    const from = new Date(filters.value.dateFrom);
    list = list.filter((t) => new Date(t.date) >= from);
  }
  if (filters.value.dateTo) {
    const to = new Date(filters.value.dateTo);
    to.setHours(23, 59, 59, 999);
    list = list.filter((t) => new Date(t.date) <= to);
  }

  // sort
  list.sort((a, b) => {
    let cmp = 0;
    if (sortBy.value === 'date') {
      cmp = new Date(a.date) - new Date(b.date);
    } else if (sortBy.value === 'amount') {
      cmp = Number(a.amount) - Number(b.amount);
    } else if (sortBy.value === 'account') {
      cmp = String(a.accountName || '').localeCompare(String(b.accountName || ''));
    }
    return sortDir.value === 'asc' ? cmp : -cmp;
  });

  return list;
});

const totalIn = computed(() =>
  filteredTransactions.value.reduce((sum, t) => (Number(t.amount) > 0 ? sum + Number(t.amount) : sum), 0)
);
const totalOut = computed(() =>
  filteredTransactions.value.reduce((sum, t) => (Number(t.amount) < 0 ? sum + Number(t.amount) : sum), 0)
);

// Pagination computed
const totalPages = computed(() => Math.max(1, Math.ceil(filteredTransactions.value.length / pageSize)));
const pageStart = computed(() => (page.value - 1) * pageSize);
const pagedTransactions = computed(() =>
  filteredTransactions.value.slice(pageStart.value, pageStart.value + pageSize)
);
watch(filteredTransactions, () => {
  if (page.value > totalPages.value) page.value = totalPages.value;
});

// Bulk helpers for visible rows (completed only)
const visibleCompletedIds = computed(() =>
  pagedTransactions.value.filter((t) => (t.status || '').toLowerCase() === 'completed').map((t) => t.transactionId)
);
const allVisibleCompletedSelected = computed(
  () => visibleCompletedIds.value.length > 0 && visibleCompletedIds.value.every((id) => selectedTransactions.value.includes(id))
);
const someVisibleCompletedSelected = computed(
  () => visibleCompletedIds.value.some((id) => selectedTransactions.value.includes(id)) && !allVisibleCompletedSelected.value
);

const toggleSelectAllVisible = (e) => {
  const shouldSelect = e.target.checked;
  const current = new Set(selectedTransactions.value);
  if (shouldSelect) {
    for (const id of visibleCompletedIds.value) {
      if (current.size >= 10) break; // cap at 10
      current.add(id);
    }
  } else {
    for (const id of visibleCompletedIds.value) {
      current.delete(id);
    }
  }
  selectedTransactions.value = Array.from(current);
};

// Row navigation to ProofOfPayment
const getTxId = (tx) => String(tx.transactionId || tx._id || '');
const onRowClick = (tx, evt) => {
  if (showBulkActions.value) return; // don’t navigate in bulk select mode
  const target = evt?.target;
  if (target && target.closest && target.closest('input,button,a,label')) return;

  const id = getTxId(tx);
  if (!id) return;

  // Cache the full tx for instant hydration on proof page (optional)
  try { sessionStorage.setItem('yb:selected-tx', JSON.stringify(tx)); } catch {}

  router.push({ name: 'ProofOfPayment', params: { transactionId: id } });
};

// Actions
const debouncedSearch = (() => {
  let t;
  return () => {
    clearTimeout(t);
    t = setTimeout(() => applyFilters(), 400);
  };
})();

const applyFilters = () => {
  page.value = 1;
  fetchAll(); // ensure fresh data if account changed
};

const resetFilters = () => {
  filters.value = {
    accountId: '',
    type: '',
    status: '',
    proofGenerated: '',
    search: '',
    dateFrom: '',
    dateTo: '',
  };
  sortBy.value = 'date';
  sortDir.value = 'desc';
  fetchAll();
};

const exportCSV = () => {
  if (!filteredTransactions.value.length) return;
  const rows = [
    ['Date', 'Description', 'Account Name', 'Account Number', 'Status', 'Amount', 'Transaction ID'],
    ...filteredTransactions.value.map((t) => [
      new Date(t.date).toISOString(),
      `"${String(t.reference || t.description || '').replace(/"/g, '""')}"`,
      `"${String(t.accountName || '').replace(/"/g, '""')}"`,
      String(t.accountNumber || ''),
      String(t.status || ''),
      Number(t.amount).toFixed(2),
      String(t.transactionId || t._id || ''),
    ]),
  ];
  const csv = rows.map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `all_transactions.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const bulkGenerateProofs = async () => {
  if (!selectedTransactions.value.length) {
    toast.warning('Please select at least one completed transaction.');
    return;
  }
  if (selectedTransactions.value.length > 10) {
    toast.error('Maximum 10 transactions allowed for bulk generation.');
    return;
  }
  try {
    isBulkGenerating.value = true;
    const results = await NotificationService.bulkGenerateProofs(selectedTransactions.value);
    bulkResults.value = results;

    // Update proof flags locally
    results.results.forEach((r) => {
      if (r.success) {
        const tx = transactions.value.find((t) => (t.transactionId || t._id) === r.transactionId);
        if (tx) {
          tx.proofGenerated = true;
          tx.proofGeneratedAt = new Date().toISOString();
        }
      }
    });

    selectedTransactions.value = [];
    toast.success(`Bulk generation completed: ${results.summary.successful}/${results.summary.total} successful.`);
  } catch (error) {
    console.error('Bulk generation error:', error);
    toast.error(error.response?.data?.message || error.message || 'Failed to generate proofs.');
  } finally {
    isBulkGenerating.value = false;
  }
};

const closeBulkResults = () => (bulkResults.value = null);

const navigateBack = () => router.push('/dashboard');

onMounted(() => {
  fetchAll();
});
</script>

<style scoped>
/* Base cards, labels, chips, buttons to match upgraded style */
.card-base { @apply bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl shadow-sm; }
.label { @apply text-sm text-slate-600; }

.input-field {
  @apply w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 placeholder-slate-400
  focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400;
}

.btn { @apply inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition border border-transparent; }
.btn-primary { @apply bg-deep-teal text-white hover:opacity-95; }
.btn-secondary { @apply bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200; }
.btn-ghost { @apply bg-white text-slate-700 border border-slate-200 hover:bg-slate-50; }
.chip { @apply px-3 py-1.5 rounded-full text-sm border border-slate-200 text-slate-600 bg-white; }
.chip-soft { @apply px-2 py-1 rounded-full text-xs bg-teal-50 text-teal-700 border border-teal-200; }

.th { @apply text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-3 py-3 border-b border-slate-200; }
.td { @apply px-3 py-3 text-sm text-slate-700; }

.empty-state { @apply flex flex-col items-center justify-center text-center p-10 gap-2; }
.empty-illustration { @apply text-4xl md:text-5xl mb-2; }

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

/* Decorative background shapes (shared motif) */
.shape {
  position: absolute;
  border-radius: 9999px;
  filter: blur(60px);
  opacity: 0.4;
  transform: translateZ(0);
  pointer-events: none;
}
.shape-1 {
  width: 420px; height: 420px;
  background: radial-gradient(circle at 30% 30%, rgba(20,184,166,0.25), transparent 60%);
  top: -120px; left: -120px;
}
.shape-2 {
  width: 520px; height: 520px;
  background: radial-gradient(circle at 70% 70%, rgba(59,130,246,0.22), transparent 60%);
  bottom: -160px; right: -160px;
}
@media (min-width: 1024px) {
  .shape-1 { width: 560px; height: 560px; top: -160px; left: -160px; }
  .shape-2 { width: 680px; height: 680px; bottom: -220px; right: -200px; }
}
</style>