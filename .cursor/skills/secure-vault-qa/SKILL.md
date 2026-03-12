---
name: secure-vault-qa
description: Autonomous end-to-end testing of secure vault flows (send, swap, DeFi) by co-signing transactions initiated from the desktop UI using the SDK. Use when testing any UI flow that requires a secure vault co-signer.
---

# Secure Vault QA — Autonomous Co-signing

Test secure vault UI flows end-to-end by driving the desktop app and co-signing with the SDK, with no manual intervention.

## Prerequisites

1. Desktop dev server running (`yarn dev:desktop`)
2. `.cursor/test-config.local` populated with vault names, passwords, share paths, and chain addresses

Read `.cursor/test-config.local` at the start of every run to get all paths and values.

## Workflow

### 1. Prepare the Browser

```
browser_lock
browser_resize  →  width: 960, height: 1400
```

The oversized viewport prevents the Continue button from falling outside the clickable area (its bounding box is ~y:1188 at default height).

### 2. Navigate the Send Form

1. Select the secure vault (name from `secure_vault_name`).
2. Open the target chain, click **Send** on the token.
3. Fill the recipient address — use the fast vault address for the same chain (e.g. `fast_vault_thorchain` for THORChain RUNE).
4. Set the amount by clicking a **percentage button** (25 %, 50 %, etc.).
   - Never type a decimal number — `<input type="number">` validates against the browser locale and blocks form submission when the separator doesn't match.
5. Click **Continue**.

### 3. Approve the Verify Step

The verify screen has two checkboxes with custom overlays that intercept direct clicks.

- Do NOT click the `checkbox` refs. Click the **text label** refs instead (the accessibility-tree entries whose `name` matches the checkbox label text).
- After both checkboxes are checked, click **Sign Transaction**.

### 4. Extract the QR URL

`FramedQrCode` logs the URL to the browser console in dev mode:

```
[QR_CODE_VALUE]:https://vultisig.com?type=SignTransaction&...
```

Read `browser_console_messages`, search for `QR_CODE_VALUE`, and capture the URL.

### 5. Run the Co-signer

`VAULT_SHARE_PATH` and `VAULT_PASSWORD` are set in `.envrc` (loaded automatically by direnv). Only the QR URL is needed per run:

```bash
COSIGN_QR_URL="<url from step 4>" yarn cosign
```

The co-signer (`core/mpc/keysign/cosigner.ts`) is fully self-contained — no SDK dependency. It:

1. Decrypts the vault share using `@core` / `@lib` utilities.
2. Parses the QR URL → `KeysignMessage` protobuf (regex extraction, NOT `URLSearchParams`).
3. Resolves the `KeysignPayload` (inline or fetched from relay).
4. Extracts message hashes via WalletCore (`getEncodedSigningInputs` + `getPreSigningHashes`).
5. Joins the relay session and waits for the desktop to start it.
6. Runs MPC keysign for each hash.

Expect ~8–15 s for the co-signer to complete.

### 6. Verify the Result

After co-signing, the desktop broadcasts the transaction. The DOM will show:

- "Transaction successful"
- Sent amount and USD value
- Transaction hash

Take a screenshot or read the DOM snapshot as proof.

## Gotchas

| Issue | Cause | Fix |
|-------|-------|-----|
| `+` corrupted in base64 | `URLSearchParams.get()` treats `+` as space | Use regex `/[?&]jsonData=([^&]+)/` |
| Form submission blocked | Locale decimal separator vs typed dot | Use percentage buttons, never type decimals |
| Checkbox click intercepted | Custom `<div>` overlay on checkbox input | Click the text-label ref, not the checkbox ref |
| Screenshot timeout | Wails WebView during heavy rendering | Wait and retry, or use DOM snapshot as evidence |
| Session expired | Relay sessions time out after ~2 min | Run the co-signer promptly after QR appears |
| Continue button off-screen | Default viewport too short | Resize to 960×1400 before starting |
