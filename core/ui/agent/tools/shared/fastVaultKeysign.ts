import type { SignatureAlgorithm } from '@core/chain/signing/SignatureAlgorithm'
import { keysign } from '@core/mpc/keysign'
import type { KeysignSignature } from '@core/mpc/keysign/KeysignSignature'
import { v4 as uuidv4 } from 'uuid'

import { relayUrl } from '../../config'
import type { VaultMeta } from '../types'
import { callFastVaultSign } from './fastVaultApi'
import { registerSession, startSession, waitForParties } from './relayClient'
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
      const sig = await fastVaultKeysignAttempt({
        vault,
        messageHash,
        derivePath,
        signatureAlgorithm,
        chain,
      })
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

type FastVaultKeysignAttemptInput = {
  vault: VaultMeta
  messageHash: string
  derivePath: string
  signatureAlgorithm: SignatureAlgorithm
  chain: string
}

async function fastVaultKeysignAttempt({
  vault,
  messageHash,
  derivePath,
  signatureAlgorithm,
  chain,
}: FastVaultKeysignAttemptInput): Promise<KeysignSignature> {
  const sessionId = uuidv4()
  const hexEncryptionKey = generateEncryptionKey()
  const isEcdsa = signatureAlgorithm === 'ecdsa'
  const publicKey = isEcdsa ? vault.publicKeyEcdsa : vault.publicKeyEddsa

  await registerSession(relayUrl, sessionId, vault.localPartyId)

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

  const parties = await waitForParties(relayUrl, sessionId, 2)

  await startSession(relayUrl, sessionId, parties)

  const keyShare = getKeyShare(vault, signatureAlgorithm)
  const peers = parties.filter(p => p !== vault.localPartyId)
  const mpcChainPath = derivePath.replaceAll("'", '')

  return keysign({
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
}

export function formatKeysignSignatureHex(sig: KeysignSignature): string {
  if (!sig.recovery_id) {
    throw new Error('recovery_id is required to format keysign signature hex')
  }
  return '0x' + sig.r + sig.s + sig.recovery_id
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
