# Translation Quality Workflow

`en.ts` is the only hand-authored source locale. Generated locale files should be updated through:

```bash
yarn translate
yarn i18n:review-quality
yarn check
```

`yarn translate` retranslates missing strings, structurally invalid strings, and English strings changed since `HEAD`. To compare a committed branch against main, run:

```bash
yarn i18n:review-quality --base origin/main
```

The review command prints a checklist for changed generated locale entries. Safety-critical copy about backups, passwords, recovery, signing, claims, and funds must be checked for meaning drift, especially polarity such as `cannot`, `not`, `never`, and `irreversible`.

`yarn check` runs `yarn i18n:review-quality --strict`, which fails if English changed while a target locale stayed stale, or if a preserved glossary term disappears from a changed translation. It still prints safety-critical review notes as a human checklist; passing the command does not replace review for critical wallet copy.

`yarn check` also runs `yarn workspace @core/ui i18n:check`, the authoritative structural maintenance gate. That workspace command runs:

```bash
yarn workspace @core/ui i18n:check-unused
yarn workspace @core/ui i18n:check-integrity
```

`i18n:check-unused` must be green in normal development. It resolves `t(...)`, local `translate(...)` helpers, and `<Trans i18nKey=...>` with TypeScript literal and union types. When a key is intentionally dynamic, keep the expression typed as a literal union or template-literal union so the checker can prove the possible keys. Avoid broad `string` translation keys unless the call is a fallback with `defaultValue`.

To remove proven-unused source strings, run:

```bash
yarn workspace @core/ui i18n:fix
```

That command removes the unused keys from every locale so `i18n:check-integrity` stays green without requiring a Google Translate run.

Duplicate English values are advisory, not a gate, because repeated short labels and shared setup copy can be intentional. Use this cleanup report when consolidating copy:

```bash
yarn i18n:find-duplicates
```

Domain terms live in `utils/i18nGlossary.ts`. Product names, chain names, tickers, and Web3 acronyms marked `preserve: true` are protected before machine translation and restored afterward. Review-only terms such as `backup`, `password`, `recovery`, `claim`, and `contract` may be localized, but reviewers must verify the translated wording keeps the wallet/security meaning.
