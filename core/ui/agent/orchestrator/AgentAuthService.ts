import { attempt, withFallback } from '@lib/utils/attempt'
import { secp256k1 } from '@noble/curves/secp256k1'
import { keccak256, toBytes, toHex } from 'viem'
import { z } from 'zod'

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

type BuildAuthTokenInput = {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

const authDerivePath = "m/44'/60'/0'/0/0"
const tokenStoragePrefix = 'vultisig_auth_'

const jwtClaimsSchema = z.object({
  exp: z.number().min(1e9),
})

const authTokenSchema = z.object({
  token: z.string().min(1),
  refreshToken: z.string().min(1),
  expiresAt: z.number().positive(),
})

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

  return withFallback(
    attempt(() => {
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
      const result = jwtClaimsSchema.safeParse(JSON.parse(decoded))
      if (result.success) {
        return result.data.exp * 1000
      }
      return 0
    }),
    0
  )
}

function getStorageKey(vaultPubKey: string): string {
  return tokenStoragePrefix + vaultPubKey
}

function loadPersistedToken(vaultPubKey: string): AuthToken | null {
  return withFallback(
    attempt(() => {
      const raw = localStorage.getItem(getStorageKey(vaultPubKey))
      if (!raw) return null
      const result = authTokenSchema.safeParse(JSON.parse(raw))
      if (!result.success) return null
      if (!result.data.token.trim()) return null
      return result.data
    }),
    null
  )
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

    const result = await attempt(() => refreshAuthToken(token.refreshToken))
    if ('error' in result) {
      this.invalidateToken(vaultPubKey)
      return null
    }

    const newToken = this.buildAuthToken({
      accessToken: result.data.access_token,
      refreshToken: result.data.refresh_token,
      expiresIn: result.data.expires_in,
    })
    this.tokens.set(vaultPubKey, newToken)
    persistToken(vaultPubKey, newToken)
    return newToken
  }

  async signIn(vault: VaultMeta): Promise<AuthToken> {
    const authMessage = generateAuthMessage(vault.publicKeyEcdsa)
    const messageHash = ethereumSignHash(authMessage)

    const sig = await fastVaultKeysign({
      vault,
      messageHash,
      derivePath: authDerivePath,
      signatureAlgorithm: 'ecdsa',
      chain: 'Ethereum',
      maxAttempts: 2,
    })

    const signature = formatKeysignSignatureHex(sig)

    const resp = await authenticate({
      publicKey: vault.publicKeyEcdsa,
      chainCodeHex: vault.hexChainCode,
      signature,
      message: authMessage,
    })

    if (!resp.access_token) {
      throw new Error('authentication returned empty token')
    }

    const token = this.buildAuthToken({
      accessToken: resp.access_token,
      refreshToken: resp.refresh_token,
      expiresIn: resp.expires_in,
    })
    this.tokens.set(vault.publicKeyEcdsa, token)
    persistToken(vault.publicKeyEcdsa, token)

    return token
  }

  async validate(vaultPubKey: string): Promise<boolean> {
    const token = this.getCachedToken(vaultPubKey)
    if (!token) return false

    const result = await attempt(() => validateToken(token.token))
    if ('error' in result) {
      this.invalidateToken(vaultPubKey)
      return false
    }
    return true
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

  private buildAuthToken({
    accessToken,
    refreshToken,
    expiresIn,
  }: BuildAuthTokenInput): AuthToken {
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
