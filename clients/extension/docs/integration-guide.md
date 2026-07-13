# Vultisig Extension Integration Guide

{% hint style="info" %}
**Extension vs SDK**: Use the Extension when users manage a Vultisig vault in the browser and connect it to web dApps (like a MetaMask integration). Use the [SDK](https://github.com/vultisig/vultisig-sdk) when your application needs to create and manage vaults programmatically.
{% endhint %}

## Table of Contents

1. [Introduction](#introduction)
2. [Supported Chains](#supported-chains)
3. [How Vultisig Extension Works](#how-vultisig-extension-works)
4. [Provider Detection](#provider-detection)
5. [Supported Methods](#supported-methods)
   - [Ethereum](#ethereum-windowvultisigethereum)
   - [THORChain](#thorchain-windowvultisigthorchain)
   - [Solana](#solana-windowvultisigsolana)
   - [Cosmos-Based Chains](#cosmos-based-chains-dydx-gaiachain-kujira-osmosis)
   - [UTXO Chains](#utxo-chains-bitcoin-bitcoincash-dogecoin-litecoin-zcash)
   - [Tron](#tron-windowtronlink-and-windowtronweb)
   - [Polkadot](#polkadot-windowvultisigpolkadot)
   - [Ripple](#ripple-windowvultisigripple)
   - [MayaChain](#mayachain-windowvultisigmayachain)
   - [Dash](#dash-windowvultisigdash)
   - [QBTC](#qbtc-windowvultisigqbtc-and-windowkeplr)
   - [Plugin Provider](#plugin-provider-windowvultisigplugin)
   - [Additional Provider Surfaces](#additional-provider-surfaces)
6. [Wallet Compatibility Layers](#wallet-compatibility-layers)
7. [Steps to Integrate](#steps-to-integrate-with-vultisig-extension)
8. [Custom Message Signing](#custom-message-signing)
9. [Querying Transactions](#querying-transactions)
10. [Event Handling](#event-handling)
11. [Get Vault](#get-vault)
12. [Error Handling](#error-handling)
13. [Detailed Implementation Examples](#detailed-implementation-examples)

---

## Introduction

Vultisig Extension is a Chrome extension for managing Vultisig vaults and
interacting with decentralized finance (DeFi) applications. It stores the
extension's local vault data and key shares in extension storage; transaction
authorization follows the selected vault's configured signing flow.

The extension provides:

- **`window.vultisig.ethereum`** for Ethereum and EVM chain integrations.
- **`window.vultisig.thorchain`** for THORChain support.
- **`window.vultisig.solana`** for Solana support and Wallet Standard registration.
- **`window.vultisig.qbtc`** for QBTC (post-quantum ML-DSA-44) integration.
- **`window.cardano.vultisig`** for Cardano CIP-30 discovery.
- **`window.vultisig.sui`** and Sui Wallet Standard registration for Sui dApps.
- **`window.vultisig.ton.tonconnect`** for TON Connect discovery.
- **`window.vultisig.bittensor`** for Bittensor dApps.
- **`window.vultisig.station`** for Terra and Station-compatible dApps.
- **`window.gemWallet`** plus the GemWallet message bridge for XRPL dApps.
- **`window.tronLink`** and **`window.tronWeb`** for Tron/TronLink compatibility.
- **`window.keplr`** for Keplr-compatible Cosmos chain integration.
- **`window.phantom`** for prioritized Phantom wallet compatibility (Bitcoin,
  Ethereum, and vault-supported Solana or Sui).
- A MetaMask-compatible interface (`window.ethereum`) for seamless integration with existing dApps.
- [EIP-6963](https://eips.ethereum.org/EIPS/eip-6963) provider announcement (`rdns: me.vultisig`) for multi-wallet discovery.
- Support for UTXO chains (Bitcoin, Litecoin, etc.), Cosmos chains, Polkadot, Ripple, and more.

## Supported Chains

| Chain       | Identifier            | Provider Type |
| ----------- | --------------------- | ------------- |
| Bitcoin     | `0x1f96`              | UTXO          |
| BitcoinCash | `0x2710`              | UTXO          |
| Bittensor   | N/A (genesis hash per request) | Custom |
| Cardano     | `1` (CIP-30 network id) | CIP-30      |
| Dash        | `Dash_dash`           | Custom        |
| DogeCoin    | `0x7d0`               | UTXO          |
| DyDx        | `dydx-1`              | Cosmos        |
| Ethereum    | `0x1`                 | EVM           |
| GaiaChain   | `cosmoshub-4`         | Cosmos        |
| Kujira      | `kaiyo-1`             | Cosmos        |
| LiteCoin    | `Litecoin_litecoin`   | UTXO          |
| MayaChain   | `MayaChain-1`         | Cosmos        |
| Osmosis     | `osmosis-1`           | Cosmos        |
| Polkadot    | `Polkadot_polkadot`   | Custom        |
| QBTC        | `QBTC_qbtc`           | Custom (MLDSA)|
| Ripple      | `Ripple_ripple`       | Custom        |
| Solana      | `solana:mainnet`      | Wallet Standard |
| Sui         | `sui:mainnet`         | Wallet Standard |
| Terra       | `phoenix-1`           | Station       |
| Terra Classic | `columbus-5`        | Station       |
| THORChain   | `Thorchain_thorchain` | Cosmos        |
| TON         | `-239`                | TON Connect   |
| Tron        | N/A                   | TronLink      |
| Zcash       | `Zcash_zcash`         | UTXO          |

## How Vultisig Extension Works

- **Vault Custody**: The extension stores local vault data and key shares and
  participates in signing. The required participants and authorization flow
  depend on the selected vault's type and configuration.
- **Compatibility**: The extension injects multiple provider interfaces to maximize dApp compatibility:
  - `window.ethereum` for MetaMask-compatible Ethereum integration
  - `window.vultisig.*` namespace for all chain providers
  - `window.keplr` for Cosmos ecosystem dApps
  - `window.phantom` for Phantom-compatible dApps
  - `window.cardano.vultisig` for Cardano CIP-30 dApps
  - Sui Wallet Standard registration for Sui dApps
  - `window.tonkeeper.tonconnect` for TON Connect-compatible dApps
  - `window.injectedWeb3.bittensor` for Bittensor dApps when Vultisig is prioritized
  - Station-compatible globals for Terra dApps
  - `window.tronLink` / `window.tronWeb` for Tron dApps
  - `window.xfi` for XDEFI/Ctrl-compatible dApps

## Provider Detection

### EIP-6963 (Recommended for Ethereum)

Vultisig Extension announces itself via [EIP-6963](https://eips.ethereum.org/EIPS/eip-6963), the standard for multi-wallet discovery. This is the recommended detection method for Ethereum dApps:

```javascript
window.addEventListener("eip6963:announceProvider", (event) => {
  const { info, provider } = event.detail;
  if (info.rdns === "me.vultisig") {
    console.log("Vultisig Extension found:", info.name);
    // Use provider for Ethereum interactions
  }
});

// Trigger announcement
window.dispatchEvent(new Event("eip6963:requestProvider"));
```

Provider announcement details:

- `rdns`: `me.vultisig`
- `name`: `Vultisig`

### Legacy Detection

```javascript
// Ethereum
if (window.vultisig?.ethereum) {
  console.log("Vultisig Extension Ethereum provider available");
} else if (window.ethereum?.isVultiConnect) {
  console.log("Vultisig Extension is the default Ethereum provider");
}

// Other chains
if (window.vultisig?.[chain]) {
  console.log(`Vultisig Extension ${chain} provider available`);
}

// Keplr (Cosmos)
if (window.keplr?.isVulticonnect) {
  console.log("Vultisig Extension Keplr-compatible provider available");
}

// TronLink
if (window.tronLink?.isVultiConnect) {
  console.log("Vultisig Extension TronLink-compatible provider available");
}
```

## Supported Methods

### Ethereum (`window.vultisig.ethereum`)

Also available via `window.ethereum` when Vultisig is the default provider.

**Account Management:**
- `eth_accounts`
- `eth_requestAccounts`

**Chain Management:**
- `eth_chainId`
- `net_version`
- `wallet_addEthereumChain`
- `wallet_switchEthereumChain`

**Transaction Management:**
- `eth_sendTransaction`
- `eth_getTransactionByHash`
- `eth_getTransactionReceipt`
- `eth_getTransactionCount`
- `eth_estimateGas`

**Signing:**
- `personal_sign`
- `eth_signTypedData_v4` (EIP-712 typed data signing)

**Read Methods:**
- `eth_blockNumber`
- `eth_call`
- `eth_gasPrice`
- `eth_maxPriorityFeePerGas`
- `eth_feeHistory`
- `eth_getBalance`
- `eth_getBlockByNumber`
- `eth_getBlockByHash`
- `eth_getCode`
- `eth_getStorageAt`
- `eth_getLogs`

**Permissions (EIP-2255):**
- `wallet_getPermissions`
- `wallet_requestPermissions`
- `wallet_revokePermissions`

**Other:**
- `wallet_watchAsset` (EIP-747 token addition)
- `wallet_getCapabilities`

### THORChain (`window.vultisig.thorchain`)

**Account Management:**
- `request_accounts`
- `get_accounts`

**Transaction Management:**
- `send_transaction`
- `deposit_transaction` (for bond, unbond, etc.)
- `deposit` (alternative deposit interface with `recipient` field)
- `get_transaction_by_hash`

### Solana (`window.vultisig.solana`)

Vultisig implements the full [Solana Wallet Standard](https://github.com/wallet-standard/wallet-standard). The provider is also registered via `registerWallet()` for automatic discovery by Wallet Standard-compatible dApps.

**Wallet Standard Features:**
- `standard:connect`
- `standard:disconnect`
- `standard:events`
- `solana:signAndSendTransaction` (legacy + versioned transactions)
- `solana:signTransaction`
- `solana:signMessage`
- `solana:signIn` (Sign In With Solana / SIWS)

**Legacy request() API:**
- `request_accounts`
- `get_accounts`
- `send_transaction`
- `get_transaction_by_hash`

**Direct methods (Phantom-compatible):**
- `connect()`
- `disconnect()`
- `signTransaction(transaction)`
- `signAllTransactions(transactions)`
- `signAndSendTransaction(transaction, options)`
- `signMessage(message)` -- returns `{ signature: Uint8Array }`
- `signIn(input)` -- SIWS, returns `SolanaSignInOutput`

### Cosmos-Based Chains (DyDx, GaiaChain, Kujira, Osmosis)

Accessible via `window.vultisig.cosmos`.

**Account Management:**
- `request_accounts`
- `get_accounts`

**Chain Management:**
- `wallet_add_chain`
- `wallet_switch_chain`

**Transaction Management:**
- `send_transaction`
- `get_transaction_by_hash`

**Note**: Cosmos uses a shared provider. Switch to the target chain via `wallet_switch_chain` before interacting. The active chain determines which address is returned.

### Keplr Compatibility (`window.keplr`)

The extension exposes a full [Keplr](https://docs.keplr.app/api/)-compatible provider for Cosmos ecosystem dApps:

- `enable(chainIds)` -- connect to one or more chains
- `getKey(chainId)` -- get account key info (address, pubkey, name)
- `getOfflineSigner(chainId)` -- get offline signer for direct + amino signing
- `getOfflineSignerOnlyAmino(chainId)` -- amino-only offline signer
- `signAmino(chainId, signer, signDoc)` -- amino transaction signing
- `signDirect(chainId, signer, signDoc)` -- direct/protobuf transaction signing
- `experimentalSuggestChain(chainInfo)` -- accepted but no-op

**Supported message types for `signDirect`:**
- `MsgSend`
- `MsgExecuteContract` (CosmWasm)
- `MsgTransfer` (IBC)
- `THORChain MsgDeposit`
- `THORChain MsgSend`

### UTXO Chains (Bitcoin, BitcoinCash, Dogecoin, Litecoin, Zcash)

Accessible via `window.vultisig.bitcoin`, `window.vultisig.bitcoincash`, `window.vultisig.dogecoin`, `window.vultisig.litecoin`, `window.vultisig.zcash`.

**Account Management:**
- `request_accounts`
- `get_accounts`

**Transaction Management:**
- `send_transaction`
- `get_transaction_by_hash`

**PSBT Signing (Bitcoin):**
- `signPSBT(psbt, { inputsToSign }, broadcast)` -- sign a PSBT with optional input selection
- `signPsbt({ psbt, broadcast, signInputs, allowedSignHash })` -- XDEFI/Ctrl-compatible PSBT signing
- `bitcoin_signPsbt` via `request()` -- method-based PSBT signing

PSBT signing is used for ordinals, inscriptions, and advanced Bitcoin transactions.

### Tron (`window.tronLink` and `window.tronWeb`)

The extension provides a full TronLink-compatible interface. When Vultisig is set as the default provider, `window.tronLink` and `window.tronWeb` are injected.

**TronLink:**
- `tron_requestAccounts` -- connect and get address

**TronWeb (via `window.tronWeb.trx`):**
- `sign(transaction)` -- sign a Tron transaction (TransferContract, TriggerSmartContract, TransferAssetContract)
- `signMessage(message)` -- sign a message
- `signMessageV2(message)` -- sign a message (v2 format)

Supports TRC20 token transfers with automatic decoding and contract interaction.

### Polkadot (`window.vultisig.polkadot`)

**Account Management:**
- `request_accounts`
- `get_accounts`

**Transaction Management:**
- `send_transaction`
- `get_transaction_by_hash`

### Ripple (`window.vultisig.ripple`)

**Account Management:**
- `request_accounts`
- `get_accounts`

**Transaction Management:**
- `send_transaction`
- `get_transaction_by_hash`

### MayaChain (`window.vultisig.mayachain`)

**Account Management:**
- `request_accounts`
- `get_accounts`

**Transaction Management:**
- `send_transaction`
- `get_transaction_by_hash`

### Dash (`window.vultisig.dash`)

**Account Management:**
- `request_accounts`
- `get_accounts`

**Transaction Management:**
- `send_transaction`
- `get_transaction_by_hash`

### QBTC (`window.vultisig.qbtc` and `window.keplr`)

QBTC is a post-quantum Cosmos SDK chain that signs with **ML-DSA-44** rather than secp256k1/ed25519. Vultisig exposes QBTC via two complementary surfaces:

- **`window.vultisig.qbtc`** -- recommended QBTC-native provider with explicit MLDSA semantics. Use this when you control the dApp client.
- **`window.keplr`** (chainId `qbtc-testnet`) -- compatibility route for Keplr-shape dApps and cosmjs / cosmos-kit clients that can't be modified. The Keplr `algo` field is reported as `secp256k1` because the Keplr `Algo` union has no MLDSA enum, but the `pubKey` bytes returned are the real ML-DSA-44 key (see "Public key shape" below).

**Account Management (`window.vultisig.qbtc`):**
- `request_accounts` -- connect and return the QBTC bech32 address
- `get_accounts` -- return the currently authorized QBTC address (or `[]`)

**Transaction Management (`window.vultisig.qbtc`):**
- `send_transaction` -- sign and broadcast a QBTC transaction; returns the tx hash
- `get_transaction_by_hash`

**Keplr-compat methods (`window.keplr`):**
- `enable('qbtc-testnet')`
- `getKey('qbtc-testnet')` / `getOfflineSigner('qbtc-testnet').getAccounts()`
- `signDirect(chainId, signer, signDoc)` / `signAmino(chainId, signer, signDoc)`

**Vault requirement (important):** QBTC requires the user's vault to carry an ML-DSA public key (`vault.publicKeyMldsa`). MLDSA keygen is gated by the `Enable MLDSA` toggle in Vultisig Developer Options at vault creation time -- vaults created with the toggle off cannot use QBTC on either surface. If a dApp calls `window.vultisig.qbtc.request({ method: 'request_accounts' })` against a vault without MLDSA support, the provider rejects with:

```text
EIP1193Error: QBTC requires an MLDSA-enabled vault. Enable MLDSA in
Vultisig Developer Options and create a new vault.
code: 4100 (Unauthorized)
```

**Public key shape:** Unlike other chains, the `publicKey` (or Keplr `pubKey`) returned for QBTC is the raw ML-DSA-44 hex public key (~1312 bytes), not a 33-byte compressed secp256k1 key. dApps verifying signatures must use ML-DSA-44 verification regardless of which surface they used; the `algo: 'secp256k1'` tag reported by `window.keplr.getKey('qbtc-testnet')` is a compatibility shim and does not describe the actual signing algorithm.

### Plugin Provider (`window.vultisig.plugin`)

For Vultisig Marketplace plugin developers:

- `personal_sign([message, account, type?, pluginId?])` -- sign a message with optional policy type. When `type` is `"policy"`, `pluginId` is required.
- `reshare_sign([{ id, dAppSessionId, encryptionKeyHex }])` -- initiate plugin reshare signing

### Additional Provider Surfaces

Vultisig also exposes ecosystem-specific discovery surfaces that supplement
the generic provider contracts documented above:

- **Cardano:** the generic provider is `window.vultisig.cardano`. CIP-30 dApps
  can discover Vultisig at `window.cardano.vultisig`; when Vultisig is
  prioritized, the extension also exposes the legacy `window.cardano.lace`
  alias.
- **Sui:** the provider is available directly at `window.vultisig.sui` and is
  registered through Sui Wallet Standard when the current vault supports Sui.
  When prioritized, it is also available at `window.phantom.sui`.
- **TON:** TON Connect-compatible dApps can use
  `window.vultisig.ton.tonconnect` or `window.tonkeeper.tonconnect`.
- **Bittensor:** the direct provider is `window.vultisig.bittensor`. When
  prioritized, Substrate-compatible dApps can also discover it at
  `window.injectedWeb3.bittensor`.
- **Terra / Station:** the direct provider is `window.vultisig.station`.
  Compatibility injection also supplies guarded `window.station` and
  `window.terra` globals, Station detection flags, and entries in the
  `terraWallets` and `interchainWallets` discovery arrays.
- **XRPL / GemWallet:** when `window.gemWallet` is unclaimed, the extension
  installs the GemWallet-compatible presence marker and message bridge. The
  bridge supports the GemWallet `isInstalled`, `getAddress`, `getPublicKey`,
  and `getNetwork` request types; transaction requests use
  `window.vultisig.ripple`.

Guarded aliases defer to wallets that were injected earlier. Prioritized
compatibility aliases can replace configurable globals; use the
`window.vultisig.*` namespace when you want to select Vultisig explicitly.

## Wallet Compatibility Layers

The extension exposes the compatibility layers below. The notes distinguish
surfaces that are always available from aliases added only when Vultisig is
the prioritized wallet:

| Window Object | Compatibility | Notes |
|--------------|---------------|-------|
| `window.ethereum` | MetaMask | Guarded direct provider; prioritized routing when selected |
| `window.keplr` | Keplr | Guarded full API; not priority-gated |
| `window.phantom` | Phantom | Prioritized only; Solana and Sui require those chains in the current vault |
| `window.cardano.vultisig` | Cardano CIP-30 | Direct Cardano discovery |
| Sui Wallet Standard | Sui | Registered when the current vault supports Sui |
| `window.tonkeeper.tonconnect` | TON Connect | Guarded TON wallet discovery |
| `window.injectedWeb3.bittensor` | Substrate | Present when Vultisig is prioritized |
| `window.station` / `window.terra` | Station | Guarded Terra compatibility globals; not priority-gated |
| `window.gemWallet` | GemWallet / XRPL | Guarded presence marker and request bridge; not priority-gated |
| `window.tronLink` | TronLink | Prioritized only; `isTronLink = true` |
| `window.tronWeb` | TronWeb | Prioritized only; full TronWeb instance |
| `window.xfi` | XDEFI/Ctrl | Prioritized only; all providers |
| `window.vultiConnectRouter` | Multi-wallet | Prioritized only; routes injected EVM wallets |

### Multi-Wallet Router

When other wallets are present alongside Vultisig, `window.vultiConnectRouter` manages priority:

```javascript
// Check the router
const router = window.vultiConnectRouter;

// Switch to Vultisig
router.setDefaultProvider(true);

// Switch to other wallet
router.setDefaultProvider(false);

// Access all available providers
router.providers; // [ethereumProvider, otherProvider, ...]
```

## Steps to Integrate with Vultisig Extension

### 1. Connecting to Vultisig Extension

#### Ethereum

```javascript
const connectEthereum = async () => {
  const provider = window.vultisig?.ethereum || window.ethereum;

  if (provider) {
    try {
      const accounts = await provider.request({
        method: "eth_requestAccounts",
      });
      console.log("Connected:", accounts);
    } catch (error) {
      console.error("Connection failed", error);
    }
  }
};
```

#### Solana (Wallet Standard)

```javascript
// Using @solana/wallet-adapter
import { useWallet } from "@solana/wallet-adapter-react";

// Vultisig is auto-discovered via Wallet Standard registration
const { connect, publicKey } = useWallet();
await connect();
```

#### Solana (Direct)

```javascript
const connectSolana = async () => {
  const provider = window.vultisig?.solana;
  if (provider) {
    const { publicKey } = await provider.connect();
    console.log("Connected:", publicKey.toString());
  }
};
```

#### Cosmos (via Keplr API)

```javascript
const connectCosmos = async () => {
  if (window.keplr) {
    await window.keplr.enable("cosmoshub-4");
    const key = await window.keplr.getKey("cosmoshub-4");
    console.log("Connected:", key.bech32Address);
  }
};
```

#### Tron

```javascript
const connectTron = async () => {
  if (window.tronLink) {
    const result = await window.tronLink.request({
      method: "tron_requestAccounts",
    });
    console.log("Connected:", result.data.address);
  }
};
```

#### Other Chains

```javascript
const connectChain = async (chain) => {
  const provider = window.vultisig?.[chain];

  if (provider) {
    const accounts = await provider.request({ method: "request_accounts" });
    console.log(`Connected to ${chain}:`, accounts);
  }
};
```

#### QBTC

```javascript
const connectQbtc = async () => {
  const provider = window.vultisig?.qbtc;
  if (!provider) {
    console.error("Vultisig QBTC provider not available");
    return;
  }

  try {
    const [address] = await provider.request({ method: "request_accounts" });
    console.log("Connected QBTC address:", address);
  } catch (error) {
    if (error.code === 4100) {
      // Unauthorized -- most commonly: vault has no ML-DSA key.
      // Tell the user to enable MLDSA in Developer Options and create
      // a new vault.
      alert(error.message);
    } else if (error.code === 4001) {
      console.log("User rejected the QBTC connection");
    } else {
      throw error;
    }
  }
};

// Send a QBTC transaction
const sendQbtc = async ({ from, to, value, memo }) => {
  const hash = await window.vultisig.qbtc.request({
    method: "send_transaction",
    params: [{ from, to, value, memo }],
  });
  console.log("QBTC tx hash:", hash);
  return hash;
};
```

#### QBTC via Keplr compatibility

Use this route when a Keplr-shape dApp or a cosmjs / cosmos-kit client needs to talk to QBTC without code changes:

```javascript
const connectQbtcViaKeplr = async () => {
  if (!window.keplr) {
    console.error("Keplr-compat surface not available");
    return;
  }

  await window.keplr.enable("qbtc-testnet");
  const key = await window.keplr.getKey("qbtc-testnet");
  console.log("QBTC address:", key.bech32Address);
  // key.pubKey is the raw ML-DSA-44 public key (~1312 bytes).
  // key.algo is reported as 'secp256k1' for Keplr API compatibility;
  // verify signatures with ML-DSA-44 regardless.

  const signer = window.keplr.getOfflineSigner("qbtc-testnet");
  // Use `signer` with cosmjs's StargateClient.connectWithSigner to broadcast.
};
```

### 2. Connected Accounts

Use `eth_accounts` for EVM chains and `get_accounts` for other chains.

```javascript
// Ethereum
const accounts = await window.vultisig.ethereum.request({
  method: "eth_accounts",
});
```

```javascript
// Other chains
const chainAccounts = await window.vultisig[chain].request({
  method: "get_accounts",
});
```

### 3. Managing Active Chain

#### Ethereum

```javascript
// Get current chain
const chainId = await window.vultisig.ethereum.request({
  method: "eth_chainId",
});

// Switch chain
await window.vultisig.ethereum.request({
  method: "wallet_switchEthereumChain",
  params: [{ chainId: "0x1" }],
});
```

#### Cosmos

```javascript
// Switch to Osmosis
await window.vultisig.cosmos.request({
  method: "wallet_switch_chain",
  params: [{ chainId: "osmosis-1" }],
});
```

**Note**: UTXO, Solana, Polkadot, Ripple, and THORChain providers have a single chain each and don't support chain switching.

### 4. Handling Transactions

#### Transaction Details Structure

```typescript
interface Transaction {
  from: string; // Sender address
  to: string; // Receiver address
  value?: string; // Amount in hex (EVM) or native format
  data?: string; // Calldata or memo
  gasLimit?: string; // EVM gas limit (hex)
  maxPriorityFeePerGas?: string; // EIP-1559 priority fee (hex)
  maxFeePerGas?: string; // EIP-1559 max fee (hex)
}
```

#### Ethereum

```javascript
const txHash = await window.vultisig.ethereum.request({
  method: "eth_sendTransaction",
  params: [
    {
      from: "0x1234...5678",
      to: "0xabcd...ef12",
      value: "0x0",
      data: "0x",
    },
  ],
});
```

#### THORChain

```javascript
// Regular send
const hash = await window.vultisig.thorchain.request({
  method: "send_transaction",
  params: [
    {
      from: "thor1...",
      to: "thor1...",
      value: "1000000",
      data: "memo here",
    },
  ],
});

// Deposit (bond, unbond, etc.)
const hash = await window.vultisig.thorchain.request({
  method: "deposit_transaction",
  params: [
    {
      from: "thor1...",
      to: "thor1...",
      value: "1000000",
      memo: "BOND:thor1...",
      data: "BOND:thor1...",
    },
  ],
});
```

#### Cosmos Non-Native Tokens

```javascript
// Sending RUJI on THORChain
const txDetails = {
  from: "thor1...",
  to: "thor1...",
  asset: {
    chain: "THORChain",
    ticker: "x/ruji",
  },
  amount: {
    amount: 100000,
    decimals: 8,
  },
  data: "", // Optional memo
};

// Sending IBC token on Cosmos
const txDetails = {
  from: "cosmos1...",
  to: "cosmos1...",
  asset: {
    chain: "Cosmos",
    ticker: "ibc/4CC44260793F84006656DD868E017578F827A492978161DA31D7572BCB3F4289",
  },
  amount: {
    amount: 100000,
    decimals: 6,
  },
  data: "",
};
```

#### Solana

```javascript
// Using signAndSendTransaction (Phantom-compatible)
const { signature } = await window.vultisig.solana.signAndSendTransaction(
  transaction
);

// Using signTransaction (sign only, no broadcast)
const signedTx = await window.vultisig.solana.signTransaction(transaction);

// Batch sign
const signedTxs = await window.vultisig.solana.signAllTransactions([
  tx1,
  tx2,
]);
```

#### Bitcoin PSBT

```javascript
// Sign a PSBT
const signedPsbt = await window.vultisig.bitcoin.signPsbt({
  psbt: base64EncodedPsbt,
  broadcast: false,
  signInputs: {
    bc1q...: [0, 1], // address -> input indexes
  },
});
```

## Custom Message Signing

### Ethereum -- personal_sign

```javascript
const signature = await window.vultisig.ethereum.request({
  method: "personal_sign",
  params: [hexMessage, walletAddress],
});
```

### Ethereum -- eth_signTypedData_v4 (EIP-712)

```javascript
const signature = await window.vultisig.ethereum.request({
  method: "eth_signTypedData_v4",
  params: [
    walletAddress,
    JSON.stringify({
      types: {
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
          { name: "chainId", type: "uint256" },
          { name: "verifyingContract", type: "address" },
        ],
        // ... your types
      },
      primaryType: "YourType",
      domain: {
        /* ... */
      },
      message: {
        /* ... */
      },
    }),
  ],
});
```

### Solana -- signMessage

```javascript
const { signature } = await window.vultisig.solana.signMessage(
  new TextEncoder().encode("Hello, Vultisig!")
);
```

### Solana -- Sign In With Solana (SIWS)

```javascript
const result = await window.vultisig.solana.signIn({
  domain: "example.com",
  statement: "Sign in to Example",
});
// result: { account, signedMessage, signature, signatureType: 'ed25519' }
```

### Tron -- signMessage

```javascript
// Sign via TronWeb
const signature = await window.tronWeb.trx.sign("message to sign");

// signMessageV2
const signature = await window.tronWeb.trx.signMessageV2("message to sign");
```

### Cosmos -- signAmino / signDirect (via Keplr)

```javascript
// Amino signing
const { signed, signature } = await window.keplr.signAmino(
  chainId,
  signerAddress,
  signDoc
);

// Direct (protobuf) signing
const { signed, signature } = await window.keplr.signDirect(
  chainId,
  signerAddress,
  signDoc
);
```

## Querying Transactions

### Ethereum

```javascript
const tx = await window.vultisig.ethereum.request({
  method: "eth_getTransactionByHash",
  params: [txHash],
});

const receipt = await window.vultisig.ethereum.request({
  method: "eth_getTransactionReceipt",
  params: [txHash],
});
```

### Other Chains

```javascript
const tx = await window.vultisig[chain].request({
  method: "get_transaction_by_hash",
  params: [txHash],
});
```

## Event Handling

### Ethereum Events

```javascript
const provider = window.vultisig.ethereum;

// Account changed
provider.on("accountsChanged", (accounts) => {
  console.log("Accounts:", accounts);
});

// Chain changed
provider.on("chainChanged", (chainId) => {
  console.log("Chain:", chainId);
});

// Connected
provider.on("connect", (info) => {
  console.log("Connected:", info.chainId);
});

// Disconnected
provider.on("disconnect", (error) => {
  console.log("Disconnected:", error);
});

// Network changed (legacy)
provider.on("networkChanged", (networkId) => {
  console.log("Network:", networkId);
});
```

### Solana Events (Wallet Standard)

```javascript
const provider = window.vultisig.solana;

const unsubscribe = provider.on("change", ({ accounts }) => {
  console.log("Accounts changed:", accounts);
});

// Unsubscribe
unsubscribe();
```

### Keplr Events

```javascript
window.addEventListener("keplr_keystorechange", () => {
  console.log("Keplr keystore changed");
});
```

## Get Vault

```javascript
// Get current vault info
const vault = await window.vultisig.getVault();
console.log("Vault:", vault);

// Get all vaults (triggers popup for user selection)
const vaults = await window.vultisig.getVaults();
console.log("Vaults:", vaults);
```

## Error Handling

All methods can throw errors with the following structure:

```typescript
interface ProviderError {
  code: number;
  message: string;
}
```

Common error codes:

| Code | Meaning |
|------|---------|
| 4001 | User rejected the request |
| 4100 | Unauthorized |
| 4200 | Unsupported method |
| 4900 | Disconnected |
| 4901 | Chain disconnected |
| -32000 | Missing or invalid parameters |
| -32603 | Function not supported |

## Detailed Implementation Examples

### Ethereum Account Management

```typescript
// Connect
const accounts = await window.vultisig.ethereum.request({
  method: "eth_requestAccounts",
});
// Returns: ['0x14F6Ed6CBb27b607b0E2A48551A988F1a19c89B6']

// Get balance
const balance = await window.vultisig.ethereum.request({
  method: "eth_getBalance",
  params: [address, "latest"],
});

// Get transaction count (nonce)
const nonce = await window.vultisig.ethereum.request({
  method: "eth_getTransactionCount",
  params: [address, "latest"],
});
```

### Ethereum Gas Management

```typescript
// Estimate gas
const gasEstimate = await window.vultisig.ethereum.request({
  method: "eth_estimateGas",
  params: [transaction],
});

// Get gas price (legacy)
const gasPrice = await window.vultisig.ethereum.request({
  method: "eth_gasPrice",
});

// Get max priority fee (EIP-1559)
const maxPriorityFee = await window.vultisig.ethereum.request({
  method: "eth_maxPriorityFeePerGas",
});

// Get fee history
const feeHistory = await window.vultisig.ethereum.request({
  method: "eth_feeHistory",
  params: [blockCount, "latest", rewardPercentiles],
});
```

### Block Information

```typescript
const blockNumber = await window.vultisig.ethereum.request({
  method: "eth_blockNumber",
});

const block = await window.vultisig.ethereum.request({
  method: "eth_getBlockByNumber",
  params: ["latest", false], // false = don't include full tx objects
});
```

### Contract Interaction

```typescript
// Read contract (no signing required)
const result = await window.vultisig.ethereum.request({
  method: "eth_call",
  params: [{ to: contractAddress, data: encodedCalldata }, "latest"],
});

// Get contract code
const code = await window.vultisig.ethereum.request({
  method: "eth_getCode",
  params: [contractAddress, "latest"],
});

// Get storage
const storage = await window.vultisig.ethereum.request({
  method: "eth_getStorageAt",
  params: [contractAddress, "0x0", "latest"],
});

// Get logs
const logs = await window.vultisig.ethereum.request({
  method: "eth_getLogs",
  params: [{ fromBlock: "0x0", toBlock: "latest", address: contractAddress }],
});
```

### Token Management

```typescript
// Watch a token (add to wallet display)
await window.vultisig.ethereum.request({
  method: "wallet_watchAsset",
  params: {
    type: "ERC20",
    options: {
      address: tokenAddress,
      symbol: "TOKEN",
      decimals: 18,
    },
  },
});
```

## Summary

Vultisig Extension provides secure multi-chain dApp integration with:

- **EIP-1193** compliance for Ethereum provider API
- **EIP-6963** for multi-wallet discovery
- **EIP-712** support via `eth_signTypedData_v4`
- **EIP-2255** permissions management
- **Solana Wallet Standard** compliance
- **Keplr API** compatibility for Cosmos ecosystem
- **TronLink/TronWeb** compatibility for Tron ecosystem
- **Phantom** compatibility for multi-chain dApps
- **PSBT signing** for advanced Bitcoin transactions

Provider requests use the selected vault's configured custody and signing
flow.
