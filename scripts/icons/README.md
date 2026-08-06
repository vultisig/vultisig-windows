# Icons V3 codegen

Tooling for the [Icons V3 adoption](../../docs/icons-v3/PLAN.md) (issue #4383). Pulls icons
from the Figma "Icons V3" library and writes them as React components that follow this
repo's icon contract, so a generated file is a drop-in body swap for the legacy icon.

## Files

| File | Purpose |
|------|---------|
| `generate-icons.mjs` | The codegen. Fetches SVG from Figma → repo-contract React component. |
| `figma-icons.config.json` | Non-secret Figma coordinates (file key + section node id). |
| `icon-mapping.json` | Source-of-truth mapping: desktop icon → V3 source icon. **Seed, intentionally incomplete.** |

## Token

The Figma API token is **never** committed. Pass it via the environment:

```bash
export FIGMA_TOKEN=figd_xxx   # a Figma personal access token with File content: Read
```

Revoke and rotate the token if it is ever pasted into a chat, PR, or log.

## Commands

```bash
# List every icon name available in the V3 section (use these in icon-mapping.json "v3" fields)
FIGMA_TOKEN=figd_xxx node scripts/icons/generate-icons.mjs --list

# Preview one icon without writing (prints the generated component)
FIGMA_TOKEN=figd_xxx node scripts/icons/generate-icons.mjs --icon WalletIcon --dry-run

# Generate one icon
FIGMA_TOKEN=figd_xxx node scripts/icons/generate-icons.mjs --icon WalletIcon

# Generate every mapped, non-bespoke icon
FIGMA_TOKEN=figd_xxx node scripts/icons/generate-icons.mjs --all

# Figma-free: generate from the sibling iOS repo's already-shipped V3 assets
# (vultisig-ios#4834). No token, no rate limits — the `v3` names match the iOS
# asset folder names. Preferred when the icon exists in iOS.
node scripts/icons/generate-icons.mjs --all \
  --from-ios ../vultisig-ios/VultisigApp/VultisigApp/Assets.xcassets/Icons
```

Notes:

- The ~9MB Figma section response is **cached** to the OS temp dir after the first fetch;
  pass `--refresh` to re-fetch. `--from-ios` skips Figma entirely.
- `--all` skips icons already `migrated` or `bespoke`; use `--icon <Name>` to force one.

After generating, always:

1. `yarn eslint lib/ui/icons/<Name>.tsx --fix` — sort/format to house style.
2. Eyeball the result in the Storybook gallery (`Foundation/Icons`) — a name match is not a
   glyph match.
3. `yarn check` before opening the PR.

## Adding to the mapping

Each entry:

```json
{ "desktop": "WalletIcon", "v3": "wallet-filled", "status": "proposed", "source": "station" }
```

- `desktop` — the component file in `lib/ui/icons/` (without `.tsx`).
- `v3` — the icon name from `--list` (`null` for bespoke glyphs with no V3 counterpart).
- `status` — `verified` (checked against rendered art), `proposed` (needs eyeballing), or `bespoke`.
- `source` — `station`, `ios`, or `manual` (where the decision came from).

Chevrons stay on the legacy pack by design — do not add them.
