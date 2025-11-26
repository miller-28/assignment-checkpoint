# Delivery Dashboard - Implementation Design

## Overview
Simple operational dashboard for Delivery team to process shipments. Built with Vue 3 + TypeScript.

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
- **Pending Deliveries** - Orders awaiting shipment
- **In-Transit Deliveries** - Shipped orders
- **Completed Deliveries** - Delivered orders

### 3. Delivery Operations
**Available actions:**
- **Mark as Shipped** - POST /api/v1/deliveries/:id/ship
  - Triggers status update to "Shipped"
  - Generates tracking number
- **Mark as Delivered** - POST /api/v1/deliveries/:id/deliver
  - Triggers status update to "Delivered"
  - Records delivery timestamp
- **View Delivery Details** - GET /api/v1/deliveries/:id
- **Refresh List** - Reload deliveries from API

---

## Project Structure

```
dashboard-delivery/
├── src/
│   ├── components/
│   │   ├── LoginForm.vue           # Mock login
│   │   ├── DeliveryCard.vue        # Single delivery display
│   │   ├── PendingList.vue         # Pending shipments
│   │   ├── InTransitList.vue       # Shipped orders
│   │   └── CompletedList.vue       # Delivered orders
│   ├── views/
│   │   ├── LoginView.vue
│   │   └── DashboardView.vue
│   ├── services/
│   │   ├── api.ts                  # Axios instance
│   │   ├── authService.ts          # Mock auth
│   │   └── deliveryService.ts      # Delivery API calls
│   ├── types/
│   │   └── delivery.ts             # Delivery interfaces
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
│   Delivery Dashboard Login      │
│                                  │
│   Username: [_____________]     │
│   Password: [_____________]     │
│                                  │
│        [ Login Button ]         │
└─────────────────────────────────┘
```

### Dashboard Page
```
┌──────────────────────────────────────────────────────────────┐
│  Delivery Dashboard                  [Logout] [Refresh]      │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  📋 PENDING SHIPMENTS (2)                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Delivery ID: del-001                                 │   │
│  │ Order ID: ord-123                                    │   │
│  │ Product: prod-456 | Qty: 2                           │   │
│  │ Status: ⏳ Processing                                │   │
│  │ Created: 2025-11-26 10:30                            │   │
│  │                                                      │   │
│  │           [ 🚚 Mark as Shipped ]                     │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  🚚 IN TRANSIT (3)                                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Delivery ID: del-002                                 │   │
│  │ Order ID: ord-789                                    │   │
│  │ Product: prod-123 | Qty: 1                           │   │
│  │ Status: 🚚 Shipped                                   │   │
│  │ Tracking: TRACK-789456                               │   │
│  │ Shipped: 2025-11-26 11:00                            │   │
│  │                                                      │   │
│  │           [ ✅ Mark as Delivered ]                   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ✅ COMPLETED TODAY (5)                                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Delivery ID: del-003                                 │   │
│  │ Order ID: ord-456                                    │   │
│  │ Product: prod-789 | Qty: 3                           │   │
│  │ Status: ✅ Delivered                                  │   │
│  │ Shipped: 2025-11-26 08:00                            │   │
│  │ Delivered: 2025-11-26 10:15                          │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

---

## Data Types

```typescript
interface Delivery {
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

interface ShipDeliveryRequest {
  tracking_number?: string; // Auto-generated if not provided
}

interface DeliverDeliveryRequest {
  location?: string;
  signature?: string;
}
```

---

## API Integration

**Base URL:** `http://localhost:3001/api/v1`

**Endpoints:**
- `GET /deliveries` - List all deliveries
- `GET /deliveries/:id` - Get delivery details
- `POST /deliveries/:id/ship` - Mark as shipped
- `POST /deliveries/:id/deliver` - Mark as delivered

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
  localStorage.setItem('delivery_token', mockToken);
  return mockToken;
};

export const mockLogout = () => {
  localStorage.removeItem('delivery_token');
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('delivery_token');
};

export const getMockToken = () => {
  return localStorage.getItem('delivery_token');
};
```

---

## Operations Flow

### Mark as Shipped
```typescript
async function markAsShipped(deliveryId: string) {
  const response = await axios.post(
    `/deliveries/${deliveryId}/ship`,
    { tracking_number: generateTrackingNumber() }
  );
  // Refresh delivery list
  await fetchDeliveries();
}

