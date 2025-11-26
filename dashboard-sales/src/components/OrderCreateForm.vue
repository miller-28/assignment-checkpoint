<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h2 class="text-xl font-bold mb-4">📝 Create New Order</h2>
    
    <form @submit.prevent="handleSubmit">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Product ID
          </label>
          <input
            v-model="form.product_id"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 550e8400-e29b-41d4-a716-446655440001"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Quantity
          </label>
          <input
            v-model.number="form.quantity"
            type="number"
            min="1"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="1"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            User ID
          </label>
          <input
            v-model="form.user_id"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 550e8400-e29b-41d4-a716-446655440000"
          />
        </div>
      </div>
      
      <div class="flex gap-2">
        <button
          type="button"
          @click="fillMockData"
          class="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
        >
          🎲 Fill Mock Data
        </button>
        <button
          type="submit"
          :disabled="isSubmitting"
          class="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-400"
        >
          {{ isSubmitting ? 'Creating...' : 'Create Order' }}
        </button>
      </div>
      
      <div v-if="successMessage" class="mt-4 p-3 bg-green-100 text-green-700 rounded-md">
        {{ successMessage }}
      </div>
      
      <div v-if="errorMessage" class="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
        {{ errorMessage }}
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { createOrder } from '../services/orderService';

const emit = defineEmits<{
  created: [orderId: string];
}>();

const form = reactive({
  product_id: '',
  quantity: 1,
  user_id: '',
});

const isSubmitting = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

const fillMockData = () => {
  const mockProducts = [
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440005',
  ];
  const mockQuantities = [1, 2, 5, 10, 20];
  
  form.product_id = mockProducts[Math.floor(Math.random() * mockProducts.length)];
  form.quantity = mockQuantities[Math.floor(Math.random() * mockQuantities.length)];
  form.user_id = '550e8400-e29b-41d4-a716-446655440000';
};

const handleSubmit = async () => {
  isSubmitting.value = true;
  successMessage.value = '';
  errorMessage.value = '';
  
  try {
    const response = await createOrder(form);
    successMessage.value = `Order created successfully! Order ID: ${response.order_id}`;
    emit('created', response.order_id);
    
    // Reset form
    form.product_id = '';
    form.quantity = 1;
    form.user_id = '';
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      successMessage.value = '';
    }, 3000);
  } catch (error: any) {
    errorMessage.value = error.response?.data?.error || 'Failed to create order';
  } finally {
    isSubmitting.value = false;
  }
};
</script>
