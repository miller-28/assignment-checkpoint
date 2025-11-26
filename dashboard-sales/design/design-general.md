# Sales Dashboard - Implementation Design

## Overview
Simple operational dashboard for Sales team to manage orders. Built with Vue 3 + TypeScript.

---

## Technology Stack
- **Framework:** Vue 3 (Composition API + TypeScript)
- **UI Library:** Tailwind CSS
- **HTTP Client:** Axios
- **State Management:** Pinia (optional, or Vue reactive state)
- **Router:** Vue Router
- **Auth:** Mock JWT in localStorage
- **Linting:** ESLint + Prettier
- **Testing:** Jest + Vue Test Utils

---

## Features

### 1. Mock Login
- Simple form: username/password
- Mock validation (any credentials work)
- Store mock JWT in localStorage
- Redirect to dashboard

### 2. Dashboard View
**Main sections:**
- **Create Order Form** - Trigger new order creation
- **Orders List** - Display all orders with current status
- **Order Details** - View individual order lifecycle

### 3. Order Operations
**Available actions:**
- **Create Order** - POST /api/v1/orders
  - Input: Product ID, Quantity, User ID
  - Shows generated Order ID after creation
- **View Order Status** - GET /api/v1/orders/:id
  - Display: Order ID, Status, Created/Shipped/Delivered timestamps
- **Refresh List** - Reload orders from API

**No shipment/delivery actions** - Sales only creates orders and views status updates from Delivery system.

---

## Project Structure

```
dashboard-sales/
├── src/
│   ├── components/
│   │   ├── LoginForm.vue        # Mock login
│   │   ├── OrderCreateForm.vue  # Create new order
│   │   ├── OrderList.vue        # List all orders
│   │   └── OrderCard.vue        # Single order display
│   ├── views/
│   │   ├── LoginView.vue
│   │   └── DashboardView.vue
│   ├── services/
│   │   ├── api.ts               # Axios instance with interceptors
│   │   ├── authService.ts       # Mock auth
│   │   └── orderService.ts      # Order API calls
│   ├── types/
│   │   └── order.ts             # Order interfaces
│   ├── router/
│   │   └── index.ts
│   ├── App.vue
│   └── main.ts
├── public/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## UI Layout

### Login Page
```
┌─────────────────────────────────┐
│     Sales Dashboard Login       │
│                                  │
│   Username: [_____________]     │
│   Password: [_____________]     │
│                                  │
│        [ Login Button ]         │
└─────────────────────────────────┘
```

### Dashboard Page
```
┌──────────────────────────────────────────────────┐
│  Sales Dashboard              [Logout] [Refresh] │
├──────────────────────────────────────────────────┤
│                                                   │
│  📝 CREATE NEW ORDER                             │
│  ┌────────────────────────────────────────────┐ │
│  │ Product ID: [________]                     │ │
│  │ Quantity:   [___]                          │ │
│  │ User ID:    [________]                     │ │
│  │                                            │ │
│  │        [ Create Order ]                    │ │
│  └────────────────────────────────────────────┘ │
│                                                   │
│  📦 ORDERS                                        │
│  ┌────────────────────────────────────────────┐ │
│  │ Order ID: abc-123                          │ │
│  │ Status: ⏳ Pending Shipment                │ │
│  │ Created: 2025-11-26 10:30                  │ │
│  │ Product: prod-456 | Qty: 2                 │ │
│  └────────────────────────────────────────────┘ │
│                                                   │
│  ┌────────────────────────────────────────────┐ │
│  │ Order ID: def-789                          │ │
│  │ Status: 🚚 Shipped                         │ │
│  │ Created: 2025-11-26 09:15                  │ │
│  │ Shipped: 2025-11-26 11:00                  │ │
│  │ Product: prod-123 | Qty: 1                 │ │
│  └────────────────────────────────────────────┘ │
│                                                   │
│  ┌────────────────────────────────────────────┐ │
│  │ Order ID: ghi-012                          │ │
│  │ Status: ✅ Delivered                        │ │
│  │ Created: 2025-11-25 14:20                  │ │
│  │ Shipped: 2025-11-25 16:00                  │ │
│  │ Delivered: 2025-11-26 09:30                │ │
│  │ Product: prod-789 | Qty: 3                 │ │
│  └────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

---

## Data Types

```typescript
interface Order {
  order_id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  status: 'Pending Shipment' | 'Shipped' | 'Delivered';
  created_at: string;
  shipped_at?: string;
  delivered_at?: string;
}

interface CreateOrderRequest {
  user_id: string;
  product_id: string;
  quantity: number;
  idempotency_key: string;
}

interface CreateOrderResponse {
  order_id: string;
  status: string;
  created_at: string;
}
```

