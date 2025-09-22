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
            Notification Settings
          </h1>
          <p class="text-medium-grey">Choose how and when we keep you informed.</p>
        </div>

        <div class="flex items-center gap-2">
          <button class="btn btn-ghost" @click="navigateBack">← Back to Dashboard</button>
        </div>
      </div>

      <!-- Content -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left: Tips / Info -->
        <aside class="card-base h-fit">
          <h3 class="text-lg font-semibold text-deep-teal mb-2">Helpful tips</h3>
          <ul class="space-y-2 text-sm text-slate-600">
            <li>• Email is best for statements and longer updates.</li>
            <li>• SMS is ideal for real‑time security alerts.</li>
            <li>• You can change these at any time.</li>
          </ul>

          <div class="mt-5">
            <h4 class="label mb-2">Security</h4>
            <div class="grid grid-cols-2 gap-2">
              <span class="chip chip-soft">Bank‑grade encryption</span>
              <span class="chip chip-soft">Opt‑in only</span>
            </div>
          </div>

          <div class="mt-5">
            <h4 class="label mb-2">Recommended</h4>
            <div class="grid grid-cols-1 gap-2">
              <span class="chip chip-soft text-emerald-700 border-emerald-200 bg-emerald-50">Transaction alerts</span>
              <span class="chip chip-soft text-indigo-700 border-indigo-200 bg-indigo-50">Security alerts</span>
            </div>
          </div>
        </aside>

        <!-- Right: Settings module -->
        <section class="card-base lg:col-span-2">
          <!-- Wrap the component so it inherits the card spacing -->
          <NotificationSettings />
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import NotificationSettings from '../components/settings/NotificationSettings.vue';

const router = useRouter();

const navigateBack = () => {
  router.push('/dashboard');
};
</script>

<style scoped>
/* Base tokens to match the upgraded app style */
.card-base {
  @apply bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl p-5 shadow-sm;
}
.label { @apply text-sm text-slate-600; }

.btn {
  @apply inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition border border-transparent;
}
.btn-ghost { @apply bg-white text-slate-700 border border-slate-200 hover:bg-slate-50; }

.chip { @apply px-3 py-1.5 rounded-full text-sm border border-slate-200 text-slate-600 bg-white; }
.chip-soft { @apply px-2 py-1 rounded-full text-xs bg-teal-50 text-teal-700 border border-teal-200; }

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