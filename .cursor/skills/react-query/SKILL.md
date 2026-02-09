---
name: react-query
description: Guide for writing React Query hooks, mutation hooks, and query UI in this codebase. Use when creating or modifying useQuery/useMutation hooks, rendering query states, combining or transforming queries, invalidating caches, or working with `@lib/ui` query utilities.
---

# React Query Patterns

Custom types and utilities live in `@lib/ui` (`lib/ui/query/`).

## Query Hook

```ts
import { useQuery } from '@tanstack/react-query'

export const useSomeQuery = () => {
  const input = { id, network }

  return useQuery({
    queryKey: ['getSomething', input],
    queryFn: () => getSomething(input),
  })
}
```

- Query key is `[functionName, input]` when `queryFn` calls another function with an input.
- Include **every** variable the query depends on in the key.
- Export a `getXxxQueryKey` helper when mutations need to invalidate or reset the query from elsewhere.

## Resolved Data Hook

When a parent renders children only after a query succeeds (via `MatchQuery`) and child components need to access the resolved data, provide a companion hook. Only create this hook when there are actual consumers -- knip will flag unused exports.

```ts
export const useSomeQuery = () => useQuery({ ... })

export const useSomeData = () => {
  const { data } = useSomeQuery()
  return ensurePresent(data, 'some query data')
}
```

## Query UI Rendering

Use `MatchQuery` from `@lib/ui/query/components/MatchQuery` for loading/error/success states. Never write manual `if (isLoading)` / `if (error)` checks.

```tsx
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'

<MatchQuery
  value={query}
  pending={() => <Spinner />}
  error={(e) => <ErrorMessage error={e} />}
  success={(data) => <DataView data={data} />}
/>
```

All render props default to `() => null`. There is also an `inactive` prop for queries that haven't started.

## Mutation Hook

```ts
import { useMutation } from '@tanstack/react-query'
import { useRefetchQueries } from '@lib/ui/query/hooks/useRefetchQueries'

export const useSomeMutation = () => {
  const refetchQueries = useRefetchQueries()

  return useMutation({
    mutationFn: async () => {
      // perform mutation
    },
    onSuccess: () => {
      refetchQueries(getTransactionsQueryKey({ ... }))
    },
  })
}
```

- `useRefetchQueries()` from `@lib/ui` -- refetches multiple query keys in one call.
- Always invalidate **all** queries whose data is affected by the mutation.

## Utilities (`@lib/ui`)

Query option presets to spread into `useQuery`:
- `noRefetchQueryOptions` -- disables refetch on mount, window focus, and reconnect.
- `persistQueryOptions` -- marks query for localStorage persistence.
- `pollingQueryOptions(intervalMs)` -- enables periodic refetching at the given interval.

Hooks for composing queries:
- `useCombineQueries({ queries, joinData, eager? })` -- merges multiple queries into one. Accepts an array of queries or a record of named queries. `eager: true` (default) returns partial data; `eager: false` waits for all.
- `useTransformQueryData(query, transform)` -- derives new data from a single query.

Types:
- `Query<T, E>` -- `{ data: T | undefined, isPending: boolean, error: E | null }`
- `EagerQuery<T, E>` -- `{ data: T | undefined, isPending: boolean, errors: E[] }`
- `inactiveQuery` -- constant for idle state.
- `pendingQuery` -- constant for pending state.
- `getResolvedQuery(data)` -- creates a resolved `Query<T>` from data.
