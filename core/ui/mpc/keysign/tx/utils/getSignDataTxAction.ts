import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { CosmosChain } from '@core/chain/Chain'
import { cosmosFeeCoinDenom } from '@core/chain/chains/cosmos/cosmosFeeCoinDenom'
import { CosmosMsgType } from '@core/chain/chains/cosmos/cosmosMsgTypes'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { getKeysignChain } from '@core/mpc/keysign/utils/getKeysignChain'
import type { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { fromBase64 } from '@cosmjs/encoding'
import { attempt } from '@lib/utils/attempt'
import { TW } from '@trustwallet/wallet-core'
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx'
import { TxBody } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx'
import { MsgTransfer } from 'cosmjs-types/ibc/applications/transfer/v1/tx'

type SignDataTxAction =
  | { action: 'send'; labelKey: 'sent'; amount: number }
  | { action: 'leave_pool'; labelKey: 'left_pool'; amount?: number }
  | {
      action: 'contract_execution'
      labelKey: 'contract_execution'
      contractAddress: string
      amount?: number
    }
  | { action: 'deposit'; labelKey: 'deposited'; amount: number }
  | { action: 'transfer'; labelKey: 'transferred'; amount: number }

const sumAmountForDenom = (
  amounts: readonly { denom: string; amount: string }[],
  chainFeeDenom: string,
  decimals: number
): number => {
  const total = amounts
    .filter(a => a.denom === chainFeeDenom)
    .reduce((sum, a) => sum + BigInt(a.amount || '0'), 0n)
  return fromChainAmount(total, decimals)
}

const parseAmountFromAminoValue = (
  value: unknown,
  type: string,
  chain: CosmosChain,
  chainFeeDenom: string,
  decimals: number
): number | undefined => {
  const v = value as Record<string, unknown>
  if (!v) return undefined

  if (
    type === CosmosMsgType.MSG_SEND ||
    type === CosmosMsgType.THORCHAIN_MSG_SEND
  ) {
    const amount = (v.amount as { denom: string; amount: string }[])?.[0]
    if (amount?.denom === chainFeeDenom) {
      return fromChainAmount(BigInt(amount.amount || '0'), decimals)
    }
  }

  if (
    type === CosmosMsgType.MSG_EXECUTE_CONTRACT ||
    type === CosmosMsgType.MSG_EXECUTE_CONTRACT_URL
  ) {
    const funds = (v.funds as { denom: string; amount: string }[]) ?? []
    return sumAmountForDenom(funds, chainFeeDenom, decimals) || undefined
  }

  if (type === CosmosMsgType.MSG_TRANSFER_URL) {
    const token = v.token as { denom: string; amount: string } | undefined
    if (token?.denom === chainFeeDenom) {
      return fromChainAmount(BigInt(token.amount || '0'), decimals)
    }
  }

  if (
    type === CosmosMsgType.THORCHAIN_MSG_DEPOSIT ||
    type === CosmosMsgType.THORCHAIN_MSG_DEPOSIT_URL
  ) {
    const coins = (v.coins as { asset?: unknown; amount: string }[]) ?? []
    const first = coins[0]
    if (first?.amount) {
      return fromChainAmount(BigInt(first.amount), decimals)
    }
  }

  return undefined
}

const parseSignDirectMessage = (
  typeUrl: string,
  value: Uint8Array,
  chain: CosmosChain,
  chainFeeDenom: string,
  decimals: number
): Partial<SignDataTxAction> | null => {
  if (
    typeUrl === CosmosMsgType.MSG_SEND_URL ||
    typeUrl === CosmosMsgType.THORCHAIN_MSG_SEND_URL
  ) {
    const result = attempt(() => MsgSend.decode(value))
    if ('error' in result) return null
    const msg = result.data
    const amount = sumAmountForDenom(msg.amount, chainFeeDenom, decimals)
    return { action: 'send', labelKey: 'sent', amount }
  }

  if (
    typeUrl === CosmosMsgType.MSG_EXECUTE_CONTRACT_URL ||
    typeUrl === CosmosMsgType.MSG_EXECUTE_CONTRACT
  ) {
    const result = attempt(() => MsgExecuteContract.decode(value))
    if ('error' in result) return null
    const msg = result.data
    const amount =
      msg.funds?.length && chainFeeDenom
        ? sumAmountForDenom(msg.funds, chainFeeDenom, decimals)
        : undefined
    return {
      action: 'contract_execution',
      labelKey: 'contract_execution',
      contractAddress: msg.contract ?? '',
      amount: amount || undefined,
    }
  }

  if (typeUrl === CosmosMsgType.MSG_TRANSFER_URL) {
    const result = attempt(() => MsgTransfer.decode(value))
    if ('error' in result) return null
    const msg = result.data
    if (msg.token?.denom === chainFeeDenom) {
      const amount = fromChainAmount(BigInt(msg.token.amount ?? '0'), decimals)
      return { action: 'transfer', labelKey: 'transferred', amount }
    }
    return { action: 'transfer', labelKey: 'transferred', amount: 0 }
  }

  if (
    typeUrl === CosmosMsgType.THORCHAIN_MSG_DEPOSIT_URL ||
    typeUrl === CosmosMsgType.THORCHAIN_MSG_DEPOSIT
  ) {
    const result = attempt(() =>
      TW.Cosmos.Proto.Message.THORChainDeposit.decode(value)
    )
    if ('error' in result) return null
    const msg = result.data
    const first = msg.coins?.[0]
    const amount = first?.amount
      ? fromChainAmount(BigInt(first.amount), decimals)
      : 0
    return { action: 'deposit', labelKey: 'deposited', amount }
  }

  if (
    typeUrl === CosmosMsgType.THORCHAIN_MSG_SEND_URL ||
    typeUrl === CosmosMsgType.THORCHAIN_MSG_SEND
  ) {
    const result = attempt(() =>
      TW.Cosmos.Proto.Message.THORChainSend.decode(value)
    )
    if ('error' in result) return null
    const msg = result.data
    const amounts = (msg.amounts ?? []).map(a => ({
      denom: a.denom ?? '',
      amount: a.amount ?? '0',
    }))
    const amount = chainFeeDenom
      ? sumAmountForDenom(amounts, chainFeeDenom, decimals)
      : 0
    return { action: 'send', labelKey: 'sent', amount }
  }

  if (
    typeUrl === CosmosMsgType.THORCHAIN_MSG_LEAVE_POOL_URL ||
    typeUrl === CosmosMsgType.THORCHAIN_MSG_LEAVE_POOL
  ) {
    return { action: 'leave_pool', labelKey: 'left_pool' }
  }

  return null
}

const actionPriority: { type: string; action: string; labelKey: string }[] = [
  {
    type: CosmosMsgType.THORCHAIN_MSG_LEAVE_POOL_URL,
    action: 'leave_pool',
    labelKey: 'left_pool',
  },
  {
    type: CosmosMsgType.THORCHAIN_MSG_LEAVE_POOL,
    action: 'leave_pool',
    labelKey: 'left_pool',
  },
  {
    type: CosmosMsgType.MSG_EXECUTE_CONTRACT_URL,
    action: 'contract_execution',
    labelKey: 'contract_execution',
  },
  {
    type: CosmosMsgType.MSG_EXECUTE_CONTRACT,
    action: 'contract_execution',
    labelKey: 'contract_execution',
  },
  {
    type: CosmosMsgType.MSG_TRANSFER_URL,
    action: 'transfer',
    labelKey: 'transferred',
  },
  {
    type: CosmosMsgType.THORCHAIN_MSG_DEPOSIT_URL,
    action: 'deposit',
    labelKey: 'deposited',
  },
  {
    type: CosmosMsgType.THORCHAIN_MSG_DEPOSIT,
    action: 'deposit',
    labelKey: 'deposited',
  },
  { type: CosmosMsgType.MSG_SEND_URL, action: 'send', labelKey: 'sent' },
  { type: CosmosMsgType.MSG_SEND, action: 'send', labelKey: 'sent' },
  {
    type: CosmosMsgType.THORCHAIN_MSG_SEND_URL,
    action: 'send',
    labelKey: 'sent',
  },
  { type: CosmosMsgType.THORCHAIN_MSG_SEND, action: 'send', labelKey: 'sent' },
]

export const getSignDataTxAction = (
  keysignPayload: KeysignPayload,
  toAmountFormatted: number
): SignDataTxAction | null => {
  const signData = keysignPayload.signData
  const chain = getKeysignChain(keysignPayload)

  if (!chain || !chainFeeCoin[chain]) return null

  const chainFeeDenom = cosmosFeeCoinDenom[chain as CosmosChain] ?? ''
  const decimals = chainFeeCoin[chain].decimals

  if (signData.case === 'signDirect') {
    const decodeResult = attempt(() => {
      const bodyBytes = fromBase64(signData.value.bodyBytes)
      return TxBody.decode(bodyBytes)
    })
    if ('error' in decodeResult) return null
    const txBody = decodeResult.data

    let firstSendAmount: number | undefined

    for (const msg of txBody.messages) {
      const typeUrl = msg.typeUrl || ''
      const result = parseSignDirectMessage(
        typeUrl,
        msg.value,
        chain as CosmosChain,
        chainFeeDenom,
        decimals
      )
      if (!result) continue

      if (result.action === 'send' && result.amount !== undefined) {
        if (firstSendAmount === undefined) firstSendAmount = result.amount
        continue
      }

      if (
        result.action === 'contract_execution' &&
        'contractAddress' in result
      ) {
        return result as SignDataTxAction
      }
      if (result.action === 'deposit' && result.amount !== undefined) {
        return {
          action: 'deposit',
          labelKey: 'deposited',
          amount: result.amount,
        }
      }
      if (result.action === 'transfer' && result.amount !== undefined) {
        return {
          action: 'transfer',
          labelKey: 'transferred',
          amount: result.amount,
        }
      }
      if (result.action === 'leave_pool') {
        return { action: 'leave_pool', labelKey: 'left_pool' }
      }
    }

    return {
      action: 'send',
      labelKey: 'sent',
      amount: firstSendAmount ?? toAmountFormatted,
    }
  }

  if (signData.case === 'signAmino') {
    const msgs = signData.value.msgs

    for (const msg of msgs) {
      const type = msg.type || ''
      const match = actionPriority.find(p => p.type === type)
      if (!match) continue

      const parseResult = attempt(
        () => JSON.parse(msg.value || '{}') as Record<string, unknown>
      )
      const value = 'error' in parseResult ? {} : parseResult.data

      if (match.action === 'contract_execution') {
        const contractAddress = (value.contract as string) ?? ''
        const amount = parseAmountFromAminoValue(
          value,
          type,
          chain as CosmosChain,
          chainFeeDenom,
          decimals
        )
        return {
          action: 'contract_execution',
          labelKey: 'contract_execution',
          contractAddress,
          amount,
        }
      }

      if (match.action === 'send') {
        const result = attempt(() =>
          parseAmountFromAminoValue(
            value,
            type,
            chain as CosmosChain,
            chainFeeDenom,
            decimals
          )
        )
        const amount =
          'error' in result
            ? toAmountFormatted
            : (result.data ?? toAmountFormatted)
        return { action: 'send', labelKey: 'sent', amount }
      }

      if (match.action === 'deposit') {
        const result = attempt(() =>
          parseAmountFromAminoValue(
            value,
            type,
            chain as CosmosChain,
            chainFeeDenom,
            decimals
          )
        )
        const amount = 'error' in result ? 0 : (result.data ?? 0)
        return { action: 'deposit', labelKey: 'deposited', amount }
      }

      if (match.action === 'transfer') {
        const result = attempt(() =>
          parseAmountFromAminoValue(
            value,
            type,
            chain as CosmosChain,
            chainFeeDenom,
            decimals
          )
        )
        const amount = 'error' in result ? 0 : (result.data ?? 0)
        return { action: 'transfer', labelKey: 'transferred', amount }
      }

      if (match.action === 'leave_pool') {
        return { action: 'leave_pool', labelKey: 'left_pool' }
      }
    }

    return { action: 'send', labelKey: 'sent', amount: toAmountFormatted }
  }

  return null
}
