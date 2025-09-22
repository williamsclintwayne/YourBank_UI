<template>
  <div class="relative min-h-screen bg-slate-50 overflow-x-hidden">
    <!-- Decorative background shapes -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
    </div>

    <div class="relative z-10 p-6 md:p-8 mx-auto max-w-7xl">
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div class="space-y-1">
          <h1 class="text-3xl md:text-4xl font-heading font-bold text-deep-teal tracking-tight">
            Profile View
          </h1>
          <p class="text-medium-grey">
            Viewing profile for
            <span class="font-semibold text-deep-teal">{{ displayName }}</span>.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button class="btn btn-ghost" @click="navigateBack">← Back to Dashboard</button>
        </div>
      </div>

      <!-- Content -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left: Details -->
        <section class="card-base lg:col-span-2">
          <div v-if="loading" class="space-y-3">
            <div class="skeleton h-8 rounded-lg w-40"></div>
            <div v-for="i in 8" :key="i" class="skeleton h-12 rounded-lg"></div>
          </div>

          <template v-else>
            <h2 class="text-xl font-semibold text-deep-teal mb-4">Profile Details</h2>

            <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              <div class="field">
                <dt class="label">Name</dt>
                <dd class="value">{{ displayName || '—' }}</dd>
              </div>

              <div class="field">
                <dt class="label">Email</dt>
                <dd class="value break-all">{{ userEmail || '—' }}</dd>
              </div>

              <div class="field">
                <dt class="label">ID Number</dt>
                <dd class="value">{{ maskedIdNumber || '—' }}</dd>
              </div>

              <div class="field">
                <dt class="label">Cellphone</dt>
                <dd class="value">{{ formattedCellphone || '—' }}</dd>
              </div>

              <div class="field sm:col-span-2">
                <dt class="label">Address</dt>
                <dd class="value whitespace-pre-line">{{ profile.address || '—' }}</dd>
              </div>

              <div class="field">
                <dt class="label">Title</dt>
                <dd class="value">{{ profile.title || '—' }}</dd>
              </div>

              <div class="field">
                <dt class="label">Gender</dt>
                <dd class="value">{{ profile.gender || '—' }}</dd>
              </div>

              <div class="field">
                <dt class="label">Employment Status</dt>
                <dd class="value">{{ profile.employmentStatus || '—' }}</dd>
              </div>

              <div class="field">
                <dt class="label">Account Opened On</dt>
                <dd class="value">{{ joinedDate || '—' }}</dd>
              </div>

              <div class="field sm:col-span-2">
                <dt class="label">Profile Picture</dt>
                <dd class="value">
                  <div class="flex items-center gap-3">
                    <img
                      v-if="profile.profilePicture"
                      :src="profile.profilePicture"
                      alt="Profile Picture"
                      class="h-12 w-12 rounded-full object-cover border border-slate-200"
                    />
                    <div v-else class="avatar-ring">
                      <div class="avatar">{{ initials(displayName) }}</div>
                    </div>
                    <span class="text-slate-500 text-sm">
                      {{ profile.profilePicture ? 'Uploaded' : 'No picture' }}
                    </span>
                  </div>
                </dd>
              </div>
            </dl>
          </template>
        </section>

        <!-- Right: Summary card -->
        <aside class="card-base h-fit">
          <div class="flex items-center gap-4">
            <div class="avatar-ring">
              <div class="avatar h-14 w-14 text-base">{{ initials(displayName) }}</div>
            </div>
            <div class="min-w-0">
              <p class="font-semibold text-slate-800 truncate">{{ displayName || 'Your Name' }}</p>
              <p class="text-slate-500 text-sm truncate">{{ userEmail || 'you@example.com' }}</p>
            </div>
          </div>

          <div class="mt-4 grid grid-cols-2 gap-2">
            <span class="chip chip-soft">Verified Email</span>
            <span class="chip chip-soft">Secure Session</span>
            <span class="chip chip-soft">Profile Complete</span>
            <span class="chip chip-soft" v-if="joinedDate">Joined {{ joinedDate }}</span>
          </div>

          <div class="mt-5 flex gap-2">
            <router-link to="/update-profile" class="btn btn-primary w-full text-center">Update Profile</router-link>
          </div>
        </aside>
      </div>

      <!-- Error -->
      <p v-if="errorMessage" class="alert-error mt-6" role="alert">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();

const loading = ref(false);
const errorMessage = ref('');

const userName = ref('');
const userEmail = ref('');

const profile = ref({
  idNumber: '',
  address: '',
  cellphone: '',
  title: '',
  gender: '',
  employmentStatus: '',
  profilePicture: '',
  createdAt: '',
});

