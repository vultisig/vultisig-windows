---
name: storybook-component
description: End-to-end workflow for UI component development with Storybook. Use when building or refining UI components, implementing Figma designs, extracting stateless components for stories, writing Storybook stories, or verifying visual accuracy in the browser.
---

# Storybook Component Workflow

Full workflow for Figma-to-Storybook UI development: design inspection, stateless extraction, story writing, browser verification, and design diff resolution.

## Dev Server Reference

Check the terminals folder before starting any server -- reuse existing sessions.

| Context | Port | Start Command |
|---------|------|---------------|
| `lib/ui` Storybook | 6006 | `yarn workspace @lib/ui storybook` |
| `core/ui` Storybook | 6007 | `yarn workspace @core/ui storybook` |

Never start a server if one is already running. Reuse existing browser tabs.

## Storybook Location Decision

| Component depends on | Story goes in |
|----------------------|---------------|
| Only `@lib/ui` + `@lib/utils` | `lib/ui/` (next to the component) |
| `@core/ui`, `@core/config`, `@core/chain`, or other `@core/*` | `core/ui/` (next to the component) |

Both packages have Storybook fully configured. Use the existing setup.

## Storybook Setup Reference

Both `lib/ui` and `core/ui` already have complete Storybook configurations. If a **new** package needs Storybook, follow the `core/ui/.storybook/` pattern:

- **`main.ts`** -- Vite framework via `@storybook/react-vite`, `staticDirs` for fonts/images from `core/ui/public`.
- **`preview.tsx`** -- `styled-components` `ThemeProvider` with `darkTheme`, `GlobalStyle` for global styles. For `core/ui`, also wrap with `I18nextProvider` for translations.
- **`package.json`** -- Add `storybook` and `build-storybook` scripts. Add `@storybook/addon-docs`, `@storybook/react-vite`, `storybook` as devDependencies.
- **`knip.json`** -- Ensure `**/*.{ts,tsx}` in the package's project globs covers `.stories.tsx` files (already the case).
- **`eslint.config.mjs`** -- `eslint-plugin-storybook` is already configured globally with `storybook.configs['flat/recommended']`.

## Styling

This codebase uses **styled-components** (not Tailwind). All components use:

- `styled-components` for component styling
- `darkTheme` from `@lib/ui/theme/darkTheme` for theming
- `GlobalStyle` from `@lib/ui/css/GlobalStyle` for global styles
- `getColor()` helper for theme-aware colors
- Layout primitives: `HStack`, `VStack` from `@lib/ui/layout/Stack`

## Stateless Extraction Pattern

To make a component Storybook-friendly, extract a stateless version:

1. **Create `form.tsx`** (or `content.tsx`) -- a pure component with props for all external data:
   ```
   value, onChange, onSubmit
   ```
   No hooks for persistent state, no route params, no auth context.

2. **Refactor the parent** -- becomes a thin wrapper:
   ```tsx
   <Modal title="...">
     <StatelessForm value={...} onChange={...} onSubmit={...} />
   </Modal>
   ```

3. **Do not export** the stateless component from the package index unless it has external consumers. Stories import directly from the file.

## Story Structure

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite'

import { MyComponent } from '.'

const meta: Meta<typeof MyComponent> = {
  title: 'Category/ComponentName',
  component: MyComponent,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
}
export default meta

type Story = StoryObj<typeof MyComponent>

export const Default: Story = {
  args: {
    // default props
  },
}
```

### Interactive stories with local state

When a story needs local state (e.g., modals that open/close), use a render function:

```tsx
import { Button } from '@lib/ui/buttons/Button'
import { Modal } from '@lib/ui/modal'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

// Use untyped Meta when render functions use wrapper components
const meta = {
  title: 'Category/ComponentName',
} satisfies Meta

export default meta
type Story = StoryObj

function Interactive({ initial }: { initial?: ValueType }) {
  const [value, setValue] = useState<ValueType | undefined>(initial)
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button kind="primary" onClick={() => setOpen(true)}>
        Open
      </Button>
      {open && (
        <Modal title="..." onClose={() => setOpen(false)}>
          <StatelessForm value={value} onChange={setValue} onSubmit={() => {}} />
        </Modal>
      )}
    </>
  )
}

export const NoneSelected: Story = {
  render: () => <Interactive />,
}
export const OptionASelected: Story = {
  render: () => <Interactive initial="optionA" />,
}
```

**Key rules:**
- Import types from `@storybook/react-vite` (not `@storybook/react`).
- Use untyped `Meta` / `StoryObj` (no generic) when stories use wrapper render functions -- avoids Storybook 10's required `args` type error.
- For modal components, wrap in `<Modal>` so the content is visible.
- Cover all meaningful states as separate story exports.

## Browser Verification

After starting Storybook:

1. **Navigate** to the story URL in the browser tool.
2. **Test at three viewports:**
   - Desktop (1280px+) -- full layout with all panes
   - Tablet (~800px) -- breakpoint transitions, check pane visibility
   - Mobile (~375px) -- collapsed layout, check padding
3. **Compare against Figma** -- use `get_screenshot` on the same Figma node for side-by-side reference.

If blocked from browser access, state: **"Browser check not performed -- {reason}"**

### Browser Tool Notes

- The Cursor browser tab shares editor space -- the effective viewport is smaller than the set dimensions.
- **Use Storybook's viewport addon** (the toolbar dropdown) to simulate responsive sizes rather than resizing the browser window. The Storybook iframe does not respond to outer browser resizing.
- For full-viewport screenshots, navigate directly to the iframe URL: `http://localhost:{port}/iframe.html?id={story-id}&viewMode=story`. This bypasses Storybook's sidebar/toolbar and gives the full viewport to the component.
- Always verify decorative elements and z-index at mobile viewport using Storybook's viewport control before reporting completion.

### Debugging: Iframe Access

Storybook renders stories inside an **iframe**. Browser snapshots show the shell UI (sidebar, toolbar), not the story content.

**Option 1: Direct iframe URL** (preferred)

Navigate to: `http://localhost:{port}/iframe.html?globals=&id={story-id}&viewMode=story`

Story ID format: lowercase with hyphens, e.g., `screens-backupoverviewscreen--four-devices` (title segments joined by `-`, variant after `--`).

**Option 2: Isolation mode**

In Storybook UI, click **Share** > **Open in isolation mode**, then take a snapshot of the new tab.

**Option 3: Ask user**

If browser tools fail, ask the user to inspect in DevTools and share:
- DOM path
- Element dimensions
- Computed styles (especially overflow)

## Figma Design Comparison Checklist

When implementing or verifying a Figma design:

1. **Styled components** -- Match every element against the project's `styled-components` patterns. Use `getColor()` for theme colors, not raw hex values.
2. **Colors** -- Use theme tokens from `darkTheme` (e.g., `getColor('primary')`, `getColor('text')`). Cross-reference Figma's color variables with the theme scale.
3. **Font weights** -- Figma "Regular" = `weight="400"`, "Medium" = `weight="500"`, "SemiBold" = `weight="600"`. Use the `Text` component's `weight` prop.
4. **Spacing** -- Check padding and gaps against the Figma layout. Use layout primitives (`HStack`, `VStack` with `gap` prop).
5. **Interactive states** -- Verify selected, disabled, hover, and focus states match the design.
6. **Responsive behavior** -- Check where panes hide/show, how padding changes, and whether the layout scales correctly at each breakpoint.
