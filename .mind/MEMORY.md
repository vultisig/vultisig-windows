
## 2026-02-09 06:32:04
## DKLS Reshare Function Signatures

### DKLS Reshare (ECDSA - secp256k1)
**File:** `/Users/dev/dev/vultisig/vultisig-windows/core/mpc/dkls/dkls.ts`

**Public Method:**
```typescript
public async startReshareWithRetry(keyshare: string | undefined): Promise<ReshareResult>
```

**Parameters:**
- `keyshare: string | undefined` - Base64-encoded old ECDSA keyshare from existing vault

**Return Type:**
```typescript
{
  keyshare: string          // Base64-encoded new ECDSA keyshare
  publicKey: string         // Hex-encoded new ECDSA public key
  chaincode: string         // Hex-encoded new chain code
}
```

**Private Method (for reference):**
```typescript
private async startReshare(dklsKeyshare: string | undefined, attempt: number)
```

### Schnorr Reshare (EdDSA - Ed25519)
**File:** `/Users/dev/dev/vultisig/vultisig-windows/core/mpc/schnorr/schnorrKeygen.ts`

**Public Method:**
```typescript
public async startReshareWithRetry(keyshare: string | undefined): Promise<ReshareResult>
```

**Parameters:**
- `keyshare: string | undefined` - Base64-encoded old EdDSA keyshare from existing vault

**Return Type:**
```typescript
{
  keyshare: string          // Base64-encoded new EdDSA keyshare
  publicKey: string         // Hex-encoded new EdDSA public key
  chaincode: string         // Hex-encoded new chain code (same for both DKLS and Schnorr)
}
```

## Constructor Signatures

### DKLS Constructor
```typescript
constructor(
  keygenOperation: KeygenOperation,
  isInitiateDevice: boolean,
  serverURL: string,
  sessionId: string,
  localPartyId: string,
  keygenCommittee: string[],        // New committee members
  oldKeygenCommittee: string[],      // Old committee members
  hexEncryptionKey: string,
  options?: {
    localUI?: string
    publicKey?: string
    chainCode?: string
    timeoutMs?: number
    onInboundSequenceNoChange?: (inboundSequenceNo: number) => void
  }
)
```

### Schnorr Constructor
```typescript
constructor(
  keygenOperation: KeygenOperation,
  isInitiateDevice: boolean,
  serverURL: string,
  sessionId: string,
  localPartyId: string,
  keygenCommittee: string[],        // New committee members
  oldKeygenCommittee: string[],      // Old committee members
  hexEncryptionKey: string,
  setupMessage: Uint8Array,          // From DKLS keygen, reused for EdDSA
  options?: {
    localUI?: string
    publicKey?: string
    chainCode?: string
    timeoutMs?: number
  }
)
```

## KeygenOperation Types
**File:** `/Users/dev/dev/vultisig/vultisig-windows/core/mpc/keygen/KeygenOperation.ts`

```typescript
type KeygenOperation = 
  | { create: true }
  | { reshare: ReshareType }
  | { keyimport: true }

type ReshareType = 'regular' | 'migrate' | 'plugin'
```

## Reshare Prefix Information
**File:** `/Users/dev/dev/vultisig/vultisig-windows/core/mpc/vault/Vault.ts`

- **resharePrefix**: Present in legacy GG20 vaults only
- For DKLS/Schnorr vaults: NOT stored/returned by reshare functions
- For legacy GG20: Stored in vault and passed as `old_reshare_prefix` to reshare operations
- Stored in database as field `reshare_prefix` in protobuf

## How Reshare is Called from Plugin Install
**File:** `/Users/dev/dev/vultisig/vultisig-windows/core/ui/mpc/keygen/reshare/ReshareVaultKeygenActionProvider.tsx`

```typescript
// ECDSA Reshare
const dklsKeygen = new DKLS(
  operation,              // { reshare: 'plugin' }
  isInitiatingDevice,
  serverUrl,
  sessionId,
  localPartyId,
  signers,                // New committee
  oldCommittee,           // Filtered from old parties
  encryptionKeyHex,
  { timeoutMs, onInboundSequenceNoChange: setDklsInboundSequenceNo }
)
const oldEcdsaKeyshare = keygenVault.existingVault.keyShares.ecdsa
const dklsResult = await dklsKeygen.startReshareWithRetry(oldEcdsaKeyshare)

// EdDSA Reshare
const schnorrKeygen = new Schnorr(
  operation,              // { reshare: 'plugin' }
  isInitiatingDevice,
  serverUrl,
  sessionId,
  localPartyId,
  signers,                // New committee
  oldCommittee,           // Filtered from old parties
  encryptionKeyHex,
  new Uint8Array(0),      // Empty for reshare (not used)
  { timeoutMs }
)
const oldEddsaKeyshare = keygenVault.existingVault.keyShares.eddsa
const schnorrResult = await schnorrKeygen.startReshareWithRetry(oldEddsaKeyshare)
```

