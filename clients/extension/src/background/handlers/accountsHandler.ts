import { Chain } from '@core/chain/Chain'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { deriveAddress } from '@core/chain/publicKey/address/deriveAddress'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { getVaultId } from '@core/ui/vault/Vault'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'

import { getVaultAppSessions } from '../../sessions/state/appSessions'
import { storage } from '../../storage'
import { getDappHostname } from '../../utils/connectedApps'
import { Instance } from '../../utils/constants'
import { setStoredPendingRequest } from '../../utils/pendingRequests'
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
  const currentVaultId = await storage.getCurrentVaultId()

  if (!currentVaultId) return []

  const vaultSessions = await getVaultAppSessions(currentVaultId)
  const currentSession = vaultSessions[getDappHostname(sender)]

  if (!currentSession) return []

  // Check if the chain already exists in the vault's portfolio
  const vaultsCoins = await storage.getCoins()
  const existingAccount = vaultsCoins[currentVaultId].find(
    account => isFeeCoin(account) && account.chain === chain
  )

  if (existingAccount) return [existingAccount.address]

  // If not derive the address from the vault's public key via deriveAddress()
  const walletCore = await getWalletCore()
  const vaults = await storage.getVaults()
  const vault = shouldBePresent(
    vaults.find(vault => getVaultId(vault) === currentVaultId)
  )

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

  return [address]
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
          setStoredPendingRequest('accounts', {
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
