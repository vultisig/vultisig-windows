# Agent Tool Call Specification (Draft)

Wire format for structured tool invocations sent by **agent-backend** to the
desktop/extension frontend via the SSE `actions` array.

---

## Transport

The backend includes tool calls in `SendMessageResponse.actions`:

```jsonc
// Backend → Frontend (SSE response)
{
  "actions": [
    {
      "id": "uuid",           // unique per invocation
      "type": "tool_name",    // action type — maps to a handler
      "title": "Human label", // shown in UI while executing
      "description": "...",   // optional detail
      "params": { ... },      // tool-specific input (schemas below)
      "auto_execute": true    // frontend may execute without explicit user tap
    }
  ]
}
```

The frontend executes each action and reports back via `ActionResult`:

```jsonc
// Frontend → Backend (next request body)
{
  "action_result": {
    "action": "tool_name",
    "action_id": "uuid",
    "success": true,
    "data": { ... },    // tool-specific output (schemas below)
    "error": "..."      // present when success=false
  }
}
```

---

## 1. Transaction Bundle — Sign & Broadcast

**Action type:** `sign_transaction_bundle`

Replaces both the current `sign_tx` single-transaction path and the
`MpcTransaction[]` EVM-only bundle path with a single, multi-chain-aware
invocation.

### 1.1 Params (backend → frontend)

```jsonc
{
  // Ordered list of transactions. Frontend MUST execute sequentially
  // and stop on the first failure.
  "transactions": [
    {
      "id": "uuid",                     // unique within this bundle
      "sequence": 0,                    // explicit ordering (0-based)
      "chain": "Ethereum",             // Chain enum value
      "action": "approve",             // human-readable label for this step
      "signing_mode": "ecdsa_secp256k1", // | "eddsa_ed25519"

      // --- Exactly one of the following two fields is set ---

      // Option A: pre-built keysign payload (protobuf, base64).
      // Frontend decodes, signs each pre-signing hash, compiles, broadcasts.
      "keysign_payload": "base64...",

      // Option B: raw unsigned transaction (hex).
      // Frontend hashes, signs, compiles, broadcasts directly.
      // Used when the backend has already constructed the full unsigned tx.
      "unsigned_tx_hex": "0xabc...",

      // --- End exclusive fields ---

      // Chain-specific context required to hash/compile the raw tx.
      // Only required when unsigned_tx_hex is set.
      "chain_context": {
        "chain_id": "0x1",            // EVM: hex chain ID
        "derive_path": "m/44'/60'/0'/0/0",
        "tx_type": "eip1559"          // "legacy" | "eip1559" | "eip2930"
      },

      // Human-readable metadata. Displayed in approval UI, not used for signing.
      "tx_details": {
        "description": "Approve USDC spending",
        "from": "0xabc...",
        "to": "0xdef...",
        "value": "0",
        "token_symbol": "USDC",
        "amount_human": "1000 USDC",
        "contract_name": "Uniswap Router",
        "gas_limit": "60000"
      },

      // When true, frontend should poll for on-chain receipt before
      // proceeding to the next transaction in the bundle.
      "wait_for_receipt": true,

      // Optional. Seconds to wait for receipt before timing out.
      // Defaults vary by chain kind if omitted.
      "receipt_timeout_seconds": 180
    }
  ],

  // If true, skip the bundle-approval UI and sign immediately.
  // Used when the user has already approved via a prior confirmation step.
  "skip_approval": false,

  // Optional label for the entire bundle shown in UI.
  "bundle_label": "Swap 1 ETH → USDC on Uniswap"
}
```

### 1.2 Result (frontend → backend)

```jsonc
{
  "transactions": [
    {
      "id": "uuid",            // matches input id
      "sequence": 0,
      "chain": "Ethereum",
      "tx_hash": "0x...",
      "status": "confirmed",   // "confirmed" | "failed" | "pending" | "timeout"
      "error": null             // string if this step failed
    }
  ],
  "bundle_success": true       // false if any transaction failed or was skipped
}
```

### 1.3 Frontend behaviour

1. If `skip_approval` is false, emit `tx_bundle_approval` event and wait for
   user consent. If rejected, report `success: false` immediately.
2. Request vault password via `password_required` event.
3. For each transaction in `sequence` order:
   a. If `keysign_payload` is set — decode protobuf, extract pre-signing
      hashes, sign each via fast-vault keysign, compile, broadcast.
   b. If `unsigned_tx_hex` is set — hash using chain-appropriate algorithm
      (keccak256 for EVM, sha256 for Cosmos, etc.), sign, compile, broadcast.
   c. If `wait_for_receipt` is true, poll until confirmed or timeout.
   d. On failure, stop and do not execute remaining transactions.