## Return Values Combined
```typescript
const vault = {
  publicKeys: {
    ecdsa: dklsResult.publicKey,
    eddsa: schnorrResult.publicKey
  },
  keyShares: {
    ecdsa: dklsResult.keyshare,
    eddsa: schnorrResult.keyshare
  },
  hexChainCode: dklsResult.chaincode
}
```

## Committee Combination Logic
**File:** `/Users/dev/dev/vultisig/vultisig-windows/core/mpc/reshareCommittee.ts`

```typescript
type CombineReshareCommitteeOutput = {
  allCommittee: string[]        // Union of old + new
  newCommitteeIdx: number[]     // Indices of new members in allCommittee
  oldCommitteeIdx: number[]     // Indices of old members in allCommittee
}
```

This is used internally in startReshare to create QcSession.setup() call.


## 2026-02-09 08:30:12
## Agent Service Chains & Coins Data Flow

### How Agent Retrieves Chains and Coins:
1. **Coin Loading** (agent/agent.go:114):
   - SendMessage() calls `store.GetVaultCoins(vaultPubKey)` 
   - Returns list of coins for the specific vault
   - Coins are assigned to vault.Coins before execution

2. **Vault's Coins Field** (storage/vault.go:31):
   - Vault struct contains `Coins []Coin`
   - Not loaded during GetVault() initially
   - Must be explicitly loaded via GetVaultCoins() and assigned

3. **ExecutionContext Setup** (agent/orchestrator.go:246-250):
   - Created in executeToolWithRetry()
   - Passes vault and vault.Coins to tools
   - All tools read from ctx.Vault.Coins (immutable during execution)

### Tool Data Sources:
- `get_chains`: Iterates ctx.Vault.Coins, groups by chain name
- `get_coins`: Returns full ctx.Vault.Coins array
- `get_balances`: Filters ctx.Vault.Coins by optional chain/ticker
- `add_coin`: Reads ctx.Vault.Coins to find chain address, stores via store.SaveCoin()
- `remove_coin`: Finds coin in ctx.Vault.Coins, deletes via store.DeleteCoin()
- `vault_info`: Returns vault metadata + coins
- `list_vaults`: Calls store.GetVaults() + store.GetCoins() (all vaults)

### Storage Structure (Database):
- **vaults table**: Public key, name, signers, lib_type, chain_public_keys, chain_key_shares
- **coins table**: id, public_key_ecdsa (FK to vaults), chain, address, ticker, contract_address, is_native_token, decimals, logo, price_provider_id
- Coins linked to vaults via public_key_ecdsa foreign key
- Cascade delete: removing vault removes all its coins

### Data Consistency Notes:
- Coins are stored per-vault in database via public_key_ecdsa
- No intermediate "chain selection" table - coins ARE the chain representation
- Adding coin requires chain to already exist (via native coin)
- Address derived from vault's public keys, not stored separately per chain


## 2026-02-09 08:32:22
## Vault Coins Management Architecture

### CRITICAL FINDING: Separate Storage Instance Issue Found

The codebase uses a SINGLE shared Store instance that is both:
1. Wails-bound and exposed to the frontend
2. Shared with the Agent Service

But there are TWO DIFFERENT code paths for loading coins:

**Frontend (UI) Path:**
- Desktop client calls `store.GetCoins()` which returns ALL coins for ALL vaults as `map[string][]Coin`
- This is grouped by vault public key: `Record<vaultId, AccountCoin[]>`
- Then `mergeVaultsWithCoins()` in `/core/ui/storage/vaults.tsx` (lines 48-57) FILTERS coins:
  - Only coins whose chain matches a chain in the vault's native coins are kept
  - This filtering is crucial and happens in the UI layer

**Agent Path:**
- Agent calls `store.GetVaultCoins(vaultPubKey)` for a SINGLE vault
- Returns only coins for that specific vault (filtered at DB level)
- Gets all coins without UI-layer filtering

### The Possible Sync Issue

The filtering logic in `mergeVaultsWithCoins()` (vaults.tsx:48-57):
```typescript
return {
  ...vault,
  coins: vaultCoins.filter(coin => vaultChains.includes(coin.chain)),
}
```

This filter keeps only coins whose chain is in the vault's native coins list. If:
1. Agent adds a coin for chain X
2. But the vault doesn't have a native coin for chain X
3. The UI will NOT show that coin because of this filter

### Storage Flow

**Main App (Frontend):**
1. `coinsStorage.getCoins()` in `/clients/desktop/src/storage/coins.ts` calls `GetCoins()` from Go backend
2. `GetCoins()` in `/storage/store.go:361` returns ALL coins for ALL vaults
3. Frontend calls `mergeVaultsWithCoins()` which applies the chain filter
4. Result: `useVaults()` hook provides filtered vaults with coins
5. `currentVault` context uses these filtered coins
6. All UI components read from `useCurrentVault().coins`

