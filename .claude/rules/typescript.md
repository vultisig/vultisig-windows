---
paths:
  - "**/*.ts"
  - "**/*.tsx"
---

# TypeScript Rules

## type over interface
- Use `type` for all object type definitions (enforced by ESLint)
- Only use `interface` for contracts implemented by classes

## No type assertions (`as`)
- Prefer type-safe designs and narrowing
- Use `as` only as last resort at routing boundaries with validation

## Trust types — no unnecessary fallbacks
- When a type is non-optional, use it directly
- Use `shouldBePresent()` and `assertField()` for required runtime values
- No optional chaining on guaranteed-present values

## Derive union types from const arrays
```typescript
const chains = ['evm', 'solana', 'cosmos'] as const
type Chain = (typeof chains)[number]
```
