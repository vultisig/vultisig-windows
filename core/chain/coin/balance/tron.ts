import base58 from 'bs58'

import { isNativeCoin } from '../utils/isNativeCoin'
import { CoinBalanceResolver } from './CoinBalanceResolver'

/**
 * Fetches balance for a Tron token (native or TRC20)
 * @param coin - Coin object representing the token
 * @returns Promise resolving to token balance as string
 */
export const getTronCoinBalance: CoinBalanceResolver = async input => {
  if (isNativeCoin(input)) {
    // Native TRX balance
    const body = {
      address: input.address,
      visible: true,
    }

    try {
      const response = await fetch(
        'https://tron-rpc.publicnode.com/wallet/getaccount',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      )

      const data = await response.json()

      // Extract balance, handling different possible response formats
      const balance =
        data.result?.balance ??
        data.balance ??
        data.result?.balance?.toString() ??
        '0'

      return BigInt(balance ?? '0')
    } catch (error) {
      console.error('Error fetching TRX balance:', error)
      return BigInt('0')
    }
  } else {
    // TRC20 token balance
    try {
      // Decode Base58 addresses to hex
      const hexAddress = base58TronDecode(input.address)
      const hexContractAddress = base58TronDecode(input.id)

      // Fetch TRC20 token balance using EVM service
      const balance = await fetchTRC20TokenBalance(
        `0x${hexContractAddress}`,
        `0x${hexAddress}`
      )

      return BigInt(balance ?? '0')
    } catch (error) {
      console.error('Error fetching TRC20 token balance:', error)
      return BigInt('0')
    }
  }
}

/**
 * Decodes a Base58 string with checksum verification (similar to TrustWallet Core)
 */
function base58TronDecode(address: string): string {
  try {
    // 1. Decode from Base58
    const decoded = base58.decode(address)

    // 2. The last 4 bytes are the checksum
    const addressBytes = decoded.slice(0, -4)

    // 3. Convert to hex string - extract only the address part (21 bytes)
    const hex = Buffer.from(addressBytes).toString('hex')

    // 4. Return only the valid address part (should be 42 chars including '41' prefix)
    return hex.substring(0, 42)
  } catch (error) {
    console.error('Base58 decoding error:', error)
    return ''
  }
}

async function fetchTRC20TokenBalance(
  contractAddress: string,
  walletAddress: string
): Promise<number> {
  // Add "41" prefix after padding with zeros
  const paddedWalletAddress = '0000000000000000000000' + walletAddress.slice(2)

  // Prepare the data field using the function signature of `balanceOf(address)`
  const data = '0x70a08231' + paddedWalletAddress

  // Build the params for the RPC call
  const fromAddress = '0x' + walletAddress.slice(4) // Keep "0x", remove "41"
  const toAddress = '0x' + contractAddress.slice(4) // Keep "0x", remove "41"

  const params: any[] = [
    {
      from: fromAddress,
      to: toAddress,
      gas: '0x0',
      gasPrice: '0x0',
      value: '0x0',
      data: data,
    },
    'latest',
  ]

  // Call the RPC method
  return await intRpcCall('eth_call', params)
}

async function intRpcCall(method: string, params: any[]): Promise<number> {
  return await sendRPCRequest(method, params, (result: any) => {
    if (typeof result === 'number') {
      return result
    }

    if (typeof result === 'string') {
      // Remove '0x' prefix if present
      const hexString = result.startsWith('0x') ? result.slice(2) : result
      return parseInt(hexString, 16)
    }

    throw {
      code: 500,
      message: 'Error converting the RPC result to number',
    }
  })
}

async function sendRPCRequest<T>(
  method: string,
  params: any[],
  decode: (result: any) => T
): Promise<T> {
  const payload = {
    jsonrpc: '2.0',
    method: method,
    params: params,
    id: 1,
  }

  const rpcEndpoint = 'https://api.trongrid.io/jsonrpc'

  try {
    const response = await fetch(rpcEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (data.error) {
      return decode(data.error.message)
    } else if (data.result !== undefined) {
      return decode(data.result)
    } else {
      throw {
        code: 500,
        message: 'Unknown error',
      }
    }
  } catch (error) {
    console.error('RPC Request Payload:', payload)
    console.error('Error:', error)
    throw error
  }
}
