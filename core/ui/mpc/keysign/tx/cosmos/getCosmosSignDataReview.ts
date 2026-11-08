import { fromBase64, toBech32 } from '@cosmjs/encoding'
import { TW } from '@trustwallet/wallet-core'
import { Chain, CosmosChain } from '@vultisig/core-chain/Chain'
import { isChainOfKind } from '@vultisig/core-chain/ChainKind'
import { cosmosFeeCoinDenom } from '@vultisig/core-chain/chains/cosmos/cosmosFeeCoinDenom'
import { CosmosMsgType } from '@vultisig/core-chain/chains/cosmos/cosmosMsgTypes'
import { getKeysignChain } from '@vultisig/core-mpc/keysign/utils/getKeysignChain'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { attempt, withFallback } from '@vultisig/lib-utils/attempt'
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx'
import { MsgDelegate } from 'cosmjs-types/cosmos/staking/v1beta1/tx'
import { TxBody } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx'
import { MsgTransfer } from 'cosmjs-types/ibc/applications/transfer/v1/tx'

/**
 * A coin as the signed data names it: a bank denom, or a THORChain / Maya
 * deposit asset. The chain's own fee coin always appears under its bank denom.
 */
export type CosmosSignDataCoin = {
  denom: string
  amount: bigint
}

/** One amount leaving the vault, as the signed data states it. */
export type CosmosSignDataTransfer = {
  recipient?: string
  coin: CosmosSignDataCoin
  memo?: string
}

/**
 * What a Cosmos `signDirect` / `signAmino` payload signs, read from the
 * signed data itself rather than from the payload's summary fields.
 * `hasUnsummarizedMessages` is set when a message's effect is not fully
 * described by `transfers`.
 */
export type CosmosSignDataReview = {
  chain: CosmosChain
  transfers: CosmosSignDataTransfer[]
  memo: string
  hasUnsummarizedMessages: boolean
}

type MessageReading = {
  transfers: CosmosSignDataTransfer[]
  isSummarized: boolean
}

type ReadMessageInput<T> = {
  value: T
  chain: CosmosChain
}

type MessageReader<T> = (input: ReadMessageInput<T>) => MessageReading

const unsummarized: MessageReading = { transfers: [], isSummarized: false }

const noTransfers: MessageReading = { transfers: [], isSummarized: true }

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const readString = (value: unknown): string => {
  if (typeof value !== 'string' || value === '') {
    throw new Error('Expected a non-empty string')
  }
  return value
}

const readOptionalString = (value: unknown): string | undefined => {
  if (value === undefined || value === null || value === '') return undefined
  if (typeof value !== 'string') throw new Error('Expected a string')
  return value
}

const readAmount = (value: unknown): bigint => {
  if (typeof value !== 'string' || !/^\d+$/.test(value)) {
    throw new Error('Expected an integer amount')
  }
  return BigInt(value)
}

const readCoin = (value: unknown): CosmosSignDataCoin => {
  if (!isRecord(value)) throw new Error('Expected a coin')
  return { denom: readString(value.denom), amount: readAmount(value.amount) }
}

const readCoins = (value: unknown): CosmosSignDataCoin[] => {
  if (!Array.isArray(value)) throw new Error('Expected a coin list')
  return value.map(readCoin)
}

type ToTransfersInput = {
  recipient?: string
  coins: CosmosSignDataCoin[]
  memo?: string
}

const toTransfers = ({
  recipient,
  coins,
  memo,
}: ToTransfersInput): CosmosSignDataTransfer[] =>
  coins.map(coin => ({ recipient, coin, memo }))

const thorchainAddressPrefix: Partial<Record<CosmosChain, string>> = {
  [Chain.THORChain]: 'thor',
  [Chain.MayaChain]: 'maya',
}

const nativeDepositAsset: Partial<Record<CosmosChain, string>> = {
  [Chain.THORChain]: 'THOR.RUNE',
  [Chain.MayaChain]: 'MAYA.CACAO',
}

type GetDepositDenomInput = {
  chain: CosmosChain
  asset: string
}

const getDepositDenom = ({ chain, asset }: GetDepositDenomInput) =>
  asset.toUpperCase() === nativeDepositAsset[chain]
    ? cosmosFeeCoinDenom[chain]
    : asset