4. Report full results back.

### 1.4 Multi-chain example

```jsonc
{
  "type": "sign_transaction_bundle",
  "params": {
    "transactions": [
      {
        "id": "a1",
        "sequence": 0,
        "chain": "Ethereum",
        "action": "Approve USDC on Ethereum",
        "signing_mode": "ecdsa_secp256k1",
        "unsigned_tx_hex": "0x02f8...",
        "chain_context": { "chain_id": "0x1", "derive_path": "m/44'/60'/0'/0/0", "tx_type": "eip1559" },
        "tx_details": { "description": "Approve USDC", "amount_human": "Unlimited USDC" },
        "wait_for_receipt": true
      },
      {
        "id": "a2",
        "sequence": 1,
        "chain": "Ethereum",
        "action": "Bridge USDC to Arbitrum",
        "signing_mode": "ecdsa_secp256k1",
        "keysign_payload": "CiQKIFN3...",
        "tx_details": { "description": "Bridge 500 USDC via LayerZero", "amount_human": "500 USDC" },
        "wait_for_receipt": true
      },
      {
        "id": "a3",
        "sequence": 2,
        "chain": "Arbitrum",
        "action": "Swap USDC → ARB",
        "signing_mode": "ecdsa_secp256k1",
        "keysign_payload": "EhRBcmJp...",
        "tx_details": { "description": "Swap 500 USDC to ARB on Camelot", "amount_human": "500 USDC" },
        "wait_for_receipt": true
      }
    ],
    "bundle_label": "Bridge & Swap: ETH USDC → ARB"
  }
}
```

---

## 2. Add Token

**Action type:** `add_token`

Adds one or more tokens to the active vault. If the token's chain is not yet
in the vault, the frontend derives the chain address and adds the native fee
coin automatically.

### 2.1 Params

```jsonc
{
  "tokens": [
    {
      "chain": "Ethereum",              // required — Chain enum value
      "ticker": "USDC",                 // required — display symbol
      "contract_address": "0xA0b8...",  // required for non-native tokens
      "decimals": 6,                    // required
      "logo": "https://...",            // optional — token icon URL
      "price_provider_id": "usd-coin", // optional — for price lookups
      "is_native": false                // optional — default false
    }
  ]
}
```

When `tokens` contains a single entry, this is equivalent to the existing
`add_coin` tool. The array form allows the backend to add multiple tokens in
one round-trip (e.g. "add USDC on Ethereum and Arbitrum").

### 2.2 Result

```jsonc
{
  "results": [
    {
      "chain": "Ethereum",
      "ticker": "USDC",
      "address": "0xabc...",           // vault's address on this chain
      "contract_address": "0xA0b8...",
      "success": true,
      "error": null,
      "chain_added": false             // true if the chain was new to the vault
    }
  ]
}
```

### 2.3 Frontend behaviour

For each token in order:
1. Resolve `chain` to internal `Chain` enum (case-insensitive match).
2. If chain not in vault, derive keypair and create native fee coin first.
   Set `chain_added: true` in result.
3. Check for duplicates — if token already exists, return
   `success: false, error: "already_exists"`.
4. Create coin in storage with provided metadata.
5. Signal `vaultModified` so the UI refreshes.

---

## 3. Add Chain

**Action type:** `add_chain`

Adds one or more chains to the vault by deriving addresses and creating their
native fee coins.

### 3.1 Params

```jsonc
{
  "chains": [
    {
      "chain": "Solana"     // required — Chain enum value
    }
  ]
}
```

### 3.2 Result

```jsonc
{
  "results": [
    {
      "chain": "Solana",
      "ticker": "SOL",             // native coin ticker
      "address": "5yKx...",        // derived vault address
      "success": true,
      "error": null
    }
  ]
}
```

### 3.3 Frontend behaviour

For each chain:
1. Resolve to internal `Chain` enum.
2. If chain already exists in vault, return
   `success: false, error: "already_exists"`.
3. Derive keypair using vault's public keys + chain code.
4. Create the chain's native fee coin in storage.
5. Signal `vaultModified`.

---

## 4. Query Address Book

**Action type:** `get_address_book`

Returns the user's saved address book entries, optionally filtered.

### 4.1 Params

```jsonc
{
  // All filters are optional. When omitted, return all entries.
  "chain": "Ethereum",     // filter by chain
  "query": "alice"         // case-insensitive substring match on title or address
}
```

### 4.2 Result

```jsonc
{
  "entries": [
    {
      "id": "uuid",
      "title": "Alice",
      "address": "0xabc...",
      "chain": "Ethereum",
      "chain_kind": "evm"   // convenience field: evm | utxo | cosmos | solana | ...
    }
  ],
  "total_count": 1
}
```

