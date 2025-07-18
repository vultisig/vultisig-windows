import { getChainKind } from '@core/chain/ChainKind'
import { BlockaidSupportedChain } from '@core/chain/tx/security/chains'
import { BlockaidScanResult } from '@core/chain/tx/security/types'
import {
  TxSecurityValidationResult,
  validateTxSecurity,
} from '@core/chain/tx/security/validate'
import { KeysignMessagePayload } from '@core/mpc/keysign/keysignPayload/KeysignMessagePayload'
import { getKeysignChain } from '@core/mpc/keysign/utils/getKeysignChain'
import { getKeysignCoin } from '@core/mpc/keysign/utils/getKeysignCoin'
import { useCore } from '@core/ui/state/core'
import { useBlockaidEnabled } from '@core/ui/storage/blockaid'
import { useCallback } from 'react'

type UseBlockaidScanResultType = {
  scanTransaction: (payload: KeysignMessagePayload) => Promise<{
    scanResult?: BlockaidScanResult
    scanUnavailable: boolean
    error?: TxSecurityValidationResult
  }>
  isEnabled: boolean
}

export const useBlockaidScanResult = (): UseBlockaidScanResultType => {
  const { client } = useCore()
  const blockaidEnabled = useBlockaidEnabled()

  const scanTransactionForPayload = useCallback(
    async (
      payload: KeysignMessagePayload
    ): Promise<{
      scanResult?: BlockaidScanResult
      scanUnavailable: boolean
      error?: TxSecurityValidationResult
    }> => {
      if (client !== 'extension' || !blockaidEnabled) {
        return { scanUnavailable: true }
      }

      if (!('keysign' in payload)) {
        return { scanUnavailable: true }
      }

      const keysignPayload = payload.keysign
      const chain = getKeysignChain(keysignPayload)
      const coin = getKeysignCoin(keysignPayload)

      const account_address = coin.address
      let rawTx: string | undefined = undefined

      if (getChainKind(chain) === 'evm') {
        const { toAddress, toAmount, memo } = keysignPayload
        const valueHex = BigInt(toAmount).toString(16)
        const paddedValue = '0x' + valueHex.padStart(64, '0')

        const txData = {
          method: 'eth_sendTransaction',
          params: [
            {
              from: account_address,
              to: toAddress,
              value: paddedValue,
              data: memo && memo !== '' ? memo : '0x',
            },
          ],
        }

        rawTx = JSON.stringify(txData)
      }

      if (!rawTx) {
        return { scanUnavailable: true }
      }

      try {
        const validationResult = await validateTxSecurity({
          chain: chain as BlockaidSupportedChain,
          sender: coin.address,
          value: rawTx,
        })

        if (validationResult) {
          return { scanUnavailable: false, error: validationResult }
        }

        return {
          scanUnavailable: false,
        }
      } catch (e) {
        console.error('Error scanning transaction:', e)
        return { scanUnavailable: true }
      }
    },
    [client, blockaidEnabled]
  )

  return {
    scanTransaction: scanTransactionForPayload,
    isEnabled: blockaidEnabled,
  }
}
