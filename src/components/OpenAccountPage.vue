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
            Open an Account
          </h1>
          <p class="text-medium-grey">
            Start your banking journey by opening an account with us today.
          </p>
        </div>
        <div class="flex items-center gap-2">
          <button class="btn btn-ghost" @click="goBack">← Back to Dashboard</button>
        </div>
      </div>

      <!-- Content -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Benefits / Info -->
        <section class="card-base lg:col-span-1 h-fit">
          <div class="flex items-center gap-3">
            <div class="logo-badge">YB</div>
            <div>
              <p class="font-heading font-bold text-deep-teal text-lg tracking-tight">
                {{ selectedTypeLabel }}
              </p>
              <p class="text-slate-500 text-sm -mt-0.5">A great choice for {{ selectedTypeTagline }}</p>
            </div>
          </div>

          <ul class="mt-4 space-y-2 text-sm text-slate-700">
            <li class="flex items-start gap-2">
              <span class="chip chip-soft">Minimum deposit</span>
              <span class="font-medium">{{ formatCurrency(minDeposit) }}</span>
            </li>
            <li v-if="accountForm.accountType === 'Savings'" class="flex items-start gap-2">
              <span class="chip chip-soft">Flexible</span>
              <span>Withdraw anytime with no fees.</span>
            </li>
            <li v-if="accountForm.accountType === 'Fixed Savings'" class="flex items-start gap-2">
              <span class="chip chip-soft">Higher yield</span>
              <span>Earn more by keeping funds fixed.</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="chip chip-soft">Secure</span>
              <span>Protected by bank‑grade security.</span>
            </li>
          </ul>
        </section>

        <!-- Form -->
        <section class="card-base lg:col-span-2">
          <form @submit.prevent="createAccount" class="space-y-5">
            <div>
              <label for="accountType" class="label">Account Type</label>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                <label
                  v-for="t in accountTypes"
                  :key="t.value"
                  class="select-card"
                  :class="{ 'select-card-active': accountForm.accountType === t.value }"
                >
                  <input
                    type="radio"
                    class="sr-only"
                    name="accountType"
                    :value="t.value"
                    v-model="accountForm.accountType"
                  />
                  <div class="flex items-start justify-between">
                    <div>
                      <p class="font-semibold text-slate-800">{{ t.label }}</p>
                      <p class="text-xs text-slate-500">{{ t.caption }}</p>
                    </div>
                    <span class="chip chip-soft">{{ t.badge }}</span>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label for="initialDeposit" class="label">Initial Deposit</label>
              <div class="relative mt-2">
                <input
                  id="initialDeposit"
                  v-model.number="accountForm.initialDeposit"
                  type="number"
                  step="0.01"
                  min="0"
                  class="input-field pr-24"
                  placeholder="Enter amount"
                  @input="clearError('initialDeposit')"
                  required
                />
                <span class="amount-preview">
                  {{ formatCurrency(accountForm.initialDeposit || 0) }}
                </span>
              </div>
              <div class="mt-1 text-xs text-slate-600">
                Minimum deposit for {{ selectedTypeLabel }}: <span class="font-semibold">{{ formatCurrency(minDeposit) }}</span>
              </div>
              <p v-if="errors.initialDeposit" class="text-rose-700 text-sm mt-1">{{ errors.initialDeposit }}</p>
            </div>

            <div class="pt-2 flex flex-wrap justify-between items-center gap-3">
              <div class="text-sm text-slate-600">
                By continuing, you agree to our
                <a href="#" class="text-teal-700 hover:underline">Terms</a>
                and
                <a href="#" class="text-teal-700 hover:underline">Privacy Policy</a>.
              </div>
              <button type="submit" class="btn btn-primary" :disabled="loading">
                <span v-if="loading" class="inline-flex items-center gap-2">
                  <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                  </svg>
                  Opening...
                </span>
                <span v-else>Open Account</span>
              </button>
            </div>

            <p v-if="formError" class="alert-error" role="alert">{{ formError }}</p>
          </form>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();

const accountTypes = [
  {
    value: 'Savings',
    label: 'Savings',
    caption: 'Flexible access to your money',
    badge: 'Everyday',
  },
  {
    value: 'Fixed Savings',
    label: 'Fixed Savings',
    caption: 'Higher interest for fixed terms',
    badge: 'Higher yield',
  },
  // If your backend supports "Checking", you can add it back here.
];

