<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow-md">
      <div class="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-800">🚚 Delivery Dashboard</h1>
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
      <div v-if="errorMessage" class="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
        {{ errorMessage }}
      </div>

      <div v-if="successMessage" class="mb-4 p-4 bg-green-100 text-green-700 rounded-md">
        {{ successMessage }}
      </div>

      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">📦 Orders ({{ orders.length }})</h2>
        <div class="flex gap-2">
          <button
            v-for="status in statusFilters"
            :key="status.value"
            @click="selectedStatus = status.value"
            :class="[
              'px-3 py-1 rounded-md text-sm font-medium transition-colors',
              selectedStatus === status.value
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            ]"
          >
            {{ status.label }}
          </button>
        </div>
      </div>

      <div class="flex justify-between items-center mb-4">
        <div class="text-sm text-gray-600">
          Auto-refreshing every 3 seconds
        </div>
        <div v-if="lastRefresh" class="text-xs text-gray-500">
          Last updated: {{ formatTime(lastRefresh) }}
        </div>
      </div>

      <!-- Filtered Orders Section -->
      <section v-if="selectedStatus === null">
        <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
          <span>📋 Pending Shipments</span>
          <span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm">
            {{ pending.length }}
          </span>
        </h2>
        
        <div v-if="pending.length === 0" class="bg-white p-8 rounded-lg shadow text-center text-gray-500 mb-8">
          <p class="text-lg">No pending shipments</p>
          <p class="text-sm">All orders have been processed</p>
        </div>
        
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <OrderCard
            v-for="order in pending"
            :key="order.order_id"
            :order="order"
            @ship="handleShip"
          />
        </div>

        <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
          <span>🚚 In Transit</span>
          <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
            {{ inTransit.length }}
          </span>
        </h2>
        
        <div v-if="inTransit.length === 0" class="bg-white p-8 rounded-lg shadow text-center text-gray-500 mb-8">
          <p class="text-lg">No orders in transit</p>
          <p class="text-sm">Shipped orders will appear here</p>
        </div>
        
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <OrderCard
            v-for="order in inTransit"
            :key="order.order_id"
            :order="order"
            @deliver="handleDeliver"
          />
        </div>

        <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
          <span>✅ Completed</span>
          <span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
            {{ completed.length }}
          </span>
        </h2>
        
        <div v-if="completed.length === 0" class="bg-white p-8 rounded-lg shadow text-center text-gray-500">
          <p class="text-lg">No completed orders</p>
          <p class="text-sm">Delivered orders will appear here</p>
        </div>
        
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <OrderCard
            v-for="order in completed.slice(0, 10)"
            :key="order.order_id"
            :order="order"
          />
        </div>
      </section>

      <!-- Filtered View -->
      <section v-else>
        <div v-if="filteredOrders.length === 0" class="bg-white p-8 rounded-lg shadow text-center text-gray-500">
          <p class="text-lg">No orders found</p>
          <p class="text-sm">No orders with this status</p>
        </div>
        
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <OrderCard
            v-for="order in filteredOrders"
            :key="order.order_id"
            :order="order"
            @ship="handleShip"
            @deliver="handleDeliver"
          />
        </div>
      </section>

      <ConfirmModal
        :is-open="showShipModal"
        title="Mark as Shipped"
        message="Are you sure you want to mark this order as shipped? A tracking number will be generated."
        confirm-text="Ship"
        @confirm="confirmShip"
        @cancel="showShipModal = false"
      />

      <ConfirmModal
        :is-open="showDeliverModal"
        title="Mark as Delivered"
        message="Are you sure you want to mark this order as delivered? This action completes the order."
        confirm-text="Deliver"
        @confirm="confirmDeliver"
        @cancel="showDeliverModal = false"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { mockLogout } from '../services/authService';
import { getOrders, markAsShipped, markAsDelivered } from '../services/orderService';
import type { Order } from '../types/order';
import OrderCard from '../components/OrderCard.vue';
import ConfirmModal from '../components/ConfirmModal.vue';

const router = useRouter();
const orders = ref<Order[]>([]);
const isRefreshing = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const lastRefresh = ref<Date | null>(null);
const showShipModal = ref(false);
const showDeliverModal = ref(false);
const orderToShip = ref<string | null>(null);
const orderToDeliver = ref<string | null>(null);
const selectedStatus = ref<string | null>(null);
let refreshInterval: number | null = null;

const statusFilters = [
  { label: 'All', value: null },
  { label: 'Pending', value: 'Pending' },
  { label: 'Shipped', value: 'Shipped' },
  { label: 'Delivered', value: 'Delivered' },
];

const pending = computed(() => 
  orders.value.filter(o => o.status === 'Pending')
);

const inTransit = computed(() => 
  orders.value.filter(o => o.status === 'Shipped')
);

const completed = computed(() => 
  orders.value.filter(o => o.status === 'Delivered')
);

const filteredOrders = computed(() => {
  if (!selectedStatus.value) {
    return orders.value;
  }
  return orders.value.filter(order => order.status === selectedStatus.value);
});

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

const handleShip = (orderId: string) => {
  orderToShip.value = orderId;
  showShipModal.value = true;
};

const confirmShip = async () => {
  if (!orderToShip.value) return;
  
  try {
    await markAsShipped(orderToShip.value);
    successMessage.value = 'Order marked as shipped successfully';
    showShipModal.value = false;
    orderToShip.value = null;
    await refreshOrders();
    
    setTimeout(() => {
      successMessage.value = '';
    }, 3000);
  } catch (error: any) {
    errorMessage.value = error.response?.data?.error || 'Failed to mark as shipped';
  }
};

const handleDeliver = (orderId: string) => {
  orderToDeliver.value = orderId;
  showDeliverModal.value = true;
};

const confirmDeliver = async () => {
  if (!orderToDeliver.value) return;
  
  try {
    await markAsDelivered(orderToDeliver.value);
    successMessage.value = 'Order marked as delivered successfully';
    showDeliverModal.value = false;
    orderToDeliver.value = null;
    await refreshOrders();
    
    setTimeout(() => {
      successMessage.value = '';
    }, 3000);
  } catch (error: any) {
    errorMessage.value = error.response?.data?.error || 'Failed to mark as delivered';
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
