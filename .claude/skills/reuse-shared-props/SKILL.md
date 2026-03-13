---
description: USE shared prop types from @lib/ui/props WHEN defining component props TO avoid duplication
---

# Reuse Shared Props

When defining component props, import and compose shared prop types from `@lib/ui/props` using `&` instead of defining inline equivalents.

## Available Props

| Prop Type | Fields |
|-----------|--------|
| `InputProps<T>` | `value: T`, `onChange: (value: T) => void` |
| `ValueProp<T>` | `value: T` |
| `OptionsProp<T>` | `options: readonly T[]` |
| `OnClickProp` | `onClick: () => void` |
| `OnFinishProp<T?, Mode?>` | `onFinish: (value: T) => void` (supports `'optional'` mode) |
| `OnSuccessProp<T?, Mode?>` | `onSuccess: (value: T) => void` (supports `'optional'` mode) |
| `OnBackProp` | `onBack: () => void` |
| `OnCloseProp` | `onClose: () => void` |
| `OnRemoveProp` | `onRemove: () => void` |
| `TitleProp` | `title: ReactNode` |
| `DescriptionProp` | `description: ReactNode` |
| `LabelProp` | `label: ReactNode` |
| `MessageProp` | `message: ReactNode` |
| `ChildrenProp` | `children: ReactNode` |
| `IconProp` | `icon: ReactNode` |
| `ActionProp` | `action: ReactNode` |
| `IsDisabledProp` | `isDisabled?: boolean \| string` |
| `IsActiveProp` | `isActive?: boolean` |
| `StatusProp<T>` | `status: T` |
| `KindProp<T>` | `kind: T` |
| `UiProps` | `style?: CSSProperties`, `className?: string` |
| `AsProp<T>` | `as?: T` (polymorphic element type) |
| `RenderProp<T?>` | `render: (value: T) => ReactNode` |
| `SvgProps` | `SVGProps<SVGSVGElement>` (see svg-icon-pattern skill) |

## onChange vs onValueChange

`InputProps` uses `onChange`, but `TextInput` uses `onValueChange`. Map accordingly:

```tsx
<TextInput value={value} onValueChange={onChange} />
```
