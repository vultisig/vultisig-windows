import { getTronStakingDisplay } from '@core/ui/chain/tx/getTronStakingDisplay'
import { Chain } from '@vultisig/core-chain/Chain'
import { tronRpcUrl } from '@vultisig/core-chain/chains/tron/config'
import { isFeeCoin } from '@vultisig/core-chain/coin/utils/isFeeCoin'
import { getFeeAmount } from '@vultisig/core-mpc/keysign/fee'
import { getSendFeeEstimate } from '@vultisig/core-mpc/keysign/send/getSendFeeEstimate'
import { getKeysignChain } from '@vultisig/core-mpc/keysign/utils/getKeysignChain'
import { attempt } from '@vultisig/lib-utils/attempt'

const defaultTronMemoFee = 1_000_000n
const tronMemoFeeRequestTimeoutMs = 10_000

type TronChainParameter = {
  key?: unknown
  value?: unknown
}

type TronChainParametersResponse = {
  chainParameter?: unknown
}

const parseMemoFee = (value: unknown): bigint | undefined => {
  if (typeof value === 'bigint') return value >= 0n ? value : undefined

  if (typeof value === 'number') {
    return Number.isSafeInteger(value) && value >= 0 ? BigInt(value) : undefined
  }

  if (typeof value === 'string' && /^\d+$/.test(value)) {
    return BigInt(value)
  }

  return undefined
}

export const fetchTronMemoFee = async (
  fetcher: typeof fetch = fetch
): Promise<bigint> => {
  const controller = new AbortController()
  const timeoutId = setTimeout(
    () => controller.abort(),
    tronMemoFeeRequestTimeoutMs
  )

  try {
    const result = await attempt(async () => {
      const response = await fetcher(
        `${tronRpcUrl}/wallet/getchainparameters`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: '{}',
          signal: controller.signal,
        }
      )

      if (!response.ok) return undefined

      const data = (await response.json()) as TronChainParametersResponse
      if (!Array.isArray(data.chainParameter)) return undefined

      const memoParameter = (data.chainParameter as TronChainParameter[]).find(
        parameter => parameter.key === 'getMemoFee'
      )

      return parseMemoFee(memoParameter?.value)
    })

    return 'error' in result
      ? defaultTronMemoFee
      : (result.data ?? defaultTronMemoFee)
  } finally {
    clearTimeout(timeoutId)
  }
}

let tronMemoFeePromise: Promise<bigint> | undefined

const getTronMemoFee = () => {
  tronMemoFeePromise ??= fetchTronMemoFee()
  return tronMemoFeePromise
}

type TronMemoFeeInput = {
  chain: Chain
  isNativeToken: boolean
  memo?: string
}

export const paysTronMemoFee = ({
  chain,
  isNativeToken,
  memo,
}: TronMemoFeeInput) =>
  chain === Chain.Tron &&
  isNativeToken &&
  !!memo &&
  !getTronStakingDisplay({ chain, memo })

type AddTronMemoFeeInput = TronMemoFeeInput & {
  fee: bigint
  memoFee?: () => Promise<bigint>
}

export const addTronMemoFee = async ({
  fee,
  memoFee = getTronMemoFee,
  ...input
}: AddTronMemoFeeInput) =>
  paysTronMemoFee(input) ? fee + (await memoFee()) : fee

type GetKeysignFeeAmountInput = Parameters<typeof getFeeAmount>[0]

export const getKeysignFeeAmount = async (input: GetKeysignFeeAmountInput) => {
  const fee = await getFeeAmount(input)
  const { keysignPayload } = input

  return addTronMemoFee({
    fee,
    chain: getKeysignChain(keysignPayload),
    isNativeToken: keysignPayload.coin?.isNativeToken ?? false,
    memo: keysignPayload.memo,
  })
}

type GetSendFeeEstimateInput = Parameters<typeof getSendFeeEstimate>[0]

export const getSendFeeEstimateWithTronMemo = async (
  input: GetSendFeeEstimateInput
) => {
  const fee = await getSendFeeEstimate(input)

  return addTronMemoFee({
    fee,
    chain: input.coin.chain,
    isNativeToken: isFeeCoin(input.coin),
    memo: input.memo,
  })
}
