import type { SignatureAlgorithm } from '@core/chain/signing/SignatureAlgorithm'
import { keysign } from '@core/mpc/keysign'
import type { KeysignSignature } from '@core/mpc/keysign/KeysignSignature'
import { v4 as uuidv4 } from 'uuid'

import type { VaultMeta } from '../types'
import { callFastVaultSign } from './fastVaultApi'
import { registerSession, startSession, waitForParties } from './relayClient'

const relayUrl = 'https://api.vultisig.com/router'
const defaultDerivePath = "m/44'/60'/0'/0/0"

function generateEncryptionKey(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

function getKeyShare(
  vault: VaultMeta,
  signatureAlgorithm: SignatureAlgorithm
): string {
  const targetPubKey =
    signatureAlgorithm === 'ecdsa' ? vault.publicKeyEcdsa : vault.publicKeyEddsa
  const ks = vault.keyShares.find(k => k.publicKey === targetPubKey)
  if (!ks) {
    throw new Error(`${signatureAlgorithm} keyshare not found for vault`)
  }
  return ks.keyShare
}

type FastVaultKeysignParams = {
  vault: VaultMeta
  messageHash: string
  derivePath?: string
  signatureAlgorithm?: SignatureAlgorithm
  chain?: string
  maxAttempts?: number
}

export async function fastVaultKeysign({
  vault,
  messageHash,
  derivePath = defaultDerivePath,
  signatureAlgorithm = 'ecdsa',
  chain = 'Ethereum',
  maxAttempts = 2,
}: FastVaultKeysignParams): Promise<KeysignSignature> {
  let lastErr: Error | undefined

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const sig = await fastVaultKeysignAttempt(
        vault,
        messageHash,
        derivePath,
        signatureAlgorithm,
        chain
      )
      return sig
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error(String(err))
      if (attempt < maxAttempts && isRetryable(lastErr)) {
        await new Promise(r => setTimeout(r, 2000))
        continue
      }
      throw lastErr
    }
  }
  throw lastErr
}

async function fastVaultKeysignAttempt(
  vault: VaultMeta,
  messageHash: string,
  derivePath: string,
  signatureAlgorithm: SignatureAlgorithm,
  chain: string
): Promise<KeysignSignature> {
  const sessionId = uuidv4()
  const hexEncryptionKey = generateEncryptionKey()
  const isEcdsa = signatureAlgorithm === 'ecdsa'
  const publicKey = isEcdsa ? vault.publicKeyEcdsa : vault.publicKeyEddsa

  console.log('[fastVaultKeysign] step 1: registerSession', { sessionId: sessionId.slice(0, 8), localPartyId: vault.localPartyId })
  await registerSession(relayUrl, sessionId, vault.localPartyId)
  console.log('[fastVaultKeysign] step 1 done')

  console.log('[fastVaultKeysign] step 2: callFastVaultSign', { publicKey: publicKey.slice(0, 12), derivePath, isEcdsa, chain })
  await callFastVaultSign({
    publicKey,
    messages: [messageHash],
    session: sessionId,
    hexEncryptionKey,
    derivePath,
    isEcdsa,
    vaultPassword: vault.password,
    chain,
  })
  console.log('[fastVaultKeysign] step 2 done')

  console.log('[fastVaultKeysign] step 3: waitForParties')
  const parties = await waitForParties(relayUrl, sessionId, 2)
  console.log('[fastVaultKeysign] step 3 done, parties:', parties)

  console.log('[fastVaultKeysign] step 4: startSession')
  await startSession(relayUrl, sessionId, parties)
  console.log('[fastVaultKeysign] step 4 done')

  const keyShare = getKeyShare(vault, signatureAlgorithm)
  const peers = parties.filter(p => p !== vault.localPartyId)
  const mpcChainPath = derivePath.replaceAll("'", '')
  console.log('[fastVaultKeysign] step 5: keysign', {
    keyShareLen: keyShare.length,
    keySharePrefix: keyShare.slice(0, 20),
    signatureAlgorithm,
    messageHash: messageHash.slice(0, 16),
    derivePath,
    localPartyId: vault.localPartyId,
    peers,
  })

  const result = await keysign({
    keyShare,
    signatureAlgorithm,
    message: messageHash,
    chainPath: mpcChainPath,
    localPartyId: vault.localPartyId,
    peers,
    serverUrl: relayUrl,
    sessionId,
    hexEncryptionKey,
    isInitiatingDevice: true,
  })
  console.log('[fastVaultKeysign] step 5 done')

  return result
}

export function formatKeysignSignatureHex(sig: KeysignSignature): string {
  const recoveryId = sig.recovery_id || '1b'
  return '0x' + sig.r + sig.s + recoveryId
}

function isRetryable(err: Error): boolean {
  const msg = err.message.toLowerCase()
  return (
    msg.includes('timeout waiting for') ||
    msg.includes('deadline exceeded') ||
    msg.includes('unreachable') ||
    msg.includes('keysign failed')
  )
}
