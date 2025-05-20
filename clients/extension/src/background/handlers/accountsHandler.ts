import { Chain } from '@core/chain/Chain'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { deriveAddress } from '@core/chain/utils/deriveAddress'
import { getVaultPublicKeyExport } from '@core/ui/vault/share/utils/getVaultPublicKeyExport'
import { getVaultId } from '@core/ui/vault/Vault'

import { Messenger } from '../../messengers/createMessenger'
import { getVaultAppSessions } from '../../sessions/state/appSessions'
import { getDappHostname } from '../../utils/connectedApps'
import { Instance } from '../../utils/constants'
import { Messaging, VaultExport } from '../../utils/interfaces'
import { setStoredRequest } from '../../utils/storage'
import { getCurrentVaultId } from '../../vault/state/currentVaultId'
import { getVaults } from '../../vault/state/vaults'
import { getVaultsCoins } from '../../vault/state/vaultsCoins'
import { getWalletCore } from '../walletCore'
import { handleOpenPanel } from '../window/windowManager'

const instance: Record<Instance, boolean> = {
  [Instance.CONNECT]: false,
  [Instance.TRANSACTION]: false,
  [Instance.VAULTS]: false,
}

export const handleFindAccounts = async (
  chain: Chain,
  sender: string
): Promise<string[]> => {
  const currentVaultId = await getCurrentVaultId()

  if (!currentVaultId) return []
  const vaultSessions = await getVaultAppSessions(currentVaultId)
  const currentSession = vaultSessions[getDappHostname(sender)] ?? null

  // First check if we have the address in our coins
  const vaultsCoins = await getVaultsCoins()
  const existingCoins = vaultsCoins[currentVaultId]
    .filter(
      accountCoin => isFeeCoin(accountCoin) && accountCoin.chain === chain
    )
    .map(({ address }) => address ?? '')

  if (existingCoins.length > 0) {
    return existingCoins
  }

  // If not derive the address from the vault's public key via deriveAddress()
  const vaults = await getVaults()
  const vault = vaults.find(vault => getVaultId(vault) === currentVaultId)
  if (!vault) return []

  const walletCore = await getWalletCore()
  if (!walletCore) return []

  try {
    const publicKey = getPublicKey({
      chain,
      walletCore,
      hexChainCode: vault.hexChainCode,
      publicKeys: vault.publicKeys,
    })

    const address = deriveAddress({
      chain,
      publicKey,
      walletCore,
    })

    if (!currentSession) {
      return []
    }
    return [address]
  } catch (error) {
    console.error(`Error deriving address for chain ${chain}:`, error)
    return []
  }
}

const handleFindVault = async (
  sender: string
): Promise<Messaging.GetVault.Response> => {
  const vaults = await getVaults()
  const currentVaultId = await getCurrentVaultId()
  if (!currentVaultId) return undefined
  const vaultSessions = await getVaultAppSessions(currentVaultId)
  const currentSession = vaultSessions[getDappHostname(sender)] ?? null
  if (currentSession) {
    const selected = vaults.find(vault => getVaultId(vault) === currentVaultId)
    if (!selected) return undefined
    const { uid, hex_chain_code, name, public_key_ecdsa, public_key_eddsa } =
      getVaultPublicKeyExport(selected)
    return {
      name,
      uid,
      hexChainCode: hex_chain_code,
      publicKeyEcdsa: public_key_ecdsa,
      publicKeyEddsa: public_key_eddsa,
    }
  } else {
    return undefined
  }
}

function handleWithConnection<T>(
  findFn: () => Promise<T>,
  sender: string,
  options?: { chain?: Chain; timeoutMs?: number; maxRetries?: number }
): Promise<T> {
  const timeoutMs = options?.timeoutMs ?? 60000 // Default 60 seconds timeout
  const maxRetries = options?.maxRetries ?? 120 // 120 retries * 250ms = 30s

  return new Promise((resolve, reject) => {
    if (instance[Instance.CONNECT]) {
      let retries = 0
      const interval = setInterval(() => {
        if (!instance[Instance.CONNECT]) {
          clearInterval(interval)
          findFn().then(resolve)
        } else if (retries++ >= maxRetries) {
          clearInterval(interval)
          instance[Instance.CONNECT] = false // Reset the stuck state
          reject(new Error('Connection timeout. Please try again.'))
        }
      }, 250)
    } else {
      instance[Instance.CONNECT] = true

      findFn().then(result => {
        if (result && (!Array.isArray(result) || result.length)) {
          instance[Instance.CONNECT] = false
          resolve(result)
        } else {
          setStoredRequest({
            chain: options?.chain ?? Chain.Ethereum,
            sender,
          }).then(() => {
            handleOpenPanel({ id: 'connectTab' }).then(createdWindowId => {
              const timeoutId = setTimeout(() => {
                instance[Instance.CONNECT] = false
                chrome.windows.onRemoved.removeListener(onRemoved)
                reject(new Error('User did not respond in time.'))
              }, timeoutMs)

              function onRemoved(closedWindowId: number) {
                if (closedWindowId === createdWindowId) {
                  clearTimeout(timeoutId)
                  instance[Instance.CONNECT] = false
                  findFn().then(resolve)
                  chrome.windows.onRemoved.removeListener(onRemoved)
                }
              }

              chrome.windows.onRemoved.addListener(onRemoved)
            })
          })
        }
      })
    }
  })
}

export const handleGetAccounts = (
  chain: Chain,
  sender: string
): Promise<string[]> => {
  return handleWithConnection(() => handleFindAccounts(chain, sender), sender, {
    chain,
  })
}

export const handleGetVault = (
  sender: string
): Promise<Messaging.GetVault.Response> => {
  return handleWithConnection(() => handleFindVault(sender), sender)
}

export const handleGetVaults = async (
  popupMessenger: Messenger
): Promise<Messaging.GetVaults.Response> => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Vault selection timeout. Please try again.'))
    }, 60000) // 60 second timeout
    handleOpenPanel({ id: 'vaultsTab' })
    popupMessenger.reply(
      'vaults:connect',
      async ({ selectedVaults }: { selectedVaults: VaultExport[] }) => {
        clearTimeout(timeoutId)
        resolve(selectedVaults)
        return
      }
    )
  })
}
