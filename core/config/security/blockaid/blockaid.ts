import { rootApiUrl } from '@core/config'
import axios, { AxiosError } from 'axios'

import { Chain } from '../../../chain/Chain'
import { Endpoints } from './constants'
import {
  BlockaidAddressPayload,
  BlockaidScanPayload,
  BlockaidScanResult,
} from './types'

const blockaid_client_id = 'vultisig-desktop-extension'

class BlockaidClient {
  private async post<R extends BlockaidScanResult>(url: string, data: unknown) {
    try {
      const { data: res } = await axios.post<R>(url, data, {
        timeout: 6_000,
        headers: {
          'client-id': blockaid_client_id,
          'user-agent': navigator.userAgent,
          origin: rootApiUrl,
        },
      })
      return res
    } catch (err) {
      console.warn('[Blockaid]', (err as AxiosError).message)
      return null
    }
  }

  scanTransaction(input: BlockaidScanPayload) {
    // Determine the correct endpoint based on payload structure
    let endpoint: string

    if (input.chain === 'mainnet') {
      // For mainnet, differentiate between Solana and Sui based on payload structure
      if (input.encoding === 'base58' && input.transactions) {
        // This is a Solana transaction
        endpoint = `${rootApiUrl}/blockaid/v0/solana/message/scan`
      } else {
        // This is a Sui transaction
        endpoint = `${rootApiUrl}/blockaid/v0/sui/transaction/scan`
      }
    } else {
      // For other chains, use the existing endpoint logic
      const chain = typeof input.chain === 'string' ? input.chain : input.chain
      endpoint = Endpoints.txScan(chain as Chain)
    }

    return this.post<BlockaidScanResult>(endpoint, input)
  }

  scanAddress(input: BlockaidAddressPayload) {
    const endpoint = Endpoints.addressScan(input.chain as Chain)

    return this.post<BlockaidScanResult>(endpoint, input)
  }

  async fullVerify(tx: BlockaidScanPayload, addr: BlockaidAddressPayload) {
    const [transactionScanResult, addressScanResult] = await Promise.all([
      this.scanTransaction(tx),
      this.scanAddress(addr),
    ])

    return this.mergeResults(transactionScanResult, addressScanResult)
  }

  private mergeResults(
    ...results: Array<BlockaidScanResult | null | undefined>
  ): BlockaidScanResult | null {
    const existing = results.filter(Boolean) as BlockaidScanResult[]
    if (!existing.length) return null

    // For now, return the first valid result
    // This can be enhanced later if needed
    return existing[0]
  }
}

export const blockaid = new BlockaidClient()
