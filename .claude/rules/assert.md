# TypeScript Assertion Standards

## Use This For

- Values that are required by app logic and should fail fast if missing
- Internal state, config, derived data, and code paths where `null` or `undefined` means a bug
- Record or object fields that must exist at this point in the flow

## Preferred Helpers

- Use `shouldBePresent(value, name?)` for required values
- Use `assertField(obj, key)` when asserting a required field on an object or record

## Why

- This repo prefers explicit failure over silent fallbacks for required data
- Shared assertion helpers make these failures consistent and easy to recognize

## Guidance

- Prefer `shouldBePresent()` over `||`, `??`, or optional chaining when a missing value would indicate invalid state
- Use `assertField()` when you specifically need to assert that an object field is present
- Do not use assertions for truly optional values or untrusted external data unless the code has already validated that data

## Examples

Asserting required configuration:
```typescript
const config = {
  apiKey: shouldBePresent(process.env.API_KEY, 'API_KEY'),
  baseUrl: shouldBePresent(process.env.BASE_URL, 'BASE_URL'),
}
```

Using fallbacks for required data (bad):
```typescript
const config = {
  apiKey: process.env.API_KEY || '',
  baseUrl: process.env.BASE_URL ?? 'http://localhost',
}
```

Asserting required values:
```typescript
const getUserName = (user: User) => {
  const profile = shouldBePresent(user.profile, 'user.profile')
  return shouldBePresent(profile.name, 'user.profile.name')
}
```

Silently accepting missing required data (bad):
```typescript
const getUserName = (user: User) => {
  return user?.profile?.name || 'Anonymous'
}
```

Asserting a required object field:
```typescript
const getBalance = (account: Account) => {
  return assertField(account, 'balance')
}
```
