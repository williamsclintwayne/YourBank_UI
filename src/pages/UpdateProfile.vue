<template>
  <div class="relative min-h-screen bg-slate-50">
    <!-- Decorative background shapes -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
    </div>

    <div class="relative z-10 p-6 md:p-8 mx-auto max-w-5xl">
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div class="space-y-1">
          <h1 class="text-3xl md:text-4xl font-heading font-bold text-deep-teal tracking-tight">
            Update Profile
          </h1>
          <p class="text-medium-grey">Keep your personal information up to date.</p>
        </div>

        <div class="flex items-center gap-3">
          <button class="btn btn-ghost" @click="goBack">← Back to Dashboard</button>
          <button class="btn btn-secondary" @click="fetchProfile" :disabled="loading">
            Refresh
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left: Profile card -->
        <section class="card-base lg:col-span-2">
          <div class="flex items-center gap-4 mb-6">
            <div class="avatar-ring">
              <div class="avatar">{{ initials(name) }}</div>
            </div>
            <div>
              <p class="text-slate-800 font-semibold leading-tight">
                {{ name || 'Your Name' }}
              </p>
              <p class="text-slate-500 text-sm leading-tight">
                {{ email || 'you@example.com' }}
              </p>
            </div>
          </div>

          <!-- Loading skeleton -->
          <div v-if="loading" class="space-y-3">
            <div class="skeleton h-10 rounded-lg"></div>
            <div class="skeleton h-10 rounded-lg"></div>
            <div class="skeleton h-10 rounded-lg"></div>
            <div class="flex justify-between gap-3 pt-2">
              <div class="skeleton h-10 rounded-lg flex-1"></div>
              <div class="skeleton h-10 rounded-lg flex-1"></div>
            </div>
          </div>

          <!-- Form -->
          <form v-else @submit.prevent="updateProfile" class="space-y-4">
            <div>
              <label for="address" class="label">Address</label>
              <textarea
                v-model="profile.address"
                id="address"
                rows="3"
                class="input-field resize-y"
                placeholder="Street, City, Postal Code"
                @input="validateField('address')"
                required
              ></textarea>
              <p v-if="errors.address" class="text-rose-600 text-sm mt-1">{{ errors.address }}</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="cellphone" class="label">Cellphone Number</label>
                <input
                  v-model="profile.cellphone"
                  id="cellphone"
                  type="tel"
                  inputmode="tel"
                  class="input-field"
                  placeholder="e.g. 082 123 4567"
                  @input="formatPhone(); validateField('cellphone')"
                  required
                />
                <p v-if="errors.cellphone" class="text-rose-600 text-sm mt-1">{{ errors.cellphone }}</p>
              </div>

              <div>
                <label for="employmentStatus" class="label">Employment Status</label>
                <select
                  v-model="profile.employmentStatus"
                  id="employmentStatus"
                  class="input-field"
                  @change="validateField('employmentStatus')"
                >
                  <option value="" disabled>Select Status</option>
                  <option value="Employed">Employed</option>
                  <option value="Unemployed">Unemployed</option>
                  <option value="Student">Student</option>
                </select>
                <p v-if="errors.employmentStatus" class="text-rose-600 text-sm mt-1">{{ errors.employmentStatus }}</p>
              </div>
            </div>

            <div class="flex flex-wrap justify-between gap-3 pt-2">
              <button type="button" class="btn btn-secondary" @click="goBack">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                <span v-if="saving" class="inline-flex items-center gap-2">
                  <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                  </svg>
                  Saving...
                </span>
                <span v-else>Save Changes</span>
              </button>
            </div>
          </form>
        </section>

        <!-- Right: Tips / Help -->
        <aside class="card-base h-fit">
          <h3 class="text-lg font-semibold text-deep-teal mb-3">Profile tips</h3>
          <ul class="space-y-2 text-sm text-slate-600">
            <li>• Use your current residential address for verification.</li>
            <li>• Enter a reachable cellphone number for OTPs.</li>
            <li>• Keep employment status updated for product eligibility.</li>
          </ul>

          <div class="mt-5">
            <h4 class="label mb-2">Security</h4>
            <div class="grid grid-cols-2 gap-2">
              <span class="chip chip-soft">2FA Enabled</span>
              <span class="chip chip-soft">Secure Session</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();

