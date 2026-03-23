import { bittensorRpcUrl } from '@core/chain/chains/bittensor/client'
import { queryUrl } from '@lib/utils/query/queryUrl'

import { CoinBalanceResolver } from '../resolver'

type RpcResponse<T> = {
  jsonrpc: string
  id: number
  result?: T
  error?: { code: number; message: string }
}

// System.Account storage key prefix: twox128("System") ++ twox128("Account")
const systemAccountPrefix =
  '0x26aa394eea5630e07c48ae0c9558cef7b99d880ec681799c0cf30e8886371da9'

export const getBittensorCoinBalance: CoinBalanceResolver = async input => {
  // Compute blake2_128_concat storage key for the account
  const { blake2AsHex } = await import('@polkadot/util-crypto')
  const { decodeAddress } = await import('@polkadot/util-crypto')

  const pubkey = decodeAddress(input.address)
  const hash = blake2AsHex(pubkey, 128).slice(2) // 16 bytes = 128 bits, remove 0x
  const accountId = Buffer.from(pubkey).toString('hex')
  const storageKey = systemAccountPrefix + hash + accountId

  const response = await queryUrl<RpcResponse<string | null>>(
    bittensorRpcUrl,
    {
      body: {
        jsonrpc: '2.0',
        method: 'state_getStorage',
        params: [storageKey],
        id: 1,
      },
    }
  )

  if (response.error) {
    throw new Error(
      `Bittensor balance RPC error: ${response.error.message ?? `code ${response.error.code}`}`
    )
  }

  const result = response.result
  if (!result) return BigInt(0)

  // Parse AccountInfo SCALE: nonce(4) + consumers(4) + providers(4) + sufficients(4) + free(16) + ...
  // free balance starts at byte offset 16 (after 4x u32), encoded as u128 LE
  const hex = result.startsWith('0x') ? result.slice(2) : result
  // Minimum expected length: 64 hex chars (32 bytes for 4x u32 + u128)
  if (hex.length < 64 || !/^[0-9a-fA-F]+$/.test(hex)) {
    throw new Error(`Unexpected storage response format: ${result}`)
  }
  const freeHex = hex.slice(32, 64) // bytes 16-31 = free balance (u128 LE)

  // Convert LE hex to BigInt
  const leBytes = freeHex.match(/.{2}/g)
  if (!leBytes) {
    throw new Error(`Failed to parse free balance hex: ${freeHex}`)
  }
  return BigInt('0x' + leBytes.reverse().join(''))
}