**Agent Service:**
1. In `agent.go:114`, calls `store.GetVaultCoins(vaultPubKey)` directly
2. Returns coins from DB for that vault (no UI filtering applied)
3. Passes to `ExecutionContext`
4. Tools like `get_chains`, `get_coins` read from ctx.Vault.Coins directly
5. `add_coin` saves via `store.SaveCoin()` directly to DB

### Same Store Instance Confirmed
- `main.go:37` creates single Store: `store, err := storage.NewStore()`
- Bound to Wails (line 94): part of `Bind: []interface{}{app, tssIns, store, ...}`
- Passed to AgentService (line 60): `agentSvc := agent.NewAgentService(store, tssIns)`
- Both use same underlying SQLite DB via same Store pointer

### Database Schema
- `coins` table: id, public_key_ecdsa (FK), chain, address, ticker, contract_address, is_native_token, logo, price_provider_id, decimals
- Cascade delete: removing vault removes all its coins
- Coins are persisted per vault via public_key_ecdsa FK

### Native Coins Determination
In `currentVaultCoins.ts:25-28`:
```typescript
const useCurrentVaultChains = () => {
  const nativeCoins = useCurrentVaultNativeCoins()
  return useMemo(() => nativeCoins.map(coin => coin.chain), [nativeCoins])
}
```
Native coins are those where `isFeeCoin()` returns true (defined in chain configs).
These are the chains represented in vault.

## 2026-02-09 08:35:38
## Chain Addition & Address Derivation Flow

### Frontend Address Derivation Architecture

**Key Entry Point:** `core/ui/storage/coins.tsx` - `useCreateCoinMutation()`
- Lines 59-81: When adding a new chain, the mutation:
  1. Takes vault data (publicKeys, hexChainCode, chainPublicKeys)
  2. Gets the chain-specific public key via `getPublicKey()`
  3. Derives address from that public key via `deriveAddress()`
  4. Stores the derived address with the coin

**Address Derivation Stack:**
1. `deriveAddress()` at `core/chain/publicKey/address/deriveAddress.ts`
   - Takes: chain, publicKey (PublicKey object from wallet-core), walletCore
   - Returns: chain-specific address string
   - Chain-specific logic:
     - MayaChain: `walletCore.AnyAddress.createBech32WithPublicKey(publicKey, coinType, 'maya')`
     - Cardano: special `deriveCardanoAddress()` with public key data
     - Default: `walletCore.CoinTypeExt.deriveAddressFromPublicKey(coinType, publicKey)`
     - BitcoinCash: strips 'bitcoincash:' prefix if present

2. `getPublicKey()` at `core/chain/publicKey/getPublicKey.ts`
   - Takes: chain, walletCore, hexChainCode, publicKeys {ecdsa, eddsa}, chainPublicKeys
   - Chain public key priority:
     - Use chainPublicKeys[chain] if available (pre-derived per-chain keys)
     - Otherwise derive from root based on signature algorithm:
       - ECDSA chains: `derivePublicKey()` with BIP32 derivation path
       - EdDSA chains: use root EdDSA publicKey directly
   - Creates PublicKey object with getTwPublicKeyType()
   - Special handling for TRON (returns uncompressed key)

3. `derivePublicKey()` at `core/chain/publicKey/ecdsa/derivePublicKey.ts`
   - BIP32 path-based derivation using bip32 library + tiny-secp256k1
   - Takes hexRootPubKey, hexChainCode, derivation path from getCoinType()
   - Validates 32-byte chain code
   - Uses `derivePubKeyFromPath()` with hardened offset check

4. `getCoinType()` at `core/chain/coin/coinType.ts`
   - Maps Chain to WalletCore.CoinType enum
   - Example: Chain.Sui -> CoinType.sui

### Chain Metadata (chainFeeCoin)

**File:** `core/chain/coin/chainFeeCoin.ts`
- Defines native coin metadata per chain via `leanChainFeeCoin` Record
- Each entry: { ticker, logo, decimals, priceProviderId }
- Examples:
  - Sui: ticker='SUI', logo='sui', decimals=9, priceProviderId='sui'
  - Bitcoin: ticker='BTC', logo='btc', decimals=8, priceProviderId='bitcoin'

**How it's used:**
- `ManageVaultChainsPage` (line 23-26) filters chainFeeCoin by availableChains
- UI shows grid of chainFeeCoin entries as "add chain" options
- When user clicks a chain, `ChainItem.tsx` calls `createCoin.mutate(coin)` (line 38)

### UI Flow: Adding a Chain

