# Sales Dashboard - Implementation Sequence

## Overview
Step-by-step implementation for Sales Dashboard (Vue 3 + TypeScript).

---

## Implementation Phases

### Phase 1: Project Setup
**Priority: Critical**

1. **Create Vue Project**
   ```bash
   npm create vite@latest dashboard-sales -- --template vue-ts
   cd dashboard-sales
   npm install
   ```

2. **Install Dependencies**
   ```bash
   # UI & Routing
   npm install vue-router axios
   
   # Tailwind CSS
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   
   # Testing & Linting
   npm install -D vitest @vue/test-utils jsdom
   npm install -D eslint @typescript-eslint/parser prettier
   ```

3. **Configure Tailwind** (`tailwind.config.js`)
   ```javascript
   content: ['./index.html', './src/**/*.{vue,js,ts}']
   ```

4. **Setup Directory Structure**
   ```
   src/
   ├── components/
   ├── views/
   ├── services/
   ├── types/
   ├── router/
   └── assets/
   ```

---

### Phase 2: Type Definitions
**Priority: High**

1. **Create Order Types** (`src/types/order.ts`)
   ```typescript
   export interface Order {
     order_id: string;
     user_id: string;
     product_id: string;
     quantity: number;
     status: 'Pending Shipment' | 'Shipped' | 'Delivered';
     created_at: string;
     shipped_at?: string;
     delivered_at?: string;
   }
   
   export interface CreateOrderRequest {
     user_id: string;
     product_id: string;
     quantity: number;
   }
   ```

**No testing needed** - Type definitions only

---

### Phase 3: Mock Auth Service
**Priority: High - Quick Win**

1. **Auth Service** (`src/services/authService.ts`)
   ```typescript
   export const mockLogin = (username: string, password: string) => {
     const token = btoa(`${username}:${Date.now()}`);
     localStorage.setItem('sales_token', token);
     return token;
   };
   
   export const mockLogout = () => {
     localStorage.removeItem('sales_token');
   };
   
   export const isAuthenticated = () => {
     return !!localStorage.getItem('sales_token');
   };
   ```

**Testing:**
- Simple unit test for localStorage operations

---

### Phase 4: API Service Layer
**Priority: Critical**

1. **API Client** (`src/services/api.ts`)
   ```typescript
   import axios from 'axios';
   
   const api = axios.create({
     baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
   });
   
   api.interceptors.request.use((config) => {
     const token = localStorage.getItem('sales_token');
     if (token) {
       config.headers.Authorization = `Bearer ${token}`;
     }
     return config;
   });
   ```

2. **Order Service** (`src/services/orderService.ts`)
   ```typescript
   export const createOrder = async (data: CreateOrderRequest) => {
     const response = await api.post('/orders', {
       ...data,
       idempotency_key: crypto.randomUUID(),
     });
     return response.data;
   };
   
   export const getOrders = async () => {
     const response = await api.get('/orders');
     return response.data;
   };
   ```

**Testing:**
- Mock axios for service tests

---

### Phase 5: Router Setup
**Priority: High**

1. **Router Configuration** (`src/router/index.ts`)
   ```typescript
   import { createRouter, createWebHistory } from 'vue-router';
   import LoginView from '@/views/LoginView.vue';
   import DashboardView from '@/views/DashboardView.vue';
   import { isAuthenticated } from '@/services/authService';
   
   const routes = [
     { path: '/', redirect: '/login' },
     { path: '/login', component: LoginView },
     {
       path: '/dashboard',
       component: DashboardView,
       beforeEnter: (to, from, next) => {
         isAuthenticated() ? next() : next('/login');
       },
     },
   ];
   ```

**Testing:**
- Test route guards

---

### Phase 6: Login View
**Priority: High**

1. **Login Component** (`src/views/LoginView.vue`)
   - Simple form with username/password
   - Call mockLogin on submit
   - Redirect to dashboard
   - Basic styling with Tailwind

**Testing:**
- Test form submission
- Test redirect after login

---

### Phase 7: Order Components
**Priority: Critical - Assignment Focus**

