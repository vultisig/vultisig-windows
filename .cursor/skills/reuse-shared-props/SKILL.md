---
name: reuse-shared-props
description: USE shared prop types from @lib/ui/props WHEN defining component props TO avoid duplication
---

# Reuse Shared Props

When defining component props, import and reuse shared prop types from `@lib/ui/props` instead of defining custom types for common patterns.

## Available Props

| Prop Type | Fields | Use Case |
|-----------|--------|----------|
| `InputProps<T>` | `value: T`, `onChange: (value: T) => void` | Controlled input components |
| `ValueProp<T>` | `value: T` | Read-only value display |
| `OnClickProp` | `onClick: () => void` | Clickable elements |
| `OnFinishProp<T>` | `onFinish: (value: T) => void` | Flow completion callbacks |
| `OnBackProp` | `onBack: () => void` | Navigation back |
| `OnCloseProp` | `onClose: () => void` | Modal/dialog close |
| `TitleProp` | `title: ReactNode` | Title display |
| `LabelProp` | `label: ReactNode` | Label display |
| `ChildrenProp` | `children: ReactNode` | Container components |
| `IconProp` | `icon: ReactNode` | Icon display |
| `IsDisabledProp` | `isDisabled?: boolean \| string` | Disabled state |

## Pattern

```tsx
// ✅ Good - reuse shared props, compose with & for additional fields
import { InputProps } from '@lib/ui/props'

type MyFieldProps = InputProps<string> & {
  error?: string
  placeholder?: string
}

export const MyField = ({ value, onChange, error, placeholder }: MyFieldProps) => {
  return (
    <TextInput
      value={value}
      onValueChange={onChange}
      placeholder={placeholder}
    />
  )
}

// ❌ Bad - defining custom props that duplicate shared types
type MyFieldProps = {
  value: string
  onValueChange: (value: string) => void  // duplicates InputProps
  error?: string
}
```

## Composing Multiple Props

```tsx
import { InputProps, LabelProp, IsDisabledProp } from '@lib/ui/props'

type LabeledInputProps = InputProps<number> & LabelProp & IsDisabledProp & {
  min?: number
  max?: number
}
```

## Note on onChange vs onValueChange

`InputProps` uses `onChange`, but some underlying components (like `TextInput`) use `onValueChange`. Map accordingly:

```tsx
<TextInput
  value={value}
  onValueChange={onChange}  // InputProps.onChange -> TextInput.onValueChange
/>
```
