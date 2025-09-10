<template>
  <div class="p-6 md:p-8 bg-light-grey-bg min-h-screen">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <h1 class="text-3xl font-bold font-heading text-deep-teal mb-2 md:mb-0">Transaction History</h1>
      <div class="flex space-x-2">
        <button @click="refreshTransactions" class="btn btn-secondary">
          <span v-if="isLoading">Refreshing...</span>
          <span v-else>Refresh</span>
        </button>
        <button @click="showBulkActions = !showBulkActions" class="btn btn-outline">
          Bulk Actions
        </button>
        <button @click="navigateBack" class="btn btn-secondary">Back to Dashboard</button>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-md p-4 mb-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select v-model="filters.status" @change="applyFilters" class="w-full px-3 py-2 border border-gray-300 rounded-md">
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select v-model="filters.type" @change="applyFilters" class="w-full px-3 py-2 border border-gray-300 rounded-md">
            <option value="">All Types</option>
            <option value="transfer">Transfer</option>
            <option value="deposit">Deposit</option>
            <option value="withdrawal">Withdrawal</option>
            <option value="payment">Payment</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Proof Status</label>
          <select v-model="filters.proofGenerated" @change="applyFilters" class="w-full px-3 py-2 border border-gray-300 rounded-md">
            <option value="">All</option>
            <option value="true">Has Proof</option>
            <option value="false">No Proof</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input 
            v-model="filters.search" 
            @input="debouncedSearch"
            type="text" 
            placeholder="Transaction ID, description..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>
    </div>

    <!-- Bulk Actions -->
    <div v-if="showBulkActions" class="bg-white rounded-lg shadow-md p-4 mb-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Bulk Actions</h3>
      <div class="flex items-center space-x-4">
        <label class="flex items-center">
          <input 
            type="checkbox" 
            @change="toggleSelectAll"
            :checked="selectedTransactions.length === completedTransactions.length && completedTransactions.length > 0"
            class="mr-2"
          />
          Select All Completed Transactions
        </label>
        
        <button 
          @click="bulkGenerateProofs"
          :disabled="selectedTransactions.length === 0 || isBulkGenerating"
          class="btn btn-primary"
        >
          <span v-if="isBulkGenerating">Generating...</span>
          <span v-else>Generate Proofs ({{ selectedTransactions.length }})</span>
        </button>
        
        <span class="text-sm text-gray-600">
          Selected: {{ selectedTransactions.length }} / Max: 10
        </span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <span class="ml-3 text-gray-600">Loading transactions...</span>
    </div>

    <!-- Transactions List -->
    <div v-else-if="transactions.length > 0" class="space-y-4">
      <div v-for="transaction in transactions" :key="transaction._id" class="relative">
        <!-- Bulk Selection Checkbox -->
        <div v-if="showBulkActions && transaction.status === 'completed'" class="absolute top-4 left-4 z-10">
          <input 
            type="checkbox"
            :value="transaction.transactionId"
            v-model="selectedTransactions"
            :disabled="selectedTransactions.length >= 10 && !selectedTransactions.includes(transaction.transactionId)"
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </div>
        
        <ProofOfPayment 
          :transaction="transaction" 
          :class="{'ml-8': showBulkActions && transaction.status === 'completed'}"
        />
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <div class="mx-auto h-24 w-24 text-gray-300 mb-4">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
          </path>
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
      <p class="text-gray-500 mb-4">
        {{ showDeveloperInfo ? 'Backend API endpoints need to be implemented. See integration guide below.' : 'Start making transactions to see them here.' }}
      </p>
      <p v-if="showDeveloperInfo" class="text-sm text-blue-600">
        Required endpoint: <code>/api/transactions/history</code>
      </p>
    </div>

    <!-- Developer Info Component -->
    <DeveloperInfo v-if="showDeveloperInfo" />

    <!-- Pagination -->
    <div v-if="pagination && pagination.totalPages > 1" class="flex justify-center items-center space-x-2 mt-8">
      <button 
        @click="changePage(pagination.currentPage - 1)"
        :disabled="pagination.currentPage <= 1"
        class="btn btn-outline"
      >
        Previous
      </button>
      
      <span class="text-sm text-gray-600">
        Page {{ pagination.currentPage }} of {{ pagination.totalPages }}
        ({{ pagination.total }} total transactions)
      </span>
      
      <button 
        @click="changePage(pagination.currentPage + 1)"
        :disabled="pagination.currentPage >= pagination.totalPages"
        class="btn btn-outline"
      >
        Next
      </button>
    </div>

    <!-- Bulk Generation Results -->
    <div v-if="bulkResults" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Bulk Generation Results</h3>
        
        <div class="space-y-2 mb-4">
          <div v-for="result in bulkResults.results" :key="result.transactionId" 
               class="flex justify-between items-center text-sm">
            <span>{{ result.transactionId }}</span>
            <span :class="result.success ? 'text-green-600' : 'text-red-600'">
              {{ result.success ? 'Success' : 'Failed' }}
            </span>
          </div>
        </div>
        
        <div class="text-sm text-gray-600 mb-4">
          <p>Successful: {{ bulkResults.summary.successful }}</p>
          <p>Failed: {{ bulkResults.summary.failed }}</p>
          <p>Total: {{ bulkResults.summary.total }}</p>
        </div>
        
        <button @click="closeBulkResults" class="btn btn-primary w-full">
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import NotificationService from '../services/notificationService';
import ProofOfPayment from '../components/ProofOfPayment.vue';
import DeveloperInfo from '../components/DeveloperInfo.vue';

