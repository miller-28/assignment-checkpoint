<template>
  <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
    <div class="flex justify-between items-start mb-4">
      <div class="flex-1">
        <div class="flex items-center gap-2 mb-2">
          <h3 class="font-bold text-lg">Order ID:</h3>
          <span class="font-mono text-sm">{{ formatId(order.order_id) }}</span>
        </div>
        
        <div class="space-y-1 text-sm text-gray-600">
          <p><span class="font-medium">Product:</span> {{ formatId(order.product_id) }}</p>
          <p><span class="font-medium">Quantity:</span> {{ order.quantity }}</p>
        </div>
        
        <div :class="statusClass" class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold mt-3">
          <span>{{ statusEmoji }}</span>
          <span>{{ order.status }}</span>
        </div>
      </div>
      
      <div class="flex flex-col gap-2 ml-4">
        <button
          v-if="order.status === 'Pending'"
          @click="$emit('ship', order.order_id)"
          class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors font-medium whitespace-nowrap"
        >
          🚚 Mark as Shipped
        </button>
        
        <button
          v-if="order.status === 'Shipped'"
          @click="$emit('deliver', order.order_id)"
          class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors font-medium whitespace-nowrap"
        >
          ✅ Mark as Delivered
        </button>
      </div>
    </div>
    
    <div class="border-t pt-3 mt-3 space-y-1 text-xs text-gray-500">
      <div class="flex justify-between">
        <span class="font-medium">Created:</span>
        <span>{{ formatDate(order.created_at) }}</span>
      </div>
      <div v-if="order.shipped_at" class="flex justify-between">
        <span class="font-medium">Shipped:</span>
        <span>{{ formatDate(order.shipped_at) }}</span>
      </div>
      <div v-if="order.delivered_at" class="flex justify-between">
        <span class="font-medium">Delivered:</span>
        <span>{{ formatDate(order.delivered_at) }}</span>
      </div>
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
  ship: [id: string];
  deliver: [id: string];
}>();

const statusClass = computed(() => {
  switch (props.order.status) {
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'Shipped':
      return 'bg-blue-100 text-blue-800';
    case 'Delivered':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
});

const statusEmoji = computed(() => {
  switch (props.order.status) {
    case 'Pending':
      return '⏳';
    case 'Shipped':
      return '🚚';
    case 'Delivered':
      return '✅';
    default:
      return '📦';
  }
});

const formatId = (id: string): string => {
  return id.length > 13 ? `${id.substring(0, 8)}...${id.substring(id.length - 4)}` : id;
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
