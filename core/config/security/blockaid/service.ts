import { attempt } from '../../../../lib/utils/attempt'
import { Chain } from '../../../chain/Chain'
import { blockaid } from './blockaid'
import { buildBlockaidScanPayload } from './buildScanPayload'
import { BlockaidErrorTypes, BlockaidResultTypes } from './constants'
import { BlockaidError, BlockaidScanResult } from './types'

export class BlockaidService {
  static async scanTransaction({
    chain,
    accountAddress,
    rawTx,
    metadata = { domain: 'https://vultisig.com' },
  }: {
    chain: Chain | string
    accountAddress?: string
    rawTx?: string
    metadata?: Record<string, unknown>
  }): Promise<BlockaidScanResult> {
    const result = await attempt(async () => {
      const payload = buildBlockaidScanPayload({
        chain,
        accountAddress,
        rawTx,
        metadata,
      })

      return await blockaid.scanTransaction(payload)
    })

    if ('error' in result) {
      throw new Error(`Blockaid scan failed: ${result.error}`)
    }

    if (!result.data) {
      throw new Error('Blockaid scan returned no data')
    }

    return result.data
  }

  static async scanAddress({
    chain,
    address,
  }: {
    chain: string
    address: string
  }): Promise<BlockaidScanResult> {
    const result = await attempt(async () => {
      return await blockaid.scanAddress({ chain, address })
    })

    if ('error' in result) {
      throw new Error(`Blockaid address scan failed: ${result.error}`)
    }

    if (!result.data) {
      throw new Error('Blockaid address scan returned no data')
    }

    return result.data
  }

  static validateScanResult(scanResult: BlockaidScanResult): {
    isValid: boolean
    error?: BlockaidError
  } {
    const validation = scanResult.validation

    if (validation?.status !== 'Success') {
      return { isValid: false }
    }

    if (
      validation?.result_type === BlockaidResultTypes.Warning ||
      validation?.result_type === BlockaidResultTypes.Malicious
    ) {
      const error = new BlockaidError(
        'Security warning from Blockaid',
        validation.result_type === BlockaidResultTypes.Warning
          ? BlockaidErrorTypes.Warning
          : BlockaidErrorTypes.Malicious,
        scanResult
      )
      return { isValid: false, error }
    }

    return { isValid: true }
  }
}
