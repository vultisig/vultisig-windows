import { match } from '@lib/utils/match'

import { Messenger } from '../../messengers/createMessenger'
import { RequestMethod } from '../../utils/constants'
import { Messaging, PluginCreatePolicyProps } from '../../utils/interfaces'
import { setStoredPendingRequest } from '../../utils/pendingRequests'
import { handleOpenPanel } from '../window/windowManager'
import { base64 } from '@coral-xyz/anchor/dist/cjs/utils/bytes'
import {
  addTransactionToVault,
  getVaultTransactions,
  removeTransactionFromVault,
  updateTransaction,
} from '../../transactions/state/transactions'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { storage } from '../../storage'
import { v4 as uuidv4 } from 'uuid'
import { policyToMessageHex } from '../../pages/plugin/policyToHexMessage'
import { ensureHexPrefix } from '@lib/utils/hex/ensureHexPrefix'

export const handlePluginRequest = async (
  request: Messaging.Plugin.Request,
  popupMessenger: Messenger
): Promise<Messaging.Plugin.Response> => {
  const [params] = request.params || []
  if (!params) {
    throw new Error('Missing required params in plugin request')
  }
  return match(request.method, {
    [RequestMethod.VULTISIG.PLUGIN_REQUEST_RESHARE]: async () => {
      await setStoredPendingRequest('plugin', {
        type: 'ReshareRequest',
        payload: { id: params.id },
      })
      await handleOpenPanel({ id: 'pluginTab' })

      return new Promise((resolve, reject) => {
        popupMessenger.reply(
          'plugin:reshare',
          ({ joinUrl }: { joinUrl: string }) => {
            if (!joinUrl || typeof joinUrl !== 'string') {
              reject(new Error('Invalid or missing joinUrl'))
              return
            }
            resolve(joinUrl)
          }
        )
      })
    },
    [RequestMethod.VULTISIG.PLUGIN_CREATE_POLICY]: async () => {
      const currentVaultId = shouldBePresent(await storage.getCurrentVaultId())
      console.log('current vault Id:', currentVaultId)

      const uuid = uuidv4()
      await setStoredPendingRequest('plugin', {
        type: 'PluginCreatePolicy',
        payload: {
          recipe: params.recipe,
          publicKey: params.publicKey,
          pluginVersion: params.pluginVersion,
          policyVersion: params.policyVersion,
        },
      })
      if (currentVaultId != params.publicKey) {
        await storage.setCurrentVaultId(params.publicKey)
      }

      const hexMessage = policyToMessageHex({
        ...params,
      } as PluginCreatePolicyProps)
      const prefix = `\x19Ethereum Signed Message:\n${hexMessage.length}`
      const fullMessage = prefix + new TextDecoder().decode(hexMessage)
      console.log('fullMessage:', fullMessage)

      const transaction = {
        transactionPayload: {
          custom: {
            method: 'personal_sign',
            message: fullMessage,
          },
        },
        status: 'default',
      }

      await addTransactionToVault(params.publicKey, {
        ...transaction,
        id: uuid,
        status: 'default',
      })

      const createdWindowId = await handleOpenPanel({ id: 'pluginTab' })
      if (!createdWindowId) {
        throw new Error('Failed to open transaction panel window')
      }

      const updatedTx = shouldBePresent(
        (await getVaultTransactions(currentVaultId)).find(tx => tx.id === uuid)
      )

      await updateTransaction(currentVaultId, {
        ...updatedTx,
        windowId: createdWindowId,
      })

      return await new Promise<string>((resolve, reject) => {
        const onRemoved = async (closedWindowId: number) => {
          if (closedWindowId !== createdWindowId) return

          try {
            const currentTransactions =
              await getVaultTransactions(currentVaultId)
            const matchedTransaction = currentTransactions.find(
              ({ windowId }) => windowId === createdWindowId
            )

            if (!matchedTransaction) {
              reject(new Error('Transaction not found after window closed'))
              chrome.windows.onRemoved.removeListener(onRemoved)
              return
            }

            if (matchedTransaction.status === 'default') {
              // removing the transaction with default status from store
              removeTransactionFromVault(
                currentVaultId,
                shouldBePresent(matchedTransaction.id)
              )
              reject(new Error('Transaction was not completed'))
            } else {
              if (matchedTransaction.txHash) {
                resolve(ensureHexPrefix(matchedTransaction.txHash))
              } else {
                reject(new Error('Transaction has no signature or hash'))
              }
            }
          } catch (err) {
            reject(err)
          } finally {
            chrome.windows.onRemoved.removeListener(onRemoved)
          }
        }

        chrome.windows.onRemoved.addListener(onRemoved)
      })
    },
  })
}
