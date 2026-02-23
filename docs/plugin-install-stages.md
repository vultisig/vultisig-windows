# Plugin Install: 6-Stage Reshare Flow

## Overview

Plugin installation adds a 4th keyshare holder (the plugin worker) to an existing 2-of-3 DKLS vault via a **2-of-4 threshold reshare**. All coordination happens through the relay server.

## The 4 Parties

| Party | ID Pattern | Who |
|-------|-----------|------|
| **Wallet** (extension or desktop) | first non-server signer | Initiator — runs the MPC client-side |
| **Fast Vault Server** | `Server-{digits}` | `api.vultisig.com` — existing vault server party. Go: deterministic 5-digit hash of sessionID. TS: random 4-digit (1000-9999). |
| **Verifier** | `verifier-{sessionId[:8]}` | `verifier.vultisig.com` — validates auth, coordinates plugin |
| **Plugin Worker** | `{name}-{name}-{hex4}-{number}` | e.g. `plugin-dca-swap-abc1-2048` — the new keyshare holder |

---

## Marketplace vs Extension Responsibilities

In the extension flow, responsibilities are split across two actors:

| Step | Marketplace (web app) | Extension (popup) |
|------|----------------------|-------------------|
| Generate sessionID + encryptionKey | YES | |
| Seed relay with wallet party | YES | |
| Collect password | | YES |
| Call fast vault `/vault/reshare` (reshare_type:1) | | YES |
| Call store API `/vault/reshare` (with pluginId) → triggers verifier + plugin | YES | |
| Poll relay for all 4 peers | | YES |
| Start MPC session on relay | | YES |
| Run DKLS + Schnorr reshare | | YES |
| Signal completion to relay | | YES |
| Verify via `/vault/exist` | YES | |

**Desktop orchestrator** does ALL of the above. It calls the verifier directly (with `plugin_id` + auth token) instead of going through the marketplace's store API.

---

## Stage 1 — Session Init

Generate session credentials and register on relay.

```
1. sessionID = UUID v4
2. encryptionKeyHex = 32 random bytes → hex
3. POST https://api.vultisig.com/router/{sessionID}  body: [localPartyID]
```

**Go:** `agent/tools/plugin_install.go:181-201` — generates both credentials, registers on relay
**TS:** marketplace's `startReshareSession()` (`extension.ts:119-127`) generates both credentials, seeds relay. Extension does NOT generate — receives `dAppSessionId` + `encryptionKeyHex` from marketplace via `reshare_sign` message, passed through `ExternalSessionIdProvider` / `ExternalEncryptionKeyProvider` (`ReshareVaultFlowProviders.tsx:33-60`).

**Relay URL:** All three implementations resolve to the same endpoint (`https://api.vultisig.com/router/{sessionID}`). Go's `DefaultRelayURL` already includes `/router` (`shared/config.go:10`).

**Pre-validation:** Desktop agent validates DKLS lib type, server party presence, local party in signers, and pre-checks installation status. Marketplace only checks `isFastVault` + basic data presence. Extension defers validation to later stages.

---

## Stage 2 — Recruit Fast Vault Server

Tell the fast vault server to join the reshare as a participant.

```
POST https://api.vultisig.com/vault/reshare

{
  name, public_key, session_id, hex_encryption_key,
  hex_chain_code,
  local_party_id: "Server-{digits}",
  old_parties: [existing signers],
  old_reshare_prefix,
  encryption_password,
  email: "",            ← Go sends empty string, TS omits entirely
  reshare_type: 1,      ← plugin install
  lib_type: 1           ← DKLS
}
```

Both Go and TS endpoints resolve to the same URL. Both are effectively **fire-and-forget**: Go checks the response but only logs a warning on failure and continues to polling; TS uses `responseType: 'none'` (`reshareWithServer.ts:23`) and ignores the response entirely.

