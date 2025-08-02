import config from './config.json';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import axios from 'axios';
import './assets/main.css'; // Import the main CSS file

axios.defaults.baseURL = config.apiBaseUrl; // Use config value

createApp(App)
  .use(router)
  .mount('#app');

  // Use other URLs from config as needed:
  // import config from '../config.json';

  // const response = await axios.get(`${config.anotherServiceUrl}/some-endpoint`);