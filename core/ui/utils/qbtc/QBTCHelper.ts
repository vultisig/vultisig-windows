/**
 * Custom Cosmos transaction builder for QBTC chain.
 * Bypasses WalletCore's TransactionCompiler because MLDSA keys
 * are incompatible with WalletCore's secp256k1 verification.
 * Builds Cosmos protobuf (SignDoc, TxRaw) manually.
 */

import { sha256 } from '@noble/hashes/sha2.js'
import { KeysignSignature } from '@vultisig/core-mpc/keysign/KeysignSignature'
import { CosmosSpecific } from '@vultisig/core-mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'

import {
  concatBytes,
  protoBytes,
  protoString,
  protoVarint,
} from './protoEncoding'

const pubKeyTypeURL = '/cosmos.crypto.mldsa.PubKey'
const msgSendTypeURL = '/cosmos.bank.v1beta1.MsgSend'
const msgTransferTypeURL = '/ibc.applications.transfer.v1.MsgTransfer'
const msgVoteTypeURL = '/cosmos.gov.v1beta1.MsgVote'

/** QBTC fee denom and chain ID (Cosmos SDK); inlined because published `@vultisig/core-chain` omits QBTC. */
const denom = 'qbtc'
const chainID = 'qbtc-testnet'

type QBTCKeysignInput = {
  keysignPayload: KeysignPayload
  cosmosSpecific: CosmosSpecific
}

/** Returns the SHA256 hash(es) of the SignDoc that must be signed. */
export const getQBTCPreSignedImageHash = ({
  keysignPayload,
  cosmosSpecific,
}: QBTCKeysignInput): string[] => {
  const signDoc = buildSignDoc({ keysignPayload, cosmosSpecific })
  const hash = sha256(signDoc)
  return [Buffer.from(hash).toString('hex')]
}

type QBTCSignedTransactionInput = QBTCKeysignInput & {
  signatures: Record<string, KeysignSignature>
}

/** Assembles the signed transaction ready for broadcast. */
export const getQBTCSignedTransaction = ({
  keysignPayload,
  cosmosSpecific,
  signatures,
}: QBTCSignedTransactionInput): {
  serialized: string
  transactionHash: string
} => {
  const { bodyBytes, authInfoBytes } = buildTxComponents({
    keysignPayload,
    cosmosSpecific,
  })

  const signDoc = buildSignDocFromComponents({
    bodyBytes,
    authInfoBytes,
    accountNumber: cosmosSpecific.accountNumber,
  })

  const hashHex = Buffer.from(sha256(signDoc)).toString('hex')
  const sig = shouldBePresent(
    signatures[hashHex],
    `QBTC signature for hash ${hashHex}`
  )
  const sigData = Buffer.from(sig.der_signature, 'hex')

  const txRaw = buildTxRaw({ bodyBytes, authInfoBytes, signature: sigData })
  const txBytesBase64 = Buffer.from(txRaw).toString('base64')
  const serialized = JSON.stringify({
    tx_bytes: txBytesBase64,
    mode: 'BROADCAST_MODE_SYNC',
  })
  const transactionHash = Buffer.from(sha256(txRaw))
    .toString('hex')
    .toUpperCase()

  return { serialized, transactionHash }
}

// --- Internal builders ---

const buildSignDoc = ({ keysignPayload, cosmosSpecific }: QBTCKeysignInput) => {
  const { bodyBytes, authInfoBytes } = buildTxComponents({
    keysignPayload,
    cosmosSpecific,
  })
  return buildSignDocFromComponents({
    bodyBytes,
    authInfoBytes,
    accountNumber: cosmosSpecific.accountNumber,
  })
}

type BuildTxComponentsOutput = {
  bodyBytes: Uint8Array
  authInfoBytes: Uint8Array
}

