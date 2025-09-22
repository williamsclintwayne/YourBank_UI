<template>
  <div class="relative min-h-screen bg-slate-50 flex items-center justify-center overflow-x-hidden">
    <!-- Decorative background shapes -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
    </div>

    <main class="relative z-10 w-full max-w-6xl px-6 md:px-8 py-10">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <!-- Left: Brand / Hero (desktop) -->
        <section class="hidden lg:block">
          <div class="hero card-base">
            <div class="flex items-center gap-3">
              <div class="logo-badge">YB</div>
              <div>
                <p class="font-heading font-bold text-deep-teal text-lg tracking-tight">YourBank</p>
                <p class="text-slate-500 text-sm -mt-0.5">Open your account in minutes</p>
              </div>
            </div>

            <div class="mt-5">
              <p class="text-slate-700 font-semibold">Clear, calm, capable banking.</p>
              <ul class="mt-2 space-y-1.5 text-sm text-slate-600">
                <li>• Bank‑grade security and privacy</li>
                <li>• Simple payments and smart insights</li>
                <li>• Friendly support when you need it</li>
              </ul>
            </div>

            <div class="mt-6 flex flex-wrap gap-2">
              <span class="chip chip-soft">No hidden fees</span>
              <span class="chip chip-soft">24/7 Support</span>
              <span class="chip chip-soft">Seamless onboarding</span>
            </div>
          </div>
        </section>

        <!-- Right: Registration form -->
        <section class="card-base w-full max-w-lg mx-auto">
          <header class="text-center mb-4">
            <h1 class="text-2xl md:text-3xl font-heading font-bold text-deep-teal tracking-tight">Register</h1>
            <p class="text-slate-500 text-sm mt-1">Create your profile to start banking with YourBank.</p>
          </header>

          <form @submit.prevent="registerUser" class="space-y-4">
            <div>
              <label for="name" class="label">Full Name</label>
              <input id="name" v-model.trim="form.name" type="text" class="input-field" required @input="clearError('name')" />
              <p v-if="errors.name" class="error">{{ errors.name }}</p>
            </div>

            <div>
              <label for="email" class="label">Email</label>
              <input id="email" v-model.trim="form.email" type="email" class="input-field" placeholder="you@example.com" required @input="clearError('email')" />
              <p v-if="errors.email" class="error">{{ errors.email }}</p>
            </div>

            <div>
              <label for="password" class="label">Password</label>
              <div class="relative">
                <input
                  id="password"
                  :type="showPassword ? 'text' : 'password'"
                  v-model="form.password"
                  class="input-field pr-10"
                  placeholder="At least 8 characters"
                  required
                  @input="clearError('password')"
                />
                <button type="button" class="toggle-visibility" :aria-label="showPassword ? 'Hide password' : 'Show password'" @click="showPassword = !showPassword">
                  {{ showPassword ? '🙈' : '👁️' }}
                </button>
              </div>

              <!-- Strength meter -->
              <div class="mt-2">
                <div class="strength-track">
                  <div class="strength-bar" :style="{ width: passwordStrength.width, background: passwordStrength.color }"></div>
                </div>
                <div class="flex items-center justify-between text-xs text-slate-500 mt-1">
                  <span>Strength: <span :style="{ color: passwordStrength.textColor }" class="font-medium">{{ passwordStrength.label }}</span></span>
                  <span>Use upper, lower, number, symbol</span>
                </div>
              </div>
              <p v-if="errors.password" class="error">{{ errors.password }}</p>
            </div>

            <div>
              <label for="idNumber" class="label">ID Number</label>
              <input
                id="idNumber"
                v-model="form.idNumber"
                type="text"
                inputmode="numeric"
                class="input-field"
                placeholder="Digits only"
                required
                @input="digitsOnly('idNumber', 13); clearError('idNumber')"
              />
              <p v-if="errors.idNumber" class="error">{{ errors.idNumber }}</p>
            </div>

            <div>
              <label for="cellphone" class="label">Cellphone</label>
              <input
                id="cellphone"
                v-model="form.cellphone"
                type="tel"
                inputmode="tel"
                class="input-field"
                placeholder="e.g. 082 123 4567"
                required
                @input="formatPhone(); clearError('cellphone')"
              />
              <p v-if="errors.cellphone" class="error">{{ errors.cellphone }}</p>
            </div>

            <div>
              <label for="address" class="label">Address</label>
              <textarea
                id="address"
                v-model.trim="form.address"
                rows="2"
                class="input-field resize-y"
                placeholder="Street, City, Postal Code"
                required
                @input="clearError('address')"
              ></textarea>
              <p v-if="errors.address" class="error">{{ errors.address }}</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="title" class="label">Title</label>
                <select id="title" v-model="form.title" class="input-field" required @change="clearError('title')">
                  <option value="" disabled>Select Title</option>
                  <option value="Mr">Mr</option>
                  <option value="Ms">Ms</option>
                  <option value="Mrs">Mrs</option>
                  <option value="Dr">Dr</option>
                </select>
                <p v-if="errors.title" class="error">{{ errors.title }}</p>
              </div>

              <div>
                <label for="gender" class="label">Gender</label>
                <select id="gender" v-model="form.gender" class="input-field" required @change="clearError('gender')">
                  <option value="" disabled>Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <p v-if="errors.gender" class="error">{{ errors.gender }}</p>
              </div>
            </div>

            <div>
              <label for="employmentStatus" class="label">Employment Status</label>
              <select id="employmentStatus" v-model="form.employmentStatus" class="input-field" required @change="clearError('employmentStatus')">
                <option value="" disabled>Select Status</option>
                <option value="Employed">Employed</option>
                <option value="Unemployed">Unemployed</option>
                <option value="Student">Student</option>
              </select>
              <p v-if="errors.employmentStatus" class="error">{{ errors.employmentStatus }}</p>
            </div>

            <button type="submit" class="btn btn-primary w-full mt-4" :disabled="loading">
              <span v-if="loading" class="inline-flex items-center gap-2 justify-center">
                <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                </svg>
                Creating account...
              </span>
              <span v-else>Register</span>
            </button>

            <p v-if="formError" class="alert-error" role="alert">{{ formError }}</p>

            <p class="text-center text-sm text-slate-600">
              Already have an account?
              <router-link to="/login" class="text-teal-700 font-medium hover:underline">Login</router-link>
            </p>
          </form>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();

