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

Domain terms live in `utils/i18nGlossary.ts`. Product names, chain names, tickers, and Web3 acronyms marked `preserve: true` are protected before machine translation and restored afterward. Review-only terms such as `backup`, `password`, `recovery`, `claim`, and `contract` may be localized, but reviewers must verify the translated wording keeps the wallet/security meaning.
