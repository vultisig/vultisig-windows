# Conditional Matching

## Use this when

- Branching on string-literal unions, discriminated unions, or record unions
- Rendering one of several React branches from a finite state or value

## Prefer project utilities

- Use `match()` for simple literal unions
- Use Match component for conditional React component rendering
- Use `matchRecordUnion()` for record union values
- Use `matchDiscriminatedUnion()` for discriminated unions with explicit keys

## Why this exists

These are established project utilities. Using them keeps branching consistent and usually improves exhaustiveness and discoverability.

## Do not over-apply

- `switch` is allowed when it is the clearest fit, especially for numeric discriminators, config/build code, or imperative branching where the match helpers do not improve correctness
- Do not rewrite existing straightforward code just to avoid `switch`

## Examples

```typescript
const sound = match(animal, {
  dog: () => 'woof',
  cat: () => 'meow'
})
```

Using Match component in React:
```typescript
<Match
  value={status}
  loading={() => <LoadingSpinner />}
  error={() => <ErrorMessage />}
  success={() => <Content />}
/>
```

```typescript
matchRecordUnion(shape, {
  circle: (radius) => Math.PI * radius * radius,
  rectangle: ({width, height}) => width * height
})
```

Using matchDiscriminatedUnion:
```typescript
matchDiscriminatedUnion(
  action,
  'kind',
  'payload',
  {
    increment: (amount) => count + amount,
    decrement: (amount) => count - amount
  }
)
```