const form = ref({
  name: '',
  email: '',
  password: '',
  idNumber: '',
  cellphone: '',
  address: '',
  title: '',
  gender: '',
  employmentStatus: '',
});

const errors = ref({
  name: '',
  email: '',
  password: '',
  idNumber: '',
  cellphone: '',
  address: '',
  title: '',
  gender: '',
  employmentStatus: '',
});

const showPassword = ref(false);
const loading = ref(false);
const formError = ref('');

// Password strength (simple)
const passwordScore = computed(() => {
  const p = form.value.password || '';
  let score = 0;
  if (p.length >= 8) score++;
  if (/[A-Z]/.test(p)) score++;
  if (/[a-z]/.test(p)) score++;
  if (/\d/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  return Math.min(score, 4); // 0..4
});
const passwordStrength = computed(() => {
  const map = [
    { label: 'Weak', width: '20%', color: '#fecaca', textColor: '#b91c1c' },
    { label: 'Fair', width: '40%', color: '#fde68a', textColor: '#92400e' },
    { label: 'Good', width: '60%', color: '#bbf7d0', textColor: '#166534' },
    { label: 'Strong', width: '80%', color: '#86efac', textColor: '#166534' },
    { label: 'Excellent', width: '100%', color: '#34d399', textColor: '#065f46' },
  ];
  return map[passwordScore.value] || map[0];
});

const clearError = (field) => (errors.value[field] = '');

const digitsOnly = (field, maxLen = 99) => {
  form.value[field] = String(form.value[field] || '').replace(/\D/g, '').slice(0, maxLen);
};

const formatPhone = () => {
  const digits = String(form.value.cellphone || '').replace(/\D/g, '').slice(0, 12);
  if (digits.length === 10) {
    form.value.cellphone = `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  } else {
    form.value.cellphone = digits;
  }
};

const validate = () => {
  let ok = true;
  // Reset
  Object.keys(errors.value).forEach((k) => (errors.value[k] = ''));

  if (!form.value.name.trim()) {
    errors.value.name = 'Full name is required.';
    ok = false;
  }
  if (!/^\S+@\S+\.\S+$/.test(form.value.email)) {
    errors.value.email = 'Enter a valid email address.';
    ok = false;
  }
  if (passwordScore.value < 2 || (form.value.password || '').length < 8) {
    errors.value.password = 'Use at least 8 characters including letters and numbers.';
    ok = false;
  }
  const idDigits = String(form.value.idNumber).replace(/\D/g, '');
  if (idDigits.length < 6) {
    errors.value.idNumber = 'Enter a valid ID number.';
    ok = false;
  }
  const phoneDigits = String(form.value.cellphone).replace(/\D/g, '');
  if (phoneDigits.length < 9) {
    errors.value.cellphone = 'Enter a valid cellphone number.';
    ok = false;
  }
  if (!form.value.address.trim()) {
    errors.value.address = 'Address is required.';
    ok = false;
  }
  ['title', 'gender', 'employmentStatus'].forEach((f) => {
    if (!form.value[f]) {
      errors.value[f] = 'This field is required.';
      ok = false;
    }
  });

  return ok;
};

const registerUser = async () => {
  formError.value = '';
  if (!validate()) return;

  try {
    loading.value = true;
    const payload = {
      ...form.value,
      idNumber: String(form.value.idNumber).replace(/\D/g, ''),
      cellphone: String(form.value.cellphone).replace(/\D/g, ''),
    };
    const response = await axios.post('/api/users/register', payload);
    if (response.status === 200 || response.status === 201) {
      alert('Registration successful! Please log in.');
      router.push('/login');
    } else {
      formError.value = 'Registration failed. Please try again.';
    }
  } catch (error) {
    console.error('Error registering user:', error.response?.data || error.message);
    formError.value = error.response?.data?.message || 'An error occurred while registering.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Surface */
.card-base {
  @apply bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl p-5 shadow-sm;
}

/* Inputs */
.input-field {
  @apply w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 placeholder-slate-400
    focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400;
}
.label { @apply text-sm text-slate-600; }
.error { @apply text-sm text-rose-700 mt-1; }

/* Buttons */
.btn {
  @apply inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition border border-transparent;
}
.btn-primary { @apply bg-deep-teal text-white hover:opacity-95 disabled:opacity-70 disabled:cursor-not-allowed; }
.btn-secondary { @apply bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200; }

/* Toggles */
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

/* Password strength */
.strength-track {
  height: 8px;
  border-radius: 9999px;
  background: #e2e8f0; /* slate-200 */
  overflow: hidden;
  border: 1px solid rgba(226,232,240,0.7);
}
.strength-bar {
  height: 100%;
  border-radius: 9999px;
  transition: width .2s ease;
}

/* Alerts */
.alert-error {
  @apply w-full text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2;
}

/* Hero */
.hero { position: relative; overflow: hidden; }
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
.chip { @apply px-3 py-1.5 rounded-full text-sm border border-slate-200 text-slate-600 bg-white; }
.chip-soft { @apply px-2 py-1 rounded-full text-xs bg-teal-50 text-teal-700 border border-teal-200; }

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