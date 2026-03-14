/**
 * Test to verify fromt_derive_view_key matches what monero-ts expects.
 *
 * This creates a 1-of-1 FROMT keyshare from the seed, then checks if
 * the derived view key matches monero-ts's derivation.
 *
 * Since we can't easily run FROMT WASM in Node.js, we instead test
 * the scanner approach: create wallet with spend key and check view key.
 */

import { pbkdf2 } from '@noble/hashes/pbkdf2.js'
import { sha512 } from '@noble/hashes/sha2.js'
import { HDKey } from '@scure/bip32'
import * as moneroTs from 'monero-ts'

const MNEMONIC = 'bachelor super tape stereo expect fiber vendor subway bar jewel asset vibrant'
const EXPECTED_ADDRESS = '45sQXBvHYc4ZXtsCmaVhjrWHtyvAnwPbmP8gBBVea9xFefZY4RgTekehtb8cxQ23NHPdvxSkLz2Lo2q2hisn5HxC2cwYPBL'

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

function toHex(bytes) {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

const bip39Seed = pbkdf2(sha512, MNEMONIC, 'mnemonic', { c: 2048, dkLen: 64 })
const master = HDKey.fromMasterSeed(bip39Seed)
const child = master.derive("m/44'/128'/0'/0/0")
const spendKey = scReduce32(child.privateKey)

console.log('Spend key:', toHex(spendKey))

// Create wallet from spend key to get the correct view key
const wallet = await moneroTs.createWalletKeys({
  networkType: moneroTs.MoneroNetworkType.MAINNET,
  privateSpendKey: toHex(spendKey),
  language: 'English',
})

const address = await wallet.getPrimaryAddress()
const viewKey = await wallet.getPrivateViewKey()
const spendPub = await wallet.getPublicSpendKey()
const viewPub = await wallet.getPublicViewKey()

console.log('Address:         ', address)
console.log('Address matches: ', address === EXPECTED_ADDRESS)
console.log('View key:        ', viewKey)
console.log('Spend pub key:   ', spendPub)
console.log('View pub key:    ', viewPub)

await wallet.close()

// The scanner should use THIS view key
console.log('\n--- Scanner should use ---')
console.log(`privateViewKey: "${viewKey}"`)
console.log(`primaryAddress: "${address}"`)
