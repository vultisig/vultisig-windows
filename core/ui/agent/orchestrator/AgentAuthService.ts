import { secp256k1 } from '@noble/curves/secp256k1'
import { keccak256, toBytes, toHex } from 'viem'

import { ethereumSignHash } from '../tools/shared/ethereumSigning'
import {
  fastVaultKeysign,
  formatKeysignSignatureHex,
} from '../tools/shared/fastVaultKeysign'
import {
  authenticate,
  refreshAuthToken,
  revokeAllTokens,
  validateToken,
} from '../tools/shared/verifierApi'
import type { VaultMeta } from '../tools/types'
import type { AuthToken } from './types'

const authDerivePath = "m/44'/60'/0'/0/0"
const tokenStoragePrefix = 'vultisig_auth_'

function deriveEthereumAddress(compressedPubKeyHex: string): string {
  const normalized = compressedPubKeyHex.replace(/^0[xX]/, '')
  const pubBytes =
    secp256k1.ProjectivePoint.fromHex(normalized).toRawBytes(false)
  const hash = keccak256(toBytes(toHex(pubBytes.slice(1))))
  return '0x' + hash.slice(-40)
}

function generateNonce(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return (
    '0x' +
    Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  )
}

function generateAuthMessage(publicKeyEcdsa: string): string {
  const address = deriveEthereumAddress(publicKeyEcdsa)
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000)
    .toISOString()
    .replace(/Z$/, '')
    .replace(/(\.\d{3})\d*/, '$1Z')

  return JSON.stringify({
    message: 'Sign into Vultisig Plugin Marketplace',
    nonce: generateNonce(),
    expiresAt,
    address,
  })
}

function parseJwtExpiry(token: string): number {
  const parts = token.split('.')
  if (parts.length !== 3) return 0

  let payload = parts[1]
  const pad = payload.length % 4
  if (pad === 2) payload += '=='
  else if (pad === 3) payload += '='

  try {
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    const claims = JSON.parse(decoded) as Record<string, unknown>
    const exp = claims.exp
    if (typeof exp === 'number' && exp > 1e9) {
      return exp * 1000
    }
  } catch {
    // invalid JWT
  }
  return 0
}

function getStorageKey(vaultPubKey: string): string {
  return tokenStoragePrefix + vaultPubKey
}

function loadPersistedToken(vaultPubKey: string): AuthToken | null {
  try {
    const raw = localStorage.getItem(getStorageKey(vaultPubKey))
    if (!raw) return null
    const parsed = JSON.parse(raw) as AuthToken
    if (!parsed.token?.trim()) return null
    return parsed
  } catch {
    return null
  }
}

function persistToken(vaultPubKey: string, token: AuthToken): void {
  try {
    localStorage.setItem(getStorageKey(vaultPubKey), JSON.stringify(token))
  } catch {
    // storage full or unavailable
  }
}

function deletePersistedToken(vaultPubKey: string): void {
  try {
    localStorage.removeItem(getStorageKey(vaultPubKey))
  } catch {
    // best-effort
  }
}

export class AgentAuthService {
  private tokens = new Map<string, AuthToken>()

  getCachedToken(vaultPubKey: string): AuthToken | null {
    let token = this.tokens.get(vaultPubKey) ?? null

    if (!token) {
      const persisted = loadPersistedToken(vaultPubKey)
      if (!persisted) return null
      token = persisted
      this.tokens.set(vaultPubKey, token)
    }

    if (!token.token.trim()) {
      this.invalidateToken(vaultPubKey)
      return null
    }

    const fiveMinutesFromNow = Date.now() + 5 * 60 * 1000
    if (token.expiresAt < fiveMinutesFromNow) {
      return null
    }

    return token
  }

  async refreshIfNeeded(vaultPubKey: string): Promise<AuthToken | null> {
    const token =
      this.tokens.get(vaultPubKey) ?? loadPersistedToken(vaultPubKey)
    if (!token) return null

    const fiveMinutesFromNow = Date.now() + 5 * 60 * 1000
    if (token.expiresAt > fiveMinutesFromNow) {
      return token
    }

    if (!token.refreshToken?.trim()) {
      this.invalidateToken(vaultPubKey)
      return null
    }

    try {
      const resp = await refreshAuthToken(token.refreshToken)
      const newToken = this.buildAuthToken(
        resp.access_token,
        resp.refresh_token,
        resp.expires_in
      )
      this.tokens.set(vaultPubKey, newToken)
      persistToken(vaultPubKey, newToken)
      return newToken
    } catch {
      this.invalidateToken(vaultPubKey)
      return null
    }
  }

  async signIn(vault: VaultMeta): Promise<AuthToken> {
    console.log('[auth:signIn] generating auth message')
    const authMessage = generateAuthMessage(vault.publicKeyEcdsa)
    const messageHash = ethereumSignHash(authMessage)
    console.log('[auth:signIn] messageHash:', messageHash.slice(0, 16) + '...')

    console.log('[auth:signIn] calling fastVaultKeysign...')
    const sig = await fastVaultKeysign({
      vault,
      messageHash,
      derivePath: authDerivePath,
      signatureAlgorithm: 'ecdsa',
      chain: 'Ethereum',
      maxAttempts: 2,
    })
    console.log('[auth:signIn] keysign completed, sig r:', sig.r?.slice(0, 16) + '...')

    const signature = formatKeysignSignatureHex(sig)

    const resp = await authenticate(
      vault.publicKeyEcdsa,
      vault.hexChainCode,
      signature,
      authMessage
    )

    if (!resp.access_token) {
      throw new Error('authentication returned empty token')
    }

    const token = this.buildAuthToken(
      resp.access_token,
      resp.refresh_token,
      resp.expires_in
    )
    this.tokens.set(vault.publicKeyEcdsa, token)
    persistToken(vault.publicKeyEcdsa, token)

    return token
  }

  async validate(vaultPubKey: string): Promise<boolean> {
    const token = this.getCachedToken(vaultPubKey)
    if (!token) return false
    try {
      await validateToken(token.token)
      return true
    } catch {
      this.invalidateToken(vaultPubKey)
      return false
    }
  }

  async disconnect(vaultPubKey: string): Promise<void> {
    const token = this.getCachedToken(vaultPubKey)
    if (token) {
      try {
        await revokeAllTokens(token.token)
      } catch {
        // best-effort
      }
    }
    this.invalidateToken(vaultPubKey)
  }

  invalidateToken(vaultPubKey: string): void {
    this.tokens.delete(vaultPubKey)
    deletePersistedToken(vaultPubKey)
  }

  isSignedIn(vaultPubKey: string): boolean {
    return this.getCachedToken(vaultPubKey) !== null
  }

  getTokenInfo(vaultPubKey: string): { connected: boolean; expiresAt: string } {
    const token = this.getCachedToken(vaultPubKey)
    if (!token) return { connected: false, expiresAt: '' }
    return {
      connected: true,
      expiresAt: new Date(token.expiresAt).toISOString(),
    }
  }

  private buildAuthToken(
    accessToken: string,
    refreshToken: string,
    expiresIn: number
  ): AuthToken {
    let expiresAt = 0
    if (expiresIn > 0) {
      expiresAt = Date.now() + expiresIn * 1000
    }
    if (!expiresAt) {
      expiresAt = parseJwtExpiry(accessToken)
    }
    if (!expiresAt) {
      throw new Error('could not determine token expiry')
    }

    return { token: accessToken, refreshToken, expiresAt }
  }
}
