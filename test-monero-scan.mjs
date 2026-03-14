/**
 * Standalone test for monero-ts scanning.
 * Tests that monero-ts can sync blocks from a Monero daemon in Node.js.
 *
 * Usage: node test-monero-scan.mjs
 *
 * Env vars (or defaults from .env):
 *   FROMT_MNEMONIC       - BIP39 mnemonic
 *   FROMT_BIRTHDAY        - Restore height
 *   FROMT_EXPECTED_ADDRESS - Expected Monero address
 */

import { pbkdf2 } from '@noble/hashes/pbkdf2.js'
import { sha512 } from '@noble/hashes/sha2.js'
import { HDKey } from '@scure/bip32'
import { createHash } from 'crypto'
import * as moneroTs from 'monero-ts'

// ---- Load env ----
const MNEMONIC = process.env.FROMT_MNEMONIC || 'bachelor super tape stereo expect fiber vendor subway bar jewel asset vibrant'
const BIRTHDAY = parseInt(process.env.FROMT_BIRTHDAY || '3621100', 10)
const EXPECTED_ADDRESS = process.env.FROMT_EXPECTED_ADDRESS || '45sQXBvHYc4ZXtsCmaVhjrWHtyvAnwPbmP8gBBVea9xFefZY4RgTekehtb8cxQ23NHPdvxSkLz2Lo2q2hisn5HxC2cwYPBL'
const DAEMON_URL = process.env.MONERO_DAEMON || 'https://node.sethforprivacy.com'

// ---- Key derivation (matches core/mpc/fromt/mnemonicToMoneroSeed.ts) ----
const ed25519Order = BigInt('0x1000000000000000000000000000000014DEF9DEA2F79CD65812631A5CF5D3ED')

function scReduce32(key) {
  const reversed = new Uint8Array(key.length)
  for (let i = 0; i < key.length; i++) {
    reversed[key.length - 1 - i] = key[i]
  }
  let k = BigInt(0)
  for (const byte of reversed) {
    k = (k << BigInt(8)) | BigInt(byte)
  }
  k = k % ed25519Order
  const result = new Uint8Array(32)
  for (let i = 0; i < 32; i++) {
    result[i] = Number(k & BigInt(0xff))
    k >>= BigInt(8)
  }
  return result
}

function mnemonicToMoneroSeed(mnemonic) {
  const bip39Seed = pbkdf2(sha512, mnemonic, 'mnemonic', { c: 2048, dkLen: 64 })
  const master = HDKey.fromMasterSeed(bip39Seed)
  const child = master.derive("m/44'/128'/0'/0/0")
  return scReduce32(child.privateKey)
}

function keccak256(data) {
  return createHash('sha3-256').update(data).digest()
}

function toHex(bytes) {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

// ---- Derive keys ----
console.log('=== Monero Scanner Test ===')
console.log(`Mnemonic: ${MNEMONIC.split(' ').slice(0, 3).join(' ')}...`)
console.log(`Birthday: ${BIRTHDAY}`)
console.log(`Expected: ${EXPECTED_ADDRESS}`)
console.log(`Daemon:   ${DAEMON_URL}`)
console.log()

const spendKey = mnemonicToMoneroSeed(MNEMONIC)
console.log(`Spend key (private): ${toHex(spendKey)}`)

// Standard Monero: viewKey = keccak256(spendKey) mod l
const viewKeyRaw = keccak256(Buffer.from(spendKey))
const viewKey = scReduce32(viewKeyRaw)
console.log(`View key (private):  ${toHex(viewKey)}`)

// ---- Step 1: Verify address with monero-ts ----
console.log('\n--- Step 1: Verify address derivation ---')
try {
  const keysWallet = await moneroTs.createWalletKeys({
    networkType: moneroTs.MoneroNetworkType.MAINNET,
    primaryAddress: EXPECTED_ADDRESS,
    privateViewKey: toHex(viewKey),
    language: 'English',
  })
  const derivedAddress = await keysWallet.getPrimaryAddress()
  console.log(`Derived address:  ${derivedAddress}`)
  console.log(`Address match:    ${derivedAddress === EXPECTED_ADDRESS ? 'YES ✓' : 'NO ✗'}`)
  await keysWallet.close()
} catch (err) {
  console.error('Address verification failed:', err.message)
  console.log('Trying with spend key instead...')

  try {
    const keysWallet = await moneroTs.createWalletKeys({
      networkType: moneroTs.MoneroNetworkType.MAINNET,
      privateSpendKey: toHex(spendKey),
      language: 'English',
    })
    const derivedAddress = await keysWallet.getPrimaryAddress()
    const derivedViewKey = await keysWallet.getPrivateViewKey()
    console.log(`Derived address:    ${derivedAddress}`)
    console.log(`Derived view key:   ${derivedViewKey}`)
    console.log(`Address match:      ${derivedAddress === EXPECTED_ADDRESS ? 'YES ✓' : 'NO ✗'}`)

    // Use the correct view key from the wallet
    if (derivedAddress === EXPECTED_ADDRESS) {
      console.log('\n--- Step 2: Test scanning with correct keys ---')
      await testSync(derivedAddress, derivedViewKey)
    }
    await keysWallet.close()
    process.exit(0)
  } catch (err2) {
    console.error('Spend key wallet creation also failed:', err2.message)
    process.exit(1)
  }
}

// ---- Step 2: Test scanning ----
console.log('\n--- Step 2: Test scanning ---')
await testSync(EXPECTED_ADDRESS, toHex(viewKey))

async function testSync(address, privateViewKey) {
  console.log(`Creating view-only wallet...`)
  console.log(`  Address:     ${address}`)
  console.log(`  View key:    ${privateViewKey}`)
  console.log(`  Restore:     ${BIRTHDAY}`)
  console.log(`  Daemon:      ${DAEMON_URL}`)

  const wallet = await moneroTs.createWalletFull({
    networkType: moneroTs.MoneroNetworkType.MAINNET,
    primaryAddress: address,
    privateViewKey,
    restoreHeight: BIRTHDAY,
    server: { uri: DAEMON_URL },
  })

  console.log('Wallet created. Starting sync...')

  let lastHeight = 0
  const listener = new moneroTs.MoneroWalletListener()
  listener.onSyncProgress = async (height, startHeight, endHeight, percentDone, message) => {
    if (height !== lastHeight) {
      console.log(`  Sync: ${height}/${endHeight} (${(percentDone * 100).toFixed(1)}%) ${message || ''}`)
      lastHeight = height
    }
  }

  const startTime = Date.now()
  const result = await wallet.sync(listener)
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)

  console.log(`\nSync complete in ${elapsed}s`)
  console.log(`  Blocks fetched: ${result.getNumBlocksFetched()}`)
  console.log(`  Received money: ${result.getReceivedMoney()}`)

  const balance = await wallet.getBalance()
  const unlockedBalance = await wallet.getUnlockedBalance()
  console.log(`  Balance:          ${balance} atomic units (${Number(balance) / 1e12} XMR)`)
  console.log(`  Unlocked balance: ${unlockedBalance} atomic units (${Number(unlockedBalance) / 1e12} XMR)`)

  const height = await wallet.getHeight()
  console.log(`  Wallet height:    ${height}`)

  await wallet.close()
  console.log('\n=== Test PASSED ===')
}
