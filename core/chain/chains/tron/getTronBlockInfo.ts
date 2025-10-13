import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { queryUrl } from '@lib/utils/query/queryUrl'

import { AccountCoinKey } from '../../coin/AccountCoin'
import { tronRpcUrl } from './config'

type TronBlockHeader = {
  raw_data?: {
    timestamp?: number
    number?: number
    version?: number
    txTrieRoot?: string
    parentHash?: string
    witness_address?: string
  }
}

type TronBlock = {
  block_header?: TronBlockHeader
  blockID: string
}

type BlockChainSpecificTron = {
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

type ResolveRefBlockInput = {
  nowNum: number
  refBlockBytesHex: string
  refBlockHashHex: string
}

type GetTronBlockInfoInput = {
  coin: AccountCoinKey
  expiration?: number
  timestamp?: number
  refBlockBytesHex?: string
  refBlockHashHex?: string
}

const getBlockByNum = async (num: number) => {
  return await queryUrl<TronBlock>(`${tronRpcUrl}/wallet/getblockbynum`, {
    body: { num },
  })
}

const deriveRefBlockHashFromBlockID = (blockID: string): string => {
  const id = blockID.replace(/^0x/, '').toLowerCase()
  return id.substring(16, 32)
}

const resolveRefBlock = async ({
  nowNum,
  refBlockBytesHex,
  refBlockHashHex,
}: ResolveRefBlockInput) => {
  const low16 = parseInt(refBlockBytesHex, 16)
  // snap to the most recent block whose (blockNum % 65536) === low16
  let candidate = Math.floor(nowNum / 65536) * 65536 + low16
  if (candidate > nowNum) candidate -= 65536

  // Try a few windows (very rarely more than 1 step is needed)
  for (let k = 0; k < 3; k++) {
    const num = candidate - 65536 * k
    const blk = await getBlockByNum(num)
    const derived = deriveRefBlockHashFromBlockID(blk.blockID)
    if (derived.toLowerCase() === refBlockHashHex.toLowerCase()) {
      return blk
    }
  }
  throw new Error('Could not resolve ref block')
}

export async function getTronBlockInfo({
  coin,
  expiration,
  timestamp,
  refBlockBytesHex,
  refBlockHashHex,
}: GetTronBlockInfoInput): Promise<BlockChainSpecificTron> {
  const url = `${tronRpcUrl}/wallet/getnowblock`

  let currentBlock = await queryUrl<TronBlock>(url, {
    body: {},
  })
  if (refBlockBytesHex && refBlockHashHex) {
    currentBlock = await resolveRefBlock({
      nowNum: shouldBePresent(currentBlock.block_header?.raw_data?.number),
      refBlockBytesHex,
      refBlockHashHex,
    })
  }
  const currentTimestampMillis = Math.floor(Date.now())
  const nowMillis = Math.floor(Date.now())
  const oneHourMillis = 60 * 60 * 1000
  expiration = expiration ?? nowMillis + oneHourMillis

  let estimation = '800000' // Default TRX fee
  if (coin.id) {
    estimation = await getTriggerConstantContractFee(
      coin.address,
      coin.id,
      '0x9c9d70d46934c98fd3d7c302c4e0b924da7a4fdf',
      BigInt('1000000')
    )
  }

  return {
    timestamp: timestamp ?? currentTimestampMillis,
    expiration,
    blockHeaderTimestamp: currentBlock.block_header?.raw_data?.timestamp ?? 0,
    blockHeaderNumber: currentBlock.block_header?.raw_data?.number ?? 0,
    blockHeaderVersion: currentBlock.block_header?.raw_data?.version ?? 0,
    blockHeaderTxTrieRoot:
      currentBlock.block_header?.raw_data?.txTrieRoot ?? '',
    blockHeaderParentHash:
      currentBlock.block_header?.raw_data?.parentHash ?? '',
    blockHeaderWitnessAddress:
      currentBlock.block_header?.raw_data?.witness_address ?? '',
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
  const functionSelector = 'transfer(address,uint256)'

  const parameter = buildTrc20TransferParameter(recipientAddressHex, amount)

  const url = 'https://api.trongrid.io/walletsolidity/triggerconstantcontract'

  type TriggerContractResponse = {
    energy_used?: number
    energy_penalty?: number
  }

  const responseData = await queryUrl<TriggerContractResponse>(url, {
    headers: {
      accept: 'application/json',
    },
    body: {
      owner_address: ownerAddressBase58,
      contract_address: contractAddressBase58,
      function_selector: functionSelector,
      parameter: parameter,
      visible: true,
    },
  })

  const energyUsed = responseData.energy_used ?? 0
  const energyPenalty = responseData.energy_penalty ?? 0
  const totalEnergy = energyUsed + energyPenalty
  const totalSun = totalEnergy * 280

  return totalSun.toString()
}
