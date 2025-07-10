import { Chain } from '@core/chain/Chain'
import { BlockaidService } from '@core/config/security/blockaid/service'
import {
  BlockaidError,
  BlockaidScanResult,
} from '@core/config/security/blockaid/types'
import { useCore } from '@core/ui/state/core'
import { useBlockaidEnabled } from '@core/ui/storage/blockaid'
import { attempt } from '@lib/utils/attempt'
import { useCallback } from 'react'

type UseBlockaidScanInput = {
  chain: Chain | string
  accountAddress?: string
  rawTx?: string
  metadata?: Record<string, unknown>
}

type UseBlockaidScanResult = {
  scanTransaction: (input: UseBlockaidScanInput) => Promise<{
    scanResult?: BlockaidScanResult
    scanUnavailable: boolean
    error?: BlockaidError
  }>
  isEnabled: boolean
}

export const useBlockaidScan = (): UseBlockaidScanResult => {
  const { client } = useCore()
  const blockaidEnabled = useBlockaidEnabled()

  const scanTransaction = useCallback(
    async ({
      chain,
      accountAddress,
      rawTx,
      metadata,
    }: UseBlockaidScanInput) => {
      // Only run Blockaid check for extension and when enabled
      if (
        client !== 'extension' ||
        !blockaidEnabled ||
        !rawTx ||
        !accountAddress
      ) {
        return { scanUnavailable: false }
      }

      const scanResponse = await attempt(async () => {
        return await BlockaidService.scanTransaction({
          chain,
          accountAddress,
          rawTx,
          metadata,
        })
      })

      if ('error' in scanResponse) {
        // Log error but don't fail the transaction
        console.warn('Blockaid scan failed:', scanResponse.error)
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