const buildTxComponents = ({
  keysignPayload,
  cosmosSpecific,
}: QBTCKeysignInput): BuildTxComponentsOutput => {
  const coin = shouldBePresent(keysignPayload.coin)
  const pubKeyData = Buffer.from(coin.hexPublicKey, 'hex')

  const bodyBytes = buildTxBody({ keysignPayload, cosmosSpecific })
  const authInfoBytes = buildAuthInfo({
    pubKeyData,
    sequence: cosmosSpecific.sequence,
    gas: cosmosSpecific.gas,
  })
  return { bodyBytes, authInfoBytes }
}

type BuildSignDocFromComponentsInput = {
  bodyBytes: Uint8Array
  authInfoBytes: Uint8Array
  accountNumber: bigint
}

const buildSignDocFromComponents = ({
  bodyBytes,
  authInfoBytes,
  accountNumber,
}: BuildSignDocFromComponentsInput) =>
  concatBytes(
    protoBytes(1, bodyBytes),
    protoBytes(2, authInfoBytes),
    protoString(3, chainID),
    protoVarint(4, accountNumber)
  )

// --- Message routing ---

const buildTxBody = ({
  keysignPayload,
  cosmosSpecific,
}: QBTCKeysignInput): Uint8Array => {
  const { transactionType, ibcDenomTraces } = cosmosSpecific
  let { memo } = keysignPayload
  let anyMsg: Uint8Array

  // TransactionType.IBC_TRANSFER = 3
  if (transactionType === 3) {
    anyMsg = buildIBCTransferAny({ keysignPayload, ibcDenomTraces })
    const parts = memo?.split(':')
    memo = parts && parts.length === 4 ? parts[3] : undefined
  }
  // TransactionType.VOTE = 1
  else if (transactionType === 1) {
    anyMsg = buildVoteAny(keysignPayload)
    memo = undefined
  } else {
    anyMsg = buildMsgSendAny(keysignPayload)
  }

  return concatBytes(
    protoBytes(1, anyMsg),
    memo ? protoString(2, memo) : new Uint8Array(0)
  )
}

// --- MsgSend ---

const buildMsgSendAny = (keysignPayload: KeysignPayload): Uint8Array => {
  const msgSend = buildMsgSend(keysignPayload)
  return concatBytes(protoString(1, msgSendTypeURL), protoBytes(2, msgSend))
}

const buildMsgSend = (keysignPayload: KeysignPayload): Uint8Array => {
  const coin = shouldBePresent(keysignPayload.coin)
  const coinDenom = coin.isNativeToken ? denom : coin.contractAddress

  const coinProto = concatBytes(
    protoString(1, coinDenom),
    protoString(2, keysignPayload.toAmount)
  )

  return concatBytes(
    protoString(1, coin.address),
    protoString(2, keysignPayload.toAddress),
    protoBytes(3, coinProto)
  )
}

// --- IBC Transfer ---

type BuildIBCTransferAnyInput = {
  keysignPayload: KeysignPayload
  ibcDenomTraces?: CosmosSpecific['ibcDenomTraces']
}

const buildIBCTransferAny = ({
  keysignPayload,
  ibcDenomTraces,
}: BuildIBCTransferAnyInput): Uint8Array => {
  const msgTransfer = buildMsgTransfer({ keysignPayload, ibcDenomTraces })
  return concatBytes(
    protoString(1, msgTransferTypeURL),
    protoBytes(2, msgTransfer)
  )
}

const buildMsgTransfer = ({
  keysignPayload,
  ibcDenomTraces,
}: BuildIBCTransferAnyInput): Uint8Array => {
  const memo = shouldBePresent(keysignPayload.memo, 'IBC transfer memo')
  const parts = memo.split(':')
  if (parts.length < 2) {
    throw new Error(
      'QBTC: IBC transfer requires memo with source channel (ibc:channel-N:...)'
    )
  }
  const sourceChannel = parts[1]

  const timeouts = ibcDenomTraces?.latestBlock?.split('_') ?? []
  const timeoutStr = timeouts[timeouts.length - 1]
  if (!timeoutStr || timeoutStr === '0') {
    throw new Error('QBTC: IBC transfer requires valid timeout timestamp')
  }
  const timeout = BigInt(timeoutStr)

  const coin = shouldBePresent(keysignPayload.coin)
  const tokenDenom = coin.isNativeToken ? denom : coin.contractAddress

  const token = concatBytes(
    protoString(1, tokenDenom),
    protoString(2, keysignPayload.toAmount)
  )

  return concatBytes(
    protoString(1, 'transfer'),
    protoString(2, sourceChannel),
    protoBytes(3, token),
    protoString(4, coin.address),
    protoString(5, keysignPayload.toAddress),
    // field 6 = timeout_height (empty = use timeout_timestamp)
    protoVarint(7, timeout)
  )
}