**`local_party_id` generation differs:** Go uses a deterministic Java-style hash of the sessionID → `Server-{last 5 digits}` (`plugin_install.go:490-502`). TS uses `Server-` + random 4-digit number (`localPartyId.ts:8-14`). Both produce valid `Server-XXXX` IDs — the exact value is only used as the relay party name.

Fast vault server joins the relay. Poll relay until 2 parties visible (wallet + server).

**Polling differs:** Desktop polls every 1s with 5min timeout (`plugin_install.go:325-365`). Marketplace polls every 200ms with ~20s timeout (`extension.ts:148-176`). Extension has NO separate "wait for 2" step — it skips straight to waiting for all 4 parties in Stage 3 (`WaitForPluginAndVerifier.tsx`).

**Go:** `plugin_install.go:203-213` → `requestFastVaultReshare()` (line 505)
**TS:** `PluginReshareFastKeygenServerActionProvider.tsx:31-47`
**UI state:** `fastServer`

---

## Stage 3 — Recruit Verifier + Plugin Worker

Tell the verifier to join. The verifier in turn brings the plugin worker.

### Desktop (Go) — calls verifier directly

```
POST https://verifier.vultisig.com/vault/reshare
Authorization: Bearer {authToken}       ← EIP-191 signed token

{
  name, public_key, session_id, hex_encryption_key,
  hex_chain_code,
  local_party_id: "verifier-{sessionID[:8]}",   ← verifier's intended party ID
  old_parties, old_reshare_prefix, lib_type,
  plugin_id,                ← tells verifier WHICH plugin to bring
  email: "",
  use_vultisig_relay: true,
  relay_url, relay_server   ← both set to DefaultRelayURL
}
```