### 4.3 Notes

- For EVM entries (`chain_kind: "evm"`), the address is valid across all EVM
  chains. The `chain` field indicates the chain it was saved under but the
  backend may use the address on any EVM chain.
- Results are sorted by `title` ascending.

---

## 5. Add Address Book Entry

**Action type:** `add_address_book`

Creates one or more address book entries.

### 5.1 Params

```jsonc
{
  "entries": [
    {
      "title": "Alice",           // required — display name
      "address": "0xabc...",      // required — wallet address
      "chain": "Ethereum"         // required — Chain enum value
    }
  ]
}
```

### 5.2 Result

```jsonc
{
  "results": [
    {
      "id": "uuid",              // generated entry ID
      "title": "Alice",
      "address": "0xabc...",
      "chain": "Ethereum",
      "success": true,
      "error": null
    }
  ]
}
```

### 5.3 Frontend behaviour

For each entry:
1. Validate `chain` resolves to a known Chain enum value.
2. Generate a UUID for the entry.
3. Persist via storage.
4. Signal `vaultModified`.

Duplicate detection is **not** enforced — the same address/chain pair may
appear multiple times with different titles (e.g. "Alice ETH" and
"Alice Main").

---

## 6. Delete Address Book Entry

**Action type:** `delete_address_book`

Removes one or more address book entries.

### 6.1 Params

```jsonc
{
  "entries": [
    // Option A: delete by ID (preferred, unambiguous)
    { "id": "uuid" },

    // Option B: delete by match (when ID is unknown)
    { "title": "Alice", "chain": "Ethereum" },

    // Option C: delete by address + chain
    { "address": "0xabc...", "chain": "Ethereum" }
  ]
}
```

Matching priority when `id` is not provided:
1. Exact match on `title` + `chain`
2. Exact match on `address` + `chain`
3. Exact match on `title` alone (if only one result)

### 6.2 Result

```jsonc
{
  "results": [
    {
      "id": "uuid",             // the deleted entry's ID
      "title": "Alice",
      "chain": "Ethereum",
      "success": true,
      "error": null             // e.g. "not_found", "ambiguous_match"
    }
  ]
}
```

### 6.3 Frontend behaviour

For each entry:
1. If `id` is provided, delete directly.
2. Otherwise, query storage and apply matching priority.
3. If no match found, return `success: false, error: "not_found"`.
4. If multiple matches and no `id`, return `success: false, error: "ambiguous_match"`.
5. Signal `vaultModified`.

---

## Design Decisions

### Array-first params

All mutating tools accept arrays (`tokens`, `chains`, `entries`,
`transactions`). This enables multi-step workflows in a single round-trip:

> "Add USDC on Ethereum, Arbitrum, and Base"

becomes one `add_token` action with three entries rather than three separate
actions. The backend can still send a single-element array for simple cases.

### Sequential execution with early termination

`sign_transaction_bundle` executes transactions in strict `sequence` order.
On failure, remaining transactions are skipped and their entries are absent
from the result. This is critical for dependent workflows (approve → swap).

For non-transactional tools (`add_token`, `add_chain`, etc.), all entries are
attempted regardless of individual failures. Partial success is reported
per-entry.

### Unified signing path

`sign_transaction_bundle` supports two signing input modes:

| Mode | Field | When to use |
|---|---|---|
| Protobuf | `keysign_payload` | Backend used Vultisig transaction builder (has full chain-specific context) |
| Raw hex | `unsigned_tx_hex` + `chain_context` | Backend constructed the unsigned tx directly (e.g. from an external DEX API) |

The frontend auto-detects which path to use based on which field is present.

### Chain identifiers

All `chain` fields use the string enum values from `Chain.ts`:
`Ethereum`, `Bitcoin`, `Solana`, `THORChain`, `Arbitrum`, `Base`, etc.
Matching is case-insensitive on the frontend.

### Backwards compatibility

The existing `add_coin`, `add_chain`, `get_address_book`,
`add_address_book_entry`, `remove_address_book_entry`, and `sign_tx` action
types continue to work via `actionClassification.ts` mappings. New code
should prefer the types defined in this spec.

| Legacy type | New type |
|---|---|
| `add_coin` | `add_token` |
| `add_chain` | `add_chain` |
| `get_address_book` | `get_address_book` |
| `address_book_add` | `add_address_book` |
| `address_book_remove` | `delete_address_book` |
| `sign_tx` | `sign_transaction_bundle` |
| `MpcTransaction[]` (response field) | `sign_transaction_bundle` (action) |
