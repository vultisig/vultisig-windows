---
description: Internationalization workflow for React components. Use when adding user-facing text, creating translations, styling partial text with Trans, or working with i18n. CRITICAL - only update en.ts during development.
---

# i18n Workflow

## CRITICAL: en.ts Only

**Add translations ONLY to `core/ui/i18n/locales/en.ts`.**

Other locale files (de.ts, es.ts, it.ts, pt.ts, hr.ts, zh.ts, ru.ts, nl.ts) are auto-translated via Google Translate as part of `yarn check`. No manual editing or extra steps needed — just add keys to en.ts.

## Auto-Translation (part of `yarn check`)

Running `yarn check` automatically syncs missing translations to all locale files using Google Translate. This step is **optional and non-blocking** — if credentials are missing or the API fails, the check command still completes successfully.

Requirements (for translation to run):
- `GOOGLE_TRANSLATE_PROJECT_ID` env var set
- `GOOGLE_APPLICATION_CREDENTIALS` env var pointing to a valid credentials file
- These are typically configured via `.envrc` with direnv

If the environment is not configured, the step is silently skipped.

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

## Styled Text (Trans Component)

When text needs partial styling (gradient, colors, bold), use the `Trans` component with inline tags. These tags are preserved during auto-translation (sent as `text/html` to Google Translate).

Wrap styled text in short tags like `<g>`, `<highlight>`, `<b>` in the translation string, then map them via the `components` prop:

```ts
// en.ts
onboarding_greeting: 'Say goodbye to <g>seed phrases</g>',
```

```tsx
<Trans
  i18nKey="onboarding_greeting"
  components={{ g: <GradientText as="span" /> }}
/>
```

Common mappings:
- `<g>` / `<highlight>` → `<GradientText as="span" />`
- `<b>` → `<b />`
- `<blue>` → `<span style={{ color: primaryAlt.toCssValue() }} />`

**Do not** use `{{variable}}` interpolation for static text that just needs styling. Keep the full sentence in one translation key so translators see the context. Reserve `values` for genuinely dynamic data (counts, names, amounts).

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
