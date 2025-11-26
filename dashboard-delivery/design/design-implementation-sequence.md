# Delivery Dashboard - Implementation Sequence

## Overview
Step-by-step implementation for Delivery Dashboard (Vue 3 + TypeScript).

---

## Implementation Phases

### Phase 1: Project Setup
**Priority: Critical**

1. **Create Vue Project**
   ```bash
   npm create vite@latest dashboard-delivery -- --template vue-ts
   cd dashboard-delivery
   npm install
   ```

2. **Install Same Dependencies as Sales Dashboard**
   ```bash
   npm install vue-router axios
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   npm install -D vitest @vue/test-utils jsdom
   npm install -D eslint @typescript-eslint/parser prettier
   ```

3. **Configure Tailwind** (Same as Sales)

4. **Setup Directory Structure** (Same as Sales)

---

### Phase 2: Type Definitions
**Priority: High**

1. **Create Delivery Types** (`src/types/delivery.ts`)
   ```typescript
   export interface Delivery {
     delivery_id: string;
     order_id: string;
     user_id: string;
     product_id: string;
     quantity: number;
     status: 'Processing' | 'Shipped' | 'Delivered';
     tracking_number?: string;
     created_at: string;
     shipped_at?: string;
     delivered_at?: string;
   }
   ```

**No testing needed**

---

### Phase 3: Mock Auth Service
**Priority: High**

1. **Auth Service** (`src/services/authService.ts`)
   - Copy from Sales Dashboard
   - Change key to `delivery_token`

**Testing:**
- Simple localStorage tests

---

### Phase 4: API Service Layer
**Priority: Critical**

1. **API Client** (`src/services/api.ts`)
   ```typescript
   const api = axios.create({
     baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1',
   });
   ```

2. **Delivery Service** (`src/services/deliveryService.ts`)
   ```typescript
   export const getDeliveries = async () => {
     const response = await api.get('/deliveries');
     return response.data;
   };
   
   export const markAsShipped = async (deliveryId: string) => {
     const response = await api.post(`/deliveries/${deliveryId}/ship`, {
       tracking_number: `TRACK-${Date.now()}`,
     });
     return response.data;
   };
   
   export const markAsDelivered = async (deliveryId: string) => {
     const response = await api.post(`/deliveries/${deliveryId}/deliver`);
     return response.data;
   };
   ```

**Testing:**
- Mock axios for service tests

---

### Phase 5: Router Setup
**Priority: High**

1. **Router Configuration** (`src/router/index.ts`)
   - Copy from Sales Dashboard
   - Adjust routes and auth key

---

### Phase 6: Login View
**Priority: High**

1. **Login Component** (`src/views/LoginView.vue`)
   - Copy from Sales Dashboard
   - Change branding to "Delivery Dashboard"

**Testing:**
- Test login flow

---

### Phase 7: Delivery Components
**Priority: Critical - Assignment Focus**

1. **Delivery Card** (`src/components/DeliveryCard.vue`)
   ```vue
   <template>
     <div class="bg-white p-4 rounded-lg shadow mb-4">
       <div class="flex justify-between items-start">
         <div>
           <h3 class="font-bold">Delivery ID: {{ delivery.delivery_id }}</h3>
           <p class="text-sm text-gray-600">Order ID: {{ delivery.order_id }}</p>
           <p class="text-sm">Product: {{ delivery.product_id }} | Qty: {{ delivery.quantity }}</p>
           <span :class="statusClass" class="inline-block px-2 py-1 rounded text-sm mt-2">
             {{ statusEmoji }} {{ delivery.status }}
           </span>
         </div>
         
         <div class="flex flex-col gap-2">
           <button
             v-if="delivery.status === 'Processing'"
             @click="$emit('ship', delivery.delivery_id)"
             class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
           >
             🚚 Mark as Shipped
           </button>
           
           <button
             v-if="delivery.status === 'Shipped'"
             @click="$emit('deliver', delivery.delivery_id)"
             class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
           >
             ✅ Mark as Delivered
           </button>
         </div>
       </div>
       
       <div class="mt-2 text-sm text-gray-500">
         <p>Created: {{ formatDate(delivery.created_at) }}</p>
         <p v-if="delivery.shipped_at">Shipped: {{ formatDate(delivery.shipped_at) }}</p>
         <p v-if="delivery.tracking_number">Tracking: {{ delivery.tracking_number }}</p>
         <p v-if="delivery.delivered_at">Delivered: {{ formatDate(delivery.delivered_at) }}</p>
       </div>
     </div>
   </template>
   
   <script setup lang="ts">
   import { computed } from 'vue';
   
   const props = defineProps<{ delivery: Delivery }>();
   const emit = defineEmits<{
     ship: [id: string];
     deliver: [id: string];
   }>();
   
   const statusClass = computed(() => ({
     'bg-yellow-100 text-yellow-800': props.delivery.status === 'Processing',
     'bg-blue-100 text-blue-800': props.delivery.status === 'Shipped',
     'bg-green-100 text-green-800': props.delivery.status === 'Delivered',
   }));
   
   const statusEmoji = computed(() => ({
     Processing: '⏳',
     Shipped: '🚚',
     Delivered: '✅',
   }[props.delivery.status]));
   </script>
   ```

2. **Pending List** (`src/components/PendingList.vue`)
   - Filter deliveries by status === 'Processing'
   - Map to DeliveryCard components

