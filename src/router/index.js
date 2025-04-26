import { createRouter, createWebHistory } from 'vue-router';
import DashboardPage from '../components/DashboardPage.vue';
import Payments from '../components/Payments.vue';
import Transactions from '../components/Transactions.vue';
import LoginPage from '../components/LoginPage.vue';
import HomePage from '../components/HomePage.vue';
import GetStartedPage from '../components/GetStartedPage.vue';
import UpdateProfile from '../pages/UpdateProfile.vue';
import OpenAccountPage from '../components/OpenAccountPage.vue'; // Import OpenAccountPage
import LearnMorePage from '../components/LearnMorePage.vue'; // Import LearnMorePage

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
    component: GetStartedPage,
  },
  {
    path: '/update-profile',
    name: 'UpdateProfile', // Add name for consistency
    component: UpdateProfile,
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
