import { createRouter, createWebHistory } from 'vue-router';
import DashboardPage from '../components/DashboardPage.vue';
import Payments from '../components/Payments.vue';
import Transactions from '../components/Transactions.vue';
import LoginPage from '../components/LoginPage.vue';
import HomePage from '../components/HomePage.vue'; // Ensure HomePage is correctly imported
import GetStartedPage from '../components/GetStartedPage.vue';
import UpdateProfile from '../pages/UpdateProfile.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage, // Ensure this component exists and is correctly imported
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardPage,
  },
  {
    path: '/payments',
    name: 'Payments',
    component: Payments,
  },
  {
    path: '/transactions/:accountId',
    name: 'Transactions',
    component: Transactions,
    props: true,
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
  },
  {
    path: '/get-started',
    name: 'GetStarted',
    component: GetStartedPage,
  },
  { path: '/update-profile', component: UpdateProfile },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
