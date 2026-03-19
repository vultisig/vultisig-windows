# Trust TypeScript – No Fallbacks for Defined Values

When a value's type is non-optional, use it directly. Do not add optional chaining or fallback values.

## Do

```typescript
const { requestOrigin } = usePopupContext()
useIt(requestOrigin)
```

## Don't

```typescript
const ctx = usePopupContext()
useIt(ctx?.requestOrigin || '')
```

## Notes

- If a value may be missing, validate earlier and fail fast (e.g., assertions in @rules).
- Do not silence type guarantees with `?.`, `||`, or `??` when the type is non-optional.
