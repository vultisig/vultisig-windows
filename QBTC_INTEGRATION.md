# QBTC Integration Guide for Vultisig Extension

> This document provides all the information needed to integrate the Vultisig extension with the **qbtc** blockchain — a Cosmos SDK chain that lets Bitcoin holders claim `qbtc` tokens by proving BTC address ownership via zero-knowledge proofs.

---

## 1. What is QBTC?

QBTC is a Cosmos SDK blockchain (CometBFT consensus) where Bitcoin holders can claim tokens proportional to their BTC UTXOs. The claim is done via **PLONK zero-knowledge proofs** — the user proves they own a Bitcoin address **without revealing their private key, public key, or signature**.

This is designed to work natively with Vultisig's TSS/MPC signing infrastructure:

```
Vultisig Extension/App
  → TSS/MPC sign (produces r, s)
  → proof-service generates ZK proof (hides r, s, pubkey)
  → MsgClaimWithProof broadcast to qbtc chain
  → chain verifies proof → mints qbtc tokens
```

---

## 2. Chain Constants

| Constant | Value | Notes |
|----------|-------|-------|
| **Chain ID** | `qbtc-1` | Mainnet chain ID |
| **Address Prefix** | `qbtc` | Bech32 (e.g., `qbtc1abc...`) |
| **Coin Type (BIP44)** | `118` | Standard Cosmos |
| **Bond Denom** | `qbtc` | Token denomination |
| **Decimals** | `0` | Amounts are in satoshis |
| **Min Gas Price** | `0.0001qbtc` | |
| **Blocks Per Year** | `5,256,000` | ~10 blocks/min |

---

## 3. Claim Flow (End-to-End)

### Step 1: Identify Claimable UTXOs

Query the chain for UTXOs associated with a Bitcoin address. Only UTXOs with `entitled_amount > 0` are claimable.

### Step 2: Compute Hashes

```
AddressHash     = Hash160(pubkey)                          // 20 bytes, 40 hex chars
QBTCAddressHash = SHA256("qbtc1...")                       // 32 bytes, 64 hex chars
ChainIDHash     = SHA256("qbtc-1")[0:8]                    // first 8 bytes
MessageHash     = SHA256("ecdsa:" || AddressHash || QBTCAddressHash || ChainIDHash || "qbtc-claim-v1")
```

> For Taproot (P2TR) addresses, the type prefix is different — see Section 8.

### Step 3: Sign the Message Hash

Use TSS/MPC to produce an ECDSA signature `(r, s)` over the `MessageHash` using the Bitcoin private key (secp256k1).

### Step 4: Generate ZK Proof

Call the **proof-service** HTTP API (recommended) or use the `zkprover` CLI.

### Step 5: Broadcast Transaction

Submit `MsgClaimWithProof` to the qbtc chain using a Cosmos SDK client (e.g., CosmJS).

### Step 6: Verify Result

Check the response for `utxos_claimed` count and `total_amount_claimed`.

---

## 4. Proof Service HTTP API

The proof-service is an HTTP server that generates ZK proofs. This is the recommended integration path for frontends/extensions.

### Health Check

```
GET /health
→ {"status": "healthy", "setup_loaded": true}
```

### Generate Proof

```
POST /prove
Content-Type: application/json

{
  "signature_r": "<48-char hex string (24 bytes r-component)>",
  "signature_s": "<64-char hex string (32 bytes s-component)>",
  "public_key": "<66-char hex string (33 bytes compressed pubkey)>",
  "utxos": [
    {"txid": "<64-char hex>", "vout": 0},
    {"txid": "<64-char hex>", "vout": 1}
  ],
  "claimer_address": "qbtc1...",
  "chain_id": "qbtc-1"
}
```

**Response:**

```json
{
  "proof": "<hex-encoded PLONK proof>",
  "message_hash": "<64-char hex>",
  "address_hash": "<40-char hex>",
  "qbtc_address_hash": "<64-char hex>",
  "utxos": [...],
  "claimer_address": "qbtc1..."
}
```

> Default listen address: `0.0.0.0:8090`, request timeout: 300s

---

## 5. Transaction Message: MsgClaimWithProof

### Protobuf Definition

```protobuf
message MsgClaimWithProof {
  string claimer = 1;              // qbtc bech32 address
  repeated UTXORef utxos = 2;     // up to 50 UTXOs
  string proof = 3;                // hex-encoded ZK proof
  string message_hash = 4;        // 64 hex chars (32 bytes)
  string address_hash = 5;        // 40 hex chars (20 bytes)
  string qbtc_address_hash = 6;   // 64 hex chars (32 bytes)
}

message UTXORef {
  string txid = 1;   // 64 hex chars (Bitcoin txid)
  uint32 vout = 2;   // output index
}
```

### Response

```protobuf
message MsgClaimWithProofResponse {
  uint64 total_amount_claimed = 1;  // total satoshis claimed
  uint32 utxos_claimed = 2;        // count of claimed UTXOs
  uint32 utxos_skipped = 3;        // count of skipped UTXOs
}
```

### Validation Rules