3. **In Transit List** (`src/components/InTransitList.vue`)
   - Filter deliveries by status === 'Shipped'

4. **Completed List** (`src/components/CompletedList.vue`)
   - Filter deliveries by status === 'Delivered'

**Testing:**
- Test filtering logic
- Test button visibility based on status
- Test emit events

---

### Phase 8: Dashboard View
**Priority: Critical**

1. **Dashboard Component** (`src/views/DashboardView.vue`)
   ```vue
   <template>
     <div class="min-h-screen bg-gray-100">
       <nav class="bg-white shadow p-4 flex justify-between">
         <h1 class="text-2xl font-bold">Delivery Dashboard</h1>
         <div>
           <button @click="refreshDeliveries" class="mr-4">🔄 Refresh</button>
           <button @click="handleLogout" class="text-red-500">Logout</button>
         </div>
       </nav>
       
       <main class="container mx-auto p-6">
         <section class="mb-8">
           <h2 class="text-xl font-bold mb-4">📋 Pending Shipments ({{ pending.length }})</h2>
           <DeliveryCard
             v-for="delivery in pending"
             :key="delivery.delivery_id"
             :delivery="delivery"
             @ship="handleShip"
           />
           <p v-if="pending.length === 0" class="text-gray-500">No pending shipments</p>
         </section>
         
         <section class="mb-8">
           <h2 class="text-xl font-bold mb-4">🚚 In Transit ({{ inTransit.length }})</h2>
           <DeliveryCard
             v-for="delivery in inTransit"
             :key="delivery.delivery_id"
             :delivery="delivery"
             @deliver="handleDeliver"
           />
           <p v-if="inTransit.length === 0" class="text-gray-500">No orders in transit</p>
         </section>
         
         <section>
           <h2 class="text-xl font-bold mb-4">✅ Completed Today ({{ completed.length }})</h2>
           <DeliveryCard
             v-for="delivery in completed.slice(0, 5)"
             :key="delivery.delivery_id"
             :delivery="delivery"
           />
           <p v-if="completed.length === 0" class="text-gray-500">No completed deliveries</p>
         </section>
       </main>
     </div>
   </template>
   
   <script setup lang="ts">
   import { ref, computed, onMounted } from 'vue';
   import { getDeliveries, markAsShipped, markAsDelivered } from '@/services/deliveryService';
   
   const deliveries = ref<Delivery[]>([]);
   
   const pending = computed(() => 
     deliveries.value.filter(d => d.status === 'Processing')
   );
   
   const inTransit = computed(() => 
     deliveries.value.filter(d => d.status === 'Shipped')
   );
   
   const completed = computed(() => 
     deliveries.value.filter(d => d.status === 'Delivered')
   );
   
   const refreshDeliveries = async () => {
     deliveries.value = await getDeliveries();
   };
   
   const handleShip = async (deliveryId: string) => {
     await markAsShipped(deliveryId);
     await refreshDeliveries();
   };
   
   const handleDeliver = async (deliveryId: string) => {
     await markAsDelivered(deliveryId);
     await refreshDeliveries();
   };
   
   onMounted(() => {
     refreshDeliveries();
     setInterval(refreshDeliveries, 5000);
   });
   </script>
   ```

**Testing:**
- Test filtering computed properties
- Test ship/deliver actions
- Test auto-refresh

---

### Phase 9: Styling & Polish
**Priority: Medium**

1. **Tailwind Styling**
   - Section headers with counts
   - Action button hover states
   - Empty states
   - Responsive layout

2. **Error Handling**
   - Display API errors
   - Loading states

**Testing:**
- Visual testing

---

### Phase 10: Build & Environment Configuration
**Priority: Medium**

1. **Environment Configuration**

**Testing:**
- Build and test locally

---

## Testing Strategy
- **Unit Tests:** Services (auth, delivery)
- **Component Tests:** DeliveryCard, lists, dashboard
- **E2E Tests:** Login → Ship → Deliver flow
- **Coverage Target:** 60%+

## Simplifications for Speed
✅ Mock authentication
✅ Simple Tailwind styling
✅ Basic error handling
✅ No Pinia state management
✅ No advanced features
✅ Simple auto-refresh

## What Matters for Assignment
🎯 **Login page** - Functional
🎯 **Grouped by status** - Pending, In Transit, Completed
🎯 **Ship button** - For processing deliveries
🎯 **Deliver button** - For shipped deliveries
🎯 **Real-time updates** - Auto-refresh shows changes
🎯 **Integration with Sales** - Complete lifecycle

## Order of Implementation
1. ✅ Project setup (copy structure from Sales)
2. ✅ Types + services
3. ✅ Router + Login
4. ✅ Delivery components (card + lists)
5. ✅ Dashboard view (3 sections)
6. ✅ Action handlers (ship/deliver)
7. ✅ Styling
8. ✅ Tests

## Key Features
- ✅ Mock login
- ✅ View deliveries grouped by status
- ✅ Ship action (Processing → Shipped)
- ✅ Deliver action (Shipped → Delivered)
- ✅ Auto-refresh every 5 seconds
- ✅ Clean UI with status badges
- ✅ Mobile responsive

## Key Differences from Sales Dashboard
- **No create form** - Deliveries created by consuming events
- **Action buttons** - Ship and Deliver operations
- **Grouped views** - Three sections by status
- **Tracking numbers** - Display tracking info
- **Focus on operations** - Warehouse-style interface
