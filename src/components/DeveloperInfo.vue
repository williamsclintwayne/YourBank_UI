<template>
  <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
    <div class="flex items-start">
      <div class="flex-shrink-0">
        <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z">
          </path>
        </svg>
      </div>
      <div class="ml-3">
        <h3 class="text-lg font-medium text-blue-900 mb-2">
          Backend API Endpoints Required
        </h3>
        <p class="text-blue-800 mb-4">
          The proof of payment system is ready, but your backend needs to implement these API endpoints:
        </p>
        
        <div class="space-y-3">
          <div class="bg-white rounded p-3 border border-blue-200">
            <h4 class="font-medium text-blue-900 mb-2">Transaction History</h4>
            <code class="text-sm bg-gray-100 px-2 py-1 rounded">GET /api/transactions/history</code>
            <p class="text-sm text-blue-700 mt-1">Returns paginated transaction list with filters</p>
          </div>
          
          <div class="bg-white rounded p-3 border border-blue-200">
            <h4 class="font-medium text-blue-900 mb-2">Proof of Payment</h4>
            <div class="space-y-1">
              <div><code class="text-sm bg-gray-100 px-2 py-1 rounded">POST /api/proof-of-payment/generate/{id}</code></div>
              <div><code class="text-sm bg-gray-100 px-2 py-1 rounded">GET /api/proof-of-payment/download/{id}</code></div>
              <div><code class="text-sm bg-gray-100 px-2 py-1 rounded">GET /api/proof-of-payment/view/{id}</code></div>
              <div><code class="text-sm bg-gray-100 px-2 py-1 rounded">GET /api/proof-of-payment/verify/{id}</code></div>
              <div><code class="text-sm bg-gray-100 px-2 py-1 rounded">POST /api/proof-of-payment/bulk-generate</code></div>
            </div>
            <p class="text-sm text-blue-700 mt-1">PDF generation, download, and verification endpoints</p>
          </div>
        </div>
        
        <div class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p class="text-sm text-yellow-800">
            <strong>📄 Documentation:</strong> Check <code>PROOF_OF_PAYMENT_INTEGRATION.md</code> for detailed API specifications and response formats.
          </p>
        </div>
        
        <button 
          @click="$emit('close')" 
          class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Got it, I'll implement the backend
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineEmits(['close']);
</script>