| Field | Constraint |
|-------|-----------|
| `claimer` | Valid bech32 qbtc address |
| `utxos` | 1–50 UTXOs, no duplicates |
| `proof` | 100 bytes min, 50 KB max (hex string) |
| `message_hash` | Exactly 64 hex characters |
| `address_hash` | Exactly 40 hex characters |
| `qbtc_address_hash` | Exactly 64 hex characters |
| Each `txid` | Exactly 64 hex characters |

### Gas

This transaction type is **gas-free** — the chain does not charge gas for `MsgClaimWithProof`.

---

## 6. UTXO Data Model

```protobuf
message UTXO {
  string txid = 1;
  uint32 vout = 2;
  uint64 amount = 3;                        // total BTC in satoshis
  uint64 entitled_amount = 4;               // claimable amount (0 = already claimed)
  ScriptPubKeyResult script_pub_key = 5;
}

message ScriptPubKeyResult {
  string hex = 1;       // script hex
  string type = 2;      // e.g., "pubkeyhash", "witnessv0keyhash"
  string address = 3;   // Bitcoin address
}
```

**Key rule:** Only UTXOs where `entitled_amount > 0` can be claimed. After claiming, `entitled_amount` is set to `0`.

---

## 7. Query Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/qbtc/v1/params` | GET | Get all chain parameters |
| `/qbtc/v1/params/{key}` | GET | Get specific parameter |
| `/qbtc/v1/last_processed_block` | GET | Last processed Bitcoin block height |
| `/qbtc/v1/node_peer_address/{address}` | GET | Peer address for a validator |
| `/qbtc/v1/node_peer_addresses` | GET | All validator peer addresses (paginated) |

### Important Parameters

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `ClaimWithProofDisabled` | int | `0` | `0` = claiming enabled, `>0` = disabled |
| `EmissionCurve` | int | `5` | Token emission curve factor |
| `BlocksPerYear` | int | `5256000` | Expected blocks per year |

---

## 8. Supported Bitcoin Address Types

| Type | Address Format | Script Type (in UTXO) | ZK Circuit | Hash Method |
|------|---------------|----------------------|------------|-------------|
| **P2PKH** | `1...` | `pubkeyhash` | ECDSA | Hash160(pubkey) |
| **P2WPKH** | `bc1q...` (42 chars) | `witnessv0keyhash` | ECDSA | Hash160(pubkey) |
| **P2SH-P2WPKH** | `3...` | `scripthash` | ECDSA | Hash160(pubkey) |
| **P2PK** | (raw pubkey in script) | `pubkey` | ECDSA | Hash160(pubkey) |
| **P2WSH** (single-key) | `bc1q...` (62 chars) | `witnessv0scripthash` | ECDSA | Hash160(pubkey) |
| **P2TR** (key-path) | `bc1p...` | `witnessv1taproot` | Schnorr | x-only pubkey (32 bytes) |

**Not supported:** P2WSH multisig, P2TR script-path.

### Message Hash Type Prefixes

- ECDSA circuits (P2PKH, P2WPKH, P2SH-P2WPKH, P2PK, P2WSH): `"ecdsa:"`
- Schnorr circuit (P2TR): `"schnorr:"`

---

## 9. On-Chain Claim Validation Logic

When `MsgClaimWithProof` is received, the chain:

1. Checks `ClaimWithProofDisabled` parameter — rejects if disabled
2. Checks ZK verifier is initialized (verifying key loaded from genesis)
3. Runs `ValidateBasic()` on the message (format checks from Section 5)
4. Finds the first valid UTXO (not claimed, has address, `entitled_amount > 0`)
5. Determines Bitcoin script type from the UTXO's `script_pub_key.type`
6. Verifies the ZK proof against the UTXO's Bitcoin address using the appropriate circuit
7. For each UTXO in the batch:
   - If address doesn't match the proven address → **skip** (not fail)
   - If already claimed (`entitled_amount == 0`) → **skip**
   - Otherwise → **claim**: mint `entitled_amount` of `qbtc` to claimer, set `entitled_amount = 0`
8. All claims are atomic (all-or-nothing via cache context)
9. Emits `claim_with_proof` event

---

## 10. Error Codes & Common Failures

| Error | Meaning |
|-------|---------|
| `"ClaimWithProof feature is disabled"` | Governance disabled claiming |
| `"proof verification failed: proof data is not valid hex"` | Malformed proof |
| `"proof verification failed: message hash mismatch"` | Wrong message hash computation |
| `"no valid claimable UTXOs found"` | All UTXOs already claimed or invalid |
| `"proof data too large"` | Proof exceeds 50 KB |
| `"proof data too small"` | Proof under 100 bytes |
| `"duplicate utxo reference"` | Same UTXO listed twice |
| `"invalid txid format"` | TXID not 64 hex characters |

---

## 11. Events Emitted

On successful claim:

```
Event: "claim_with_proof"
Attributes:
  - claimer: "qbtc1..."
  - btc_address: "1A1z..." or "bc1q..."
  - utxos_claimed: "3"
  - utxos_skipped: "1"
  - total_amount: "150000000"  (in satoshis)
```

---

## 12. Recommended Client Libraries

