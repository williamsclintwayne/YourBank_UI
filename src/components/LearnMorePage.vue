<template>
  <div class="p-8">
    <h1 class="text-3xl font-bold text-blue-600">Learn More</h1>
    <p class="mt-4 text-gray-600">Discover more about our services and offerings.</p>

    <div class="mt-8 max-w-3xl mx-auto">
      <div v-for="(faq, index) in faqs" :key="index" class="mb-6">
        <button
          @click="toggleFaq(index)"
          class="w-full text-left font-medium text-gray-800 bg-gray-100 p-4 rounded-lg shadow-md"
        >
          {{ faq.question }}
        </button>
        <div v-if="faq.open" class="mt-2 text-gray-600">
          {{ faq.answer }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const faqs = ref([
  {
    question: 'What is YourBank?',
    answer: 'YourBank is a modern banking platform offering secure and accessible financial services.',
    open: false,
  },
  {
    question: 'How do I open an account?',
    answer: 'You can open an account online by clicking the "Open an Account" button on the homepage.',
    open: false,
  },
  {
    question: 'Is my money safe?',
    answer: 'Yes, YourBank uses state-of-the-art security systems to protect your money and data.',
    open: false,
  },
]);

const toggleFaq = (index) => {
  faqs.value[index].open = !faqs.value[index].open;
};
</script>

<style scoped>
/* Add styles if needed */
</style>