const formatThorchainAsset = (asset: TW.Cosmos.Proto.ITHORChainAsset) => {
  const separator = asset.synth
    ? '/'
    : asset.trade
      ? '~'
      : asset.secured
        ? '-'
        : '.'
  return `${readString(asset.chain)}${separator}${readString(asset.symbol)}`
}

const directReaders: Record<string, MessageReader<Uint8Array>> = {
  [CosmosMsgType.MSG_SEND_URL]: ({ value }) => {
    const message = MsgSend.decode(value)
    return {
      transfers: toTransfers({
        recipient: readString(message.toAddress),
        coins: message.amount.map(readCoin),
      }),
      isSummarized: true,
    }
  },
  [CosmosMsgType.THORCHAIN_MSG_SEND_URL]: ({ value, chain }) => {
    const prefix = thorchainAddressPrefix[chain]
    if (!prefix) return unsummarized
    const message = TW.Cosmos.Proto.Message.THORChainSend.decode(value)
    if (message.toAddress.length === 0) {
      throw new Error('Missing recipient')
    }
    return {
      transfers: toTransfers({
        recipient: toBech32(prefix, message.toAddress),
        coins: message.amounts.map(readCoin),
      }),
      isSummarized: true,
    }
  },
  [CosmosMsgType.THORCHAIN_MSG_DEPOSIT_URL]: ({ value, chain }) => {
    if (!nativeDepositAsset[chain]) return unsummarized
    const message = TW.Cosmos.Proto.Message.THORChainDeposit.decode(value)
    const memo = readOptionalString(message.memo)
    return {
      transfers: message.coins.map(coin => {
        if (!coin.asset) throw new Error('Missing deposit asset')
        return {
          coin: {
            denom: getDepositDenom({
              chain,
              asset: formatThorchainAsset(coin.asset),
            }),
            amount: readAmount(coin.amount),
          },
          memo,
        }
      }),
      isSummarized: true,
    }
  },
  [CosmosMsgType.MSG_TRANSFER_URL]: ({ value }) => {
    const message = MsgTransfer.decode(value)
    return {
      transfers: toTransfers({
        recipient: readString(message.receiver),
        coins: [readCoin(message.token)],
        memo: readOptionalString(message.memo),
      }),
      isSummarized: true,
    }
  },
  [CosmosMsgType.MSG_EXECUTE_CONTRACT_URL]: ({ value }) => {
    const message = MsgExecuteContract.decode(value)
    return {
      transfers: toTransfers({
        recipient: readString(message.contract),
        coins: message.funds.map(readCoin),
      }),
      isSummarized: false,
    }
  },
  [CosmosMsgType.MSG_DELEGATE_URL]: ({ value }) => {
    const message = MsgDelegate.decode(value)
    return {
      transfers: toTransfers({
        recipient: readString(message.validatorAddress),
        coins: [readCoin(message.amount)],
      }),
      isSummarized: true,
    }
  },
  [CosmosMsgType.MSG_UNDELEGATE_URL]: () => noTransfers,
  [CosmosMsgType.MSG_BEGIN_REDELEGATE_URL]: () => noTransfers,
  [CosmosMsgType.MSG_WITHDRAW_DELEGATOR_REWARD_URL]: () => noTransfers,
  '/cosmos.gov.v1.MsgVote': () => noTransfers,
  '/cosmos.gov.v1beta1.MsgVote': () => noTransfers,
  '/cosmos.gov.v1.MsgVoteWeighted': () => noTransfers,
  '/cosmos.gov.v1beta1.MsgVoteWeighted': () => noTransfers,
}

const readAminoSend: MessageReader<Record<string, unknown>> = ({ value }) => ({
  transfers: toTransfers({
    recipient: readString(value.to_address),
    coins: readCoins(value.amount),
  }),
  isSummarized: true,
})