const router = useRouter();
const toast = useToast();

// Reactive state
const transactions = ref([]);
const isLoading = ref(false);
const pagination = ref(null);
const filters = ref({
  status: '',
  type: '',
  proofGenerated: '',
  search: ''
});

// Bulk actions
const showBulkActions = ref(false);
const selectedTransactions = ref([]);
const isBulkGenerating = ref(false);
const bulkResults = ref(null);
const showDeveloperInfo = ref(false);

// Computed properties
const completedTransactions = computed(() => {
  return transactions.value.filter(t => t.status === 'completed');
});

// Methods
const fetchTransactions = async (page = 1) => {
  try {
    isLoading.value = true;
    const cleanFilters = Object.fromEntries(
      Object.entries(filters.value).filter(([_, value]) => value !== '')
    );
    
    const data = await NotificationService.getTransactionHistory(page, 20, cleanFilters);
    transactions.value = data.transactions || [];
    pagination.value = data.pagination || null;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    
    // Handle missing backend endpoints
    if (error.isEndpointMissing) {
      toast.error('Backend API not yet implemented. Please implement the transaction history endpoints.');
      transactions.value = [];
      pagination.value = null;
      showDeveloperInfo.value = true;
    } else {
      toast.error(error.message || 'Failed to fetch transactions');
    }
  } finally {
    isLoading.value = false;
  }
};

const refreshTransactions = () => {
  fetchTransactions(pagination.value?.currentPage || 1);
};

const applyFilters = () => {
  fetchTransactions(1); // Reset to first page when applying filters
};

const debouncedSearch = (() => {
  let timeout;
  return () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      applyFilters();
    }, 500);
  };
})();

const changePage = (page) => {
  if (page >= 1 && page <= pagination.value.totalPages) {
    fetchTransactions(page);
  }
};

const toggleSelectAll = () => {
  if (selectedTransactions.value.length === completedTransactions.value.length) {
    selectedTransactions.value = [];
  } else {
    selectedTransactions.value = completedTransactions.value
      .slice(0, 10)
      .map(t => t.transactionId);
  }
};

const bulkGenerateProofs = async () => {
  if (selectedTransactions.value.length === 0) {
    toast.warning('Please select at least one transaction');
    return;
  }
  
  if (selectedTransactions.value.length > 10) {
    toast.error('Maximum 10 transactions allowed for bulk generation');
    return;
  }
  
  try {
    isBulkGenerating.value = true;
    const results = await NotificationService.bulkGenerateProofs(selectedTransactions.value);
    
    bulkResults.value = results;
    
    // Update transaction proof status for successful generations
    results.results.forEach(result => {
      if (result.success) {
        const transaction = transactions.value.find(t => t.transactionId === result.transactionId);
        if (transaction) {
          transaction.proofGenerated = true;
          transaction.proofGeneratedAt = new Date().toISOString();
        }
      }
    });
    
    // Clear selections
    selectedTransactions.value = [];
    
    toast.success(`Bulk generation completed! ${results.summary.successful}/${results.summary.total} successful`);
  } catch (error) {
    console.error('Error in bulk generation:', error);
    toast.error(error.message || 'Failed to generate proofs in bulk');
  } finally {
    isBulkGenerating.value = false;
  }
};

const closeBulkResults = () => {
  bulkResults.value = null;
};

const navigateBack = () => {
  router.push('/dashboard');
};

// Lifecycle
onMounted(() => {
  fetchTransactions();
});
</script>

<style scoped>
.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.2s ease-in-out;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
}

.btn-secondary {
  background-color: #6b7280;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #4b5563;
}

.btn-outline {
  border: 1px solid #d1d5db;
  color: #374151;
  background-color: white;
}

.btn-outline:hover:not(:disabled) {
  background-color: #f9fafb;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
