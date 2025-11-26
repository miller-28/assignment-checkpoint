<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-bold">📦 Orders ({{ orders.length }})</h2>
      <div class="flex gap-2">
        <button
          v-if="orders.length > 0"
          @click="$emit('deleteAll')"
          class="px-3 py-1 rounded-md text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
        >
          🗑️ Delete All
        </button>
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
    
    <div v-if="filteredOrders.length === 0" class="bg-white p-8 rounded-lg shadow text-center text-gray-500">
      <p class="text-lg">No orders found</p>
      <p class="text-sm">Create your first order using the form above</p>
    </div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <OrderCard
        v-for="order in filteredOrders"
        :key="order.order_id"
        :order="order"
        @delete="$emit('delete', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Order } from '../types/order';
import OrderCard from './OrderCard.vue';

const props = defineProps<{
  orders: Order[];
}>();

defineEmits<{
  delete: [orderId: string];
  deleteAll: [];
}>();

const selectedStatus = ref<string | null>(null);

const statusFilters = [
  { label: 'All', value: null },
  { label: 'Pending', value: 'PendingShipment' },
  { label: 'Shipped', value: 'Shipped' },
  { label: 'Delivered', value: 'Delivered' },
];

const filteredOrders = computed(() => {
  if (!selectedStatus.value) {
    return props.orders;
  }
  return props.orders.filter(order => order.status === selectedStatus.value);
});
</script>
