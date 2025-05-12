import { Chain } from '@core/chain/Chain'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
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

  if (currentSession) {
    const vaultsCoins = await getVaultsCoins()
    return vaultsCoins[currentVaultId]
      .filter(
        accountCoin => isFeeCoin(accountCoin) && accountCoin.chain === chain
      )
      .map(({ address }) => address ?? '')
  } else {
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

export const handleGetAccounts = (
  chain: Chain,
  sender: string
): Promise<string[]> => {
  return new Promise(resolve => {
    if (instance[Instance.CONNECT]) {
      const interval = setInterval(() => {
        if (!instance[Instance.CONNECT]) {
          clearInterval(interval)

          handleFindAccounts(chain, sender).then(resolve)
        }
      }, 250)
    } else {
      instance[Instance.CONNECT] = true

      handleFindAccounts(chain, sender).then(accounts => {
        if (accounts.length) {
          instance[Instance.CONNECT] = false

          resolve(accounts)
        } else {
          setStoredRequest({
            chain,
            sender,
          }).then(() => {
            handleOpenPanel({ id: 'connectTab' }).then(createdWindowId => {
              chrome.windows.onRemoved.addListener(
                function onRemoved(closedWindowId) {
                  if (closedWindowId === createdWindowId) {
                    instance[Instance.CONNECT] = false
                    handleFindAccounts(chain, sender).then(resolve)
                    chrome.windows.onRemoved.removeListener(onRemoved)
                  }
                }
              )
            })
          })
        }
      })
    }
  })
}

export const handleGetVault = (
  sender: string
): Promise<Messaging.GetVault.Response> => {
  return new Promise(resolve => {
    if (instance[Instance.CONNECT]) {
      const interval = setInterval(() => {
        if (!instance[Instance.CONNECT]) {
          clearInterval(interval)

          handleFindVault(sender).then(resolve)
        }
      }, 250)
    } else {
      instance[Instance.CONNECT] = true

      handleFindVault(sender).then(vault => {
        if (vault) {
          instance[Instance.CONNECT] = false

          resolve(vault)
        } else {
          setStoredRequest({
            chain: Chain.Ethereum,
            sender,
          }).then(() => {
            handleOpenPanel({ id: 'connectTab' }).then(createdWindowId => {
              chrome.windows.onRemoved.addListener(
                function onRemoved(closedWindowId) {
                  if (closedWindowId === createdWindowId) {
                    instance[Instance.CONNECT] = false
                    handleFindVault(sender).then(resolve)
                    chrome.windows.onRemoved.removeListener(onRemoved)
                  }
                }
              )
            })
          })
        }
      })
    }
  })
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
