# Deferred E2E Tests

Tests listed below require real vault data, testnet funds, server connectivity,
or manual user interaction that cannot be automated without a configured vault.

---

## Transaction Signing

### `test: eth_sendTransaction signs and broadcasts`
- **What it tests:** Full send transaction flow — user approves in popup, MPC signing occurs, tx is broadcast
- **What's needed:** Vault shares (2-of-3 or 2-of-2 keygen complete), testnet ETH for gas, RPC endpoint

### `test: personal_sign returns valid signature`
- **What it tests:** Signs a message with the vault key and returns a valid ECDSA signature
- **What's needed:** Vault shares, no funds needed (just signing)

### `test: eth_signTypedData_v4 returns valid EIP-712 signature`
- **What it tests:** Signs typed data per EIP-712 and returns a valid signature
- **What's needed:** Vault shares

### `test: Solana signTransaction produces valid signed transaction`
- **What it tests:** Signs a Solana transaction via the Phantom-compatible interface
- **What's needed:** Vault shares with Solana key, devnet SOL

### `test: Solana signAndSendTransaction broadcasts`
- **What it tests:** Signs and sends a Solana transaction
- **What's needed:** Vault shares with Solana key, devnet SOL, RPC endpoint

### `test: Solana signMessage returns ed25519 signature`
- **What it tests:** Signs an arbitrary message with Solana key
- **What's needed:** Vault shares with Solana key

### `test: Bitcoin signPSBT signs a PSBT`
- **What it tests:** Signs a Partially Signed Bitcoin Transaction
- **What's needed:** Vault shares with Bitcoin key, testnet BTC UTXOs

### `test: THORChain deposit_transaction executes deposit`
- **What it tests:** THORChain native deposit transaction flow
- **What's needed:** Vault shares with THORChain key, testnet RUNE

### `test: MayaChain deposit_transaction executes deposit`
- **What it tests:** MayaChain native deposit transaction flow
- **What's needed:** Vault shares with MayaChain key, testnet CACAO

### `test: Cosmos send_transaction signs and broadcasts`
- **What it tests:** Cosmos SDK send transaction flow
- **What's needed:** Vault shares with Cosmos key, testnet ATOM

### `test: Keplr signAmino returns valid signature`
- **What it tests:** Amino-style signing through Keplr interface
- **What's needed:** Vault shares with Cosmos key

### `test: Keplr signDirect returns valid signature`
- **What it tests:** Protobuf direct signing through Keplr interface
- **What's needed:** Vault shares with Cosmos key

### `test: Polkadot signPayload signs extrinsic`
- **What it tests:** Signs a Polkadot extrinsic payload
- **What's needed:** Vault shares with Polkadot key

### `test: Polkadot signRaw signs raw data`
- **What it tests:** Signs raw data with Polkadot key
- **What's needed:** Vault shares with Polkadot key

### `test: TronLink tron_requestAccounts connects and returns address`
- **What it tests:** Full Tron connection flow
- **What's needed:** Vault shares with Tron key

---

## Balance & State Queries (with real data)

### `test: eth_getBalance returns actual balance`
- **What it tests:** Querying a real account balance and verifying the returned hex value
- **What's needed:** Funded testnet account address, RPC endpoint

### `test: eth_getTransactionReceipt returns real receipt`
- **What it tests:** Fetching receipt for a known transaction hash
- **What's needed:** Known testnet tx hash, RPC endpoint

---

## Vault Operations

### `test: vault creation flow (Fast Vault)`
- **What it tests:** Creating a new Fast Vault through the extension UI
- **What's needed:** Server connectivity (relay server), email verification

### `test: vault creation flow (Secure Vault)`
- **What it tests:** Creating a new Secure Vault with QR pairing
- **What's needed:** Server connectivity, mobile Vultisig app for pairing

### `test: vault import from .vult file`
- **What it tests:** Importing an existing vault from a backup file
- **What's needed:** Valid .vult backup file with key shares

### `test: vault backup/export produces valid .vult file`
- **What it tests:** Exporting an active vault to a backup file
- **What's needed:** Active vault with key shares

### `test: getVault returns vault info`
- **What it tests:** `window.vultisig.getVault()` returns vault data
- **What's needed:** Active vault

### `test: getVaults returns all vaults`
- **What it tests:** `window.vultisig.getVaults()` returns list of vaults
- **What's needed:** One or more active vaults

---

## DApp Connection Flow

### `test: eth_requestAccounts shows approval popup and connects`
- **What it tests:** Full connection flow — popup appears, user approves, accounts returned
- **What's needed:** Active vault, ability to interact with popup (may need vault shares)

### `test: connect updates isConnected and selectedAddress`
- **What it tests:** After connecting, provider state updates correctly
- **What's needed:** Active vault for approval

### `test: wallet_switchEthereumChain switches and emits chainChanged`
- **What it tests:** Full chain switch flow with event emission
- **What's needed:** Active vault (chain switch may require vault)

### `test: wallet_revokePermissions disconnects and emits events`
- **What it tests:** Full disconnect flow after a connection
- **What's needed:** Active vault (need to be connected first)

---

## Send/Swap Flows

### `test: EVM token send end-to-end`
- **What it tests:** Sending an ERC-20 token through the extension
- **What's needed:** Active vault, testnet ERC-20 tokens, testnet ETH for gas

### `test: cross-chain swap via THORChain`
- **What it tests:** Swap flow using THORChain as intermediary
- **What's needed:** Active vault, testnet funds on source chain, THORChain stagenet

---

## Token & Asset Management

### `test: wallet_watchAsset adds token to wallet`
- **What it tests:** Adding a custom ERC-20 token to the wallet's tracked assets
- **What's needed:** Active vault, valid ERC-20 contract address

### `test: token discovery finds tokens`
- **What it tests:** Automatic discovery of tokens held by the wallet
- **What's needed:** Active vault with funded address, token discovery API

---

## Push Notifications

### `test: push notification received for incoming transaction`
- **What it tests:** Extension receives and displays push notification
- **What's needed:** Active vault, incoming transaction, push notification service

---

## Keplr Advanced

### `test: Keplr getKey returns valid key info`
- **What it tests:** Returns the correct public key, address, and vault name
- **What's needed:** Active vault with Cosmos key

### `test: Keplr enable enables multiple chain IDs`
- **What it tests:** Enabling multiple Cosmos chains simultaneously
- **What's needed:** Active vault with multi-chain Cosmos keys

### `test: Keplr getOfflineSigner returns working signer`
- **What it tests:** The offline signer can sign transactions
- **What's needed:** Active vault with Cosmos key

---

## Solana Advanced

### `test: Solana signIn returns valid SIWS response`
- **What it tests:** Sign-In With Solana flow produces valid output
- **What's needed:** Active vault with Solana key

### `test: Solana signAllTransactions signs batch`
- **What it tests:** Batch transaction signing for Solana
- **What's needed:** Active vault with Solana key, devnet SOL

---

*Total deferred tests: 32*
*These will become implementable once a test vault fixture is created with pre-generated key shares.*
