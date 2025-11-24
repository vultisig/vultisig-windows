import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { queryUrl } from '@lib/utils/query/queryUrl'

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
}

type ResolveRefBlockInput = {
  nowNum: number
  refBlockBytesHex: string
  refBlockHashHex: string
}

type GetTronBlockInfoInput = {
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
  }
}
