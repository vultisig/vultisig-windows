import { OtherChain } from '@core/chain/Chain'
import { queryUrl } from '@lib/utils/query/queryUrl'

import { TokenMetadataResolver } from '../resolver'

type TriggerConstantContractResponse = {
  constant_result?: string[]
}

export const getTronTokenMetadata: TokenMetadataResolver<
  OtherChain.Tron
> = async ({ id }) => {
  const url = 'https://api.trongrid.io/wallet/triggerconstantcontract'
  const ownerAddress = 'T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb'

  const [symbolResult, decimalsResult] = await Promise.all([
    queryUrl<TriggerConstantContractResponse>(url, {
      body: {
        contract_address: id,
        function_selector: 'symbol()',
        owner_address: ownerAddress,
        visible: true,
      },
    }),
    queryUrl<TriggerConstantContractResponse>(url, {
      body: {
        contract_address: id,
        function_selector: 'decimals()',
        owner_address: ownerAddress,
        visible: true,
      },
    }),
  ])

  const symbolHex = symbolResult.constant_result?.[0]
  if (!symbolHex) {
    throw new Error(`Failed to fetch symbol for token ${id}`)
  }

  const decimalsHex = decimalsResult.constant_result?.[0]
  if (!decimalsHex) {
    throw new Error(`Failed to fetch decimals for token ${id}`)
  }

  const ticker = decodeString(symbolHex)
  const decimals = parseInt(decimalsHex, 16)

  return { ticker, decimals }
}

function decodeString(hex: string): string {
  // ERC20/TRC20 string return format:
  // [offset to string data (32 bytes)]
  // [length of string (32 bytes)]
  // [string data (padded to 32 bytes)]

  if (hex.length < 128) {
    // Possibly a short hex string or unexpected format
    return Buffer.from(hex, 'hex').toString('utf8').replace(/\0/g, '').trim()
  }

  const lengthHex = hex.slice(64, 128)
  const length = parseInt(lengthHex, 16)
  const dataHex = hex.slice(128, 128 + length * 2)

  return Buffer.from(dataHex, 'hex').toString('utf8')
}
