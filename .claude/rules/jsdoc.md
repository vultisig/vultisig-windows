# JSDoc on Exports

Every exported function, class, and type definition gets a `/** ... */` comment immediately before its declaration.

## When editing existing files

If an export you are adding or touching lacks JSDoc, add it as part of the change — do not leave it for review to catch.

## Style

- One or two sentences on purpose and behavior, not implementation
- Call out non-obvious constraints, invariants, or side effects
- Skip `@param`/`@returns` lists that only restate the types
- Do not restate the export's name

## Example

```typescript
/**
 * Computes the navigation history the extension should open with.
 * With no vaults in storage, persisted history is ignored so the
 * user always lands on the splash.
 */
export const resolveInitialHistory = (input: ResolveInitialHistoryInput) => { ... }
```
