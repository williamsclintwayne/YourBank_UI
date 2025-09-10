<template>
  <div class="proof-of-payment-actions">
    <!-- Transaction Card with Proof Actions -->
    <div class="transaction-card bg-white rounded-lg shadow-md p-4 mb-4">
      <div class="flex justify-between items-start">
        <div class="flex-1">
          <div class="flex items-center space-x-2 mb-2">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ transaction.description }}
            </h3>
            <span 
              class="px-2 py-1 rounded-full text-xs font-medium"
              :class="getStatusBadgeColor(transaction.status)"
            >
              {{ transaction.status.toUpperCase() }}
            </span>
            <span 
              class="px-2 py-1 rounded-full text-xs font-medium"
              :class="proofBadge.color"
            >
              {{ proofBadge.text }}
            </span>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <p><strong>Transaction ID:</strong> {{ transaction.transactionId }}</p>
              <p><strong>Amount:</strong> {{ formatCurrency(transaction.amount) }}</p>
              <p><strong>Date:</strong> {{ formatDate(transaction.createdAt) }}</p>
            </div>
            <div>
              <p><strong>From:</strong> {{ transaction.fromUserName }} ({{ transaction.fromAccountNumber }})</p>
              <p v-if="transaction.toUserName">
                <strong>To:</strong> {{ transaction.toUserName }} ({{ transaction.toAccountNumber }})
              </p>
              <p v-if="transaction.reference">
                <strong>Reference:</strong> {{ transaction.reference }}
              </p>
            </div>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="flex flex-col space-y-2 ml-4">
          <button
            v-if="transaction.status === 'completed'"
            @click="generateProof"
            :disabled="isGenerating"
            class="btn btn-primary text-sm"
          >
            <span v-if="isGenerating">Generating...</span>
            <span v-else>{{ transaction.proofGenerated ? 'Regenerate' : 'Generate' }} Proof</span>
          </button>
          
          <button
            v-if="transaction.proofGenerated"
            @click="downloadProof"
            :disabled="isDownloading"
            class="btn btn-secondary text-sm"
          >
            <span v-if="isDownloading">Downloading...</span>
            <span v-else>Download PDF</span>
          </button>
          
          <button
            v-if="transaction.proofGenerated"
            @click="viewProof"
            class="btn btn-outline text-sm"
          >
            View PDF
          </button>
          
          <button
            @click="verifyTransaction"
            :disabled="isVerifying"
            class="btn btn-outline text-sm"
          >
            <span v-if="isVerifying">Verifying...</span>
            <span v-else>Verify</span>
          </button>
        </div>
      </div>
      
      <!-- Proof Generation Status -->
      <div v-if="proofStatus" class="mt-4 p-3 rounded-lg" :class="proofStatus.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'">
        <p class="text-sm">{{ proofStatus.message }}</p>
      </div>
      
      <!-- Verification Result -->
      <div v-if="verificationResult" class="mt-4 p-3 rounded-lg bg-blue-50 text-blue-800">
        <h4 class="font-medium mb-2">Transaction Verification</h4>
        <div class="text-sm space-y-1">
          <p><strong>Valid:</strong> {{ verificationResult.isValid ? 'Yes' : 'No' }}</p>
          <p><strong>Verified At:</strong> {{ formatDate(verificationResult.verifiedAt) }}</p>
          <p v-if="verificationResult.message">{{ verificationResult.message }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useToast } from 'vue-toastification';
import NotificationService from '../services/notificationService';

const props = defineProps({
  transaction: {
    type: Object,
    required: true
  }
});

const toast = useToast();

// Reactive state
const isGenerating = ref(false);
const isDownloading = ref(false);
const isVerifying = ref(false);
const proofStatus = ref(null);
const verificationResult = ref(null);

// Computed properties
const proofBadge = computed(() => {
  return NotificationService.getProofStatusBadge(props.transaction.proofGenerated);
});

// Methods
const generateProof = async () => {
  try {
    isGenerating.value = true;
    proofStatus.value = null;
    
    const result = await NotificationService.generateProofOfPayment(props.transaction.transactionId);
    
    // Update transaction proof status
    props.transaction.proofGenerated = true;
    props.transaction.proofGeneratedAt = new Date().toISOString();
    
    proofStatus.value = {
      type: 'success',
      message: result.message || 'Proof of payment generated successfully!'
    };
    
    toast.success('Proof of payment generated successfully!');
  } catch (error) {
    console.error('Error generating proof:', error);
    
    let errorMessage = 'Failed to generate proof of payment';
    if (error.response?.status === 404) {
      errorMessage = 'Proof of payment endpoint not implemented. Please implement /api/proof-of-payment/generate/{transactionId} in your backend.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    proofStatus.value = {
      type: 'error',
      message: errorMessage
    };
    toast.error(errorMessage);
  } finally {
    isGenerating.value = false;
  }
};

const downloadProof = async () => {
  try {
    isDownloading.value = true;
    
    await NotificationService.downloadProofOfPayment(props.transaction.transactionId);
    toast.success('PDF download started!');
  } catch (error) {
    console.error('Error downloading proof:', error);
    
    let errorMessage = 'Failed to download proof of payment';
    if (error.response?.status === 404) {
      errorMessage = 'Download endpoint not implemented. Please implement /api/proof-of-payment/download/{transactionId} in your backend.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    toast.error(errorMessage);
  } finally {
    isDownloading.value = false;
  }
};

const viewProof = async () => {
  try {
    await NotificationService.viewProofOfPayment(props.transaction.transactionId);
    toast.info('PDF opened in new tab');
  } catch (error) {
    console.error('Error viewing proof:', error);
    
    let errorMessage = 'Failed to view proof of payment';
    if (error.response?.status === 404) {
      errorMessage = 'View endpoint not implemented. Please implement /api/proof-of-payment/view/{transactionId} in your backend.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    toast.error(errorMessage);
  }
};

const verifyTransaction = async () => {
  try {
    isVerifying.value = true;
    verificationResult.value = null;
    
    const result = await NotificationService.verifyTransaction(props.transaction.transactionId);
    verificationResult.value = result;
    
    toast.success('Transaction verified successfully!');
  } catch (error) {
    console.error('Error verifying transaction:', error);
    
    let errorMessage = 'Failed to verify transaction';
    if (error.response?.status === 404) {
      errorMessage = 'Verification endpoint not implemented. Please implement /api/proof-of-payment/verify/{transactionId} in your backend.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    verificationResult.value = {
      isValid: false,
      message: errorMessage,
      verifiedAt: new Date().toISOString()
    };
    toast.error(errorMessage);
  } finally {
    isVerifying.value = false;
  }
};

const getStatusBadgeColor = (status) => {
  return NotificationService.getStatusBadgeColor(status);
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'ZAR'
  }).format(amount);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>

<style scoped>
.transaction-card {
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease-in-out;
}

.transaction-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn {
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: colors 0.2s ease-in-out;
  min-width: 100px;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background-color: #2563eb;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #1d4ed8;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #4b5563;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #374151;
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-outline {
  border: 1px solid #d1d5db;
  color: #374151;
  background-color: white;
}

.btn-outline:hover:not(:disabled) {
  background-color: #f9fafb;
}

.btn-outline:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
