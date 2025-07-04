import { rootApiUrl } from '@core/config'
import axios, { AxiosError } from 'axios'

import { Endpoints } from './constants'
import { AddressScanInput, ScanResponse, TxScanInput } from './types'

const blockaid_client_id = 'vultisig-desktop-extension'

class BlockaidService {
  private async post<R extends ScanResponse>(url: string, data: unknown) {
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

  scanTransaction(input: any) {
    return this.post<ScanResponse>(Endpoints.txScan(input.chain), input)
  }

  scanAddress(input: AddressScanInput) {
    return this.post<ScanResponse>(Endpoints.addressScan(input.chain), input)
  }

  async fullVerify(tx: TxScanInput, addr: AddressScanInput) {
    const [transactionScanResult, addressScanResult] = await Promise.all([
      this.scanTransaction(tx),
      this.scanAddress(addr),
    ])

    return this.mergeResults(transactionScanResult, addressScanResult)
  }

  private mergeResults(
    ...results: Array<ScanResponse | null | undefined>
  ): ScanResponse | null {
    const existing = results.filter(Boolean) as ScanResponse[]
    if (!existing.length) return null

    // For now, return the first valid result
    // This can be enhanced later if needed
    return existing[0]
  }
}

export const blockaid = new BlockaidService()
