import {
  BittensorSigningParams,
  buildBittensorSigningPayload,
} from '@core/chain/chains/bittensor/signing/buildExtrinsic'
import { concatBytes } from '@core/chain/chains/bittensor/signing/scale'

import { getBlockchainSpecificValue } from '../../chainSpecific/KeysignChainSpecific'
import { resolvePolkadotToAddress } from '../../utils/resolvePolkadotToAddress'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { WalletCore } from '@trustwallet/wallet-core'

/**
 * Custom binary format for Bittensor txInputData:
 * [4 bytes: callData length][callData][4 bytes: signedExtra length][signedExtra][payload]
 *
 * This allows compileTx to extract callData and signedExtra to assemble the final extrinsic,
 * while getPreSigningHashes can extract the payload to hash for signing.
 */
export const encodeBittensorTxInput = (
  callData: Uint8Array,
  signedExtra: Uint8Array,
  payload: Uint8Array
): Uint8Array => {
  const callDataLen = new Uint8Array(4)
  new DataView(callDataLen.buffer).setUint32(0, callData.length, true)

  const signedExtraLen = new Uint8Array(4)
  new DataView(signedExtraLen.buffer).setUint32(0, signedExtra.length, true)

  return concatBytes(callDataLen, callData, signedExtraLen, signedExtra, payload)
}

export const decodeBittensorTxInput = (
  data: Uint8Array
): { callData: Uint8Array; signedExtra: Uint8Array; payload: Uint8Array } => {
  let offset = 0

  const callDataLen = new DataView(data.buffer, data.byteOffset).getUint32(
    offset,
    true
  )
  offset += 4
  const callData = data.slice(offset, offset + callDataLen)
  offset += callDataLen

  const signedExtraLen = new DataView(data.buffer, data.byteOffset).getUint32(
    offset,
    true
  )
  offset += 4
  const signedExtra = data.slice(offset, offset + signedExtraLen)
  offset += signedExtraLen

  const payload = data.slice(offset)

  return { callData, signedExtra, payload }
}

export const getBittensorSigningInputs = ({
  keysignPayload,
  walletCore,
}: {
  keysignPayload: KeysignPayload
  walletCore: WalletCore
}): Uint8Array[] => {
  const toAddress = resolvePolkadotToAddress({
    keysignPayload,
    walletCore,
  })

  const {
    recentBlockHash,
    nonce,
    currentBlockNumber,
    specVersion,
    transactionVersion,
    genesisHash,
  } = getBlockchainSpecificValue(
    keysignPayload.blockchainSpecific,
    'polkadotSpecific'
  )

  const params: BittensorSigningParams = {
    toAddress,
    amount: BigInt(keysignPayload.toAmount),
    nonce: Number(nonce),
    blockNumber: Number(currentBlockNumber),
    blockHash: recentBlockHash,
    genesisHash,
    specVersion,
    transactionVersion,
  }

  const { callData, signedExtra, payload } =
    buildBittensorSigningPayload(params)

  // Encode all three components into a single Uint8Array
  // that getPreSigningHashes and compileTx can decode
  return [encodeBittensorTxInput(callData, signedExtra, payload)]
}
