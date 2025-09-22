<template>
  <div class="proof-of-payment">
    <article class="card-base transaction-card">
      <!-- Loading -->
      <div v-if="loading" class="space-y-3">
        <div class="skeleton h-24 rounded-lg"></div>
        <div class="skeleton h-10 rounded-lg"></div>
      </div>

      <!-- Loaded -->
      <template v-else-if="tx">
        <div class="flex items-start justify-between gap-4">
          <!-- Main info -->
          <div class="flex-1 min-w-0">
            <!-- Title + badges -->
            <div class="flex flex-wrap items-center gap-2 mb-1">
              <h3 class="title truncate">
                {{ tx.description || tx.reference || 'Transaction' }}
              </h3>

              <span class="badge" :class="getStatusBadgeColor(tx.status)">
                {{ (tx.status || '—').toUpperCase() }}
              </span>

              <span class="badge" :class="proofBadge.color">
                {{ proofBadge.text }}
              </span>
            </div>

            <!-- Quick facts -->
            <div class="flex flex-wrap items-center gap-2 mb-3 text-xs">
              <span class="chip chip-soft">{{ formattedDate }}</span>
              <span class="chip font-semibold" :class="amountClass">{{ signedAmount }}</span>
              <span class="chip chip-soft">ID: {{ tx.transactionId }}</span>
            </div>

            <!-- Details -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-700">
              <div class="space-y-1">
                <p><span class="label">From</span> {{ tx.fromUserName }} ({{ masked(tx.fromAccountNumber) }})</p>
                <p v-if="tx.reference"><span class="label">Reference</span> {{ tx.reference }}</p>
                <p><span class="label">Type</span> {{ tx.type || '—' }}</p>
              </div>

              <div class="space-y-1">
                <p v-if="tx.toUserName"><span class="label">To</span> {{ tx.toUserName }} ({{ masked(tx.toAccountNumber) }})</p>
                <p><span class="label">Proof</span> {{ tx.proofGenerated ? 'Generated' : 'Not generated' }}</p>
                <p v-if="tx.proofGeneratedAt"><span class="label">Proof at</span> {{ formatDate(tx.proofGeneratedAt) }}</p>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-col gap-2 shrink-0">
            <button
              v-if="tx.status === 'completed'"
              @click="generateProof"
              :disabled="isGenerating"
              class="btn btn-primary"
            >
              <span v-if="isGenerating" class="inline-flex items-center gap-2">
                <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                </svg>
                Generating...
              </span>
              <span v-else>{{ tx.proofGenerated ? 'Regenerate' : 'Generate' }} Proof</span>
            </button>

            <button
              v-if="tx.proofGenerated"
              @click="downloadProof"
              :disabled="isDownloading"
              class="btn btn-secondary"
            >
              <span v-if="isDownloading" class="inline-flex items-center gap-2">
                <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                </svg>
                Downloading...
              </span>
              <span v-else>Download PDF</span>
            </button>

            <button v-if="tx.proofGenerated" @click="viewProof" class="btn btn-ghost">View PDF</button>

            <button @click="verifyTransaction" :disabled="isVerifying" class="btn btn-ghost">
              <span v-if="isVerifying" class="inline-flex items-center gap-2">
                <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                </svg>
                Verifying...
              </span>
              <span v-else>Verify</span>
            </button>
          </div>
        </div>

        <!-- Proof Generation Status -->
        <div v-if="proofStatus" class="alert mt-4" :class="proofStatus.type === 'success' ? 'alert-success' : 'alert-error'" role="status">
          <p class="text-sm">{{ proofStatus.message }}</p>
        </div>

        <!-- Verification Result -->
        <div v-if="verificationResult" class="alert alert-info mt-3">
          <h4 class="font-semibold mb-1">Transaction Verification</h4>
          <div class="text-sm space-y-1">
            <p><span class="label">Valid</span> {{ verificationResult.isValid ? 'Yes' : 'No' }}</p>
            <p><span class="label">Verified At</span> {{ formatDate(verificationResult.verifiedAt) }}</p>
            <p v-if="verificationResult.message">{{ verificationResult.message }}</p>
          </div>
        </div>
      </template>

      <!-- Missing -->
      <p v-else class="alert-error">Transaction not found.</p>
    </article>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { useToast } from 'vue-toastification';
