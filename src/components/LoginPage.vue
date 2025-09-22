<template>
  <div class="relative min-h-screen bg-slate-50 flex items-center justify-center overflow-x-hidden">
    <!-- Decorative background shapes -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
    </div>

    <main class="relative z-10 w-full max-w-5xl px-6 md:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <!-- Left hero (desktop only) -->
        <section class="hidden lg:block">
          <div class="hero card-base">
            <div class="flex items-center gap-3">
              <div class="logo-badge">YB</div>
              <div>
                <p class="font-heading font-bold text-deep-teal text-lg tracking-tight">YourBank</p>
                <p class="text-slate-500 text-sm -mt-0.5">Sign in to continue</p>
              </div>
            </div>

            <div class="mt-5">
              <p class="text-slate-700 font-semibold">Clear, calm, capable banking.</p>
              <ul class="mt-2 space-y-1.5 text-sm text-slate-600">
                <li>• Secure login with JWT</li>
                <li>• Manage accounts and payments</li>
                <li>• Exportable transactions</li>
              </ul>
            </div>
          </div>
        </section>

        <!-- Right: Login form -->
        <section class="card-base w-full max-w-md mx-auto">
          <header class="text-center mb-4">
            <h1 class="text-2xl md:text-3xl font-heading font-bold text-deep-teal tracking-tight">Login</h1>
            <p class="text-slate-500 text-sm mt-1">Welcome back. Please enter your details.</p>
          </header>

          <form @submit.prevent="login" class="space-y-4">
            <div>
              <label for="email" class="label">Email</label>
              <input
                v-model.trim="form.email"
                id="email"
                type="email"
                class="input-field"
                placeholder="you@example.com"
                autocomplete="email"
                required
              />
            </div>

            <div>
              <label for="password" class="label">Password</label>
              <div class="relative">
                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  id="password"
                  class="input-field pr-10"
                  placeholder="Enter your password"
                  autocomplete="current-password"
                  required
                />
                <button
                  type="button"
                  class="toggle-visibility"
                  :aria-label="showPassword ? 'Hide password' : 'Show password'"
                  @click="showPassword = !showPassword"
                >
                  {{ showPassword ? '🙈' : '👁️' }}
                </button>
              </div>
              <div class="mt-1 flex items-center justify-between">
                <label class="inline-flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  <input type="checkbox" v-model="remember" class="checkbox" />
                  Remember me
                </label>
                <button type="button" class="text-sm text-teal-700 hover:underline" @click="forgotPassword">
                  Forgot password?
                </button>
              </div>
            </div>

            <button type="submit" class="btn btn-primary w-full" :disabled="loading">
              <span v-if="loading" class="inline-flex items-center gap-2 justify-center">
                <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                </svg>
                Signing in...
              </span>
              <span v-else>Login</span>
            </button>

            <p v-if="errorMessage" class="alert-error" role="alert">
              {{ errorMessage }}
            </p>

            <button type="button" @click="goBack" class="btn btn-secondary w-full">Back to Homepage</button>
          </form>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();

const form = ref({
  email: '',
  password: '',
});
const remember = ref(true);
const showPassword = ref(false);
const loading = ref(false);
const errorMessage = ref('');

const login = async () => {
  errorMessage.value = '';
  if (!form.value.email || !form.value.password) return;

  try {
    loading.value = true;
    const response = await axios.post('/api/users/login', form.value);
    const token = response.data.token;
    if (!token) throw new Error('Login failed. No token received.');
    // Persist token
    if (remember.value) {
      localStorage.setItem('token', token);
    } else {
      sessionStorage.setItem('token', token);
    }
    router.push('/dashboard');
  } catch (error) {
    console.error('Error during login:', error.response?.data?.message || error.message);
    errorMessage.value = error.response?.data?.message || 'An error occurred during login.';
  } finally {
    loading.value = false;
  }
};

const forgotPassword = () => {
  // You can replace this with a real route when implemented
  alert('Password reset is not enabled yet.');
};

const goBack = () => {
  router.push('/');
};
</script>

<style scoped>
/* Card + surface */
.card-base {
  @apply bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl p-5 shadow-sm;
}

/* Buttons */
.btn {
  @apply inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition border border-transparent;
}
.btn-primary {
  @apply bg-deep-teal text-white hover:opacity-95 disabled:opacity-70 disabled:cursor-not-allowed;
}
.btn-secondary {
  @apply bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200;
}

/* Inputs */
.input-field {
  @apply w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 placeholder-slate-400
    focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400;
}
.label {
  @apply text-sm text-slate-600;
}
.checkbox {
  @apply h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-200;
}

/* Eye toggle */
.toggle-visibility {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  height: 30px;
  width: 30px;
  border-radius: 8px;
  border: 1px solid rgba(226,232,240,0.9);
  background: white;
  color: #334155;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background .16s ease, transform .16s ease;
}
.toggle-visibility:hover { background: #f8fafc; transform: translateY(-50%) scale(1.04); }

/* Error alert */
.alert-error {
  @apply w-full text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2;
}

/* Left hero */
.hero {
  position: relative;
  overflow: hidden;
}
.hero::before {
  content: "";
  position: absolute;
  inset: -2px;
  z-index: -1;
  background: conic-gradient(from 180deg, rgba(13,148,136,.18), rgba(59,130,246,.18), rgba(13,148,136,.18));
  filter: blur(16px);
  opacity: .55;
  border-radius: 14px;
}

/* Badges */
.logo-badge {
  @apply h-10 w-10 rounded-lg bg-teal-600/10 text-teal-700 flex items-center justify-center font-bold;
}

/* Background shapes */
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