function generateTrackingNumber(): string {
  return `TRACK-${Date.now()}`;
}
```

### Mark as Delivered
```typescript
async function markAsDelivered(deliveryId: string) {
  const response = await axios.post(
    `/deliveries/${deliveryId}/deliver`,
    { 
      location: 'Customer Address',
      signature: 'Customer Signature'
    }
  );
  // Refresh delivery list
  await fetchDeliveries();
}
```

---

## Status Display

Use color-coded badges:
- 🟡 **Processing** - Yellow badge (awaiting shipment)
- 🔵 **Shipped** - Blue badge (in transit)
- 🟢 **Delivered** - Green badge (completed)

---

## Filtering & Grouping

Group deliveries by status:
```typescript
const pending = computed(() => 
  deliveries.value.filter(d => d.status === 'Processing')
);

const inTransit = computed(() => 
  deliveries.value.filter(d => d.status === 'Shipped')
);

const completed = computed(() => 
  deliveries.value.filter(d => d.status === 'Delivered')
);
```

---

## Auto-Refresh (Optional)

Poll API every 5 seconds to show new orders:
```typescript
setInterval(() => {
  if (isAuthenticated()) {
    fetchDeliveries();
  }
}, 5000);
```

---

## Environment Variables

```env
VITE_API_BASE_URL=http://localhost:3001/api/v1
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

### DeliveryCard.vue
```vue
<template>
  <div class="delivery-card">
    <h3>Delivery ID: {{ delivery.delivery_id }}</h3>
    <p>Order ID: {{ delivery.order_id }}</p>
    <span :class="statusClass">{{ delivery.status }}</span>
    
    <button 
      v-if="delivery.status === 'Processing'"
      @click="$emit('ship', delivery.delivery_id)"
    >
      🚚 Mark as Shipped
    </button>
    
    <button 
      v-if="delivery.status === 'Shipped'"
      @click="$emit('deliver', delivery.delivery_id)"
    >
      ✅ Mark as Delivered
    </button>
  </div>
</template>
```

### PendingList.vue
```vue
<template>
  <section>
    <h2>📋 Pending Shipments ({{ deliveries.length }})</h2>
    <DeliveryCard 
      v-for="delivery in deliveries"
      :key="delivery.delivery_id"
      :delivery="delivery"
      @ship="handleShip"
    />
  </section>
</template>
```

---

## Testing Strategy

### Unit Tests
- **Components:** DeliveryCard, PendingList, InTransitList, CompletedList
- **Services:** authService, deliveryService
- **Utilities:** Tracking number generation, status filtering

### Integration Tests
- API service integration
- Delivery workflow (ship/deliver actions)
- Authentication guards

### Test Structure
```
tests/
├── unit/
│   ├── components/
│   │   ├── DeliveryCard.spec.ts
│   │   ├── PendingList.spec.ts
│   │   └── InTransitList.spec.ts
│   └── services/
│       ├── authService.spec.ts
│       └── deliveryService.spec.ts
└── integration/
    ├── delivery-flow.spec.ts
    └── auth-flow.spec.ts
```

### Example Test
```typescript
// DeliveryCard.spec.ts
import { mount } from '@vue/test-utils';
import DeliveryCard from '@/components/DeliveryCard.vue';

describe('DeliveryCard', () => {
  it('should show ship button for processing delivery', () => {
    const delivery = {
      delivery_id: 'del-123',
      order_id: 'ord-456',
      status: 'Processing',
      product_id: 'prod-789',
      quantity: 2,
      created_at: '2025-11-26T10:00:00Z',
    };
    
    const wrapper = mount(DeliveryCard, {
      props: { delivery },
    });
    
    expect(wrapper.find('button').text()).toContain('Mark as Shipped');
  });
  
  it('should emit ship event when button clicked', async () => {
    const delivery = { status: 'Processing', delivery_id: 'del-123' };
    const wrapper = mount(DeliveryCard, { props: { delivery } });
    
    await wrapper.find('button').trigger('click');
    
    expect(wrapper.emitted('ship')).toBeTruthy();
    expect(wrapper.emitted('ship')[0]).toEqual(['del-123']);
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
- **Operational efficiency** - Quick access to ship/deliver actions
- **Clear status visibility** - Easy to see what needs attention
- **Minimal UI** - Only essential features
- **Real-time updates** - Auto-refresh for new orders
- **Mock auth** - No authentication complexity
- **Responsive** - Mobile-friendly for warehouse use
- **Well-tested** - Comprehensive unit and integration tests
- **Code quality** - Consistent formatting and linting