1. **Order Create Form** (`src/components/OrderCreateForm.vue`)
   ```vue
   <template>
     <form @submit.prevent="handleSubmit" class="bg-white p-6 rounded-lg shadow">
       <h2 class="text-xl font-bold mb-4">📝 Create New Order</h2>
       
       <div class="mb-4">
         <label class="block mb-2">Product ID</label>
         <input v-model="form.product_id" required class="w-full border p-2" />
       </div>
       
       <div class="mb-4">
         <label class="block mb-2">Quantity</label>
         <input v-model.number="form.quantity" type="number" min="1" required class="w-full border p-2" />
       </div>
       
       <div class="mb-4">
         <label class="block mb-2">User ID</label>
         <input v-model="form.user_id" required class="w-full border p-2" />
       </div>
       
       <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded">
         Create Order
       </button>
     </form>
   </template>
   ```

2. **Order Card** (`src/components/OrderCard.vue`)
   - Display order details
   - Color-coded status badges
   - Format timestamps

3. **Order List** (`src/components/OrderList.vue`)
   - Display all orders
   - Map orders to OrderCard components
   - Empty state

**Testing:**
- Test form submission
- Test order display
- Test status badge colors

---

### Phase 8: Dashboard View
**Priority: Critical**

1. **Dashboard Component** (`src/views/DashboardView.vue`)
   ```vue
   <template>
     <div class="min-h-screen bg-gray-100">
       <nav class="bg-white shadow p-4 flex justify-between">
         <h1 class="text-2xl font-bold">Sales Dashboard</h1>
         <div>
           <button @click="refreshOrders" class="mr-4">🔄 Refresh</button>
           <button @click="handleLogout" class="text-red-500">Logout</button>
         </div>
       </nav>
       
       <main class="container mx-auto p-6">
         <OrderCreateForm @created="handleOrderCreated" class="mb-6" />
         <OrderList :orders="orders" />
       </main>
     </div>
   </template>
   
   <script setup lang="ts">
   import { ref, onMounted } from 'vue';
   import { getOrders } from '@/services/orderService';
   
   const orders = ref([]);
   
   const refreshOrders = async () => {
     orders.value = await getOrders();
   };
   
   onMounted(() => {
     refreshOrders();
     // Auto-refresh every 5 seconds
     setInterval(refreshOrders, 5000);
   });
   </script>
   ```

**Testing:**
- Test data loading
- Test refresh functionality

---

### Phase 9: Styling & Polish
**Priority: Medium**

1. **Tailwind Styling**
   - Status badges (yellow, blue, green)
   - Responsive layout
   - Card shadows and spacing

2. **Error Handling**
   - Display error messages
   - Toast notifications (optional)

**Testing:**
- Visual regression testing (optional)

---

### Phase 10: Build & Environment Configuration
**Priority: Medium**

1. **Environment Configuration**
  - `.env.example`
  - Production environment variables

**Testing:**
- Build and test locally

---

## Testing Strategy
- **Unit Tests:** Services (auth, order)
- **Component Tests:** Forms, cards, lists
- **E2E Tests:** Login flow, order creation flow
- **Coverage Target:** 60%+ (UI tests less critical)

## Simplifications for Speed
✅ Mock authentication (any credentials work)
✅ Simple Tailwind styling (no custom UI library)
✅ Basic error handling (no toast library)
✅ No state management (Pinia) - just reactive refs
✅ No advanced features (pagination, search, filters)
✅ Simple auto-refresh (setInterval, not WebSocket)

## What Matters for Assignment
🎯 **Login page** - Functional mock auth
🎯 **Order creation form** - Posts to API
🎯 **Order list** - Displays orders with status
🎯 **Status updates** - Real-time refresh shows changes
🎯 **Clean UI** - Professional appearance
🎯 **Responsive** - Works on mobile/desktop

## Order of Implementation
1. ✅ Project setup + dependencies
2. ✅ Types + services (auth, API)
3. ✅ Router + guards
4. ✅ Login view
5. ✅ Order components (form, card, list)
6. ✅ Dashboard view (main screen)
7. ✅ Styling + polish
8. ✅ Tests

## Key Features
- ✅ Mock login (instant access)
- ✅ Create orders via form
- ✅ View all orders with status
- ✅ Auto-refresh every 5 seconds
- ✅ Clean, minimal UI
- ✅ Mobile responsive
