<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow-md">
      <div class="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-800">Sales Dashboard</h1>
        <div class="flex gap-3">
          <button
            @click="refreshOrders"
            :disabled="isRefreshing"
            class="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
          >
            <span :class="{ 'animate-spin': isRefreshing }">🔄</span>
            Refresh
          </button>
          <button
            @click="handleLogout"
            class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
    
    <main class="container mx-auto px-4 py-6">
      <div class="mb-6">
        <OrderCreateForm @created="handleOrderCreated" />
      </div>
      
      <div v-if="errorMessage" class="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
        {{ errorMessage }}
      </div>
      
      <div v-if="successMessage" class="mb-4 p-4 bg-green-100 text-green-700 rounded-md">
        {{ successMessage }}
      </div>
      
      <div class="flex justify-between items-center mb-4">
        <div class="text-sm text-gray-600">
          Auto-refreshing every 3 seconds
        </div>
        <div v-if="lastRefresh" class="text-xs text-gray-500">
          Last updated: {{ formatTime(lastRefresh) }}
        </div>
      </div>
      
      <OrderList :orders="orders" @delete="handleDeleteOrder" @delete-all="showDeleteAllModal = true" />
      
      <ConfirmModal
        :is-open="showDeleteModal"
        title="Delete Order"
        message="Are you sure you want to delete this order? This action cannot be undone."
        confirm-text="Delete"
        @confirm="confirmDelete"
        @cancel="showDeleteModal = false"
      />
      
      <ConfirmModal
        :is-open="showDeleteAllModal"
        title="Delete All Orders"
        message="Are you sure you want to delete ALL orders? This will permanently remove all order data and cannot be undone."
        confirm-text="Delete All"
        @confirm="confirmDeleteAll"
        @cancel="showDeleteAllModal = false"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { mockLogout } from '../services/authService';
import { getOrders, deleteOrder, deleteAllOrders } from '../services/orderService';
import type { Order } from '../types/order';
import OrderCreateForm from '../components/OrderCreateForm.vue';
import OrderList from '../components/OrderList.vue';
import ConfirmModal from '../components/ConfirmModal.vue';

const router = useRouter();
const orders = ref<Order[]>([]);
const isRefreshing = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const lastRefresh = ref<Date | null>(null);
const showDeleteModal = ref(false);
const showDeleteAllModal = ref(false);
const orderToDelete = ref<string | null>(null);
const pendingDeleteOrderId = ref<string | null>(null);
const pendingDeleteAll = ref(false);
const deleteModalTitle = ref('');
const deleteModalMessage = ref('');
const deleteModalConfirm = ref('');
let refreshInterval: number | null = null;

const refreshOrders = async () => {
  isRefreshing.value = true;
  errorMessage.value = '';
  
  try {
    orders.value = await getOrders();
    lastRefresh.value = new Date();
  } catch (error: any) {
    errorMessage.value = error.response?.data?.error || 'Failed to load orders';
    console.error('Error fetching orders:', error);
  } finally {
    isRefreshing.value = false;
  }
};

const handleOrderCreated = () => {
  // Refresh orders list after creating new order
  setTimeout(() => {
    refreshOrders();
  }, 500);
};

const handleDeleteOrder = (orderId: string) => {
  orderToDelete.value = orderId;
  showDeleteModal.value = true;
};

const confirmDelete = async () => {
  if (!orderToDelete.value) return;
  
  try {
    await deleteOrder(orderToDelete.value);
    successMessage.value = 'Order deleted successfully';
    showDeleteModal.value = false;
    orderToDelete.value = null;
    await refreshOrders();
    
    setTimeout(() => {
      successMessage.value = '';
    }, 3000);
  } catch (error: any) {
    errorMessage.value = error.response?.data?.error || 'Failed to delete order';
  }
};

const confirmDeleteAll = async () => {
  try {
    await deleteAllOrders();
    successMessage.value = 'All orders deleted successfully';
    showDeleteAllModal.value = false;
    await refreshOrders();
    
    setTimeout(() => {
      successMessage.value = '';
    }, 3000);
  } catch (error: any) {
    errorMessage.value = error.response?.data?.error || 'Failed to delete all orders';
  }
};

const handleLogout = () => {
  mockLogout();
  router.push('/login');
};

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

onMounted(() => {
  refreshOrders();
  
  // Auto-refresh every 3 seconds
  refreshInterval = window.setInterval(() => {
    refreshOrders();
  }, 3000);
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});
</script>
