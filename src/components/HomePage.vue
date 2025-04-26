<template>
  <div class="min-h-screen bg-light-grey-bg flex flex-col items-center">
    <div class="text-center my-16 md:my-24 px-4">
      <h1 class="text-4xl md:text-5xl font-bold font-heading text-deep-teal">Welcome to YourBank</h1>
      <p class="mt-4 text-medium-grey text-lg max-w-2xl mx-auto">
        Modern banking designed for clarity and ease. Manage your accounts, make payments, and track transactions effortlessly.
      </p>
      <div class="mt-8 flex justify-center gap-4">
        <button class="btn btn-primary" @click="navigateToGetStarted">Get Started</button>
        <button class="btn btn-secondary" @click="navigateToLogin">Login</button>
      </div>
    </div>

    <div class="my-16 px-6 md:px-8 text-center max-w-4xl">
      <h2 class="text-3xl font-semibold font-heading text-deep-teal">About YourBank</h2>
      <p class="mt-4 text-medium-grey">
        We provide secure, accessible financial services with a refreshing approach. From savings accounts to seamless payments, we prioritize your financial well-being with modern technology and trustworthy support.
      </p>
    </div>

    <div class="my-16 px-6 md:px-8 text-center max-w-4xl w-full">
      <h2 class="text-3xl font-semibold font-heading text-deep-teal">What Our Customers Say</h2>
      <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="card text-left">
          <p class="text-medium-grey italic">
            "YourBank makes managing finances so clear and simple. The mint theme is surprisingly calming for a bank app!"
          </p>
          <p class="mt-4 text-charcoal font-semibold">- Alex R.</p>
        </div>
        <div class="card text-left">
          <p class="text-medium-grey italic">
            "Finally, a banking app that feels modern and trustworthy. Adding beneficiaries and paying is incredibly easy."
          </p>
          <p class="mt-4 text-charcoal font-semibold">- Sarah L.</p>
        </div>
      </div>
    </div>

    <div class="mt-16 bg-deep-teal text-white w-full py-8 text-center">
      <p class="text-base opacity-90">© {{ new Date().getFullYear() }} YourBank. All rights reserved.</p>
    </div>
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
</script>

<style scoped>
.min-h-screen {
  min-height: 100vh;
}
</style>