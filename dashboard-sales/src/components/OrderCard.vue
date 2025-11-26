<template>
  <div class="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
    <div class="flex justify-between items-start mb-3">
      <div>
        <p class="text-xs text-gray-500">Order ID</p>
        <p class="font-mono text-sm">{{ formatOrderId(order.order_id) }}</p>
      </div>
      <div class="flex items-center gap-2">
        <span :class="statusClass" class="px-3 py-1 rounded-full text-xs font-semibold">
          {{ statusIcon }} {{ formatStatus(order.status) }}
        </span>
        <button
          @click="$emit('delete', order.order_id)"
          class="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
          title="Delete order"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
    
    <div class="grid grid-cols-2 gap-3 mb-3">
      <div>
        <p class="text-xs text-gray-500">Product ID</p>
        <p class="font-mono text-xs truncate">{{ formatId(order.product_id) }}</p>
      </div>
      <div>
        <p class="text-xs text-gray-500">Quantity</p>
        <p class="font-semibold">{{ order.quantity }}</p>
      </div>
    </div>
    
    <div class="border-t pt-3 space-y-1">
      <div class="flex justify-between text-xs">
        <span class="text-gray-500">Created:</span>
        <span class="font-medium">{{ formatDate(order.created_at) }}</span>
      </div>
      <div v-if="order.shipped_at" class="flex justify-between text-xs">
        <span class="text-gray-500">Shipped:</span>
        <span class="font-medium">{{ formatDate(order.shipped_at) }}</span>
      </div>
      <div v-if="order.delivered_at" class="flex justify-between text-xs">
        <span class="text-gray-500">Delivered:</span>
        <span class="font-medium">{{ formatDate(order.delivered_at) }}</span>
      </div>
    </div>
    
    <div class="border-t pt-3 mt-3">
      <button
        @click="$emit('delete', order.order_id)"
        class="w-full bg-red-50 text-red-600 py-2 px-3 rounded-md hover:bg-red-100 transition-colors text-sm font-medium"
      >
        🗑️ Delete Order
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Order } from '../types/order';

const props = defineProps<{
  order: Order;
}>();

defineEmits<{
  delete: [orderId: string];
}>();

const statusClass = computed(() => {
  switch (props.order.status) {
    case 'PendingShipment':
      return 'bg-yellow-100 text-yellow-800';
    case 'Shipped':
      return 'bg-blue-100 text-blue-800';
    case 'Delivered':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
});

const statusIcon = computed(() => {
  switch (props.order.status) {
    case 'PendingShipment':
      return '⏳';
    case 'Shipped':
      return '🚚';
    case 'Delivered':
      return '✅';
    default:
      return '📦';
  }
});

const formatStatus = (status: string): string => {
  return status.replace(/([A-Z])/g, ' $1').trim();
};

const formatOrderId = (id: string): string => {
  return id.length > 13 ? `${id.substring(0, 8)}...${id.substring(id.length - 4)}` : id;
};

const formatId = (id: string): string => {
  return id.length > 20 ? `${id.substring(0, 8)}...` : id;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
</script>
