---
paths:
  - '**/*.tsx'
---

# React Composition Patterns

Advanced composition patterns from Tao of React + Advanced React (Nadia Makarevich).

## Children as a render optimization

Children passed as props do NOT re-render when the parent's state changes. Use this to isolate expensive renders.

```tsx
// Good — ExpensiveTree won't re-render when count changes
const Layout = ({ children }: { children: ReactNode }) => {
  const [count, setCount] = useState(0)
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>{count}</button>
      {children}
    </div>
  )
}

// Usage: <Layout><ExpensiveTree /></Layout>

// Bad — ExpensiveTree re-renders on every count change
const Layout = () => {
  const [count, setCount] = useState(0)
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>{count}</button>
      <ExpensiveTree />
    </div>
  )
}
```

## Elements as props (extracting state down)

When only part of a component needs frequently-changing state, extract that part into its own component. The remaining tree becomes children or element-props and won't re-render.

```tsx
// Good — only ScrollTracker re-renders on scroll, Header stays stable
const Page = () => (
  <ScrollTracker header={<Header />}>
    <Content />
  </ScrollTracker>
)

// Bad — entire Page re-renders on scroll
const Page = () => {
  const scrollY = useScrollPosition() // updates on every scroll
  return (
    <>
      <Header />
      <Content />
      <ScrollIndicator y={scrollY} />
    </>
  )
}
```

## Moving state down

If state is only used by one part of the tree, move it into a child component. Parent and siblings won't re-render.

```tsx
// Good — search state is isolated, list doesn't re-render on typing
const Page = () => (
  <>
    <SearchWithResults />
    <ExpensiveList />
  </>
)

// Bad — every keystroke re-renders ExpensiveList
const Page = () => {
  const [query, setQuery] = useState('')
  return (
    <>
      <SearchInput value={query} onChange={setQuery} />
      <SearchResults query={query} />
      <ExpensiveList />
    </>
  )
}
```

## Compound components

For components that share implicit state (like tabs, accordions, select + options). Use Context internally.

```tsx
// Good — clean API, state shared implicitly
<Tabs defaultValue="orders">
  <Tabs.List>
    <Tabs.Trigger value="orders">Orders</Tabs.Trigger>
    <Tabs.Trigger value="positions">Positions</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="orders"><OrderTable /></Tabs.Content>
  <Tabs.Content value="positions"><PositionTable /></Tabs.Content>
</Tabs>
```

## Key-based remounting

Use `key` to force React to unmount and remount a component, resetting all internal state. Useful when navigating between similar items.

```tsx
// Good — switching perpId remounts the form, resetting all local state
<OrderForm key={perpId} />
```

## Component responsibilities — single purpose

Each component should do ONE thing. If you're passing more than 5-7 props, the component is doing too much — split it.

## Derive state, never sync

If a value can be computed from existing state/props, compute it inline. Never `useEffect` to sync derived state.

```tsx
// Good — derived inline
const fullName = `${firstName} ${lastName}`
const filteredItems = items.filter(i => i.category === category)

// Bad — synced via useEffect (causes extra render + bugs)
const [fullName, setFullName] = useState('')
useEffect(() => {
  setFullName(`${firstName} ${lastName}`)
}, [firstName, lastName])
```

## Never define components inside render functions

Defining a component inside another component's body creates a **new function reference every render**. React sees a new type, unmounts the old instance, and mounts a fresh one — destroying all internal state and effects.

```tsx
// CRITICAL anti-pattern — full remount every render
const Page = () => {
  const ListItem = ({ item }: { item: Item }) => <div>{item.name}</div>
  return items.map(item => <ListItem key={item.id} item={item} />)
}

// Good — defined outside, stable reference
const ListItem = ({ item }: { item: Item }) => <div>{item.name}</div>
const Page = () => items.map(item => <ListItem key={item.id} item={item} />)
```

## Conditional rendering — beware same-position reuse

React reuses component instances at the same tree position. Conditional rendering with the same component type preserves stale state.

```tsx
// Bug — switching between these reuses the same Input instance (stale state)
{isEmail ? <Input id="email" /> : <Input id="phone" />}

// Fix — use key to force separate instances
{isEmail ? <Input key="email" id="email" /> : <Input key="phone" id="phone" />}
```

## Ternary over short-circuit for conditional rendering

Use ternary instead of `&&` to prevent rendering `0` or empty strings.

```tsx
// Good — explicit null for falsy case
{items.length > 0 ? <ItemList items={items} /> : null}

// Bad — renders "0" when items is empty
{items.length && <ItemList items={items} />}
```

## Error boundaries — granular placement

Place error boundaries around independent UI sections, not just at the top level. Each section that can fail independently should have its own boundary.

```tsx
// Good — chart error doesn't kill the whole page
<ErrorBoundary fallback={<ChartError />}>
  <PriceChart />
</ErrorBoundary>
<ErrorBoundary fallback={<OrderBookError />}>
  <OrderBook />
</ErrorBoundary>
```

## Async errors in error boundaries

Error boundaries only catch errors during React lifecycle (render, effects). For async errors (promises, event handlers), re-throw into the React lifecycle:

```tsx
const useThrowAsyncError = () => {
  const [, setState] = useState()
  return (error: Error) => setState(() => { throw error })
}
```
