---
name: state
description: Guide for state management patterns in this codebase. Use when creating state providers, value providers, persistent state hooks, validating stored values, deciding how components should access state, or choosing storage (desktop vs extension).
---

# State Management Patterns

Utilities live in `@lib/ui/state/`. Persistent state hooks and storage are in `clients/desktop/src/` (desktop) or `@lib/extension/storage` (extension).

## State Provider (Mutable)

`setupStateProvider` creates a React Context with internal `useState`. Returns `[Provider, useHook]` where the hook gives `[value, setValue]`.

```ts
import { setupStateProvider } from '@lib/ui/state/setupStateProvider'

// With default initial value -- Provider's initialValue prop is optional
export const [AmountProvider, useAmount] = setupStateProvider<number | null>('amount', null)

// Without default -- Provider must receive initialValue prop
export const [ReceiverProvider, useReceiver] = setupStateProvider<string>('SendReceiver')
```

- One provider per value. **Don't** combine multiple values in one context.
- **Don't** use manual `createContext` for mutable state — use `setupStateProvider`.

## Value Provider (Read-only)

`setupValueProvider` creates a Context where the Provider accepts a `value` prop (no internal state). The hook returns the value directly.

```ts
import { setupValueProvider } from '@lib/ui/state/setupValueProvider'

export const [CurrencyProvider, useCurrency] = setupValueProvider<Currency>('currency')

// Usage: const currency = useCurrency()
```

Use when the value is computed or fetched elsewhere and just needs to be distributed down the tree.

## Persistent State (Desktop Only)

`createPersistentStateHook` creates a hook backed by `LocalStorage` (browser) or `TemporaryStorage` (SSR). Uses `useSyncExternalStore` for synchronization and supports cross-tab sync via storage events.

The desktop app defines its key enum and hook in `clients/desktop/src/state/persistentState.ts`:

```ts
import { createPersistentStateHook } from '../lib/ui/state/createPersistentStateHook'
import { LocalStorage } from '../lib/ui/state/LocalStorage'
import { TemporaryStorage } from '../lib/ui/state/TemporaryStorage'

export enum PersistentStateKey {
  VaultCreationMpcLib = 'vaultCreationMpcLib-v2',
}

const Storage = typeof window !== 'undefined' ? LocalStorage : TemporaryStorage
export const persistentStorage = new Storage()
export const usePersistentState =
  createPersistentStateHook<PersistentStateKey>(persistentStorage)
```

Usage follows the same `[value, setValue]` pattern. Define domain-specific hooks that call `usePersistentState` with a key and default:

```ts
export const useVaultCreationMpcLib = () => {
  return usePersistentState<MpcLib>(
    PersistentStateKey.VaultCreationMpcLib,
    defaultMpcLib,
    validateOneOf(mpcLibOptions)
  )
}
```

## Storage by Client: Desktop vs Extension

**Desktop app** uses two persistence mechanisms:

1. **UI/session persistence** — `createPersistentStateHook` with `LocalStorage` (or `TemporaryStorage` when `typeof window === 'undefined'`). Same process, cross-tab sync via `storage` events. Use for preferences and small UI state that should survive reload.
2. **Domain data** — Wails/Go backend (`wailsjs/go/storage/Store`) with SQL-backed store for vaults, coins, address book, vault folders. Use for user data and anything that must be durable and queryable.

**Extension** does not use `createPersistentStateHook`. It uses Chrome storage:

- `@lib/extension/storage/get`, `set`, `remove` — async `chrome.storage.local` access.
- Use for persisted view, settings, or any key/value that must survive across sessions. No cross-tab sync via the same API as desktop; extension storage is per-extension.

When adding new persisted state:

- **Desktop-only UI preference** → add a `PersistentStateKey` and a hook in `persistentState.ts` (or a domain folder that uses `usePersistentState`).
- **Extension-only** → use `getStorageValue` / `setStorageValue` from `@lib/extension/storage` with a string key; no shared enum with desktop.
- **Domain data (vaults, coins, etc.)** → use the Wails Store (desktop) or the extension’s storage layer as appropriate; not `usePersistentState`.

## Persistent State Validation

An optional third parameter to `usePersistentState` validates the stored value on the **first read**. This protects against stale data after code changes (e.g., a union type gains/loses members).

The validate function has three outcomes:

- Returns `undefined` (or implicit void) — value is valid, keep it
- Returns a corrected value — use and store the correction
- Throws — fall back to `initialValue`

For union types, use `validateOneOf` from `@lib/utils/array/isOneOf`:

```ts
import { validateOneOf } from '@lib/utils/array/isOneOf'

export const useVaultCreationMpcLib = () => {
  return usePersistentState<MpcLib>(
    PersistentStateKey.VaultCreationMpcLib,
    defaultMpcLib,
    validateOneOf(mpcLibOptions)
  )
}
```

`validateOneOf(options)` returns a function that throws if the value is not a member of `options`. The hook catches the error via `attempt` and falls back to `initialValue`.

For compound objects with constrained fields, write a custom validate function that returns a corrected object or `undefined`, or throws to force fallback.

Only needed for constrained types (unions, enums). Types like `boolean`, `number | null`, `string[]`, or free-form strings often don’t need validation.

When the default value comes from a const array, use `constArray[0]` (or the appropriate element) instead of repeating the literal so the default stays in sync. See the **derive-union-from-const** skill.

## Component Autonomy

Domain-specific components should access state directly via hooks. **Never** pass props that a component can obtain itself.

```tsx
// Good — component gets its own state
export const VaultHeader = () => {
  const [vaultId] = useVaultId()
  return <Header title={vaultId} />
}

export const VaultPage = () => <VaultHeader />
```

```tsx
// Bad — unnecessary prop drilling
export const VaultHeader = ({ vaultId }: { vaultId: string }) => {
  return <Header title={vaultId} />
}
```

Only pass props to **reusable/generic components** that are used in multiple contexts and shouldn’t know about domain logic (e.g. `Button`, `Input`, `Modal`).
