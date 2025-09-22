<template>
  <div class="relative min-h-screen bg-slate-50 flex flex-col">
    <!-- Decorative background shapes -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
    </div>

    <!-- Top nav -->
    <header class="relative z-10">
      <div class="mx-auto max-w-7xl px-6 md:px-8 py-4 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="logo-badge">YB</div>
          <span class="font-heading font-bold text-deep-teal text-lg tracking-tight">YourBank</span>
        </div>
        <nav class="flex items-center gap-2">
          <button class="btn btn-ghost hidden md:inline-flex" @click="navigateToLogin">Login</button>
          <button class="btn btn-primary" @click="navigateToGetStarted">Get Started</button>
        </nav>
      </div>
    </header>

    <!-- Hero -->
    <section class="relative z-10 mx-auto max-w-7xl px-6 md:px-8 pt-8 md:pt-14">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div>
          <h1 class="text-4xl md:text-5xl font-heading font-bold text-deep-teal tracking-tight">
            Modern banking that’s clear, calm, and capable
          </h1>
          <p class="mt-4 text-medium-grey text-lg">
            Manage accounts, make payments, and track transactions effortlessly—built with a soothing mint theme for everyday clarity.
          </p>
          <div class="mt-6 flex flex-wrap items-center gap-3">
            <button class="btn btn-primary" @click="navigateToGetStarted">Open an account</button>
            <button class="btn btn-secondary" @click="navigateToLogin">I already have an account</button>
          </div>

          <div class="mt-6 flex flex-wrap items-center gap-2">
            <span class="chip chip-soft">Bank‑grade encryption</span>
            <span class="chip chip-soft">No hidden fees</span>
            <span class="chip chip-soft">24/7 support</span>
          </div>
        </div>

        <!-- Hero card -->
        <div class="hero-card card-base">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="avatar">YB</div>
              <div>
                <p class="font-semibold text-slate-800">YourBank Account</p>
                <p class="text-xs text-slate-500">•••• 7087</p>
              </div>
            </div>
            <span class="chip chip-soft">Savings</span>
          </div>
          <div class="mt-5">
            <p class="label-muted">Balance</p>
            <p class="text-3xl font-bold text-slate-900 tracking-tight">R 18,720</p>
          </div>
          <div class="mt-5 grid grid-cols-2 gap-3">
            <button class="btn btn-primary w-full" @click="navigateToGetStarted">Open account</button>
            <button class="btn btn-secondary w-full" @click="navigateToLogin">Sign in</button>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="relative z-10 mx-auto max-w-7xl px-6 md:px-8 mt-16">
      <h2 class="text-2xl md:text-3xl font-heading font-semibold text-deep-teal text-center">Why YourBank</h2>
      <div class="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="feature-card">
          <div class="feature-icon bg-teal-500/10 text-teal-600">🔒</div>
          <h3 class="feature-title">Secure by default</h3>
          <p class="feature-copy">Strong encryption, secure sessions, and privacy‑first design.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon bg-indigo-500/10 text-indigo-600">⚡</div>
          <h3 class="feature-title">Fast payments</h3>
          <p class="feature-copy">Send and receive money in a few effortless steps.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon bg-amber-500/10 text-amber-600">📊</div>
          <h3 class="feature-title">Clear insights</h3>
          <p class="feature-copy">Readable transactions with smart filters and exports.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon bg-rose-500/10 text-rose-600">💬</div>
          <h3 class="feature-title">Helpful support</h3>
          <p class="feature-copy">We’re here 24/7 with real help when you need it.</p>
        </div>
      </div>
    </section>

    <!-- Testimonials -->
    <section class="relative z-10 mx-auto max-w-7xl px-6 md:px-8 mt-16">
      <h2 class="text-2xl md:text-3xl font-heading font-semibold text-deep-teal text-center">What our customers say</h2>
      <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="testimonial card-base">
          <p class="text-slate-600 italic">
            “YourBank makes managing finances so clear and simple. The mint theme is surprisingly calming for a bank app!”
          </p>
          <p class="mt-4 text-slate-800 font-semibold">— Alex R.</p>
        </div>
        <div class="testimonial card-base">
          <p class="text-slate-600 italic">
            “Finally, a banking app that feels modern and trustworthy. Adding beneficiaries and paying is incredibly easy.”
          </p>
          <p class="mt-4 text-slate-800 font-semibold">— Sarah L.</p>
        </div>
      </div>
    </section>

    <!-- CTA band -->
    <section class="relative z-10 mt-16">
      <div class="cta-band">
        <div class="mx-auto max-w-7xl px-6 md:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 class="text-white text-2xl font-semibold tracking-tight">Ready to get started?</h3>
            <p class="text-white/80">Open an account in minutes—no paperwork, no queues.</p>
          </div>
          <div class="flex items-center gap-2">
            <button class="btn btn-primary bg-white text-deep-teal hover:opacity-95" @click="navigateToGetStarted">Open account</button>
            <button class="btn btn-ghost text-white border-white/50 hover:bg-white/10" @click="navigateToLogin">Login</button>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="relative z-10 mt-12">
      <div class="mx-auto max-w-7xl px-6 md:px-8 py-8 text-center text-slate-600">
        © {{ new Date().getFullYear() }} YourBank. All rights reserved.
      </div>
    </footer>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const navigateToGetStarted = () => {
  router.push('/get-started');
};

