---
paths:
  - '**/*.tsx'
  - '**/*.ts'
---

# React Performance Patterns

Performance patterns beyond "no useMemo" — structural optimizations that prevent re-renders by design.

## The props myth — parents cause re-renders, not props

Props changes alone do NOT trigger re-renders on unmemoized components. The **parent re-rendering** is the actual trigger — all children re-render regardless of whether their props changed. Understanding this is fundamental to choosing the right optimization strategy (composition over memoization).

## Context splitting — separate data from API

Separate contexts by update frequency AND separate state data from setter functions:

```tsx
// Good — price updates don't re-render theme consumers
const ThemeContext = createContext<Theme>(defaultTheme)
const PriceContext = createContext<PriceMap>({})

// Good — components using only dispatch don't re-render when data changes
const DataContext = createContext<State>(initialState)
const DispatchContext = createContext<Dispatch>(noop)
// Use useReducer so dispatch is referentially stable

// Bad — every price tick re-renders everything consuming this context
const AppContext = createContext<{ theme: Theme; prices: PriceMap }>({...})
```

## setupValueProvider for computed values

Use `setupValueProvider` for derived/computed values distributed via Context. It creates read-only providers that only update when the computed value changes.

## Avoid request waterfalls

Never let child component data fetching depend on parent rendering. Fire independent requests in parallel.

```tsx
// Good — both queries fire immediately
const Page = () => {
  const ordersQuery = useOrdersQuery()
  const marketsQuery = useMarketsQuery()
  return <MatchQuery query={useCombineQueries({ queries: [ordersQuery, marketsQuery], joinData: ... })} ... />
}

// Bad — waterfall: marketsQuery doesn't fire until orders render
const Page = () => {
  const ordersQuery = useOrdersQuery()
  return <MatchQuery query={ordersQuery} success={(orders) => <OrdersWithMarkets orders={orders} />} />
}
// Where OrdersWithMarkets internally calls useMarketsQuery — delayed by parent loading
```

## Index lookup data structures

Pre-compute Maps for O(1) lookups instead of O(n) Array.find in render paths.

```tsx
// Good — O(1) per row
const marketById = new Map(markets.map(m => [m.id, m]))
const rows = orders.map(o => ({ ...o, market: marketById.get(o.marketId) }))

// Bad — O(n*m), re-runs every render
const rows = orders.map(o => ({ ...o, market: markets.find(m => m.id === o.marketId) }))
```

## Avoid stale closures in event handlers

Event handlers capture state at creation time. For handlers that need current state (intervals, WebSocket callbacks), use refs.

```tsx
// Good — ref always has latest value
const latestPrice = useRef(price)
latestPrice.current = price
const handler = () => console.log(latestPrice.current)

// Bad — captures initial price, never updates
const handler = () => console.log(price)
useEffect(() => {
  ws.on('message', handler)
}, []) // handler is stale
```

## Debounce user-input-driven computations

Search, filter, and sort operations triggered by user input should be debounced to avoid wasteful re-renders.

## Batch state updates

React 18+ auto-batches state updates in event handlers. But for async operations (setTimeout, Promises), wrap in `startTransition` or `flushSync` if needed.

## List virtualization for large datasets

For lists > 100 items (discovery columns, trade history), use virtualization. Never render thousands of DOM nodes.

## Custom hooks hide state lifting

Custom hooks create an illusion of encapsulation but actually lift state to the host component. Every state change inside a hook — even internal state not exposed in the return value — causes the host component to re-render. When hooks call other hooks, state changes cascade through the entire chain.

**Solution:** Move stateful hooks into isolated child components when their state shouldn't affect the parent.

## Race conditions in data fetching

When components refetch on prop changes (e.g., user switches between tabs quickly), earlier responses can arrive after later ones, displaying stale data.

```tsx
// Good — abort previous request on new fetch
useEffect(() => {
  const controller = new AbortController()
  fetchData(id, { signal: controller.signal }).then(setData)
  return () => controller.abort()
}, [id])
```

## Avoid unnecessary prop spreading

Spreading large objects as props can cause unnecessary re-renders when any property changes, even if the component only uses a subset.

```tsx
// Good — only passes what's needed
<OrderRow price={order.price} size={order.size} side={order.side} />

// Bad — any change to order object triggers re-render
<OrderRow {...order} />
```
