---
paths:
  - '**/*.ts'
  - '**/*.tsx'
---

# Advanced TypeScript Patterns

Patterns beyond basics — use these for bulletproof type safety.

## Branded types for domain IDs

Prevent mixing up string IDs across domains. Use the unique symbol approach (zero autocomplete pollution):

```typescript
declare const brand: unique symbol
type Brand<T, B extends string> = T & { readonly [brand]: B }

type UserId = Brand<string, 'UserId'>
type OrderId = Brand<string, 'OrderId'>
type PerpId = Brand<string, 'PerpId'>

// Constructor functions are the only entry point
const createUserId = (raw: string): UserId => raw as UserId

// Now you can't accidentally pass an OrderId where a UserId is expected
const getUser = (id: UserId) => { ... }
getUser(orderId) // Type error!
```

## `satisfies` for validated config objects

Use `satisfies` to validate a value matches a type while preserving its literal type. Best for config objects.

```typescript
const columnConfig = {
  price: { label: 'Price', align: 'right' },
  volume: { label: 'Volume', align: 'right' },
  name: { label: 'Name', align: 'left' },
} satisfies Record<string, { label: string; align: 'left' | 'right' }>

// columnConfig.price.label is literal 'Price', not widened to string
```

## Exhaustive checking with `never`

After handling all union cases, assert the remaining type is `never` to catch future additions.

```typescript
const assertNever = (value: never): never => {
  throw new Error(`Unhandled value: ${value}`)
}

// If a new OrderStatus is added, this fails at compile time
const getStatusColor = (status: OrderStatus): string => {
  const colors: Record<OrderStatus, string> = {
    pending: 'yellow',
    filled: 'green',
    cancelled: 'gray',
  }
  return colors[status]
}
```

## Type predicates for runtime narrowing

Create reusable type guards that narrow types at runtime.

```typescript
const isFilledOrder = (order: Order): order is FilledOrder =>
  order.status === 'filled'

// After filtering, TypeScript knows the array contains only FilledOrder
const filled = orders.filter(isFilledOrder)
// filled: FilledOrder[]
```

## Mapped types for deriving related types

Create type variations systematically from a base type.

```typescript
// Make all properties nullable
type Nullable<T> = { [K in keyof T]: T[K] | null }

// Pick only function properties
type Methods<T> = {
  [K in keyof T as T[K] extends (...args: any[]) => any ? K : never]: T[K]
}
```

## Template literal types for string patterns

```typescript
type EventName = `on${Capitalize<string>}`
type CSSProperty = `--${string}`
type ApiEndpoint = `/api/${string}`
```

## Const assertion + satisfies for exhaustive configs

Combine `as const` and `satisfies` for configs that are both type-checked AND preserve literal types.

```typescript
const routes = {
  home: '/',
  trading: '/trading',
  portfolio: '/portfolio',
} as const satisfies Record<string, string>

type Route = (typeof routes)[keyof typeof routes]
// Route = '/' | '/trading' | '/portfolio' — literal, not string
```

## Generic constraints with defaults

Constrain generics to specific shapes while providing sensible defaults.

```typescript
type QueryResult<TData, TError extends Error = Error> = {
  data: TData | undefined
  error: TError | null
  isLoading: boolean
}
```

## Discriminated union exhaustiveness via Record

Always use `Record<UnionType, Value>` instead of switch or if/else chains — the compiler enforces all cases are handled. Adding a new union member immediately surfaces every location that needs updating.

## `NoInfer` — control generic inference sites

Prevent TypeScript from using a specific parameter as an inference site for a generic. Inference comes from the "primary" parameter only.

```typescript
// Without NoInfer: passing invalid defaultValue would WIDEN the generic
// With NoInfer: defaultValue must match the type inferred from options
const createSelect = <T extends string>(
  options: T[],
  defaultValue: NoInfer<T>,
) => { ... }

createSelect(['a', 'b', 'c'], 'd') // Error! 'd' is not 'a' | 'b' | 'c'
```

## `asserts` predicates for fail-fast narrowing

Use `asserts val is T` to narrow types for all subsequent code (not just in a branch). Ideal for `ensurePresent`-style helpers.

```typescript
function assertDefined<T>(val: T | null | undefined, msg: string): asserts val is T {
  if (val == null) throw new Error(msg)
}

// After this call, `user` is narrowed to User for ALL code below
assertDefined(user, 'User must exist')
user.name // TypeScript knows user is non-null
```

## Utility type composition

Compose built-in utility types instead of writing custom mapped types:

```typescript
// Make specific keys optional, keep the rest required
type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// Extract specific variant from a union
type SuccessResult = Extract<ApiResult, { status: 'success' }>

// Prefer composition over custom implementations
type CreateOrderInput = Omit<Order, 'id' | 'createdAt' | 'status'>
```
