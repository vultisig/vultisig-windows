import { useQuery } from '@tanstack/react-query'
import {
  Address,
  beginCell,
  Cell,
  external,
  internal,
  loadStateInit,
  SendMode,
  storeMessage,
  storeMessageRelaxed,
} from '@ton/core'
import { Chain } from '@vultisig/core-chain/Chain'
import { tonPayloadToBase64 } from '@vultisig/core-chain/chains/ton/messageBody/decode'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { Coin } from '@vultisig/core-chain/coin/Coin'
import { getBlockchainSpecificValue } from '@vultisig/core-mpc/keysign/chainSpecific/KeysignChainSpecific'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { SignTon } from '@vultisig/core-mpc/types/vultisig/keysign/v1/wasm_execute_contract_payload_pb'
import { attempt } from '@vultisig/lib-utils/attempt'
import { queryUrl } from '@vultisig/lib-utils/query/queryUrl'

type TonApiJettonPreview = {
  address: string
  decimals: number
  image?: string
  symbol: string
}

type TonApiJettonSwapAction = {
  amount_in: string
  amount_out: string
  jetton_master_in?: TonApiJettonPreview
  jetton_master_out?: TonApiJettonPreview
  ton_in?: number | string
  ton_out?: number | string
}

type TonApiAction = {
  JettonSwap?: TonApiJettonSwapAction
  status: 'ok' | 'failed'
  type: string
}

type TonApiEvent = {
  actions: TonApiAction[]
}

/**
 * Result of a TonAPI emulation. Currently only surfaces detected jetton swaps.
 * `null` when the emulation succeeded but no swap action was found, or when
 * no emulation was performed.
 */
export type TonSimulationInfo = {
  swap: {
    fromAmount: bigint
    fromCoin: Coin
    toAmount: bigint
    toCoin: Coin
  }
} | null

type UseTonSimulationInput = {
  enabled: boolean
  fromAddress?: string
  keysignPayload: KeysignPayload
  signTon: SignTon
}

type CreateTonWalletV4ExternalMessageBocInput = {
  fromAddress: string
  keysignPayload: KeysignPayload
  signTon: SignTon
}

const tonWalletV4R2WalletId = 698983191

const getTonApiCoinFromJetton = (jetton: TonApiJettonPreview): Coin => ({
  chain: Chain.Ton,
  id:
    attempt(() => Address.parse(jetton.address).toString()).data ??
    jetton.address,
  ticker: jetton.symbol,
  decimals: jetton.decimals,
  logo: jetton.image,
})

const getTonAmount = (value?: number | string): bigint =>
  value === undefined ? 0n : BigInt(value)

const parseTonApiSimulation = (event: TonApiEvent): TonSimulationInfo => {
  const action = event.actions.find(
    action => action.status === 'ok' && action.type === 'JettonSwap'
  )?.JettonSwap

  if (!action) return null

  const tonIn = getTonAmount(action.ton_in)
  const tonOut = getTonAmount(action.ton_out)

  if (tonIn > 0n && action.jetton_master_out) {
    return {
      swap: {
        fromAmount: tonIn,
        fromCoin: chainFeeCoin[Chain.Ton],
        toAmount: BigInt(action.amount_out),
        toCoin: getTonApiCoinFromJetton(action.jetton_master_out),
      },
    }
  }

  if (tonOut > 0n && action.jetton_master_in) {
    return {
      swap: {
        fromAmount: BigInt(action.amount_in),
        fromCoin: getTonApiCoinFromJetton(action.jetton_master_in),
        toAmount: tonOut,
        toCoin: chainFeeCoin[Chain.Ton],
      },
    }
  }

  if (action.jetton_master_in && action.jetton_master_out) {
    return {
      swap: {
        fromAmount: BigInt(action.amount_in),
        fromCoin: getTonApiCoinFromJetton(action.jetton_master_in),
        toAmount: BigInt(action.amount_out),
        toCoin: getTonApiCoinFromJetton(action.jetton_master_out),
      },
    }
  }

  return null
}

const getCellFromPayload = (payload?: string): Cell | undefined => {
  const normalized = tonPayloadToBase64(payload)
  if (!normalized) return undefined

  const result = attempt(() => Cell.fromBase64(normalized))
  return result.data
}

const createTonWalletV4ExternalMessageBoc = ({
  fromAddress,
  keysignPayload,
  signTon,
}: CreateTonWalletV4ExternalMessageBocInput) => {
  const tonSpecific = getBlockchainSpecificValue(
    keysignPayload.blockchainSpecific,
    'tonSpecific'
  )

  const signingBody = beginCell()
    .storeBuffer(Buffer.alloc(64))
    .storeUint(tonWalletV4R2WalletId, 32)
    .storeUint(
      tonSpecific.sequenceNumber === 0n ? 0 : Number(tonSpecific.expireAt),
      32
    )
    .storeUint(Number(tonSpecific.sequenceNumber), 32)

  signTon.tonMessages.forEach(message => {
    const stateInit = getCellFromPayload(message.stateInit)
    const transfer = internal({
      to: message.to,
      value: BigInt(message.amount),
      bounce: tonSpecific.bounceable,
      init: stateInit ? loadStateInit(stateInit.beginParse()) : undefined,
      body: getCellFromPayload(message.payload),
    })

    signingBody.storeUint(
      SendMode.PAY_GAS_SEPARATELY | SendMode.IGNORE_ERRORS,
      8
    )
    signingBody.storeRef(
      beginCell().store(storeMessageRelaxed(transfer)).endCell()
    )
  })

  const externalMessage = external({
    to: fromAddress,
    body: signingBody.endCell(),
  })

  return beginCell()
    .store(storeMessage(externalMessage))
    .endCell()
    .toBoc()
    .toString('base64')
}

/**
 * Calls TonAPI's `/v2/events/emulate` to detect whether a TON Connect
 * transaction performs a jetton swap, so the keysign UI can surface the
 * resulting swap quote (input/output amounts and coins) instead of the raw
 * outgoing messages. Disabled when a swap intent is already decoded locally.
 */
export const useTonSimulation = ({
  enabled,
  fromAddress,
  keysignPayload,
  signTon,
}: UseTonSimulationInput) => {
  const tonSpecific =
    keysignPayload.blockchainSpecific.case === 'tonSpecific'
      ? keysignPayload.blockchainSpecific.value
      : null

  return useQuery({
    queryKey: [
      'tonSimulation',
      fromAddress,
      signTon.tonMessages.map(({ amount, payload, stateInit, to }) => ({
        amount,
        payload,
        stateInit,
        to,
      })),
      tonSpecific?.sequenceNumber.toString(),
      tonSpecific?.expireAt.toString(),
      tonSpecific?.bounceable,
    ],
    queryFn: async () => {
      if (!fromAddress) return null

      const boc = createTonWalletV4ExternalMessageBoc({
        fromAddress,
        keysignPayload,
        signTon,
      })

      const event = await queryUrl<TonApiEvent>(
        'https://tonapi.io/v2/events/emulate?ignore_signature_check=true',
        { body: { boc } }
      )

      return parseTonApiSimulation(event)
    },
    enabled:
      enabled &&
      !!fromAddress &&
      keysignPayload.blockchainSpecific.case === 'tonSpecific' &&
      signTon.tonMessages.length > 0,
    retry: false,
    staleTime: Infinity,
  })
}
