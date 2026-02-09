---
name: trans-text-highlight
description: Use the Trans component correctly for text highlighting and styling in translations. Prefer using inline tags (e.g., <g>, <b>, <highlight>) over variable interpolation ({{variable}}) for static text that needs styling. Use when implementing or updating UI text that requires partial styling or highlights.
---

# Trans Component Text Highlighting

## Instructions

When highlighting or styling specific parts of a translated string, ALWAYS use the `Trans` component with inline tags instead of passing the highlighted text as a variable. This keeps the translation strings readable and ensures translators see the full context.

### 1. Define Translation with Tags

In `en.ts` (and other locales), wrap the text to be highlighted in a short tag like `<g>`, `<highlight>`, or `<b>`.

```ts
// ✅ Good: Inline tags for styling
onboarding_greeting: 'Say goodbye to <g>seed phrases</g>',
backupsTitle: '<highlight>Backups,</highlight> your new recovery method',

// ❌ Bad: Variable interpolation for static highlights
backupsTitle: '{{highlight}} your new recovery method',
backupsTitleHighlight: 'Backups,',
```

### 2. Implement the Component

In your `.tsx` file, provide the mapping for these tags in the `components` prop.

```tsx
// ✅ Good: Clean and contextual
<Trans
  i18nKey="onboarding_greeting"
  components={{ g: <GradientText as="span" /> }}
/>

<Trans
  i18nKey="backupsTitle"
  components={{ highlight: <GradientText as="span" /> }}
/>

// ❌ Bad: Unnecessary values prop for static text
<Trans
  i18nKey="backupsTitle"
  components={{ highlight: <GradientText as="span" /> }}
  values={{ highlight: t('backupsTitleHighlight') }}
/>
```

## Examples

### Gradient Highlight

Use `<g>` or `<highlight>` for `GradientText`.

```tsx
<Trans i18nKey="my_key" components={{ g: <GradientText as="span" /> }} />
```

### Bold Text

Use `<b>` for standard bold.

```tsx
<Trans i18nKey="my_key" components={{ b: <b /> }} />
```

### Colored Text

Use descriptive tags for specific colors.

```tsx
<Trans
  i18nKey="my_key"
  components={{
    blue: <span style={{ color: primaryAlt.toCssValue() }} />,
  }}
/>
```

## Anti-Patterns to Avoid

- **DO NOT** use `{{variable}}` if the text inside it is a static part of the sentence.
- **DO NOT** use `t('key')` inside `values` of a `Trans` component for static highlights.
- **DO NOT** use `Trans` if the entire string has the same style—use the `Text` component directly with the `t` function.
