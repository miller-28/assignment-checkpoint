import { createRouter, createWebHistory } from 'vue-router';
import { isAuthenticated } from '../services/authService';
import LoginView from '../views/LoginView.vue';
import DashboardView from '../views/DashboardView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/login',
      name: 'Login',
      component: LoginView,
      meta: { requiresGuest: true },
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: DashboardView,
      meta: { requiresAuth: true },
    },
  ],
});

router.beforeEach((to, from, next) => {
  const authenticated = isAuthenticated();

  if (to.meta.requiresAuth && !authenticated) {
    next('/login');
  } else if (to.meta.requiresGuest && authenticated) {
    next('/dashboard');
  } else {
    next();
  }
});

export default router;
