---
name: testing-guide
description: Comprehensive testing guide covering unit, integration, and E2E tests. Reference for deciding what to test and how, with Vitest and Playwright patterns.
disable-model-invocation: true
---

# Testing Guide — Unit, Integration & E2E

## Test Pyramid & Decision Tree

### What type of test should I write?

```
Is it a pure function (mapper, util, core logic)?
  → UNIT TEST (Vitest)

Is it a hook that composes queries/state?
  → INTEGRATION TEST (Vitest + renderHook)

Is it a component with user interaction?
  → COMPONENT TEST (Vitest + Testing Library)

Is it a critical user flow (place order, login, navigate)?
  → E2E TEST (Playwright)

Is it a styled component with no logic?
  → DON'T TEST IT
```

### Smart test evaluation — when to skip

Skip tests for:
- Pure UI components with zero logic (just rendering props)
- Styled components / CSS-only changes
- Config files, type-only files, barrel exports
- Changes under 5 lines that modify existing tested behavior

---

## Unit Tests (Vitest)

### What to unit test
- **Mappers** (`data/mappers/*.ts`) — API response → domain model transformations
- **Utils** (`shared/utils/`) — pure functions
- **Core logic** (`core.ts`) — business rules, derived computations
- **Validation schemas** (`data/schemas/`) — Zod schema edge cases

### Structure

```typescript
import { describe, it, expect } from 'vitest'
import { mapOrderFromApi } from '../data/mappers/order'

describe('mapOrderFromApi', () => {
  it('maps filled order with correct status', () => {
    const apiResponse = createMockApiOrder({ status: 'FILLED' })
    const result = mapOrderFromApi(apiResponse)
    expect(result.status).toBe('filled')
    expect(result.fillPrice).toBeDefined()
  })

  it('handles zero-quantity edge case', () => {
    const apiResponse = createMockApiOrder({ qty: '0' })
    const result = mapOrderFromApi(apiResponse)
    expect(result.quantity).toBe(0)
  })
})
```

### Patterns
- **Arrange-Act-Assert** structure
- Factory functions for test data (`createMockOrder()`, `createMockMarket()`)
- Test edge cases: empty arrays, zero values, undefined optionals, boundary values
- Test error cases: what should throw, what should return fallbacks
- One assertion per test when possible (clear failure messages)

### File location
- `src/modules/{module}/__tests__/{feature}.test.ts`
- `src/lib/{module}/__tests__/{feature}.test.ts`
- For lib modules: colocate as `*.test.ts` sibling

---

## Integration Tests (Vitest + Testing Library)

### What to integration test
- **Custom hooks** that compose multiple queries or state
- **Components with business logic** (form validation, conditional rendering)
- **Query composition** patterns (useCombineQueries, useTransformQueryData)

### Hook testing

```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useOrdersWithMarkets } from '../data/hooks'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useOrdersWithMarkets', () => {
  it('combines orders and markets data', async () => {
    // Mock API responses
    server.use(
      http.get('/api/orders', () => HttpResponse.json(mockOrders)),
      http.get('/api/markets', () => HttpResponse.json(mockMarkets)),
    )

    const { result } = renderHook(() => useOrdersWithMarkets(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(3)
    expect(result.current.data[0].market).toBeDefined()
  })
})
```

### Component testing

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('OrderForm', () => {
  it('validates minimum order size', async () => {
    render(<OrderForm />, { wrapper: TestProviders })

    const input = screen.getByLabelText('Amount')
    await userEvent.type(input, '0.001')
    await userEvent.click(screen.getByText('Place Order'))

    expect(screen.getByText(/minimum order size/i)).toBeInTheDocument()
  })
})
```

### Patterns
- Use `msw` (Mock Service Worker) for API mocking — not manual mocks
- Wrap in providers (QueryClient, theme, etc.) via `TestProviders` wrapper
- Test user behavior, not implementation details
- Never test internal state — test what the user sees

---

## E2E Tests (Playwright)

### What to E2E test
- **Critical user flows**: place order, cancel order, switch markets
- **Navigation flows**: login → trading → portfolio
- **Data integrity**: order appears in history after placement
- **Real WebSocket behavior**: price updates, order fills

### Structure

```typescript
import { test, expect } from '@playwright/test'

test.describe('Market Order', () => {
  test('places a market buy order', async ({ page }) => {
    await page.goto('/trading/BTC-USD')

    // Fill order form
    await page.getByLabel('Amount').fill('0.01')
    await page.getByRole('button', { name: 'Buy' }).click()

    // Verify confirmation
    await expect(page.getByText('Order placed')).toBeVisible()

    // Verify in order history
    await page.getByRole('tab', { name: 'History' }).click()
    await expect(page.getByText('Market Buy')).toBeVisible()
  })

  test('shows validation error for zero amount', async ({ page }) => {
    await page.goto('/trading/BTC-USD')
    await page.getByLabel('Amount').fill('0')
    await page.getByRole('button', { name: 'Buy' }).click()
    await expect(page.getByText(/minimum/i)).toBeVisible()
  })
})
```

### File location
- `tests/e2e/{feature}.spec.ts`
- Helpers in `tests/e2e/helpers/`

### Patterns
- **Page Object Model** for complex pages:
  ```typescript
  class TradingPage {
    constructor(private page: Page) {}
    async placeMarketOrder(side: 'buy' | 'sell', amount: string) { ... }
    async getOrderHistory() { ... }
  }
  ```
- **Test isolation**: each test starts from a clean state
- **Use role-based selectors**: `getByRole`, `getByLabel`, `getByText` — not CSS selectors
- **Wait for network**: `await page.waitForResponse('/api/orders')` before asserting
- **Visual regression**: screenshot comparison for critical UI states
- **Mock external APIs** but test real app behavior
- **Retry flaky checks**: use `expect(locator).toBeVisible({ timeout: 5000 })`

### Running
```bash
yarn test:e2e              # Run all E2E tests
npx playwright test --ui   # Interactive mode
npx playwright test --debug # Debug mode
```

---

## Test Data Factories

Create reusable factories for test data to avoid duplication:

```typescript
// tests/factories/order.ts
export const createMockOrder = (overrides: Partial<Order> = {}): Order => ({
  id: 'order-1',
  side: 'buy',
  type: 'market',
  status: 'pending',
  amount: 1.0,
  price: 50000,
  createdAt: new Date().toISOString(),
  ...overrides,
})
```

---

## What NOT to Test

- Implementation details (internal state, private methods)
- Third-party library behavior (React Query caching, Zustand internals)
- Styled component CSS output
- Type-only files (`types.ts`)
- Barrel exports (`index.ts`)
- Console.log calls
