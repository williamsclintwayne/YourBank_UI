import axios from 'axios';
import config from '../config.json';

const API_URL = config.apiBaseUrl + '/api';

class NotificationService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Get user notifications
  async getNotifications(page = 1, limit = 20) {
    try {
      const response = await this.api.get(`/notifications?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      const response = await this.api.patch(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Mark all notifications as read
  async markAllAsRead() {
    try {
      const response = await this.api.patch('/notifications/mark-all-read');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Delete notification
  async deleteNotification(notificationId) {
    try {
      const response = await this.api.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get notification preferences
  async getPreferences() {
    try {
      const response = await this.api.get('/notifications/preferences');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Update notification preferences
  async updatePreferences(preferences) {
    try {
      const response = await this.api.put('/notifications/preferences', preferences);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Send test notification
  async sendTestNotification(data) {
    try {
      const response = await this.api.post('/notifications/test', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Email bank statement
  async emailBankStatement(accountId, period) {
    try {
      const response = await this.api.post('/transactions/email-statement', {
        accountId,
        period
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // ===== PROOF OF PAYMENT SERVICES =====

  // Generate proof of payment PDF for a specific transaction
  async generateProofOfPayment(transactionId) {
    try {
      const response = await this.api.post(`/proof-of-payment/generate/${transactionId}`);
      return response.data;
    } catch (error) {
      console.error('Error generating proof of payment:', error);
      throw this.handleError(error);
    }
  }

  // Download proof of payment PDF file
  async downloadProofOfPayment(transactionId) {
    try {
      const response = await this.api.get(`/proof-of-payment/download/${transactionId}`, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf'
        }
      });
      
      // Create blob URL for download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `proof-of-payment-${transactionId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'PDF downloaded successfully' };
    } catch (error) {
      console.error('Error downloading proof of payment:', error);
      throw this.handleError(error);
    }
  }

  // View proof of payment PDF in browser
  async viewProofOfPayment(transactionId) {
    try {
      const response = await this.api.get(`/proof-of-payment/view/${transactionId}`, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf'
        }
      });
      
      // Create blob URL for viewing
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Open in new tab
      window.open(url, '_blank');
      
      return { success: true, message: 'PDF opened in new tab', url };
    } catch (error) {
      console.error('Error viewing proof of payment:', error);
      throw this.handleError(error);
    }
  }

  // Get transaction history with proof status
  async getTransactionHistory(page = 1, limit = 20, filters = {}) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });
      
      const response = await this.api.get(`/proof-of-payment/history?${params}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Check if proof of payment exists for a transaction
  async checkProofStatus(transactionId) {
    try {
      const response = await this.api.get(`/proof-of-payment/status/${transactionId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Generate multiple proofs of payment (bulk operation)
  async bulkGenerateProofs(transactionIds) {
    try {
      if (!Array.isArray(transactionIds) || transactionIds.length === 0) {
        throw new Error('Transaction IDs must be a non-empty array');
      }
      
      if (transactionIds.length > 10) {
        throw new Error('Maximum 10 transactions allowed for bulk generation');
      }
      
      const response = await this.api.post('/proof-of-payment/bulk-generate', {
        transactionIds
      });
      return response.data;
    } catch (error) {
      console.error('Error in bulk proof generation:', error);
      throw this.handleError(error);
    }
  }

  // Verify transaction via QR code or transaction ID (public endpoint)
  async verifyTransaction(transactionId) {
    try {
      const response = await this.api.get(`/proof-of-payment/verify/${transactionId}`);
      return response.data;
    } catch (error) {
      console.error('Error verifying transaction:', error);
      throw this.handleError(error);
    }
  }

  // Get all transactions for the authenticated user
  async getUserTransactions(page = 1, limit = 20, filters = {}) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });
      
      const response = await this.api.get(`/transactions?${params}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get specific transaction details
  async getTransactionDetails(transactionId) {
    try {
      const response = await this.api.get(`/transactions/${transactionId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Helper method to format transaction for display
  formatTransactionForDisplay(transaction, currentUserId) {
    if (!transaction) return null;
    
    const isOutgoing = transaction.fromUserId === currentUserId;
    const direction = isOutgoing ? 'outgoing' : 'incoming';
    
    return {
      ...transaction,
      direction,
      isOutgoing,
      displayAmount: isOutgoing ? `-${transaction.amount}` : `+${transaction.amount}`,
      counterparty: isOutgoing ? transaction.toUserName : transaction.fromUserName,
      counterpartyAccount: isOutgoing ? transaction.toAccountNumber : transaction.fromAccountNumber,
      relevantBalance: isOutgoing ? transaction.balanceAfterSender : transaction.balanceAfterRecipient,
      formattedDate: new Date(transaction.createdAt).toLocaleDateString(),
      formattedTime: new Date(transaction.createdAt).toLocaleTimeString(),
      canGenerateProof: transaction.status === 'completed',
      proofStatus: transaction.proofGenerated ? 'generated' : 'not-generated'
    };
  }

  // Helper method to validate transaction ID format
  isValidTransactionId(transactionId) {
    const pattern = /^YB\d{5}[A-Z]{3}$/;
    return pattern.test(transactionId);
  }

  // Transaction history with filtering and pagination
  async getTransactionHistory(page = 1, limit = 20, filters = {}) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });
      
      const response = await this.api.get(`/proof-of-payment/history?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      
      // If backend endpoints not implemented yet, provide helpful message and mock data
      if (error.response?.status === 404 || error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        console.warn('⚠️ Backend not available - using mock data for development');
        
        // Return mock data for development
        return {
          success: true,
          data: {
            transactions: this.generateMockTransactions(page, limit),
            pagination: {
              page: parseInt(page),
              limit: parseInt(limit),
              total: 50,
              totalPages: Math.ceil(50 / parseInt(limit))
            }
          }
        };
      }
      
      throw this.handleError(error);
    }
  }

  // Helper method to handle API errors
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      return {
        message: error.response.data?.message || error.response.statusText || 'An error occurred',
        status: error.response.status,
        data: error.response.data
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        message: 'No response from server. Please check your connection.',
        status: 0
      };
    } else {
      // Something else happened
      return {
        message: error.message || 'An unexpected error occurred',
        status: 0
      };
    }
  }

  // Helper method to get transaction status badge color
  getStatusBadgeColor(status) {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
      'failed': 'bg-red-100 text-red-800',
      'cancelled': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  // Helper method to get proof status badge
  getProofStatusBadge(proofGenerated) {
    return proofGenerated 
      ? { color: 'bg-green-100 text-green-800', text: 'Proof Available' }
      : { color: 'bg-gray-100 text-gray-800', text: 'No Proof' };
  }

  // Generate mock transaction data for development
  generateMockTransactions(page = 1, limit = 20) {
    const mockTransactions = [];
    const startIndex = (page - 1) * limit;
    
    for (let i = 0; i < limit; i++) {
      const index = startIndex + i + 1;
      const isOutgoing = Math.random() > 0.5;
      const amount = (Math.random() * 5000 + 100).toFixed(2);
      const statuses = ['pending', 'completed', 'failed', 'cancelled'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const proofGenerated = status === 'completed' && Math.random() > 0.3;
      
      mockTransactions.push({
        transactionId: `YB${String(index).padStart(5, '0')}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
        amount: parseFloat(amount),
        status,
        description: isOutgoing ? `Transfer to Account ${1000 + Math.floor(Math.random() * 9000)}` : `Received from Account ${1000 + Math.floor(Math.random() * 9000)}`,
        type: isOutgoing ? 'transfer' : 'deposit',
        fromUserName: isOutgoing ? 'Your Account' : `User ${Math.floor(Math.random() * 1000)}`,
        toUserName: isOutgoing ? `User ${Math.floor(Math.random() * 1000)}` : 'Your Account',
        fromAccountNumber: isOutgoing ? '12345678' : `${1000 + Math.floor(Math.random() * 9000)}`,
        toAccountNumber: isOutgoing ? `${1000 + Math.floor(Math.random() * 9000)}` : '12345678',
        reference: `REF${Math.floor(Math.random() * 100000)}`,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
        proofGenerated,
        proofGeneratedAt: proofGenerated ? new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString() : null
      });
    }
    
    return mockTransactions;
  }
}

export default new NotificationService();