const navigateToLogin = () => {
  router.push('/login');
};

// Added function to navigate to Learn More page
const navigateToLearnMore = () => {
  router.push('/learn-more');
};
</script>

<style scoped>
/* Base tokens shared with other pages */
.card-base {
  @apply bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl p-5 shadow-sm;
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
.chip-soft {
  @apply px-2 py-1 rounded-full text-xs bg-teal-50 text-teal-700 border border-teal-200;
}
.chip {
  @apply px-3 py-1.5 rounded-full text-sm border border-slate-200 text-slate-600 bg-white;
}
.label-muted {
  @apply text-xs uppercase tracking-wide text-slate-400;
}

/* Logo badge */
.logo-badge {
  @apply h-9 w-9 rounded-lg bg-teal-600/10 text-teal-700 flex items-center justify-center font-bold;
}

/* Hero card visual */
.hero-card {
  position: relative;
  overflow: hidden;
}
.hero-card::before {
  content: "";
  position: absolute;
  inset: -2px;
  z-index: -1;
  background: conic-gradient(from 180deg, rgba(13,148,136,.20), rgba(59,130,246,.20), rgba(13,148,136,.20));
  filter: blur(14px);
  opacity: .55;
  border-radius: 14px;
}

/* Avatar */
.avatar {
  @apply h-10 w-10 rounded-full bg-teal-600/10 text-teal-700 flex items-center justify-center font-semibold;
}

/* Feature cards */
.feature-card {
  @apply card-base p-5 transition hover:shadow-md;
}
.feature-icon {
  @apply h-9 w-9 rounded-lg flex items-center justify-center font-semibold;
}
.feature-title {
  @apply mt-3 font-semibold text-slate-800;
}
.feature-copy {
  @apply text-sm text-slate-600 mt-1;
}

/* Testimonials */
.testimonial {
  @apply p-6;
}

/* CTA band (full-bleed, desktop-safe) */
.cta-band {
  background: linear-gradient(90deg, #0f766e, #2563eb);
  /* Make it span the viewport even if parent uses items-center */
  width: 100vw;
  position: relative;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 0; /* flush edges on desktop */
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

/* Desktop refinements */
@media (min-width: 1024px) {
  .shape-1 {
    width: 560px;
    height: 560px;
    top: -160px;
    left: -160px;
  }
  .shape-2 {
    width: 680px;
    height: 680px;
    bottom: -220px;
    right: -200px;
  }
}

/* Prevent horizontal scroll from full-bleed and shapes */
:global(html), :global(body) {
  overflow-x: hidden;
}
</style>