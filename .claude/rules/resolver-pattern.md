---
paths:
  - "core/chain/**"
  - "core/mpc/**"
  - "core/ui/**"
---

# Resolver Pattern

Used for all chain-specific logic. **Never** switch on chain type directly.

## Structure
```
feature/
├── index.ts      — Router that delegates based on chain discriminant
├── resolver.ts   — Type definition for the resolver interface
└── resolvers/
    ├── evm.ts
    ├── solana.ts
    ├── cosmos.ts
    ├── utxo.ts
    └── ...
```

## How it works
1. Define a resolver type with the feature's operations
2. Create a `Record<ChainType, Resolver>` mapping
3. Route via discriminant field — the index.ts reads the chain type and delegates

## Adding a new chain
1. Create `resolvers/{chain}.ts` implementing the resolver type
2. Add to the resolver record in `index.ts`
3. No switch statements needed — the record handles routing

## Rules
- Each resolver file handles one chain family
- Resolver interface is the single source of truth for operations
- Common logic shared via utility functions, not base classes