Desktop aborts on failure (unlike Stage 2's fire-and-forget). 30s timeout.

**Go:** `plugin_install.go:215-237` → `requestVerifierReshare()` (line 554)

### Marketplace (TS) — calls store API (proxy to verifier)

```
POST {storeApiUrl}/vault/reshare
Authorization: Bearer {JWT}             ← marketplace JWT, auto-injected by axios interceptor

{
  name, public_key, session_id, hex_encryption_key,
  hex_chain_code,
  local_party_id,            ← extension's OWN party ID (NOT verifier's)
  old_parties,
  plugin_id,
  email: ""
}
```

The marketplace sends **5 fewer fields** than the desktop verifier call: `old_reshare_prefix`, `lib_type`, `use_vultisig_relay`, `relay_url`, `relay_server`. The store API already has vault data (looked up by `public_key`) and fills these in before forwarding to the verifier.

**TS:** marketplace `reshareVault()` at `store.ts:281-283`, extension polls only (`WaitForPluginAndVerifier.tsx`)

### What happens next (both paths)

Three things happen:
1. Verifier joins the relay
2. Verifier notifies the plugin worker
3. Plugin worker joins the relay

Poll relay until ALL four party types present (4-condition readiness check):
- `server-*` prefix → fast vault server (Go: case-insensitive, TS: case-insensitive via structural parse)
- `verifier*` prefix → verifier (Go: case-insensitive, **TS: case-sensitive** — no practical impact since verifier ID is always lowercase)
- regex `^[^-]+-[^-]+-[0-9a-f]{4}-[0-9]+$` → plugin worker (identical in Go and TS)
- total peers >= 3 (excluding self in TS) / total parties >= 4 (including self in Go)

**Polling:** Desktop: 1s interval, 5min timeout. Extension: 2s interval, no timeout (polls indefinitely).

**TS:** `WaitForPluginAndVerifier.tsx:32-61`
**UI states:** `verifierServer` (waiting for verifier+plugin) → `pluginServer` (has verifier, waiting for plugin) → `install`

---

## Stage 4 — Start MPC Session

Lock in the party list and signal all parties to begin.

```
POST relay/start/{sessionID}  body: [all 4 party IDs]
```

All parties receive the start signal and begin the TSS protocol.

**Go:** `plugin_install.go:239-245`
**TS:** `startMpcSession.ts` → `SilentStartMpcSessionFlow.tsx`
**UI state:** `install`

---

## Stage 5 — DKLS Reshare (ECDSA then EdDSA)

Run the 2-of-4 threshold reshare — two sequential sub-protocols. The reshare runs on the **React frontend**, not in Go. The desktop agent delegates via a Wails event bridge.

### Architecture

```
Go (plugin_install.go:259)
  → dklsbridge.RequestReshare()           5-minute overall timeout
    → Wails event "agent:dkls_reshare_request"

Frontend (AgentDklsReshareBridge.tsx)
  ← receives event
  → DKLS reshare (ECDSA)                  60s timeout, 3 retries
  → Schnorr reshare (EdDSA)               60s timeout, 3 retries
  → POST relay/complete/{sessionID}        completion signal
  → poll GET relay/complete/{sessionID}    10 attempts, 1s delay
  → ProvideDKLSReshare(results)            return to Go
```

Extension standalone flow uses the same DKLS/Schnorr code from `ReshareVaultKeygenActionProvider.tsx`.

### 5a: ECDSA Reshare

```
Input:  old ECDSA keyshare, old parties, new parties (all 4), threshold=2
Output: new ECDSA public key, new key share, NEW reshare prefix
```

- Desktop bridge: `AgentDklsReshareBridge.tsx:56-70` → `dklsKeygen.startReshareWithRetry()`
- Extension: `ReshareVaultKeygenActionProvider.tsx:52-78` → `dklsKeygen.startReshareWithRetry()`
- ~6 inbound protocol messages (extension tracks `dklsInboundSequenceNo` 0→6)

### 5b: EdDSA Reshare

```
Input:  old EdDSA keyshare, old parties, new parties (all 4), NEW reshare prefix from 5a
Output: new EdDSA public key, new key share
```

- Desktop bridge: `AgentDklsReshareBridge.tsx:72-87` → `schnorrKeygen.startReshareWithRetry()`
- Extension: `ReshareVaultKeygenActionProvider.tsx:80-100` → `schnorrKeygen.startReshareWithRetry()`
- ~6 inbound protocol messages (extension tracks `dklsInboundSequenceNo` 6→12)

### Retry & Completion

- Up to 3 retry attempts per sub-protocol (DKLS: `dkls.ts:367-378`, Schnorr: `schnorrKeygen.ts:329-342`)
- Each party signals completion: `POST relay/complete/{sessionID}` body `[localPartyId]`
- Wait for all peers to complete: poll `GET relay/complete/{sessionID}`, 10 attempts, 1s delay
- Desktop bridge: `AgentDklsReshareBridge.tsx:89-99` → `keygenComplete.ts:9-51`
- Extension: same `keygenComplete.ts`

### Vault not updated

The wallet does NOT save new keyshares after plugin reshare. The reshare response is intentionally discarded — the wallet continues signing with its existing keyshares via the fast vault server. Only the plugin worker, verifier, and server use the new keyshares for plugin operations.

- Desktop: `plugin_install.go:259` — response discarded (`_, err = ...`)
- Extension: `KeygenFlow.tsx:65-67` — explicitly skips `SaveVaultStep` for plugin reshare

**Total: ~12 inbound messages** (`appInstallTotalSequenceNo = 12` in TS)
**UI state:** `install` (progress shown as `(sequenceNo / 12) * 100%`)

---

## Stage 6 — Verify

Confirm the backend registered the plugin. No vault save — the wallet's keyshares are not updated (see Stage 5).

### Desktop (Go) — verifier directly

```
GET https://verifier.vultisig.com/vault/exist/{pluginId}/{publicKeyECDSA}
Authorization: Bearer {authToken}
→ 200 = installed
→ 404 = not installed (retry)
→ other = error (retry)
```

5 retry attempts with 2-second delay. Distinguishes 404 (not installed yet) from network errors.

**Go:** `plugin_install.go:268-284` (verify) → `verifier/client.go:184-194` (`CheckPluginInstalled`)

### Marketplace (TS) — store API

```
GET {storeApiUrl}/vault/exist/{pluginId}/{vaultId}
Authorization: Bearer {JWT}
```

Single attempt, no retry. All errors caught as `false`. Used for UI status display, not as part of the install flow itself.

**TS:** `store.ts:272-279` (`isAppInstalled`)

### Extension (TS) — no verification

Extension does not call any `/vault/exist` endpoint. It relies solely on relay completion signaling from Stage 5.

**UI state:** `finishInstallation`

---

## Sequence Diagram

```
  Wallet              Relay              FastVault          Verifier         Plugin Worker
    │                   │                   │                  │                  │
    │──POST /{sid}──────>│                   │                  │                  │
    │  [localPartyID]   │                   │                  │                  │
    │                   │                   │                  │                  │
    │──POST /vault/reshare (type:1)────────>│                  │                  │
    │                   │<──join session─────│                  │                  │
    │<──GET /{sid}──────│  (2 parties)      │                  │                  │
    │                   │                   │                  │                  │
    │──POST /vault/reshare (plugin_id)─────────────────────────>│                  │
    │                   │<──────────────────────join session────│                  │
    │                   │                   │                  │──notify──────────>│
    │                   │<─────────────────────────────────────────join session────│
    │<──GET /{sid}──────│  (4 parties)      │                  │                  │
    │                   │                   │                  │                  │
    │──POST /start/{sid}>│                   │                  │                  │
    │  [all 4 parties]  │                   │                  │                  │
    │                   │                   │                  │                  │
    │<════════════ ECDSA reshare (~6 messages) ═══════════════>│                  │
    │<════════════ EdDSA reshare (~6 messages) ═══════════════>│                  │
    │                   │                   │                  │                  │
    │──POST /complete───>│                   │                  │                  │
    │<──check completed──│                   │                  │                  │
    │                   │                   │                  │                  │
    │──GET /vault/exist/{pluginId}/{pubkey}────────────────────>│                  │
    │<──200 OK──────────────────────────────────────────────────│                  │
```

---

## Constraints

- **DKLS only** — GG20 vaults are rejected
- **Fast vault required** — vault must already have a `server-*` signer
- **Auth required** — verifier calls need `Authorization: Bearer {token}` (EIP-191 signed, 7-day TTL)
- **Threshold** — changes from 2-of-3 to 2-of-4 (hardcoded `threshold = 2` for plugin reshare)
- **Timeouts** — 30s for HTTP calls, 5min for peer joining, 5min for TSS reshare

---

## Key Files

| File | What |
|------|------|
| `agent/tools/plugin_install.go` | Desktop orchestrator — combines marketplace + extension roles |
| `agent/dklsbridge/reshare.go` | Go↔Frontend bridge: emits Wails event, waits for reshare response (5min timeout) |
| `core/ui/agent/components/AgentDklsReshareBridge.tsx` | Frontend bridge: receives reshare event, runs DKLS + Schnorr, returns results to Go |
| `core/ui/mpc/keygen/reshare/ReshareVaultKeygenActionProvider.tsx` | TS reshare action: DKLS → Schnorr, sequence tracking (extension standalone) |
| `core/ui/mpc/keygen/reshare/plugin/PluginReshareFlowContent.tsx` | TS plugin install UI flow |
| `core/ui/mpc/keygen/reshare/plugin/WaitForPluginAndVerifier.tsx` | TS peer polling logic |
| `core/ui/mpc/keygen/reshare/PluginReshareFastKeygenServerActionProvider.tsx` | TS fast vault server call |
| `core/ui/mpc/keygen/reshare/plugin/InstallPluginStep.ts` | UI animation states |
| `core/mpc/keygenComplete.ts` | Completion signaling: POST + poll relay `/complete/{sessionID}` |
| `relay/session.go` | Go relay client |
| `agent/verifier/client.go` | Go verifier client |
