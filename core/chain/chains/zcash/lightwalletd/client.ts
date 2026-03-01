import { lightwalletdService, zcashLightwalletdUrl } from './config'
import { grpcWebServerStream, grpcWebUnary } from './grpcWeb'
import {
  BlockID,
  CompactBlock,
  decodeBlockID,
  decodeCompactBlock,
  decodeRawTransaction,
  decodeSendResponse,
  decodeTreeState,
  encodeBlockHeight,
  encodeBlockRange,
  encodeChainSpec,
  encodeRawTransaction,
  encodeTxFilter,
  RawTransaction,
  SendResponse,
  TreeState,
} from './messages'

const rpcInput = (method: string, requestBytes: Uint8Array) => ({
  baseUrl: zcashLightwalletdUrl,
  service: lightwalletdService,
  method,
  requestBytes,
})

const rpc = (method: string, requestBytes: Uint8Array) =>
  grpcWebUnary(rpcInput(method, requestBytes))

const rpcStream = (method: string, requestBytes: Uint8Array) =>
  grpcWebServerStream(rpcInput(method, requestBytes))

export const getLatestBlock = async (): Promise<BlockID> => {
  const data = await rpc('GetLatestBlock', encodeChainSpec())
  return decodeBlockID(data)
}

export const getTreeState = async (height: number): Promise<TreeState> => {
  const data = await rpc('GetTreeState', encodeBlockHeight(height))
  return decodeTreeState(data)
}

export const sendTransaction = async (
  txData: Uint8Array
): Promise<SendResponse> => {
  const data = await rpc('SendTransaction', encodeRawTransaction(txData))
  return decodeSendResponse(data)
}

export const getBlockRange = async (
  startHeight: number,
  endHeight: number
): Promise<CompactBlock[]> => {
  const frames = await rpcStream(
    'GetBlockRange',
    encodeBlockRange(startHeight, endHeight)
  )
  return frames.map(decodeCompactBlock)
}

export const getTransaction = async (
  txHash: Uint8Array
): Promise<RawTransaction> => {
  const data = await rpc('GetTransaction', encodeTxFilter(txHash))
  return decodeRawTransaction(data)
}