---

## API Integration

**Base URL:** `http://localhost:3000/api/v1`

**Endpoints:**
- `POST /orders` - Create new order
- `GET /orders/:id` - Get order details
- `GET /orders?user_id=xxx` - List user orders (optional)

**Headers:**
```typescript
{
  'Authorization': `Bearer ${mockJWT}`,
  'Content-Type': 'application/json'
}
```

---

## Mock Authentication

```typescript
// authService.ts
export const mockLogin = (username: string, password: string) => {
  // Accept any credentials
  const mockToken = btoa(`${username}:${Date.now()}`);
  localStorage.setItem('sales_token', mockToken);
  return mockToken;
};

export const mockLogout = () => {
  localStorage.removeItem('sales_token');
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('sales_token');
};

export const getMockToken = () => {
  return localStorage.getItem('sales_token');
};
```

---

## Status Display

Use color-coded badges:
- 🟡 **Pending Shipment** - Yellow badge
- 🔵 **Shipped** - Blue badge  
- 🟢 **Delivered** - Green badge

---

## Auto-Refresh (Optional)

Poll API every 5 seconds to show status updates:
```typescript
setInterval(() => {
  if (isAuthenticated()) {
    fetchOrders();
  }
}, 5000);
```

---

## Environment Variables

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_POLLING_INTERVAL=5000
```

---

## Development Commands

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

---

## Key Vue Components

### OrderCreateForm.vue
```vue
<template>
  <form @submit.prevent="createOrder">
    <input v-model="form.product_id" placeholder="Product ID" />
    <input v-model.number="form.quantity" type="number" />
    <input v-model="form.user_id" placeholder="User ID" />
    <button type="submit">Create Order</button>
  </form>
</template>
```

### OrderCard.vue
```vue
<template>
  <div class="order-card">
    <h3>Order ID: {{ order.order_id }}</h3>
    <span :class="statusClass">{{ order.status }}</span>
    <p>Created: {{ formatDate(order.created_at) }}</p>
    <p v-if="order.shipped_at">Shipped: {{ formatDate(order.shipped_at) }}</p>
    <p v-if="order.delivered_at">Delivered: {{ formatDate(order.delivered_at) }}</p>
  </div>
</template>
```

---

## Testing Strategy

### Unit Tests
- **Components:** OrderCreateForm, OrderCard, OrderList
- **Services:** authService, orderService
- **Utilities:** Date formatting, status mapping

### Integration Tests
- API service integration
- Router navigation flows
- Authentication guards

### Test Structure
```
tests/
├── unit/
│   ├── components/
│   │   ├── OrderCreateForm.spec.ts
│   │   ├── OrderCard.spec.ts
│   │   └── OrderList.spec.ts
│   └── services/
│       ├── authService.spec.ts
│       └── orderService.spec.ts
└── integration/
    ├── order-flow.spec.ts
    └── auth-flow.spec.ts
```

### Example Test
```typescript
// OrderCreateForm.spec.ts
import { mount } from '@vue/test-utils';
import OrderCreateForm from '@/components/OrderCreateForm.vue';

describe('OrderCreateForm', () => {
  it('should emit create event with form data', async () => {
    const wrapper = mount(OrderCreateForm);
    
    await wrapper.find('input[placeholder="Product ID"]').setValue('prod-123');
    await wrapper.find('input[type="number"]').setValue(2);
    await wrapper.find('input[placeholder="User ID"]').setValue('user-456');
    
    await wrapper.find('form').trigger('submit');
    
    expect(wrapper.emitted('create')).toBeTruthy();
  });
});
```

---

## Linting Configuration

### ESLint Rules
- Vue 3 recommended rules
- TypeScript strict rules
- Prettier integration for code formatting

### .eslintrc.js
```javascript
module.exports = {
  env: {
    node: true,
    browser: true,
  },
  extends: [
    'plugin:vue/vue3-recommended',
    '@vue/typescript/recommended',
    'prettier',
  ],
  rules: {
    'vue/multi-word-component-names': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
  },
};
```

### .prettierrc
```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2
}
```

---

## Focus
- **Minimal, clean UI** - No unnecessary features
- **Operational clarity** - Clear status visibility
- **Real-time updates** - Auto-refresh or manual refresh
- **Mock auth** - No real authentication complexity
- **Responsive** - Mobile-friendly layout
- **Well-tested** - Comprehensive unit and integration tests
- **Code quality** - Consistent formatting and linting
