import config from './config.json';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import axios from 'axios';
import './assets/main.css'; // Import the main CSS file

// Toast notifications
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';

axios.defaults.baseURL = config.apiBaseUrl; // Use config value

const app = createApp(App);

// Configure toast options
const toastOptions = {
  position: 'top-right',
  timeout: 5000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false
};

app.use(router);
app.use(Toast, toastOptions);
app.mount('#app');