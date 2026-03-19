# Prefer `attempt` for Value-Producing Error Handling

## Use This For

- The codebase provides a utility function `attempt.ts` from `@lib/utils/attempt`
- It converts thrown errors into `Result`-style values using `'data' in result` and `'error' in result`
- Use it when failure should become a value such as `null`, `undefined`, a default, or a fallback branch

## Prefer

- `attempt(() => ...)` or `await attempt(() => ...)` for parsing, decoding, storage, and request fallbacks
- `'data' in result` or `'error' in result` for type-safe branching
- `withFallback(...)` when the desired behavior is "return this default on failure"

## Examples

Good: Converting failure into user-facing fallback logic
```typescript
import { attempt } from '@lib/utils/attempt'

const result = await attempt(async () => {
  return await saveUserData(data)
})

if ('data' in result) {
  showSuccessMessage('Data saved successfully')
} else {
  showErrorToUser(`Failed to save: ${result.error.message}`)
}
```

Good: Using attempt for alternative logic
```typescript
const result = await attempt(() => fetchFromPrimaryAPI())
const data = 'data' in result
  ? result.data
  : await fetchFromBackupAPI()
```

Good: Using withFallback for default values
```typescript
const userPreferences = withFallback(
  attempt(() => parseStoredPreferences()),
  DEFAULT_PREFERENCES
)
```

Good: Narrow local fallback logic can stay try/catch
```typescript
try {
  return fromDatBackupString(value)
} catch {
  return null
}
```

Good: try/finally for cleanup
```typescript
try {
  return runSession()
} finally {
  closeSession()
}
```

Good: callback isolation boundary
```typescript
try {
  listener(event)
} catch {
  // one listener should not break the emitter
}
```

## Do Not Use `attempt` For

- Analytics, logging, or telemetry calls
- Operations where the error should simply propagate
- Wrappers that only log and continue
- Cases where no fallback value or alternate branch is needed

## `try/catch` Is Still Fine For

- `try/finally` cleanup
- Narrow local fallback or probe logic when it is clearer than `attempt`
- Event and callback isolation boundaries
- Retry loops or continue-on-failure control flow
