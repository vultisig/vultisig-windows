# VultiConnect Integration Guide

## Table of Contents

- [VultiConnect Integration Guide](#vulticonnect-integration-guide)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Supported Chains](#supported-chains)
  - [How VultiConnect Works](#how-vulticonnect-works)
  - [Supported Methods](#supported-methods)
    - [Ethereum (`window.vultisig.ethereum`)](#ethereum-windowvultisigethereum)
    - [THORChain (`window.vultisig.thorchain` and `window.thorchain`)](#thorchain-windowvultisigthorchain-and-windowthorchain)
    - [Solana (`window.vultisig.solana` and `window.solana`)](#solana-windowvultisigsolana-and-windowsolana)
    - [Cosmos-Based Chains (DyDx, GaiaChain, Kujira, Osmosis)](#cosmos-based-chains-dydx-gaiachain-kujira-osmosis)
    - [Other Chains (`window.vultisig[chain]`)](#other-chains-windowvultisigchain)
      - [Supported Chains](#supported-chains-1)
  - [Steps to Integrate with VultiConnect](#steps-to-integrate-with-vulticonnect)
    - [1. Detect VultiConnect Support](#1-detect-vulticonnect-support)
    - [2. Connecting to VultiConnect](#2-connecting-to-vulticonnect)
      - [Ethereum](#ethereum)
      - [Other Supported Chains](#other-supported-chains)
    - [3. Connected Accounts](#3-connected-accounts)
      - [Ethereum](#ethereum-1)
      - [Other Supported Chains](#other-supported-chains-1)
    - [4. Managing Active Chain](#4-managing-active-chain)
      - [Ethereum](#ethereum-2)
      - [Cosmos-Based Chains](#cosmos-based-chains)
    - [5. Handling Transactions](#5-handling-transactions)
      - [Transaction Details Structure](#transaction-details-structure)
      - [Ethereum](#ethereum-3)
      - [Other Supported Chains](#other-supported-chains-2)
      - [THORChain](#thorchain)
  - [6. Custom Message Signing](#6-custom-message-signing)
    - [Ethereum](#ethereum-4)
  - [7. Querying Transactions](#7-querying-transactions)
    - [Ethereum](#ethereum-5)
    - [Other Supported Chains](#other-supported-chains-3)
  - [8. Event Handling](#8-event-handling)
  - [9. Detailed Implementation Examples](#9-detailed-implementation-examples)
    - [Transaction Object Structure](#transaction-object-structure)
    - [Ethereum Account Management Examples](#ethereum-account-management-examples)
    - [Ethereum Gas Management Examples](#ethereum-gas-management-examples)
    - [Block Information Examples](#block-information-examples)
    - [Contract Interaction Examples](#contract-interaction-examples)
  - [Error Handling](#error-handling)
  - [Summary](#summary)

---

## Introduction

VultiConnect is a Chrome extension that enhances the experience of interacting with decentralized finance (DeFi) applications. It offers a secure way for users to connect with decentralized applications without storing private keys in their browsers. VultiConnect introduces:

- **`window.vultisig.ethereum`** for Ethereum integrations (previously `window.vultisig`).
- **`window.vultisig.thorchain` and `window.thorchain`** for THORChain support.
- A MetaMask-compatible interface (`window.ethereum`) to ensure seamless integration with existing DeFi applications.
- Support for multiple other chains including MayaChain, GaiaChain, Osmosis, Kujira, DyDx, BitcoinCash, Dash, DogeCoin, LiteCoin, and Bitcoin.

## Supported Chains

VultiConnect currently supports the following chains:

| Chain       | Identifier            |
| ----------- | --------------------- |
| Bitcoin     | `0x1f96`              |
| BitcoinCash | `0x2710`              |
| Dash        | `Dash_dash`           |
| DogeCoin    | `0x7d0`               |
| DyDx        | `dydx-1`              |
| Ethereum    | `0x1`                 |
| GaiaChain   | `cosmoshub-4`         |
| Kujira      | `kaiyo-1`             |
| LiteCoin    | `Litecoin_litecoin`   |
| MayaChain   | `MayaChain-1`         |
| Osmosis     | `osmosis-1`           |
| Polkadot    | `Polkadot_polkadot`   |
| Ripple      | `Ripple_ripple`       |
| Solana      | `Solana_mainnet-beta` |
| THORChain   | `Thorchain_thorchain` |
| Zcash       | `Zcash_zcash`         |

## How VultiConnect Works

- **Private Key Security**: VultiConnect does not store private keys. Instead, transactions are converted to QR codes that users can scan and sign using VultiSig peer devices.
- **Compatibility**: The extension provides:
  - `window.ethereum` for MetaMask-compatible Ethereum integration.
  - `window.vultisig.ethereum` for VultiConnect-enhanced Ethereum features.
  - `window.vultisig.thorchain` and `window.thorchain` for THORChain functionality.
  - Additional chain support for other chains using `window.vultisig.chain` and `window.chain`.

## Supported Methods

### Ethereum (`window.vultisig.ethereum`)

- **Account Management**:
  - `eth_accounts`
  - `eth_requestAccounts`
- **Chain Management**:
  - `eth_chainId`
  - `wallet_addEthereumChain`
  - `wallet_switchEthereumChain`
- **Transaction Management**:
  - `eth_sendTransaction`
  - `eth_getTransactionByHash`
  - `eth_estimateGas`
- **Other Methods**:
  - `eth_blockNumber`
  - `eth_call`
  - `eth_gasPrice`
  - `eth_getBalance`
  - `eth_getBlockByNumber`
  - `eth_getCode`
  - `eth_getTransactionCount`
  - `eth_getTransactionReceipt`
  - `eth_maxPriorityFeePerGas`
  - `personal_sign`

### THORChain (`window.vultisig.thorchain` and `window.thorchain`)

- **Account Management**:
  - `request_accounts`
  - `get_accounts`
- **Transaction Management**:
  - `send_transaction`
  - `deposit_transaction`
  - `get_transaction_by_hash`

### Solana (`window.vultisig.solana` and `window.solana`)

- **Account Management**:
  - `request_accounts`
  - `get_accounts`
- **Transaction Management**:
  - `send_transaction`
  - `get_transaction_by_hash`

### Cosmos-Based Chains (DyDx, GaiaChain, Kujira, Osmosis)

- **Account Management**:
  - `request_accounts`
  - `get_accounts`
  - `chain_id`
- **Chain Management**:
  - `wallet_add_chain`
  - `wallet_switch_chain`
- **Transaction Management**:
  - `send_transaction`
  - `get_transaction_by_hash`
- **Notes**: Accessing a specific Cosmos-based chain (such as Kujira or Osmosis) requires calling `chain_id` to retrieve the active chain's ID or using `wallet_add_chain` and `wallet_switch_chain` to add or switch to the desired chain.

### Other Chains (`window.vultisig[chain]`)

- **Account Management**:
  - `request_accounts`
  - `get_accounts`
- **Transaction Management**:
  - `send_transaction`
  - `get_transaction_by_hash`

#### Supported Chains

The following chains are fully supported through their respective interfaces:

- Bitcoin
- BitcoinCash
- Dash
- DogeCoin
- LiteCoin
- MayaChain

## Steps to Integrate with VultiConnect

### 1. Detect VultiConnect Support

```javascript
if (window.vultisig?.ethereum) {
  console.log('VultiConnect Ethereum provider is available!')
  // Integration logic for Ethereum
} else if (window.ethereum) {
  console.log('Ethereum provider available (MetaMask or VultiConnect)')
  // Fallback to MetaMask-compatible logic
}

if (window.vultisig?.[chain] || window[chain]) {
  console.log(`VultiConnect [${chain}] provider is available!`)
  // Integration logic for the chain
} else {
  console.log(`No compatible [${chain}] provider found.`)
}
```

### 2. Connecting to VultiConnect

#### Ethereum

```javascript
const connectEthereum = async () => {
  const provider = window.vultisig?.ethereum || window.ethereum

  if (provider) {
    try {
      await provider.request({ method: 'eth_requestAccounts' })

      console.log('Connected to Ethereum wallet')
    } catch (error) {
      console.error('Ethereum connection failed', error)
    }
  } else {
    alert(
      'No Ethereum provider found. Please install VultiConnect or MetaMask.'
    )
  }
}
```

#### Other Supported Chains

```javascript
const connectChain = async chain => {
  const provider = window.vultisig?.[chain]

  if (provider) {
    try {
      const accounts = await provider.request({ method: 'request_accounts' })

      console.log(`Connected to ${chain} wallet:`, accounts)
    } catch (error) {
      console.error(`${chain} connection failed`, error)
    }
  } else {
    alert(`No ${chain} provider found. Please install VultiConnect.`)
  }
}
```

Replace `chain` with the desired chain identifier such as `bitcoin`, `bitcoincash`, `cosmos`, `dash`, `dogecoin`, `litecoin`, `maya`, `solana`, `thorchain`, etc.

Each chain uses a unified interface accessible via `window.vultisig?.[chain]` and `window[chain]` for seamless interaction across different blockchain networks.

### 3. Connected Accounts

To get connected accounts to the current dapp, use `eth_accounts` for EVM chains and `get_accounts` for other VultiConnect supported chains.

#### Ethereum

```javascript
const getConnectedEthereum = async () => {
  const provider = window.vultisig?.ethereum || window.ethereum

  if (provider) {
    try {
      const accounts = await provider.request({ method: 'eth_accounts' })

      if (accounts.length) console.log(`Currently connected address:`, accounts)
      else
        console.log(`Currently no account is connected to this dapp:`, accounts)
    } catch (error) {
      console.error('Ethereum getting connected accounts failed', error)
    }
  } else {
    alert(
      'No Ethereum provider found. Please install VultiConnect or MetaMask.'
    )
  }
}
```

#### Other Supported Chains

```javascript
const getConnectedAccountsChain = async chain => {
  const provider = window.vultisig?.[chain] || window[chain]

  if (provider) {
    try {
      const accounts = await provider.request({
        method: 'get_accounts',
      })

      if (accounts.length) console.log(`Currently connected address:`, accounts)
      else
        console.log(`Currently no account is connected to this dapp:`, accounts)
    } catch (error) {
      console.error(`${chain} getting connected accounts failed`, error)
    }
  } else {
    alert(`No ${chain} provider found. Please install VultiConnect.`)
  }
}
```

### 4. Managing Active Chain

#### Ethereum

To get the current active chain ID of VultiConnect:

```javascript
const getEthereumChainId = async () => {
  if (window.vultisig?.ethereum) {
    try {
      const chainId = await window.vultisig.ethereum.request({
        method: 'eth_chainId',
      })

      console.log('Current Ethereum Chain ID: ', chainId)
    } catch (error) {
      console.error('Failed to get Ethereum chain ID', error)
    }
  }
}
```

To switch to a desired Ethereum chain:

```javascript
const switchEthereumChain = async chainId => {
  if (window.vultisig?.ethereum) {
    try {
      await window.vultisig.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      })

      console.log(`Switched to Ethereum Chain ID: ${chainId}`)
    } catch (error) {
      console.error('Failed to switch Ethereum chain', error)
    }
  }
}
```

#### Cosmos-Based Chains

To get the current chain ID:

```javascript
const getCosmosChainId = async () => {
  if (window.vultisig?.cosmos) {
    try {
      const chainId = await window.vultisig.cosmos.request({
        method: 'chain_id',
      })

      console.log('Current Cosmos Chain ID: ', chainId)
    } catch (error) {
      console.error('Failed to get Cosmos chain ID', error)
    }
  }
}
```

To switch to a desired Cosmos chain:

```javascript
const switchCosmosChain = async chainId => {
  if (window.vultisig?.cosmos) {
    try {
      await window.vultisig.cosmos.request({
        method: 'wallet_switch_chain',
        params: [{ chainId }],
      })

      console.log(`Switched to Cosmos Chain ID: ${chainId}`)
    } catch (error) {
      console.error('Failed to switch Cosmos chain', error)
    }
  }
}
```

**Note**

Since other providers do not have different active chains, there is no need to switch chains for them. Therefore, the methods `wallet_switch_chain` and `wallet_switchEthereumChain` are not supported for chains other than Cosmos-based and Ethereum.

### 5. Handling Transactions

#### Transaction Details Structure

The txDetails object used in the transaction methods has the following structure:

- from: The sender's Ethereum or chain-specific wallet address,
- to: The receiver's wallet address.
- data: Arbitrary data that can be included with the transaction (e.g., for contract interactions).
- value: The amount to transfer, represented in hexadecimal format (e.g., "0x1" for 1 wei).

Example:

```javascript
const txDetails = {
  from: '0x1234567890abcdef1234567890abcdef12345678',
  to: '0xabcdef1234567890abcdef1234567890abcdef12',
  data: '0x', // Optional data
  value: '0x0', // Sending 0 ETH/wei
}
```

Example of non-native tokens of THORChain and other Cosmos chains :

```javascript
// sending RUJI on THORChain

const txDetails = {
  from: "thor1249rpf9u2ulwuezxkh6uas4au7xnde8umdua5z",
  to: "thor1ch4rpf9u2ulwuezxkh6uas4au7xnde8umdua91",
  assset:{
    chain: "THORChain",
    ticker: "x/ruji"
  },
  amount:{
    amount: 100000,
    deciamls: 8
  }،
  data: "0x", // Optional memo data
};


// sending KUJI on Cosmos

const txDetails = {
  from: "cosmos1ditx650chvyn8vs70v8camcj3q7h7hxlsavo9z",
  to: "cosmos1ditx650chvyn8vs70v8camcj3q7h7hxlsavo9z",
  assset:{
    chain: "Cosmos",
    ticker: "ibc/4CC44260793F84006656DD868E017578F827A492978161DA31D7572BCB3F4289"
  },
  amount:{
    amount: 100000,
    deciamls: 6
  }،
  data: "0x", // Optional memo data
};

// sending ION on Osmosis

const txDetails = {
  from: "osmo5iosp650chvyn8vs70v8camcj3q7h7hyucxl0op",
  to: "osmo5iosp650chvyn8vs70v8camcj3q7h7hyucxl0op",
  assset:{
    chain: "Osmosis",
    ticker: "uion"
  },
  amount:{
    amount: 100000,
    deciamls: 6
  }،
  data: "0x", // Optional memo data
};

```

#### Ethereum

```javascript
const sendEthereumTransaction = async txDetails => {
  if (window.vultisig?.ethereum) {
    try {
      const transactionHash = await window.vultisig.ethereum.request({
        method: 'eth_sendTransaction',
        params: [txDetails],
      })

      console.log('Ethereum Transaction Hash: ', transactionHash)
    } catch (error) {
      console.error('Ethereum transaction failed', error)
    }
  }
}
```

#### Other Supported Chains

```javascript
const sendChainTransaction = async (chain, txDetails) => {
  const provider = window.vultisig?.[chain] || window[chain]
  if (provider) {
    try {
      const transactionHash = await provider.request({
        method: 'send_transaction',
        params: [txDetails],
      })

      console.log(`${chain} Transaction Hash:`, transactionHash)
    } catch (error) {
      console.error(`${chain} transaction failed`, error)
    }
  }
}
```

#### THORChain

In addition to send transactions, THORChain supports deposit transactions for operations such as `bond`, `unbond`, etc.

```javascript
const THORChainDepositTransaction = async txDetails => {
  const provider = window.thorchain || window.vultisig.thorchain
  if (provider) {
    try {
      const transactionHash = await provider.request({
        method: 'deposit_transaction',
        params: [txDetails],
      })

      console.log(`THORChain Transaction Hash:`, transactionHash)
    } catch (error) {
      console.error(`THORChain transaction failed`, error)
    }
  }
}
```

## 6. Custom Message Signing

### Ethereum

VultiConnect currently supports the `personal_sign` method.

```javascript
const signCustomMessage = async (hexMessage, walletAddress) => {
  if (window.vultisig?.ethereum) {
    try {
      const signature = await window.vultisig.ethereum.request({
        method: 'personal_sign',
        params: [hexMessage, walletAddress],
      })

      console.log('Signature:', signature)
    } catch (error) {
      console.error('Failed to sign the message', error)
    }
  }
}
```

## 7. Querying Transactions

### Ethereum

Retrieve Ethereum transaction details with `eth_getTransactionByHash`.

```javascript
const getEthereumTransaction = async txHash => {
  if (window.vultisig?.ethereum) {
    try {
      const txDetails = await window.vultisig.ethereum.request({
        method: 'eth_getTransactionByHash',
        params: [txHash],
      })

      console.log('Ethereum Transaction Details:', txDetails)
    } catch (error) {
      console.error('Failed to get Ethereum transaction details:', error)
    }
  }
}
```

### Other Supported Chains

Retrieve transaction details of other VultiConnect supported chains using `get_transaction_by_hash`.

```javascript
const getChainTransaction = async (chain, txHash) => {
  const provider = window.vultisig?.[chain] || window[chain]
  if (provider) {
    try {
      const txDetails = await provider.request({
        method: 'get_transaction_by_hash',
        params: [txHash],
      })

      console.log('Transaction Details:', txDetails)
    } catch (error) {
      console.error('Failed to get transaction details:', error)
    }
  }
}
```

## 8. Event Handling

VultiConnect supports the CONNECT and DISCONNECT events for all supported chains.

```javascript
const provider = window.vultisig?.[chain] || window[chain]

if (provider) {
  provider.on('CONNECT', info => {
    console.log('Connected:', info)
  })

  provider.on('DISCONNECT', error => {
    console.log('Disconnected:', error)
  })
}
```

## 9. Detailed Implementation Examples

### Transaction Object Structure

```typescript
interface Transaction {
  from: string // The user's active address
  to: string // Required except during contract publications
  value?: string // Only required to send ether, in wei, hex format
  gasLimit?: string // Customizable by the user, hex format
  maxPriorityFeePerGas?: string // Customizable by the user, hex format
  maxFeePerGas?: string // Customizable by the user, hex format
  data?: string // Optional data for contract interactions, hex format
}
```

### Ethereum Account Management Examples

```typescript
// Connect to VultiConnect
const connectToVultiConnect = async () => {
  try {
    const accounts = await window.vultisig.ethereum.request({
      method: 'eth_requestAccounts',
    })
    console.log('Connected accounts:', accounts)
    // Returns: ['0x14F6Ed6CBb27b607b0E2A48551A988F1a19c89B6']
    return accounts
  } catch (error) {
    const { code, message } = error
    console.error(`Connection failed - Code: ${code}, Message: ${message}`)
    throw error
  }
}

// Get connected accounts
const getConnectedAccounts = async () => {
  try {
    const accounts = await window.vultisig.ethereum.request({
      method: 'eth_accounts',
    })
    console.log('Connected accounts:', accounts)
    // Returns: ['0x14F6Ed6CBb27b607b0E2A48551A988F1a19c89B6']
    return accounts
  } catch (error) {
    const { code, message } = error
    console.error(`Failed to get accounts - Code: ${code}, Message: ${message}`)
    throw error
  }
}

// Get account balance
const getAccountBalance = async (address: string, blockTag: string) => {
  try {
    const balance = await window.vultisig.ethereum.request({
      method: 'eth_getBalance',
      params: [address, blockTag],
    })
    console.log('Account balance:', balance)
    return balance // Returns balance as string digits
  } catch (error) {
    const { code, message } = error
    console.error(`Failed to get balance - Code: ${code}, Message: ${message}`)
    throw error
  }
}
```

### Ethereum Gas Management Examples

```typescript
// Estimate gas
const estimateGas = async (transaction: Transaction) => {
  try {
    const estimate = await window.vultisig.ethereum.request({
      method: 'eth_estimateGas',
      params: [transaction],
    })
    console.log('Gas estimate:', estimate)
    return estimate // Returns string digits
  } catch (error) {
    const { code, message } = error
    console.error(`Failed to estimate gas - Code: ${code}, Message: ${message}`)
    throw error
  }
}

// Get gas price
const getGasPrice = async () => {
  try {
    const gasPrice = await window.vultisig.ethereum.request({
      method: 'eth_gasPrice',
    })
    console.log('Gas price:', gasPrice)
    return gasPrice // Returns string digits
  } catch (error) {
    const { code, message } = error
    console.error(
      `Failed to get gas price - Code: ${code}, Message: ${message}`
    )
    throw error
  }
}

// Get max priority fee per gas
const getMaxPriorityFeePerGas = async () => {
  try {
    const maxFee = await window.vultisig.ethereum.request({
      method: 'eth_maxPriorityFeePerGas',
    })
    console.log('Max priority fee:', maxFee)
    return maxFee // Returns string digits
  } catch (error) {
    const { code, message } = error
    console.error(
      `Failed to get max priority fee - Code: ${code}, Message: ${message}`
    )
    throw error
  }
}
```

### Block Information Examples

```typescript
// Get latest block number
const getLatestBlockNumber = async () => {
  try {
    const blockNumber = await window.vultisig.ethereum.request({
      method: 'eth_blockNumber',
    })
    console.log('Latest block number:', blockNumber)
    return blockNumber // Returns string digits
  } catch (error) {
    const { code, message } = error
    console.error(
      `Failed to get block number - Code: ${code}, Message: ${message}`
    )
    throw error
  }
}

// Get block by number
const getBlockByNumber = async (blockTag: string, includeTxs: boolean) => {
  try {
    const block = await window.vultisig.ethereum.request({
      method: 'eth_getBlockByNumber',
      params: [blockTag, includeTxs ? ' ' : ''],
    })
    console.log('Block details:', block)
    /* Returns full block object with transaction details if requested */
    return block
  } catch (error) {
    const { code, message } = error
    console.error(`Failed to get block - Code: ${code}, Message: ${message}`)
    throw error
  }
}
```

### Contract Interaction Examples

```typescript
// Get contract code
const getContractCode = async (address: string, blockTag: string) => {
  try {
    const code = await window.vultisig.ethereum.request({
      method: 'eth_getCode',
      params: [address, blockTag],
    })
    console.log('Contract code:', code)
    // Returns hex string of contract bytecode
    return code
  } catch (error) {
    const { code, message } = error
    console.error(
      `Failed to get contract code - Code: ${code}, Message: ${message}`
    )
    throw error
  }
}

// Call contract method
const callContract = async (transaction: Transaction) => {
  try {
    const result = await window.vultisig.ethereum.request({
      method: 'eth_call',
      params: [transaction],
    })
    console.log('Call result:', result)
    // Returns hex string
    return result
  } catch (error) {
    const { code, message } = error
    console.error(`Contract call failed - Code: ${code}, Message: ${message}`)
    throw error
  }
}
```

## Error Handling

All methods can throw errors with the following structure:

```typescript
interface ProviderError {
  code: number
  message: string
}
```

Common error codes include:

- 4001: User rejected the request
- 4100: Unauthorized
- 4200: Unsupported method
- 4900: Disconnected
- 4901: Chain disconnected

## Summary

VultiConnect ensures secure and **multi-chain integration** with DeFi applications, providing seamless support across popular chains. Its adherence to [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) guarantees compatibility with existing applications while delivering a secure and user-friendly experience.