import NotificationService from '../services/notificationService';

// Accept either a full transaction or a transactionId prop (router passes transactionId with props: true)
const props = defineProps({
  transaction: { type: Object, default: null },
  transactionId: { type: [String, Number], default: '' }
});

const route = useRoute();
const router = useRouter();
const toast = useToast();

const tx = ref(props.transaction);
const loading = ref(false);
const error = ref('');

watch(() => props.transaction, (val) => { if (val) tx.value = val; });

const getRouteId = () => String(route.params.transactionId || props.transactionId || '');

// Hydrate quickly from session if present
const hydrateFromSession = (id) => {
  try {
    const cached = sessionStorage.getItem('yb:selected-tx');
    if (!cached) return false;
    const parsed = JSON.parse(cached);
    const cachedId = String(parsed.transactionId || parsed._id || '');
    if (cachedId === String(id)) {
      tx.value = parsed;
      return true;
    }
  } catch {}
  return false;
};

const fetchById = async (id) => {
  if (!id) return;
  try {
    loading.value = true;
    error.value = '';
    const token = localStorage.getItem('token');
    const { data } = await axios.get(`/api/transactions/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    tx.value = data.transaction || data || null;
  } catch (e) {
    console.error('Fetch transaction error:', e);
    error.value = e.response?.data?.message || e.message || 'Failed to load transaction.';
    if (e.response?.status === 401) router.push('/login');
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  if (tx.value) return;
  const id = getRouteId();
  if (!hydrateFromSession(id)) await fetchById(id);
});

// UI computed
const proofBadge = computed(() => NotificationService.getProofStatusBadge(tx.value?.proofGenerated));
const signedAmount = computed(() => {
  const amt = Number(tx.value?.amount || 0); const sign = amt < 0 ? '-' : '+'; return `${sign}${formatCurrency(Math.abs(amt))}`;
});
const amountClass = computed(() => Number(tx.value?.amount || 0) < 0 ? 'text-rose-700 border-rose-200 bg-rose-50' : 'text-emerald-700 border-emerald-200 bg-emerald-50');
const formattedDate = computed(() => formatDate(tx.value?.createdAt));

// Helpers
const masked = (v) => {
  const s = String(v || '');
  return s ? `•••• ${s.slice(-4)}` : '—';
};
const formatCurrency = (amount) => {
  try { return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(Number(amount || 0)); }
  catch { const n = Number(amount || 0); return `R ${n.toFixed(2)}`; }
};
const formatDate = (dateString) => {
  const d = new Date(dateString); if (isNaN(d.getTime())) return '';
  return d.toLocaleString('en-ZA', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
};
const getStatusBadgeColor = (status) => NotificationService.getStatusBadgeColor(status);

// Actions
const isGenerating = ref(false);
const isDownloading = ref(false);
const isVerifying = ref(false);
const proofStatus = ref(null);
const verificationResult = ref(null);

const ensureTx = () => { if (!tx.value) throw new Error('Transaction not loaded yet.'); return tx.value; };

const generateProof = async () => {
  try {
    isGenerating.value = true; proofStatus.value = null;
    const id = ensureTx().transactionId;
    const result = await NotificationService.generateProofOfPayment(id);
    tx.value.proofGenerated = true;
    tx.value.proofGeneratedAt = new Date().toISOString();
    proofStatus.value = { type: 'success', message: result.message || 'Proof of payment generated successfully!' };
    toast.success('Proof of payment generated successfully!');
  } catch (error) {
    console.error('Error generating proof:', error);
    let message = 'Failed to generate proof of payment';
    if (error.response?.status === 404) message = 'Proof endpoint missing: /api/proof-of-payment/generate/{transactionId}';
    else if (error.message) message = error.message;
    proofStatus.value = { type: 'error', message }; toast.error(message);
  } finally { isGenerating.value = false; }
};

const downloadProof = async () => {
  try {
    isDownloading.value = true;
    await NotificationService.downloadProofOfPayment(ensureTx().transactionId);
    toast.success('PDF download started!');
  } catch (error) {
    console.error('Error downloading proof:', error);
    let message = 'Failed to download proof of payment';
    if (error.response?.status === 404) message = 'Download endpoint missing: /api/proof-of-payment/download/{transactionId}';
    else if (error.message) message = error.message;
    toast.error(message);
  } finally { isDownloading.value = false; }
};

const viewProof = async () => {
  try {
    await NotificationService.viewProofOfPayment(ensureTx().transactionId);
    toast.info('PDF opened in new tab');
  } catch (error) {
    console.error('Error viewing proof:', error);
    let message = 'Failed to view proof of payment';
    if (error.response?.status === 404) message = 'View endpoint missing: /api/proof-of-payment/view/{transactionId}';
    else if (error.message) message = error.message;
    toast.error(message);
  }
};

const verifyTransaction = async () => {
  try {
    isVerifying.value = true; verificationResult.value = null;
    const result = await NotificationService.verifyTransaction(ensureTx().transactionId);
    verificationResult.value = result; toast.success('Transaction verified successfully!');
  } catch (error) {
    console.error('Error verifying transaction:', error);
    let message = 'Failed to verify transaction';
    if (error.response?.status === 404) message = 'Verification endpoint missing: /api/proof-of-payment/verify/{transactionId}';
    else if (error.message) message = error.message;
    verificationResult.value = { isValid: false, message, verifiedAt: new Date().toISOString() };
    toast.error(message);
  } finally { isVerifying.value = false; }
};
</script>

<style scoped>
/* Surface + tokens aligned with the app */
.card-base { @apply bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl p-5 shadow-sm; }

/* Title and chips/badges */
.title { @apply text-lg font-semibold text-slate-900; }
.badge { @apply px-2 py-1 rounded-full text-xs font-medium border; }
.chip { @apply px-2.5 py-1 rounded-full text-xs border border-slate-200 bg-white text-slate-700; }
.chip-soft { @apply bg-teal-50 text-teal-700 border-teal-200; }
.label { @apply font-medium text-slate-500 mr-1; }

/* Buttons */
.btn { @apply inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition border border-transparent; min-width: 120px; }
.btn-primary { @apply bg-deep-teal text-white hover:opacity-95 disabled:opacity-70 disabled:cursor-not-allowed; }
.btn-secondary { @apply bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200; }
.btn-ghost { @apply bg-white text-slate-700 border border-slate-200 hover:bg-slate-50; }

/* Alerts */
.alert { @apply rounded-lg px-3 py-2 border text-sm; }
.alert-success { @apply bg-emerald-50 text-emerald-800 border-emerald-200; }
.alert-error { @apply bg-rose-50 text-rose-800 border-rose-200; }
.alert-info { @apply bg-indigo-50 text-indigo-800 border-indigo-200; }

/* Card hover */
.transaction-card { transition: box-shadow .18s ease, transform .18s ease; }
.transaction-card:hover { box-shadow: 0 10px 22px -16px rgba(2,6,23,0.35); }

/* Skeleton */
.skeleton {
  position: relative;
  overflow: hidden;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 37%, #f1f5f9 63%);
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
  border: 1px solid rgba(226,232,240,0.8);
}
@keyframes shimmer { 0% { background-position: 100% 0; } 100% { background-position: 0 0; } }

/* Spinner */
.animate-spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
</style>