const accountForm = ref({
  accountType: 'Savings',
  initialDeposit: 0,
});

const loading = ref(false);
const formError = ref('');
const errors = ref({
  initialDeposit: '',
});

const selectedTypeLabel = computed(() => {
  const t = accountTypes.find((x) => x.value === accountForm.value.accountType);
  return t?.label || 'Savings';
});
const selectedTypeTagline = computed(() =>
  accountForm.value.accountType === 'Fixed Savings' ? 'saving towards goals' : 'daily spending and saving'
);

// Adjust minimums to your product rules
const minDepositByType = {
  'Savings': 50,
  'Fixed Savings': 500,
};
const minDeposit = computed(() => minDepositByType[accountForm.value.accountType] ?? 0);

const clearError = (field) => (errors.value[field] = '');

const validate = () => {
  errors.value.initialDeposit = '';
  const amount = Number(accountForm.value.initialDeposit);
  if (Number.isNaN(amount) || amount <= 0) {
    errors.value.initialDeposit = 'Please enter a valid positive amount.';
  } else if (amount < minDeposit.value) {
    errors.value.initialDeposit = `Minimum deposit for ${selectedTypeLabel.value} is ${formatCurrency(minDeposit.value)}.`;
  }
  return !errors.value.initialDeposit;
};

const formatCurrency = (value) => {
  try {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(Number(value || 0));
  } catch {
    const num = Number(value || 0);
    return `R ${num.toFixed(2)}`;
  }
};

const goBack = () => router.push('/dashboard');

const createAccount = async () => {
  formError.value = '';
  if (!validate()) return;

  try {
    loading.value = true;
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to open an account.');
      router.push('/login');
      return;
    }

    // Send only required fields
    const payload = {
      accountType: accountForm.value.accountType,
      initialDeposit: Number(accountForm.value.initialDeposit),
      name: `${accountForm.value.accountType} Account`, // Optional: prefill a sensible name
    };

    const response = await axios.post('/api/accounts', payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    alert(`Account created successfully! Account Number: ${response.data.accountNumber || '—'}`);
    accountForm.value = { accountType: 'Savings', initialDeposit: 0 };
    router.push('/dashboard');
  } catch (error) {
    console.error('Error creating account:', error.response?.data?.message || error.message);
    formError.value = error.response?.data?.message || 'Account creation failed.';
    if (error.response?.status === 401) router.push('/login');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Tokens consistent with other upgraded pages */
.card-base {
  @apply bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl p-5 shadow-sm;
}
.btn {
  @apply inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition border border-transparent;
}
.btn-primary { @apply bg-deep-teal text-white hover:opacity-95 disabled:opacity-70 disabled:cursor-not-allowed; }
.btn-ghost { @apply bg-white text-slate-700 border border-slate-200 hover:bg-slate-50; }

.input-field {
  @apply w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 placeholder-slate-400
    focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400;
}
.label { @apply text-sm text-slate-600; }
.alert-error { @apply w-full text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2; }

.logo-badge {
  @apply h-10 w-10 rounded-lg bg-teal-600/10 text-teal-700 flex items-center justify-center font-bold;
}
.chip { @apply px-3 py-1.5 rounded-full text-sm border border-slate-200 text-slate-600 bg-white; }
.chip-soft { @apply px-2 py-1 rounded-full text-xs bg-teal-50 text-teal-700 border border-teal-200; }

/* Selectable account type cards */
.select-card { @apply card-base cursor-pointer transition; }
.select-card-active { @apply ring-2 ring-teal-300 border-teal-300; }

/* Amount preview inside the input */
.amount-preview {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.85rem;
  color: #0f766e; /* teal-700 */
  background: #f0fdfa; /* teal-50 */
  border: 1px solid #99f6e4; /* teal-200 */
  padding: 2px 8px;
  border-radius: 9999px;
}

/* Decorative background shapes */
.shape {
  position: absolute;
  border-radius: 9999px;
  filter: blur(60px);
  opacity: 0.4;
  transform: translateZ(0);
  pointer-events: none;
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
@media (min-width: 1024px) {
  .shape-1 { width: 560px; height: 560px; top: -160px; left: -160px; }
  .shape-2 { width: 680px; height: 680px; bottom: -220px; right: -200px; }
}
</style>
