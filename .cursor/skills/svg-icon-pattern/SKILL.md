---
name: svg-icon-pattern
description: Standards for creating and using SVG icons. Use SvgProps from @lib/ui/props and spread them on the svg element. Size icons via fontSize in the style prop at the usage site.
---

# SVG Icon Pattern

## Instructions

When creating or updating icons in the `lib/ui/icons` directory, follow these standards to ensure consistency and flexibility.

### 1. Icon Component Definition

Export a named component that receives `SvgProps` from `@lib/ui/props`. Spread these props onto the `svg` element.

```tsx
// ✅ Good: SvgProps pattern
import { SvgProps } from '@lib/ui/props'

export const MyIcon = (props: SvgProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="..." />
  </svg>
)

// ❌ Bad: IconWrapper inside icon definition
export const MyIcon = (props: any) => (
  <IconWrapper {...props}>
    <svg>...</svg>
  </IconWrapper>
)
```

### 2. Sizing and Dimensions

- Calculate dimensions based on the `viewBox` attribute.
- The largest dimension (width or height) should always be `1em`.
- The smaller dimension should be calculated proportionally: `(smaller / larger)em`.
- Neither width nor height should exceed `1em`.

```tsx
// Example for non-square icon (viewBox="0 0 22 20")
// height = 20/22 = 0.909
<svg width="1em" height="0.909em" viewBox="0 0 22 20" ...>
```

### 3. Styling and Colors

- Use `fill="currentColor"` or `stroke="currentColor"` to allow the icon to inherit colors from its parent.
- For multi-colored icons, use specific colors only where necessary.

### 4. Usage and Sizing

Size icons at the usage site using the `fontSize` property within the `style` prop. This leverages the `1em` base size defined in the icon component.

```tsx
// ✅ Good: Direct sizing via style
<MyIcon style={{ fontSize: 24 }} />

// ❌ Bad: Using size prop (requires IconWrapper)
<MyIcon size={24} />
```

## Anti-Patterns to Avoid

- **DO NOT** wrap icons with `IconWrapper` inside the icon component file.
- **DO NOT** use hardcoded pixel values for `width` and `height` in the `svg` element.
- **DO NOT** use `IconWrapper` at the usage site if simple `fontSize` styling is sufficient.
