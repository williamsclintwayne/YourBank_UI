import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import axios from 'axios';
import './assets/main.css'; // Import the main CSS file

axios.defaults.baseURL = 'http://localhost:5000'; // Set base URL for Axios

createApp(App)
  .use(router)
  .mount('#app');