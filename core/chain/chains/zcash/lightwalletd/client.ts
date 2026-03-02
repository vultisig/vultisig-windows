import {
  lightwalletdService,
  zcashLightwalletdUrl,
  zcashLightwalletdUrls,
} from './config'
import {
  grpcWebServerStreamWithFallback,
  grpcWebUnary,
  grpcWebUnaryWithFallback,
} from './grpcWeb'
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

const rpcAllInputs = (method: string, requestBytes: Uint8Array) =>
  zcashLightwalletdUrls.map(baseUrl => ({
    baseUrl,
    service: lightwalletdService,
    method,
    requestBytes,
  }))

const rpcWithFallback = (method: string, requestBytes: Uint8Array) =>
  grpcWebUnaryWithFallback(rpcAllInputs(method, requestBytes))

const rpcStreamWithFallback = (method: string, requestBytes: Uint8Array) =>
  grpcWebServerStreamWithFallback(rpcAllInputs(method, requestBytes))

export const getLatestBlock = async (): Promise<BlockID> => {
  const data = await rpcWithFallback('GetLatestBlock', encodeChainSpec())
  return decodeBlockID(data)
}

export const getTreeState = async (height: number): Promise<TreeState> => {
  const data = await rpcWithFallback('GetTreeState', encodeBlockHeight(height))
  return decodeTreeState(data)
}

export const sendTransaction = async (
  txData: Uint8Array
): Promise<SendResponse> => {
  const data = await grpcWebUnary(
    rpcInput('SendTransaction', encodeRawTransaction(txData))
  )
  return decodeSendResponse(data)
}

export const getBlockRange = async (
  startHeight: number,
  endHeight: number
): Promise<CompactBlock[]> => {
  const frames = await rpcStreamWithFallback(
    'GetBlockRange',
    encodeBlockRange(startHeight, endHeight)
  )
  return frames.map(decodeCompactBlock)
}

export const getTransaction = async (
  txHash: Uint8Array
): Promise<RawTransaction> => {
  const data = await rpcWithFallback('GetTransaction', encodeTxFilter(txHash))
  return decodeRawTransaction(data)
}
