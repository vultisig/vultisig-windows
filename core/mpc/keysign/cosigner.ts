/**
 * Co-signer script for Desktop/Extension QA.
 *
 * Joins a signing session initiated by the desktop or extension client,
 * acting as the second device in a 2-of-2 SecureVault.
 *
 * Requires env vars:
 *   COSIGN_QR_URL   — the full QR URL from the desktop's keysign screen
 *   VAULT_SHARE_PATH — path to the .vult share file for this co-signer
 *   VAULT_PASSWORD   — vault decryption password
 *
 * Run from repo root:
 *   COSIGN_QR_URL="..." yarn cosign
 */

import { readFile } from 'fs/promises'
import { fileURLToPath } from 'url'

/**
 * Node.js fetch does not support file:// URLs, but WASM wrappers
 * (dkls, schnorr, 7z-wasm) use `fetch(new URL('x.wasm', import.meta.url))`
 * which produces file:// URLs when running under tsx/Node.
 */
const nativeFetch = globalThis.fetch
globalThis.fetch = async (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  const url =
    typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.href
        : input.url
  if (url.startsWith('file://')) {
    const buffer = await readFile(fileURLToPath(url))
    return new Response(buffer, {
      headers: { 'content-type': 'application/wasm' },
    })
  }
  return nativeFetch(input, init)
}

import { fromBinary } from '@bufbuild/protobuf'
import { getCoinType } from '@core/chain/coin/coinType'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { getSignatureAlgorithm } from '@core/chain/signing/SignatureAlgorithm'
import { getPreSigningHashes } from '@core/chain/tx/preSigningHashes'
import { getSevenZip } from '@core/mpc/compression/getSevenZip'
import { keysign } from '@core/mpc/keysign'
import { getEncodedSigningInputs } from '@core/mpc/keysign/signingInputs'
import { getKeysignChain } from '@core/mpc/keysign/utils/getKeysignChain'
import { joinMpcSession } from '@core/mpc/session/joinMpcSession'
import { fromCommVault } from '@core/mpc/types/utils/commVault'
import {
  KeysignMessageSchema,
  KeysignPayloadSchema,
} from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { VaultSchema } from '@core/mpc/types/vultisig/vault/v1/vault_pb'
import { vaultContainerFromString } from '@core/mpc/vault/utils/vaultContainerFromString'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { decryptWithAesGcm } from '@lib/utils/encryption/aesGcm/decryptWithAesGcm'
import { fromBase64 } from '@lib/utils/fromBase64'
import { match } from '@lib/utils/match'
import { queryUrl } from '@lib/utils/query/queryUrl'
import { initWasm } from '@trustwallet/wallet-core'
import fs from 'fs/promises'

const relayUrl = 'https://api.vultisig.com/router'
const eddsaPlaceholderPath = 'm/44/501/0/0'

/** Load and decrypt a .vult share file, returning the parsed Vault. */
async function loadVaultShare(vaultPath: string, password: string) {
  const raw = await fs.readFile(vaultPath, 'utf-8')
  const container = vaultContainerFromString(raw.trim())

  let vaultBase64: string
  if (container.isEncrypted) {
    const decrypted = await decryptWithAesGcm({
      key: password,
      value: fromBase64(container.vault),
    })
    vaultBase64 = Buffer.from(decrypted).toString('base64')
  } else {
    vaultBase64 = container.vault
  }

  const vault = fromBinary(VaultSchema, fromBase64(vaultBase64))
  return fromCommVault(vault)
}

/** Decompress LZMA/XZ base64 data (mirrors decompressQrPayload). */
async function decompressData(base64: string): Promise<Uint8Array> {
  const sevenZip = await getSevenZip()
  sevenZip.FS.writeFile('data.xz', Buffer.from(base64, 'base64'))
  sevenZip.callMain(['x', 'data.xz', '-y'])
  return sevenZip.FS.readFile('data')
}

/**
 * Extract the KeysignMessage protobuf from the QR URL.
 * Uses regex instead of URLSearchParams to preserve `+` in base64.
 */
async function parseKeysignQrUrl(url: string) {
  const match = url.match(/[?&]jsonData=([^&]+)/)
  if (!match) throw new Error('QR URL missing jsonData parameter')

  return fromBinary(KeysignMessageSchema, await decompressData(match[1]))
}

/** Poll GET /start/{sessionId} until the session starts. */
async function waitForSessionStart(
  serverUrl: string,
  sessionId: string,
  timeoutMs = 120_000
): Promise<string[]> {
  const t0 = Date.now()
  while (Date.now() - t0 < timeoutMs) {
    try {
      const signers = await queryUrl<string[]>(
        `${serverUrl}/start/${sessionId}`
      )
      if (signers?.length) return signers
    } catch {
      /* not started yet */
    }
    await new Promise(r => setTimeout(r, 1000))
  }
  throw new Error(`Timeout waiting for session start after ${timeoutMs}ms`)
}

