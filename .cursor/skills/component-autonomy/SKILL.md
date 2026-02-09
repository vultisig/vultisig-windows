---
name: component-autonomy
description: USE hooks directly in domain-specific components TO avoid unnecessary prop drilling
---

# Component Autonomy

Domain-specific components should access state directly using hooks. Only pass props to generic/reusable components.

## Pattern

```tsx
// ✅ Domain-specific component uses hook directly
export const VaultHeader = () => {
  const [vaultId] = useVaultId()
  return <Header title={vaultId} />
}

// ❌ Unnecessary prop drilling
export const VaultHeader = ({ vaultId }: { vaultId: string }) => {
  return <Header title={vaultId} />
}
```

## When to Pass Props

- Generic UI components (Button, Input, Modal)
- Reusable components used in multiple contexts
- Configuration that varies between instances

## Refactoring Checklist

1. Is this component domain-specific (used in one context)?
2. Can it access the state via an existing hook?
3. If yes to both → use hook directly, remove props
