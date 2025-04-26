<template>
  <div class="p-6 md:p-8 bg-light-grey-bg min-h-screen">
    <h1 class="text-3xl font-bold font-heading text-deep-teal mb-6">Learn More</h1>
    <p class="mt-4 text-medium-grey mb-8">
      Discover more about our services and offerings.
    </p>

    <div class="mt-8 max-w-3xl mx-auto space-y-4">
      <div v-for="(faq, index) in faqs" :key="index" class="card">
        <button
          @click="toggleFaq(index)"
          class="w-full text-left font-semibold font-heading text-deep-teal p-0 bg-transparent border-none flex justify-between items-center"
        >
          <span>{{ faq.question }}</span>
          <span>{{ faq.open ? '-' : '+' }}</span>
        </button>
        <div v-if="faq.open" class="mt-3 text-medium-grey pt-3 border-t border-light-grey-border">
          {{ faq.answer }}
        </div>
      </div>
    </div>
     <div class="text-center mt-12">
        <button class="btn btn-secondary" @click="goBack">Back to Homepage</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router'; // Import useRouter

const router = useRouter(); // Initialize router

const faqs = ref([
  {
    question: 'What is YourBank?',
    answer: 'YourBank is a modern banking platform offering secure and accessible financial services with a focus on clarity and ease of use.',
    open: false,
  },
  {
    question: 'How do I open an account?',
    answer: 'You can open an account online by registering through the "Get Started" button on the homepage and then using the "Open New Account" option in the dashboard menu.',
    open: false,
  },
  {
    question: 'Is my money safe?',
    answer: 'Yes, YourBank uses industry-standard security measures, including encryption and secure authentication, to protect your money and personal data.',
    open: false,
  },
   {
    question: 'What types of accounts can I open?',
    answer: 'Currently, you can open Savings and Fixed Savings accounts. More options may become available in the future.',
    open: false,
  },
   {
    question: 'How do I make payments?',
    answer: 'You can add beneficiaries and make payments through the "Pay Someone" option accessible from the dashboard menu.',
    open: false,
  },
]);

const toggleFaq = (index) => {
  faqs.value[index].open = !faqs.value[index].open;
};

const goBack = () => {
  router.push('/'); // Navigate back to homepage
};
</script>

<style scoped>
.min-h-screen {
  min-height: 100vh;
}
</style>
