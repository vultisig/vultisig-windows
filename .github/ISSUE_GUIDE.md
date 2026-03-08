# Issue Writing Guide

_How to fill the Vultisig issue template so agents AND humans produce great results._

---

## Quick Start

1. Pick a template (Bug Report or Feature Request)
2. Fill all sections with specific details
3. Include OS/version info for bugs
4. Submit

**Time to fill:** 5-10 minutes for a well-scoped issue. If it takes longer, your scope is too big — split it.

---

## Size Guide

| Size | Files Changed | Lines of Code | Example |
|------|--------------|---------------|---------|
| **tiny** | 1 file | <50 lines | Fix a typo, update a constant |
| **small** | 1-3 files | 50-200 lines | Add a function, fix a bug |
| **medium** | 3-8 files | 200-500 lines | New feature with tests |
| **large** | 8+ files | 500+ lines | **SPLIT THIS.** |

---

## Key Rules for This Repo

- **DO NOT** edit `lib/` — those are upstream mirrors
- **DO NOT** modify `core/mpc/` or `tss/` without explicit review approval
- Use resolver pattern for chain-specific logic (never switch on chain type)
- Only edit `en.ts` for translations, run `yarn translate` to propagate
- Use `yarn check:all` as the verify command (covers lint + typecheck + test + knip)

---

## Pre-Submit Checklist

- [ ] Title starts with a verb
- [ ] Size is tiny/small/medium (never large)
- [ ] Affected area identified (desktop, extension, core, chain)
- [ ] Steps to reproduce included (for bugs)
- [ ] OS and app version included (for bugs)