const aminoReaders: Record<string, MessageReader<Record<string, unknown>>> = {
  [CosmosMsgType.MSG_SEND]: readAminoSend,
  [CosmosMsgType.THORCHAIN_MSG_SEND]: readAminoSend,
  'bank/MsgSend': readAminoSend,
  [CosmosMsgType.THORCHAIN_MSG_DEPOSIT]: ({ value, chain }) => {
    if (!nativeDepositAsset[chain]) return unsummarized
    if (!Array.isArray(value.coins)) throw new Error('Expected a coin list')
    const memo = readOptionalString(value.memo)
    return {
      transfers: value.coins.map(coin => {
        if (!isRecord(coin)) throw new Error('Expected a coin')
        return {
          coin: {
            denom: getDepositDenom({ chain, asset: readString(coin.asset) }),
            amount: readAmount(coin.amount),
          },
          memo,
        }
      }),
      isSummarized: true,
    }
  },
  'cosmos-sdk/MsgTransfer': ({ value }) => ({
    transfers: toTransfers({
      recipient: readString(value.receiver),
      coins: [readCoin(value.token)],
      memo: readOptionalString(value.memo),
    }),
    isSummarized: true,
  }),
  [CosmosMsgType.MSG_EXECUTE_CONTRACT]: ({ value }) => ({
    transfers: toTransfers({
      recipient: readString(value.contract),
      coins: value.funds === undefined ? [] : readCoins(value.funds),
    }),
    isSummarized: false,
  }),
  'cosmos-sdk/MsgDelegate': ({ value }) => ({
    transfers: toTransfers({
      recipient: readString(value.validator_address),
      coins: [readCoin(value.amount)],
    }),
    isSummarized: true,
  }),
  'cosmos-sdk/MsgUndelegate': () => noTransfers,
  'cosmos-sdk/MsgBeginRedelegate': () => noTransfers,
  'cosmos-sdk/MsgWithdrawDelegationReward': () => noTransfers,
  'cosmos-sdk/MsgVote': () => noTransfers,
  'cosmos-sdk/v1/MsgVote': () => noTransfers,
  'cosmos-sdk/MsgVoteWeighted': () => noTransfers,
  'cosmos-sdk/v1/MsgVoteWeighted': () => noTransfers,
}

type ReadMessageWithInput<T> = ReadMessageInput<T> & {
  reader: MessageReader<T> | undefined
}

const readMessageWith = <T>({
  reader,
  value,
  chain,
}: ReadMessageWithInput<T>): MessageReading => {
  if (!reader) return unsummarized
  const read = reader
  return withFallback(
    attempt(() => read({ value, chain })),
    unsummarized
  )
}

type ReadSignedMessagesOutput = {
  messages: MessageReading[]
  memo: string
}

type ReadSignDirectInput = {
  bodyBytes: string
  chain: CosmosChain
}

const readSignDirect = ({
  bodyBytes,
  chain,
}: ReadSignDirectInput): ReadSignedMessagesOutput => {
  const body = attempt(() => TxBody.decode(fromBase64(bodyBytes)))
  if ('error' in body) {
    return { messages: [unsummarized], memo: '' }
  }

  return {
    messages: body.data.messages.map(({ typeUrl, value }) =>
      readMessageWith({ reader: directReaders[typeUrl], value, chain })
    ),
    memo: body.data.memo,
  }
}

const parseAminoValue = (value: string) => {
  const parsed = attempt(() => JSON.parse(value))
  return 'data' in parsed && isRecord(parsed.data) ? parsed.data : undefined
}

/**
 * Reads every message of a Cosmos `signDirect` / `signAmino` payload into the
 * amounts it moves out of the vault. Returns `undefined` for any other payload.
 * A message that can't be read, or whose effect isn't fully captured by its
 * transfers, sets `hasUnsummarizedMessages`.
 */
export const getCosmosSignDataReview = (
  keysignPayload: KeysignPayload
): CosmosSignDataReview | undefined => {
  const chain = getKeysignChain(keysignPayload)
  if (!isChainOfKind(chain, 'cosmos')) return undefined

  const { signData } = keysignPayload

  const signed = (() => {
    if (signData.case === 'signDirect') {
      return readSignDirect({ bodyBytes: signData.value.bodyBytes, chain })
    }

    if (signData.case === 'signAmino') {
      return {
        messages: signData.value.msgs.map(({ type, value }) => {
          const record = parseAminoValue(value)
          return record
            ? readMessageWith({
                reader: aminoReaders[type],
                value: record,
                chain,
              })
            : unsummarized
        }),
        memo: keysignPayload.memo ?? '',
      }
    }
  })()

  if (!signed) return undefined

  return {
    chain,
    transfers: signed.messages.flatMap(({ transfers }) => transfers),
    memo: signed.memo,
    hasUnsummarizedMessages:
      signed.messages.length === 0 ||
      signed.messages.some(({ isSummarized }) => !isSummarized),
  }
}