const displayName = computed(() => userName.value || 'User');

const initials = (fullName = '') =>
  fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('') || 'U';

const formatPhone = (v) => {
  const digits = String(v || '').replace(/\D/g, '');
  if (digits.length === 10) return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  return digits || '';
};

const maskId = (v) => {
  const s = String(v || '').replace(/\s/g, '');
  if (s.length < 5) return s || '';
  return `${'•'.repeat(Math.max(0, s.length - 4))}${s.slice(-4)}`;
};

const formattedCellphone = computed(() => formatPhone(profile.value.cellphone));
const maskedIdNumber = computed(() => maskId(profile.value.idNumber));
const joinedDate = computed(() => {
  const d = profile.value.createdAt ? new Date(profile.value.createdAt) : null;
  return d && !isNaN(d) ? d.toLocaleDateString() : '';
});

const fetchProfile = async () => {
  try {
    loading.value = true;
    errorMessage.value = '';
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Basic user info
    const userRes = await axios.get('/api/users/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
    // The API sometimes nests under .userId
    const user = userRes.data?.userId || userRes.data || {};
    userName.value = user.name || '';
    userEmail.value = user.email || '';

    // Extended profile
    const profileRes = await axios.get('/api/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const p = profileRes.data || {};
    profile.value = {
      idNumber: p.idNumber || '',
      address: p.address || '',
      cellphone: p.cellphone || '',
      title: p.title || '',
      gender: p.gender || '',
      employmentStatus: p.employmentStatus || '',
      profilePicture: p.profilePicture || '',
      createdAt: p.createdAt || user.createdAt || '',
    };
  } catch (error) {
    console.error('Error fetching profile:', error);
    if (error.response?.status === 401) {
      router.push('/login');
      return;
    }
    errorMessage.value = error.response?.data?.message || error.message || 'Failed to load profile.';
  } finally {
    loading.value = false;
  }
};

const navigateBack = () => router.push('/dashboard');

onMounted(fetchProfile);
</script>

<style scoped>
/* Surface and shared tokens */
.card-base { @apply bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl p-5 shadow-sm; }
.btn { @apply inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition border border-transparent; }
.btn-primary { @apply bg-deep-teal text-white hover:opacity-95; }
.btn-ghost { @apply bg-white text-slate-700 border border-slate-200 hover:bg-slate-50; }
.chip { @apply px-3 py-1.5 rounded-full text-sm border border-slate-200 text-slate-600 bg-white; }
.chip-soft { @apply px-2 py-1 rounded-full text-xs bg-teal-50 text-teal-700 border border-teal-200; }
.label { @apply text-xs uppercase tracking-wide text-slate-500; }
.value { @apply text-slate-800; }
.alert-error { @apply w-full text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2; }

/* Definition list item */
.field { @apply border border-slate-200 rounded-lg p-3 bg-white; }

/* Avatar + ring */
.avatar-ring { position: relative; display: inline-block; }
.avatar-ring::before {
  content: ""; position: absolute; inset: -3px; border-radius: 9999px;
  background: conic-gradient(from 180deg, rgba(13,148,136,.35), rgba(59,130,246,.35), rgba(13,148,136,.35));
  filter: blur(8px); opacity: .7;
}
.avatar { @apply relative h-12 w-12 rounded-full bg-teal-600/10 text-teal-700 flex items-center justify-center font-semibold; }

/* Skeleton loading */
.skeleton {
  position: relative; overflow: hidden;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 37%, #f1f5f9 63%);
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
  border: 1px solid rgba(226,232,240,0.8);
}
@keyframes shimmer { 0% { background-position: 100% 0; } 100% { background-position: 0 0; } }

/* Decorative background shapes */
.shape {
  position: absolute; border-radius: 9999px; filter: blur(60px); opacity: 0.4;
  transform: translateZ(0); pointer-events: none;
}
.shape-1 {
  width: 420px; height: 420px;
  background: radial-gradient(circle at 30% 30%, rgba(20, 184, 166, 0.25), transparent 60%);
  top: -120px; left: -120px;
}
.shape-2 {
  width: 520px; height: 520px;
  background: radial-gradient(circle at 70% 70%, rgba(59, 130, 246, 0.22), transparent 60%);
  bottom: -160px; right: -160px;
}
@media (min-width: 1024px) {
  .shape-1 { width: 560px; height: 560px; top: -160px; left: -160px; }
  .shape-2 { width: 680px; height: 680px; bottom: -220px; right: -200px; }
}
</style>