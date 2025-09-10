import { ref, onMounted, onUnmounted } from 'vue';
import { io } from 'socket.io-client';
import { useToast } from 'vue-toastification';
import config from '../config.json';

export function useNotifications() {
  const socket = ref(null);
  const isConnected = ref(false);
  const toast = useToast();

  const connectSocket = () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      // Create socket connection
      socket.value = io(config.notificationServiceUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
        timeout: 5000, // Add timeout
        forceNew: true // Force new connection
      });

      socket.value.on('connect', () => {
        console.log('Connected to notification service');
        isConnected.value = true;
        
        // Join user room for notifications
        const userId = JSON.parse(atob(token.split('.')[1])).id;
        socket.value.emit('join', userId);
      });

      socket.value.on('disconnect', () => {
        console.log('Disconnected from notification service');
        isConnected.value = false;
      });

      socket.value.on('new_notification', (notification) => {
        console.log('New notification received:', notification);
        
        // Show toast notification
        const message = `💰 ${notification.title}: ${notification.message}`;
        
        switch (notification.type) {
          case 'transaction':
            toast.info(message);
            break;
          case 'security':
            toast.warning(message);
            break;
          case 'account':
            toast.success(message);
            break;
          default:
            toast(message);
        }
      });

      socket.value.on('transaction_alert', (data) => {
        const message = `Transaction: ${data.type} of $${data.amount} from ${data.account}`;
        toast.info(message);
      });

      socket.value.on('security_alert', (data) => {
        toast.warning(`Security Alert: ${data.message}`, {
          timeout: 10000 // Show longer for security alerts
        });
      });

      socket.value.on('connect_error', (error) => {
        console.warn('Socket connection error (backend not available):', error.message);
        isConnected.value = false;
        
        // Show user-friendly message instead of console errors
        if (error.description === 'ECONNREFUSED' || error.type === 'TransportError') {
          console.log('💡 Backend notification service not running - this is expected during development');
        }
      });

    } catch (error) {
      console.error('Error creating socket connection:', error);
    }
  };

  const disconnectSocket = () => {
    if (socket.value) {
      socket.value.disconnect();
      socket.value = null;
      isConnected.value = false;
    }
  };

  const sendNotification = (eventName, data) => {
    if (socket.value && isConnected.value) {
      socket.value.emit(eventName, data);
    }
  };

  onMounted(() => {
    connectSocket();
  });

  onUnmounted(() => {
    disconnectSocket();
  });

  return {
    socket,
    isConnected,
    connectSocket,
    disconnectSocket,
    sendNotification
  };
}
