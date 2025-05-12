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

function handleWithConnection<T>(
  findFn: () => Promise<T>,
  sender: string,
  options?: { chain?: Chain }
): Promise<T> {
  return new Promise(resolve => {
    if (instance[Instance.CONNECT]) {
      const interval = setInterval(() => {
        if (!instance[Instance.CONNECT]) {
          clearInterval(interval)
          findFn().then(resolve)
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
              chrome.windows.onRemoved.addListener(
                function onRemoved(closedWindowId) {
                  if (closedWindowId === createdWindowId) {
                    instance[Instance.CONNECT] = false
                    findFn().then(resolve)
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
  return new Promise(resolve => {
    handleOpenPanel({ id: 'vaultsTab' })
    popupMessenger.reply(
      'vaults:connect',
      async ({ selectedVaults }: { selectedVaults: VaultExport[] }) => {
        resolve(selectedVaults)
        return
      }
    )
  })
}
