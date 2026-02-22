---
name: i18n-workflow
description: Internationalization workflow for React components. Use when adding user-facing text, creating translations, or working with i18n. CRITICAL - only update en.ts during development.
---

# i18n Workflow

## CRITICAL: en.ts Only

**Add translations ONLY to `core/ui/i18n/locales/en.ts`.**

Other locale files (de.ts, es.ts, it.ts, pt.ts, hr.ts, zh.ts, ru.ts, nl.ts) are auto-updated via script before PR submission. DO NOT manually edit them.

## Always Use useTranslation

Never hardcode user-facing text:

```tsx
// BAD
<Text>Lock Time</Text>

// GOOD
import { useTranslation } from 'react-i18next'

const { t } = useTranslation()
<Text>{t('lock_time')}</Text>
```

## Translation Key Naming

- Use snake_case: `vault_settings_title`
- Be descriptive: `error_network_connection_failed`
- Group related keys together in en.ts

## Styled Text

When text needs partial styling (gradient, colors, bold), use the `Trans` component. See the **trans-text-highlight** skill for patterns.

## Pluralization

Use i18next built-in pluralization:

```tsx
// BAD
{count === 1 ? t('minute') : t('minutes')}

// GOOD
{t('minute', { count })}
```

With keys in en.ts:

```typescript
minute_one: '{{count}} minute',
minute_other: '{{count}} minutes',
```
