<template>
  <div class="min-h-screen bg-gray-100 flex flex-col items-center">
    <!-- Hero Section -->
    <div class="text-center mt-16">
      <h1 class="text-5xl font-bold text-blue-600">Welcome to Your Banking Portal</h1>
      <p class="mt-4 text-gray-600 text-lg">
        Manage your accounts, make payments, and track your transactions with ease.
      </p>
      <div class="mt-8 flex justify-center gap-4">
        <button class="btn primary" @click="navigateToGetStarted">Get Started</button>
        <button class="btn secondary" @click="navigateToLogin">Login</button>
      </div>
    </div>

    <!-- About Section -->
    <div class="mt-16 px-8 text-center max-w-4xl">
      <h2 class="text-3xl font-semibold text-gray-800">About Our Bank</h2>
      <p class="mt-4 text-gray-600">
        Our bank is dedicated to providing exceptional financial services to our customers. With a wide range of
        offerings, including savings accounts, fixed deposits, and seamless payment options, we ensure that your
        financial needs are met with ease and security.
      </p>
      <p class="mt-4 text-gray-600">
        We prioritize customer satisfaction and innovation, making banking simple and accessible for everyone.
      </p>
    </div>

    <!-- Testimonials Section -->
    <div class="mt-16 px-8 text-center max-w-4xl">
      <h2 class="text-3xl font-semibold text-gray-800">What Our Customers Say</h2>
      <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="bg-white p-6 rounded-lg shadow-md">
          <p class="text-gray-600 italic">
            "This bank has transformed the way I manage my finances. The payment system is seamless, and the customer
            support is exceptional!"
          </p>
          <p class="mt-4 text-gray-800 font-bold">- John Doe</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-md">
          <p class="text-gray-600 italic">
            "I love how easy it is to add beneficiaries and make payments. This bank truly understands customer needs."
          </p>
          <p class="mt-4 text-gray-800 font-bold">- Jane Smith</p>
        </div>
      </div>
    </div>

    <!-- Footer Section -->
    <div class="mt-16 bg-blue-600 text-white w-full py-8 text-center">
      <p class="text-lg">© 2023 Your Banking Portal. All rights reserved.</p>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const navigateToGetStarted = () => {
  router.push('/get-started'); // Navigate to the GetStartedPage
};

const navigateToLogin = () => {
  router.push('/login'); // Navigate to the login page
};
</script>

<style scoped>
.min-h-screen {
  min-height: 100vh;
}

.bg-gray-100 {
  background-color: #f7fafc;
}

.text-center {
  text-align: center;
}

.btn.primary {
  background: #6366f1;
  color: white;
  padding: 0.8rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.btn.secondary {
  background: transparent;
  border: 2px solid #6366f1;
  color: #6366f1;
  padding: 0.8rem 2rem;
  border-radius: 8px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn.secondary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.bg-blue-600 {
  background-color: #6366f1;
}
</style>