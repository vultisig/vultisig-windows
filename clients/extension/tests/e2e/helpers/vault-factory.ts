/**
 * Vault Factory Helper
 *
 * Creates vault objects for seeding into chrome.storage.local.
 * Supports loading from .vult files and creating mock vaults.
 */

import { existsSync, readFileSync } from 'fs'
import { createHash } from 'crypto'

/**
 * Vault structure matching extension storage format
 */
export interface VaultData {
  name: string
  signers: string[]
  localPartyId: string
  publicKeys: {
    ecdsa: string
    eddsa: string
  }
  keyShares: {
    ecdsa: string
    eddsa: string
  }
  hexChainCode: string
  createdAt: number
  localKeyData?: string // Optional encrypted key share
}

/**
 * Storage format for vaults in extension
 */
export interface StoredVaultData {
  vaults: VaultData[]
  currentVaultId: string
}

/**
 * Parse a .vult backup file
 */
export function parseVultFile(filePath: string, password?: string): VaultData | null {
  if (!existsSync(filePath)) {
    console.warn(`Vault file not found: ${filePath}`)
    return null
  }

  try {
    const content = readFileSync(filePath, 'utf-8')
    const parsed = JSON.parse(content)

    // Handle both encrypted and unencrypted formats
    if (typeof parsed === 'object' && parsed.vault) {
      // Unencrypted format
      return normalizeVaultData(parsed.vault)
    } else if (typeof parsed === 'object' && parsed.version && parsed.encrypted) {
      // Encrypted format - would need decryption with password
      console.warn('Encrypted vault file - decryption not yet implemented')
      // For now, try to parse as-is if it has vault data
      if (parsed.vault) {
        return normalizeVaultData(parsed.vault)
      }
      return null
    } else if (typeof parsed === 'object') {
      // Try direct vault format
      return normalizeVaultData(parsed)
    }

    return null
  } catch (error) {
    console.error(`Failed to parse vault file ${filePath}:`, error)
    return null
  }
}

/**
 * Normalize vault data to expected format
 */
function normalizeVaultData(data: Record<string, unknown>): VaultData {
  return {
    name: (data.name as string) || 'Test Vault',
    signers: (data.signers as string[]) || [],
    localPartyId: (data.localPartyId as string) || (data.local_party_id as string) || '',
    publicKeys: {
      ecdsa: (data.publicKeys as any)?.ecdsa || (data.public_key_ecdsa as string) || '',
      eddsa: (data.publicKeys as any)?.eddsa || (data.public_key_eddsa as string) || '',
    },
    keyShares: {
      ecdsa: (data.keyShares as any)?.ecdsa || (data.keyshare as string) || '',
      eddsa: (data.keyShares as any)?.eddsa || '',
    },
    hexChainCode: (data.hexChainCode as string) || (data.hex_chain_code as string) || '',
    createdAt: (data.createdAt as number) || Date.now(),
    localKeyData: data.localKeyData as string | undefined,
  }
}

/**
 * Generate a vault ID from public keys (matches extension logic)
 */
export function generateVaultId(vault: VaultData): string {
  const idSource = `${vault.publicKeys.ecdsa}:${vault.publicKeys.eddsa}`
  return createHash('sha256').update(idSource).digest('hex').substring(0, 16)
}

/**
 * Create a mock fast vault for testing
 */
export function createMockFastVault(name = 'Test Fast Vault'): VaultData {
  const mockEcdsa = 'mock-ecdsa-' + Date.now()
  const mockEddsa = 'mock-eddsa-' + Date.now()

  return {
    name,
    signers: ['server', 'local-device'],
    localPartyId: 'local-device',
    publicKeys: {
      ecdsa: mockEcdsa,
      eddsa: mockEddsa,
    },
    keyShares: {
      ecdsa: 'mock-keyshare-ecdsa',
      eddsa: 'mock-keyshare-eddsa',
    },
    hexChainCode: '0000000000000000000000000000000000000000000000000000000000000000',
    createdAt: Date.now(),
  }
}

/**
 * Create a mock secure vault for testing
 */
export function createMockSecureVault(name = 'Test Secure Vault'): VaultData {
  const mockEcdsa = 'mock-secure-ecdsa-' + Date.now()
  const mockEddsa = 'mock-secure-eddsa-' + Date.now()

  return {
    name,
    signers: ['device-1', 'device-2', 'local-device'],
    localPartyId: 'local-device',
    publicKeys: {
      ecdsa: mockEcdsa,
      eddsa: mockEddsa,
    },
    keyShares: {
      ecdsa: 'mock-secure-keyshare-ecdsa',
      eddsa: 'mock-secure-keyshare-eddsa',
    },
    hexChainCode: '0000000000000000000000000000000000000000000000000000000000000000',
    createdAt: Date.now(),
  }
}

/**
 * Load a vault from TEST_VAULT_PATH environment variable
 */
export function loadTestVault(): VaultData | null {
  const vaultPath = process.env.TEST_VAULT_PATH
  const password = process.env.TEST_VAULT_PASSWORD

  if (!vaultPath) {
    console.warn('TEST_VAULT_PATH not set')
    return null
  }

  return parseVultFile(vaultPath, password)
}

/**
 * Load secure vault shares from SECURE_VAULT_SHARES environment variable
 */
export function loadSecureVaultShares(): VaultData[] {
  const sharesEnv = process.env.SECURE_VAULT_SHARES
  const password = process.env.SECURE_VAULT_PASSWORD

  if (!sharesEnv) {
    console.warn('SECURE_VAULT_SHARES not set')
    return []
  }

  const sharePaths = sharesEnv.split(',').map(s => s.trim())
  const vaults: VaultData[] = []

  for (const sharePath of sharePaths) {
    const vault = parseVultFile(sharePath, password)
    if (vault) {
      vaults.push(vault)
    }
  }

  return vaults
}