// --- Governance Vote ---

const buildVoteAny = (keysignPayload: KeysignPayload): Uint8Array => {
  const msgVote = buildMsgVote(keysignPayload)
  return concatBytes(protoString(1, msgVoteTypeURL), protoBytes(2, msgVote))
}

const voteOptionValues: Record<string, bigint> = {
  YES: 1n,
  ABSTAIN: 2n,
  NO: 3n,
  NO_WITH_VETO: 4n,
  NOWITHVETO: 4n,
}

const buildMsgVote = (keysignPayload: KeysignPayload): Uint8Array => {
  const coin = shouldBePresent(keysignPayload.coin)
  const voteStr = (keysignPayload.memo ?? '').replace('QBTC_VOTE:', '')
  const parts = voteStr.split(':')
  if (parts.length !== 2) {
    throw new Error(
      'QBTC: invalid vote memo format, expected OPTION:PROPOSAL_ID'
    )
  }

  const optionKey = parts[0].toUpperCase()
  const option = voteOptionValues[optionKey]
  if (option === undefined) {
    throw new Error(
      `QBTC: invalid vote option '${parts[0]}', expected one of: ${Object.keys(voteOptionValues).join(', ')}`
    )
  }
  const proposalId = BigInt(parts[1])

  return concatBytes(
    protoVarint(1, proposalId),
    protoString(2, coin.address),
    protoVarint(3, option)
  )
}

// --- AuthInfo ---

type BuildAuthInfoInput = {
  pubKeyData: Uint8Array
  sequence: bigint
  gas: bigint
}

const buildAuthInfo = ({
  pubKeyData,
  sequence,
  gas,
}: BuildAuthInfoInput): Uint8Array => {
  // PubKey message: field 1 = key (bytes)
  const pubKeyMsg = protoBytes(1, pubKeyData)

  // Any wrapping PubKey
  const pubKeyAny = concatBytes(
    protoString(1, pubKeyTypeURL),
    protoBytes(2, pubKeyMsg)
  )

  // ModeInfo.Single: field 1 = mode (SIGN_MODE_DIRECT = 1)
  const singleMode = protoVarint(1, 1n)

  // ModeInfo: field 1 = single
  const modeInfo = protoBytes(1, singleMode)

  // SignerInfo: field 1 = public_key (Any), field 2 = mode_info, field 3 = sequence
  const signerInfo = concatBytes(
    protoBytes(1, pubKeyAny),
    protoBytes(2, modeInfo),
    protoVarint(3, sequence)
  )

  // Fee Coin
  const feeCoin = concatBytes(
    protoString(1, denom),
    protoString(2, gas.toString())
  )

  const gasLimit = 300000n

  // Fee: field 1 = amount (repeated Coin), field 2 = gas_limit
  const fee = concatBytes(protoBytes(1, feeCoin), protoVarint(2, gasLimit))

  // AuthInfo: field 1 = signer_infos (repeated), field 2 = fee
  return concatBytes(protoBytes(1, signerInfo), protoBytes(2, fee))
}

// --- TxRaw ---

type BuildTxRawInput = {
  bodyBytes: Uint8Array
  authInfoBytes: Uint8Array
  signature: Uint8Array
}

const buildTxRaw = ({
  bodyBytes,
  authInfoBytes,
  signature,
}: BuildTxRawInput): Uint8Array =>
  concatBytes(
    protoBytes(1, bodyBytes),
    protoBytes(2, authInfoBytes),
    protoBytes(3, signature)
  )
