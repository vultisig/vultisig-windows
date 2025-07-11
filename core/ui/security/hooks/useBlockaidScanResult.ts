import { getChainKind } from '@core/chain/ChainKind'
import { BlockaidService } from '@core/config/security/blockaid/service'
import {
  BlockaidError,
  BlockaidScanResult,
} from '@core/config/security/blockaid/types'
import { KeysignMessagePayload } from '@core/mpc/keysign/keysignPayload/KeysignMessagePayload'
import { getKeysignChain } from '@core/mpc/keysign/utils/getKeysignChain'
import { getKeysignCoin } from '@core/mpc/keysign/utils/getKeysignCoin'
import { useCore } from '@core/ui/state/core'
import { useBlockaidEnabled } from '@core/ui/storage/blockaid'
import { attempt } from '@lib/utils/attempt'
import { useCallback } from 'react'

type UseBlockaidScanResultType = {
  scanTransaction: (payload: KeysignMessagePayload) => Promise<{
    scanResult?: BlockaidScanResult
    scanUnavailable: boolean
    error?: BlockaidError
  }>
  isEnabled: boolean
}

export const useBlockaidScanResult = (): UseBlockaidScanResultType => {
  const { client } = useCore()
  const blockaidEnabled = useBlockaidEnabled()

  const scanTransaction = useCallback(
    async (payload: KeysignMessagePayload) => {
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

      const scanResponse = await attempt(async () => {
        return await BlockaidService.scanTransaction({
          chain,
          accountAddress: account_address,
          rawTx,
          metadata: { domain: 'https://vultisig.com' },
        })
      })

      if ('error' in scanResponse) {
        return { scanUnavailable: true }
      }

      const scanResult = scanResponse.data

      const validation = scanResult.validation
      if (validation?.status !== 'Success') {
        return { scanUnavailable: true }
      }

      const { isValid, error } = BlockaidService.validateScanResult(scanResult)

      if (!isValid && error) {
        return { scanUnavailable: false, error }
      }

      return {
        scanResult,
        scanUnavailable: false,
      }
    },
    [client, blockaidEnabled]
  )

  return {
    scanTransaction,
    isEnabled: blockaidEnabled,
  }
}
