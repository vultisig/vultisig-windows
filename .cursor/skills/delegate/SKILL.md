---
name: delegate
description: USE verbose plan format TO enable execution by a faster, less capable AI model
---

# Delegate

Create a plan that can be executed by a less capable AI model.

## Requirements

1. **Numbered steps** - Each step = one atomic action
2. **Exact file paths** - Workspace-relative (e.g., `core/ui/feature/MyComponent.tsx`)
3. **Full code snippets** - Actual code, not descriptions
4. **Find/Replace blocks** - Show exact lines to find and replace
5. **No ambiguity** - Pick one approach, provide full implementation

## Format

```
## Step 1: Create component

Create `core/ui/feature/MyComponent.tsx`:

\`\`\`tsx
export const MyComponent = () => <div>Hello</div>
\`\`\`

## Step 2: Wire up

In `core/ui/navigation/views.tsx`, find:

\`\`\`tsx
settings: () => <SettingsPage />,
\`\`\`

Replace with:

\`\`\`tsx
settings: () => <SettingsPage />,
myFeature: () => <MyComponent />,
\`\`\`
```

## Avoid

- "Add appropriate styling" - Show actual styles
- "Handle edge cases" - Show exact logic
- "Similar to X" - Provide full code
- "Update imports as needed" - Show exact imports
