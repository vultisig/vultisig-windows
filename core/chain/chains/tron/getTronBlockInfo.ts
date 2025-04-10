import { Coin } from '@core/mpc/types/vultisig/keysign/v1/coin_pb'
import { queryUrl } from '@lib/utils/query/queryUrl'

interface TronBlockHeader {
  raw_data?: {
    timestamp?: number
    number?: number
    version?: number
    txTrieRoot?: string
    parentHash?: string
    witness_address?: string
  }
}

interface TronBlock {
  block_header?: TronBlockHeader
}

interface BlockChainSpecificTron {
  timestamp: number
  expiration: number
  blockHeaderTimestamp: number
  blockHeaderNumber: number
  blockHeaderVersion: number
  blockHeaderTxTrieRoot: string
  blockHeaderParentHash: string
  blockHeaderWitnessAddress: string
  gasFeeEstimation: number
}

export async function getTronBlockInfo(
  coin: Coin
): Promise<BlockChainSpecificTron> {
  const body = {}
  const dataPayload = JSON.stringify(body)

  const url = 'https://tron-rpc.publicnode.com/wallet/getnowblock'

  const responseData = await queryUrl<TronBlock>(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: dataPayload,
  })

  const currentTimestampMillis = Math.floor(Date.now())
  const nowMillis = Math.floor(Date.now())
  const oneHourMillis = 60 * 60 * 1000
  const expiration = nowMillis + oneHourMillis

  let estimation = '800000' // Default TRX fee
  if (!coin.isNativeToken) {
    estimation = await getTriggerConstantContractFee(
      coin.address,
      coin.contractAddress,
      '0x9c9d70d46934c98fd3d7c302c4e0b924da7a4fdf',
      BigInt('1000000')
    )
  }

  return {
    timestamp: currentTimestampMillis,
    expiration: expiration,
    blockHeaderTimestamp: responseData.block_header?.raw_data?.timestamp ?? 0,
    blockHeaderNumber: responseData.block_header?.raw_data?.number ?? 0,
    blockHeaderVersion: responseData.block_header?.raw_data?.version ?? 0,
    blockHeaderTxTrieRoot:
      responseData.block_header?.raw_data?.txTrieRoot ?? '',
    blockHeaderParentHash:
      responseData.block_header?.raw_data?.parentHash ?? '',
    blockHeaderWitnessAddress:
      responseData.block_header?.raw_data?.witness_address ?? '',
    gasFeeEstimation: parseInt(estimation || '0'),
  }
}

/**
 * Builds the 64-byte hex parameter for `transfer(address,uint256)`.
 * @param recipientBaseHex TRON base58-check encoded address (e.g., "TVNtPmF7...")
 * @param amount The amount to transfer (in decimal), e.g. 1000000
 * @returns A 64-byte hex string suitable for the TRC20 `parameter` field
 */
function buildTrc20TransferParameter(
  recipientBaseHex: string,
  amount: bigint
): string {
  // Remove 0x prefix if present and ensure it's a valid hex
  const cleanRecipientHex = recipientBaseHex.replace(/^0x/, '')

  // Pad address to 64 hex chars (24 zeros + 40 hex address)
  const paddedAddressHex = '0'.repeat(24) + cleanRecipientHex

  // Convert amount to hex and pad to 64 hex digits
  const amountHex = amount.toString(16)
  const paddedAmountHex = amountHex.padStart(64, '0')

  // Concatenate the two 32-byte segments
  return paddedAddressHex + paddedAmountHex
}

/**
 * Computes the TRX fee for calling the TRC20 `transfer(address,uint256)` method.
 * @param ownerAddressBase58 Sender's address in base58
 * @param contractAddressBase58 Token contract address in base58
 * @param recipientAddressHex Recipient's address in hex
 * @param amount Amount to transfer
 * @returns Estimated fee in SUN
 */
async function getTriggerConstantContractFee(
  ownerAddressBase58: string,
  contractAddressBase58: string,
  recipientAddressHex: string,
  amount: bigint
): Promise<string> {
  // 1. Build the function selector
  const functionSelector = 'transfer(address,uint256)'

  // 2. Build the 64-byte parameter from recipient + amount
  const parameter = buildTrc20TransferParameter(recipientAddressHex, amount)

  // 3. Create request body
  const body = {
    owner_address: ownerAddressBase58,
    contract_address: contractAddressBase58,
    function_selector: functionSelector,
    parameter: parameter,
    visible: true,
  }

  // 4. Make the POST request
  const url = 'https://api.trongrid.io/walletsolidity/triggerconstantcontract'

  interface TriggerContractResponse {
    energy_used?: number
    energy_penalty?: number
  }

  const responseData = await queryUrl<TriggerContractResponse>(url, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  // 5. Calculate fee
  const energyUsed = responseData.energy_used ?? 0
  const energyPenalty = responseData.energy_penalty ?? 0
  const totalEnergy = energyUsed + energyPenalty
  const totalSun = totalEnergy * 280

  return totalSun.toString()
}
