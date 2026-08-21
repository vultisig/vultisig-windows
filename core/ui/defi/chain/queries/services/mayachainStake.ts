import { mayachainBlockTimeSeconds } from '@core/ui/defi/chain/constants/time'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { coinKeyToString } from '@vultisig/core-chain/coin/Coin'
import { attempt } from '@vultisig/lib-utils/attempt'
import { queryUrl } from '@vultisig/lib-utils/query/queryUrl'

import { mayaMidgardBaseUrl, mayanodeBaseUrl } from '../constants'
import { mayaCoin } from '../tokens'
import { RawThorchainStakePosition } from '../types'
import { convertAPYtoAPR } from '../utils/apy'
import { parseBigint, parseNumber } from '../utils/parsers'

type CacaoPoolMember = {
  deposit_amount?: string
  withdraw_amount?: string
  units?: string
  last_withdraw_height?: string
  last_deposit_height?: string
}

type MayaNetwork = {
  liquidityAPY?: string
}

type MayaHealth = {
  lastThorNode?: {
    height?: number
  }
}

type MayaMimir = {
  CACAOPOOLDEPOSITMATURITYBLOCKS?: number
}

const getCacaoPoolMember = (address: string) =>
  queryUrl<CacaoPoolMember>(`${mayanodeBaseUrl}/cacao_provider/${address}`, {
    headers: { 'X-Client-ID': 'vultisig' },
  })

const getMayaNetwork = () =>
  queryUrl<MayaNetwork>(`${mayaMidgardBaseUrl}/network`)

const getMayaHealth = () => queryUrl<MayaHealth>(`${mayaMidgardBaseUrl}/health`)

const getMayaMimir = () =>
  queryUrl<MayaMimir>(`${mayanodeBaseUrl}/mimir`, {
    headers: { 'X-Client-ID': 'vultisig' },
  })

/**
 * Fetches Maya CACAO stake positions for a given address as price-free raw
 * data; fiat values are joined from live prices at render.
 */
export const fetchMayaStakePositions = async (address: string) => {
  const member = await getCacaoPoolMember(address).catch(() => undefined)

  const deposited = parseBigint(member?.deposit_amount)
  const withdrawn = parseBigint(member?.withdraw_amount)
  const net = deposited - withdrawn
  const amount = net > 0n ? net : 0n

  let apyPercent = 0
  let canUnstake = amount > 0n
  let unstakeAvailableDate: Date | undefined

  const enrichmentResult = await attempt(async () => {
    const [network, health, mimir] = await Promise.all([
      getMayaNetwork(),
      getMayaHealth(),
      getMayaMimir(),
    ])

    const liquidityAPYDecimal = parseNumber(network?.liquidityAPY)
    apyPercent = liquidityAPYDecimal * 100

    const maturityBlocks = mimir?.CACAOPOOLDEPOSITMATURITYBLOCKS ?? 0
    const currentHeight = health?.lastThorNode?.height ?? 0
    const lastDepositHeight = parseNumber(member?.last_deposit_height)
    const blocksSinceDeposit = currentHeight - lastDepositHeight
    const blocksRemaining = maturityBlocks - blocksSinceDeposit

    canUnstake = amount > 0n && blocksRemaining <= 0
    unstakeAvailableDate = canUnstake
      ? undefined
      : new Date(
          Date.now() + blocksRemaining * mayachainBlockTimeSeconds * 1000
        )
  })

  if ('error' in enrichmentResult) {
    canUnstake = amount > 0n
  }

  const apr = convertAPYtoAPR(apyPercent)

  const position: RawThorchainStakePosition = {
    id: 'maya-stake-cacao',
    ticker: mayaCoin.ticker,
    amount,
    fiatBasis: {
      coinKey: coinKeyToString(mayaCoin),
      amount: fromChainAmount(amount, mayaCoin.decimals),
    },
    apr,
    type: 'stake',
    canUnstake,
    unstakeAvailableDate,
    estimatedReward: undefined,
    rewards: undefined,
  }

  return { positions: [position] }
}