async function main() {
  const qrUrl = process.env.COSIGN_QR_URL
  const vaultSharePath = process.env.VAULT_SHARE_PATH
  const vaultPassword = process.env.VAULT_PASSWORD

  if (!qrUrl || !vaultSharePath || !vaultPassword) {
    console.error(
      'Missing required env vars: COSIGN_QR_URL, VAULT_SHARE_PATH, VAULT_PASSWORD'
    )
    process.exit(1)
  }

  console.log('1. Loading vault share...')
  const vault = await loadVaultShare(vaultSharePath, vaultPassword)
  console.log(`   Vault: ${vault.name}, Party: ${vault.localPartyId}`)

  console.log('\n2. Initializing WalletCore...')
  const walletCore = await initWasm()

  console.log('\n3. Parsing QR URL...')
  const keysignMsg = await parseKeysignQrUrl(qrUrl)
  console.log(`   Session: ${keysignMsg.sessionId}`)
  console.log(`   Relay: ${keysignMsg.useVultisigRelay}`)

  const serverUrl = keysignMsg.useVultisigRelay
    ? relayUrl
    : 'http://localhost:18080'

  let keysignPayload = keysignMsg.keysignPayload
  if (!keysignPayload && keysignMsg.payloadId) {
    console.log('\n4. Fetching payload from server...')
    const raw: string = await queryUrl(
      `${serverUrl}/payload/${keysignMsg.payloadId}`,
      { responseType: 'text' }
    )
    keysignPayload = fromBinary(KeysignPayloadSchema, await decompressData(raw))
  }
  if (!keysignPayload) throw new Error('No keysign payload found')

  console.log(`   To: ${keysignPayload.toAddress}`)
  console.log(`   Amount: ${keysignPayload.toAmount}`)

  console.log('\n5. Extracting message hashes...')
  const chain = getKeysignChain(keysignPayload)
  const publicKey = getPublicKey({
    chain,
    walletCore,
    hexChainCode: vault.hexChainCode,
    publicKeys: vault.publicKeys,
    chainPublicKeys: vault.chainPublicKeys,
  })

  const inputs = getEncodedSigningInputs({
    keysignPayload,
    walletCore,
    publicKey,
  })
  const msgs = inputs
    .flatMap(txInputData =>
      getPreSigningHashes({ txInputData, walletCore, chain }).map(h =>
        Buffer.from(h).toString('hex')
      )
    )
    .sort()
  console.log(
    `   Hashes (${msgs.length}): ${msgs.map(h => h.slice(0, 20) + '...').join(', ')}`
  )

  const signatureAlgorithm = getSignatureAlgorithm(chain)

  const coinType = getCoinType({ walletCore, chain })
  const chainPath = match(signatureAlgorithm, {
    ecdsa: () =>
      walletCore.CoinTypeExt.derivationPath(coinType).replaceAll("'", ''),
    eddsa: () => eddsaPlaceholderPath,
    mldsa: () => eddsaPlaceholderPath,
  })
  console.log(`\n6. Algorithm: ${signatureAlgorithm}, path: ${chainPath}`)

  console.log('\n7. Joining relay session...')
  await joinMpcSession({
    serverUrl,
    sessionId: keysignMsg.sessionId,
    localPartyId: vault.localPartyId,
  })
  console.log('   Joined')

  console.log('\n8. Waiting for session start...')
  const signers = await waitForSessionStart(serverUrl, keysignMsg.sessionId)
  console.log(`   Started: ${signers.join(', ')}`)

  const peers = signers.filter(s => s !== vault.localPartyId)
  const keyShare = shouldBePresent(
    match(signatureAlgorithm, {
      ecdsa: () => vault.keyShares.ecdsa,
      eddsa: () => vault.keyShares.eddsa,
      mldsa: () => vault.keyShareMldsa,
    }),
    'Keyshare'
  )

  console.log(`\n9. Keysigning ${msgs.length} message(s)...`)
  for (let i = 0; i < msgs.length; i++) {
    console.log(`   [${i + 1}/${msgs.length}] ${msgs[i].slice(0, 20)}...`)
    await keysign({
      keyShare,
      signatureAlgorithm,
      message: msgs[i],
      chainPath,
      localPartyId: vault.localPartyId,
      peers,
      serverUrl,
      sessionId: keysignMsg.sessionId,
      hexEncryptionKey: keysignMsg.encryptionKeyHex,
      isInitiatingDevice: false,
    })
    console.log('   Signed')
  }

  console.log('\n' + '='.repeat(50))
  console.log('CO-SIGNING COMPLETE')
  console.log('='.repeat(50))
}

main().catch(err => {
  console.error('Co-signer failed:', err)
  process.exit(1)
})