const loading = ref(false);
const saving = ref(false);

const name = ref('');
const email = ref('');

const profile = ref({
  address: '',
  cellphone: '',
  employmentStatus: '',
});

const errors = ref({
  address: '',
  cellphone: '',
  employmentStatus: '',
});

const initials = (fullName = '') => {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('') || 'U';
};

const formatPhone = () => {
  // Simple SA format: keep digits only, then format like 0xx xxx xxxx when 10 digits
  const digits = String(profile.value.cellphone || '').replace(/\D/g, '').slice(0, 12);
  if (digits.length === 10) {
    profile.value.cellphone = `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  } else {
    profile.value.cellphone = digits;
  }
};

const validateField = (field) => {
  errors.value[field] = '';
  const v = profile.value[field];

  if (field === 'address' && !String(v).trim()) {
    errors.value.address = 'Address is required.';
  }
  if (field === 'cellphone') {
    const digits = String(v || '').replace(/\D/g, '');
    if (!digits) errors.value.cellphone = 'Cellphone number is required.';
    else if (digits.length < 9) errors.value.cellphone = 'Enter a valid cellphone number.';
  }
  if (field === 'employmentStatus' && !String(v)) {
    errors.value.employmentStatus = 'Please select your employment status.';
  }
};

const validateAll = () => {
  validateField('address');
  validateField('cellphone');
  validateField('employmentStatus');
  return !errors.value.address && !errors.value.cellphone && !errors.value.employmentStatus;
};

const fetchProfile = async () => {
  try {
    loading.value = true;
    const token = localStorage.getItem('token');
    const authHeader = { headers: { Authorization: `Bearer ${token}` } };

    // Fetch user basic info
    const userRes = await axios.get('/api/users/profile', authHeader);
    const user = userRes.data.userId || userRes.data || {};
    name.value = user.name || '';
    email.value = user.email || '';

    // Fetch profile details
    const profileRes = await axios.get('/api/profile', authHeader);
    profile.value = {
      address: profileRes.data.address || user.address || '',
      cellphone: profileRes.data.cellphone || user.cellphone || '',
      employmentStatus: profileRes.data.employmentStatus || user.employmentStatus || '',
    };
  } catch (error) {
    console.error('Error fetching profile:', error.response?.data?.message || error.message);
    alert('Failed to load profile. Please try again.');
    if (error.response?.status === 401) router.push('/login');
  } finally {
    loading.value = false;
  }
};

const updateProfile = async () => {
  if (!validateAll()) return;

  try {
    saving.value = true;
    const token = localStorage.getItem('token');
    await axios.put(
      '/api/profile',
      {
        address: profile.value.address,
        cellphone: profile.value.cellphone,
        employmentStatus: profile.value.employmentStatus,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    alert('Profile updated successfully!');
    router.push('/dashboard');
  } catch (error) {
    console.error('Error updating profile:', error.message);
    alert(`Error updating profile: ${error.response?.data?.message || error.message}`);
  } finally {
    saving.value = false;
  }
};

const goBack = () => {
  router.push('/dashboard');
};

onMounted(() => {
  fetchProfile();
});
 </script>

<style scoped lang="postcss">
/* Shared UI tokens */
.card-base {
  @apply bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl p-5 shadow-sm;
}

.input-field {
  @apply w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 placeholder-slate-400
    focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400;
}

.label {
  @apply text-sm text-slate-600;
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
  @apply px-3 py-1.5 rounded-full text-sm border border-slate-200 text-slate-600 bg-white;
}
.chip-soft {
  @apply px-2 py-1 rounded-full text-xs bg-teal-50 text-teal-700 border border-teal-200;
}

/* Avatar + ring */
.avatar-ring {
  position: relative;
  display: inline-block;
}
.avatar-ring::before {
  content: "";
  position: absolute;
  inset: -3px;
  border-radius: 9999px;
  background: conic-gradient(from 180deg, rgba(13,148,136,.35), rgba(59,130,246,.35), rgba(13,148,136,.35));
  filter: blur(8px);
  opacity: .7;
}
.avatar {
  @apply relative h-12 w-12 rounded-full bg-teal-600/10 text-teal-700 flex items-center justify-center font-semibold;
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

/* Background shapes */
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