There is **no existing TypeScript/JS client** for qbtc. You'll need:

| Library | Purpose |
|---------|---------|
| **CosmJS** (`@cosmjs/stargate`, `@cosmjs/proto-signing`) | Cosmos transaction signing & broadcasting |
| **protobufjs** or `@cosmjs/proto-signing` | Serialize `MsgClaimWithProof` |
| **bitcoinjs-lib** | Bitcoin address parsing and Hash160 computation |
| **@noble/hashes** | SHA-256, RIPEMD-160 for hash computation |
| **axios** / **fetch** | Call proof-service `/prove` endpoint |

### Proto type URL for CosmJS

```typescript
const msgClaimWithProof = {
  typeUrl: "/qbtc.qbtc.v1.MsgClaimWithProof",
  value: {
    claimer: "qbtc1...",
    utxos: [{ txid: "abcd...", vout: 0 }],
    proof: "hex...",
    messageHash: "hex...",
    addressHash: "hex...",
    qbtcAddressHash: "hex..."
  }
};
```

---

## 13. Integration Checklist

### Must Have

- [ ] Detect Bitcoin address type (P2PKH, P2WPKH, P2TR, etc.)
- [ ] Compute `AddressHash` (Hash160 of pubkey, or x-only for Taproot)
- [ ] Compute `QBTCAddressHash` (SHA256 of qbtc address string)
- [ ] Compute `ChainIDHash` (first 8 bytes of SHA256 of chain ID)
- [ ] Compute `MessageHash` (see Section 3)
- [ ] TSS/MPC sign the `MessageHash` → get `(r, s)` signature
- [ ] Call proof-service `/prove` with signature + pubkey + UTXOs
- [ ] Build and broadcast `MsgClaimWithProof` via CosmJS
- [ ] Handle response: show claimed/skipped counts and total amount
- [ ] Validate all inputs client-side before submitting (Section 5 rules)

### Nice to Have

- [ ] Query chain for claimable UTXOs for a given Bitcoin address
- [ ] Check if claiming is enabled (`ClaimWithProofDisabled` param)
- [ ] Show proof generation progress (can take up to 300s)
- [ ] Batch claims (up to 50 UTXOs per transaction)
- [ ] Display `qbtc` balance after claim

---

## 14. Example: Full Claim Flow (Pseudocode)

```typescript
import { sha256, ripemd160 } from "@noble/hashes";
import { SigningStargateClient } from "@cosmjs/stargate";

// 1. User provides Bitcoin address + selects UTXOs
const btcAddress = "bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4";
const claimerAddress = "qbtc1abc...";
const chainId = "qbtc-1";

// 2. Compute hashes (for reference — proof-service does this too)
const addressHash = hash160(compressedPubKey);          // 20 bytes
const qbtcAddressHash = sha256(claimerAddress);         // 32 bytes
const chainIdHash = sha256(chainId).slice(0, 8);        // 8 bytes

// 3. TSS/MPC sign
const messageHash = sha256(
  Buffer.concat([
    Buffer.from("ecdsa:"),
    addressHash,
    qbtcAddressHash,
    chainIdHash,
    Buffer.from("qbtc-claim-v1")
  ])
);
const { r, s } = await tssSign(messageHash);

// 4. Generate proof via proof-service
const proofResponse = await fetch("http://proof-service:8090/prove", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    signature_r: r.toString("hex"),
    signature_s: s.toString("hex"),
    public_key: compressedPubKey.toString("hex"),
    utxos: [{ txid: "abcdef...", vout: 0 }],
    claimer_address: claimerAddress,
    chain_id: chainId
  })
});
const { proof, message_hash, address_hash, qbtc_address_hash } = await proofResponse.json();

// 5. Broadcast to chain
const msg = {
  typeUrl: "/qbtc.qbtc.v1.MsgClaimWithProof",
  value: {
    claimer: claimerAddress,
    utxos: [{ txid: "abcdef...", vout: 0 }],
    proof,
    messageHash: message_hash,
    addressHash: address_hash,
    qbtcAddressHash: qbtc_address_hash
  }
};
const result = await client.signAndBroadcast(claimerAddress, [msg], "auto");
// result.events → claim_with_proof event
```

---

## 15. Key Source File References (in qbtc repo)

| What | File |
|------|------|
| MsgClaimWithProof proto | `proto/qbtc/qbtc/v1/msg_claim_with_proof.proto` |
| UTXO type proto | `proto/qbtc/qbtc/v1/type_utxo.proto` |
| Query proto | `proto/qbtc/qbtc/v1/query_params.proto` |
| Chain constants | `constants/constants.go` |
| Claim handler | `x/qbtc/keeper/handle_msg_claim_with_proof.go` |
| Message hash logic | `x/qbtc/zk/message.go` |
| Bitcoin address utils | `x/qbtc/zk/btc.go` |
| ZK verifier | `x/qbtc/zk/verifier.go` |
| Proof service HTTP API | `proof-service/http.go` |
| Proof generation | `proof-service/prove.go` |
| Error definitions | `x/qbtc/types/errors.go` |
| ZK system documentation | `docs/ZK_SYSTEM.md` |