**File:** `core/ui/vault/chain/manage/index.tsx` - `ManageVaultChainsPage`
1. Gets availableChains list
2. Filters chainFeeCoin by availableChains (only shows supported chains)
3. Shows grid of native coin options
4. User clicks a chain -> triggers ChainItem.tsx click handler (line 33-40):
   - If already selected: calls deleteCoin
   - If not selected: calls createCoin with the Coin object (chain metadata)

**File:** `core/ui/vault/chain/manage/ChainItem.tsx`
- Line 38: `createCoin.mutate(coin)` passes coin with chain, ticker, logo, decimals, priceProviderId
- Line 22-28: Checks if coin is already in currentVaultNativeCoins to show checkmark

### Go Side (Agent) - Add Coin Tool

**File:** `agent/tools/coins.go` - `AddCoinTool`
- **CRITICAL:** Lines 154-164: Does NOT derive addresses
- Instead, looks for existing address from same chain:
  ```go
  for _, coin := range ctx.Vault.Coins {
    if strings.EqualFold(coin.Chain, chain) {
      existingAddress = coin.Address
      break
    }
  }
  ```
- Only allows adding coin if native token for that chain already exists
- Reuses address from native token of the same chain
- Stores coin via `store.SaveCoin()` with the reused address

### Key Architectural Finding

**Address Derivation is FRONTEND-ONLY:**
- TypeScript/React side handles all address derivation using TrustWallet Core
- Go agent CANNOT derive addresses (no access to wallet-core)
- Agent add_coin tool requires chain to already have a native token added
- Agent reuses address from existing native token of same chain

**To replicate in Go backend:**
1. Would need address derivation library (like go-ethereum, btclib, etc.)
2. Would need chain-specific derivation logic matching TrustWallet Core
3. Would need BIP32 implementation for ECDSA-based chains
4. Current workaround: require frontend to drive address derivation, agent just stores coins

## 2026-02-16 00:52:51
## Agent Backend (github.com/vultisig/agent-backend) API Analysis

### Endpoints (all under /agent, JWT-authenticated)
- POST /agent/conversations - Create conversation (body: {public_key})
- POST /agent/conversations/list - List conversations (body: {public_key, skip, take})
- POST /agent/conversations/:id - Get conversation with messages (body: {public_key})
- DELETE /agent/conversations/:id - Archive conversation (body: {public_key})
- POST /agent/conversations/:id/messages - Send message (main endpoint)
- GET /healthz - Health check (public)

### Authentication
- Bearer JWT token in Authorization header
- JWT claims: {public_key, token_id, token_type: "access"}
- JWT signed with HMAC, validated against JWT_SECRET env var
- Every request must include public_key in body that matches JWT's public_key

### Communication Protocol
- Pure HTTP REST (JSON request/response) - NO streaming, NO WebSocket, NO SSE
- Anthropic client uses synchronous SendMessage (no streaming API)
- All responses are complete JSON objects returned after full processing

### SendMessage Request Format (POST /agent/conversations/:id/messages)
```json
{
  "public_key": "string",
  "content": "string",                          // User message text (Ability 1)
  "context": {                                   // Optional wallet context
    "vault_address": "string",
    "balances": [{"chain":"","asset":"","symbol":"","amount":"","decimals":0}],
    "addresses": {"chain": "address"}
  },
  "selected_suggestion_id": "string|null",       // Ability 2: policy builder
  "action_result": {                             // Ability 3: action confirmation
    "action": "string",
    "success": true,
    "error": "string"
  }
}
```

### SendMessage Response Format
```json
{
  "message": {
    "id": "uuid",
    "conversation_id": "uuid",
    "role": "assistant",
    "content": "string",
    "content_type": "text",
    "metadata": {},
    "created_at": "timestamp"
  },
  "suggestions": [{"id":"","plugin_id":"","title":"","description":""}],
  "policy_ready": {"plugin_id":"","configuration":{},"policy_suggest":{}},
  "install_required": {"plugin_id":"","title":"","description":""}
}
```

### Three Abilities (routing in ProcessMessage)
1. **Intent Detection** (default): content is set, detects intent, returns response + suggestions
2. **Policy Builder**: selected_suggestion_id is set, fetches recipe schema, builds policy config
3. **Action Confirmation**: action_result is set, generates confirmation message

### Tools exposed to Claude
- respond_to_user: intent (action_request|general_question|unclear), response text, suggestions array
- build_policy: configuration object, explanation text
- confirm_action: response text, next_steps array
- update_memory: persistent user memory document (max 4000 chars)

### Infrastructure
- PostgreSQL for conversations/messages/memories
- Redis for suggestion cache (1hr TTL) and plugin skills cache (5min TTL)
- Anthropic Claude Sonnet for main LLM, Haiku for summarization
- Conversation windowing: 20 messages window, 30 message summarize trigger

