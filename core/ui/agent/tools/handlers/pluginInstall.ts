import { DKLS } from '@core/mpc/dkls/dkls'
import {
  setKeygenComplete,
  waitForKeygenComplete,
} from '@core/mpc/keygenComplete'
import { Schnorr } from '@core/mpc/schnorr/schnorrKeygen'
import { without } from '@lib/utils/array/without'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

import { relayUrl } from '../../config'
import { requestFastVaultReshare } from '../shared/fastVaultApi'
import { getPluginName, resolvePluginId } from '../shared/pluginConfig'
import {
  registerSession,
  startSession,
  waitForParties,
} from '../shared/relayClient'
import {
  checkPluginInstalled,
  requestVerifierReshare,
} from '../shared/verifierApi'
import type { ToolHandler, VaultMeta } from '../types'

const pluginInstallInputSchema = z.object({
  plugin_id: z.string(),
})
const pluginInstallJoinTimeoutMs = 5 * 60 * 1000
const pluginPeersMinimum = 3

const pluginPartyIdPattern = /^[^-]+-[^-]+-[0-9a-f]{4}-[0-9]+$/

function generateEncryptionKey(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

function generateServerPartyId(sessionId: string): string {
  let h = 0
  for (const c of sessionId) {
    h = (31 * h + c.charCodeAt(0)) | 0
  }
  if (h < 0) h = -h
  let suffix = String(h)
  if (suffix.length > 5) suffix = suffix.slice(-5)
  return `Server-${suffix}`
}

function toLibType(libType: string): number {
  const upper = libType.toUpperCase().trim()
  if (upper === 'DKLS') return 1
  if (upper === 'KEYIMPORT') return 2
  return 0
}

function isDKLSLib(libType: string): boolean {
  return libType.toUpperCase().trim() === 'DKLS'
}

function hasServerParty(signers: string[]): boolean {
  return signers.some(s => s.toLowerCase().trim().startsWith('server-'))
}

function classifyParties(parties: string[]): {
  hasServer: boolean
  hasVerifier: boolean
  hasPlugin: boolean
} {
  let hasServer = false
  let hasVerifier = false
  let hasPlugin = false
  for (const party of parties) {
    const lower = party.toLowerCase().trim()
    if (lower.startsWith('server-')) hasServer = true
    if (lower.startsWith('verifier')) hasVerifier = true
    if (pluginPartyIdPattern.test(lower)) hasPlugin = true
  }
  return { hasServer, hasVerifier, hasPlugin }
}

async function waitForPluginInstallParties(
  sessionId: string,
  expectedCount: number
): Promise<string[]> {
  const required = Math.max(expectedCount, pluginPeersMinimum)
  const deadline = Date.now() + pluginInstallJoinTimeoutMs

  while (Date.now() < deadline) {
    try {
      const resp = await fetch(`${relayUrl}/${sessionId}`)
      if (resp.ok) {
        const parties: string[] = await resp.json()
        const { hasServer, hasVerifier, hasPlugin } = classifyParties(parties)
        if (
          hasServer &&
          hasVerifier &&
          hasPlugin &&
          parties.length >= required
        ) {
          return parties
        }
      }
    } catch {
      // ignore polling errors
    }
    await new Promise(r => setTimeout(r, 1000))
  }
  throw new Error(
    `Timeout waiting for plugin install peers (expected=${required})`
  )
}

function getEcdsaKeyShare(vault: VaultMeta): string {
  const ks = vault.keyShares.find(k => k.publicKey === vault.publicKeyEcdsa)
  if (!ks) throw new Error('ECDSA key share not found in vault')
  return ks.keyShare
}

function getEddsaKeyShare(vault: VaultMeta): string {
  const ks = vault.keyShares.find(k => k.publicKey === vault.publicKeyEddsa)
  if (!ks) throw new Error('EdDSA key share not found in vault')
  return ks.keyShare
}

export const handlePluginInstall: ToolHandler = async (input, context) => {
  const vault = context.vault
  if (!vault) {
    throw new Error('Vault metadata required for plugin installation')
  }

  const validated = pluginInstallInputSchema.parse(input)
  const pluginId = resolvePluginId(validated.plugin_id)
  const pluginName = getPluginName(pluginId)
  if (!context.authToken) {
    throw new Error(
      'Vault is not signed in. Please sign in to install plugins.'
    )
  }
  const authToken = context.authToken

  const installed = await checkPluginInstalled(
    pluginId,
    context.vaultPubKey,
    authToken
  ).catch(() => false)

  if (installed) {
    return {
      data: {
        success: true,
        plugin_id: pluginId,
        plugin_name: pluginName,
        message: `Plugin ${pluginName} is already installed for this vault.`,
        already_installed: true,
      },
    }
  }

  if (!vault.publicKeyEcdsa?.trim()) {
    throw new Error('Vault ECDSA public key is required')
  }
  if (!vault.hexChainCode?.trim()) {
    throw new Error('Vault hex chain code is required')
  }
  if (!hasServerParty(vault.signers)) {
    throw new Error(
      'Plugin installation requires a fast vault signer committee with a server party'
    )
  }
  if (!isDKLSLib(vault.libType)) {
    throw new Error(
      'Plugin installation requires a DKLS vault; GG20 vaults are not supported'
    )
  }
  if (!vault.signers.includes(vault.localPartyId)) {
    throw new Error(
      `Local party id "${vault.localPartyId}" is not in vault signers`
    )
  }

  const sessionId = uuidv4()
  const hexEncryptionKey = generateEncryptionKey()
  const serverPartyId = generateServerPartyId(sessionId)
  const libType = toLibType(vault.libType)

  await registerSession(relayUrl, sessionId, vault.localPartyId)

  await requestFastVaultReshare({
    name: context.vaultName,
    publicKey: vault.publicKeyEcdsa,
    sessionId,
    hexEncryptionKey,
    hexChainCode: vault.hexChainCode,
    localPartyId: serverPartyId,
    oldParties: vault.signers,
    oldResharePrefix: vault.resharePrefix,
    encryptionPassword: vault.password,
    libType,
  })

  await waitForParties(relayUrl, sessionId, 2, pluginInstallJoinTimeoutMs)

  await requestVerifierReshare(
    {
      name: context.vaultName,
      publicKey: vault.publicKeyEcdsa,
      sessionId,
      hexEncryptionKey,
      hexChainCode: vault.hexChainCode,
      localPartyId: 'verifier-' + sessionId.slice(0, 8),
      oldParties: vault.signers,
      oldResharePrefix: vault.resharePrefix,
      libType,
      pluginId,
      relayUrl,
    },
    authToken
  )

  const expectedParties = vault.signers.length + 2
  const parties = await waitForPluginInstallParties(sessionId, expectedParties)

  await startSession(relayUrl, sessionId, parties)

  const oldCommittee = vault.signers.filter(party => parties.includes(party))

  const ecdsaKeyshare = getEcdsaKeyShare(vault)
  const eddsaKeyshare = getEddsaKeyShare(vault)

  const dklsKeygen = new DKLS(
    { reshare: 'plugin' },
    true,
    relayUrl,
    sessionId,
    vault.localPartyId,
    parties,
    oldCommittee,
    hexEncryptionKey,
    { timeoutMs: 60000 }
  )

  await dklsKeygen.startReshareWithRetry(ecdsaKeyshare)

  const schnorrKeygen = new Schnorr(
    { reshare: 'plugin' },
    true,
    relayUrl,
    sessionId,
    vault.localPartyId,
    parties,
    oldCommittee,
    hexEncryptionKey,
    new Uint8Array(0),
    { timeoutMs: 60000 }
  )

  await schnorrKeygen.startReshareWithRetry(eddsaKeyshare)

  await setKeygenComplete({
    serverURL: relayUrl,
    sessionId,
    localPartyId: vault.localPartyId,
  })

  await waitForKeygenComplete({
    serverURL: relayUrl,
    sessionId,
    peers: without(parties, vault.localPartyId),
  })

  let confirmed = false
  for (let i = 0; i < 5; i++) {
    try {
      confirmed = await checkPluginInstalled(
        pluginId,
        vault.publicKeyEcdsa,
        authToken
      )
      if (confirmed) break
    } catch {
      // retry
    }
    await new Promise(r => setTimeout(r, 2000))
  }

  if (!confirmed) {
    throw new Error(
      'Plugin reshare completed but backend still reports plugin as not installed'
    )
  }

  return {
    data: {
      success: true,
      plugin_id: pluginId,
      plugin_name: pluginName,
      message: `Plugin ${pluginName} installed successfully! You can now add policies.`,
    },
  }
}
