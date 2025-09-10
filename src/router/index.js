import { createRouter, createWebHistory } from 'vue-router';
import DashboardPage from '../components/DashboardPage.vue';
import Payments from '../components/Payments.vue';
import Transactions from '../components/Transactions.vue';
import LoginPage from '../components/LoginPage.vue';
import HomePage from '../components/HomePage.vue';
import GetStartedPage from '../pages/GetStartedPage.vue'; // Updated path
import UpdateProfile from '../pages/UpdateProfile.vue'; // Path is correct, but good to verify
import OpenAccountPage from '../components/OpenAccountPage.vue';
import LearnMorePage from '../components/LearnMorePage.vue';
import ViewProfile from '../pages/ViewProfile.vue'; // Path is correct, but good to verify
import NotificationSettingsPage from '../pages/NotificationSettingsPage.vue';
import TransactionHistoryPage from '../pages/TransactionHistoryPage.vue';
import ProofOfPayment from '../components/ProofOfPayment.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardPage,
    meta: { requiresAuth: true } // Add meta field for protected routes
  },
  {
    path: '/payments',
    name: 'Payments',
    component: Payments,
     meta: { requiresAuth: true }
  },
  {
    path: '/transactions/:accountId',
    name: 'Transactions',
    component: Transactions,
    props: true,
     meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
  },
  {
    path: '/get-started',
    name: 'GetStarted',
    component: GetStartedPage, // No change needed here, just the import path
  },
  {
    path: '/update-profile',
    name: 'UpdateProfile',
    component: UpdateProfile, // No change needed here, just the import path
     meta: { requiresAuth: true }
   },
   {
    path: '/open-account', // Add route for OpenAccountPage
    name: 'OpenAccount',
    component: OpenAccountPage,
     meta: { requiresAuth: true }
  },
  {
    path: '/learn-more', // Add route for LearnMorePage
    name: 'LearnMore',
    component: LearnMorePage,
  },
  {
    path: '/view-profile',
    name: 'ViewProfile',
    component: ViewProfile, // No change needed here, just the import path
     meta: { requiresAuth: true }
   },
   {
    path: '/notification-settings',
    name: 'NotificationSettings',
    component: NotificationSettingsPage,
    meta: { requiresAuth: true }
   },
   {
    path: '/transaction-history',
    name: 'TransactionHistory',
    component: TransactionHistoryPage,
    meta: { requiresAuth: true }
   },
   {
    path: '/proof-of-payment/:transactionId',
    name: 'ProofOfPayment',
    component: ProofOfPayment,
    props: true,
    meta: { requiresAuth: true }
   },
   {
    path: '/verify-transaction/:transactionId',
    name: 'VerifyTransaction',
    component: ProofOfPayment,
    props: route => ({ 
      transaction: { transactionId: route.params.transactionId },
      verifyMode: true 
    }),
    meta: { requiresAuth: false } // Public route for QR code verification
   },
   {
    path: '/proof-of-payment/view/:transactionId',
    name: 'ViewProofPDF',
    component: () => import('../components/ProofOfPayment.vue'),
    props: route => ({ 
      transaction: { transactionId: route.params.transactionId },
      viewMode: true 
    }),
    meta: { requiresAuth: true }
   },
   {
    path: '/bulk-proof-operations',
    name: 'BulkProofOperations',
    component: TransactionHistoryPage,
    props: { bulkMode: true },
    meta: { requiresAuth: true }
   },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation Guard
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const token = localStorage.getItem('token');

  if (requiresAuth && !token) {
    // Redirect to login page if trying to access a protected route without a token
    next('/login');
  } else if ((to.path === '/login' || to.path === '/get-started') && token) {
     // Redirect to dashboard if trying to access login/register page while logged in
     next('/dashboard');
  }
  else {
    // Otherwise, allow navigation
    next();
  }
});


export default router;
