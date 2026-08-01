import {
  getJettonBalance,
  getJettonWalletAddress,
} from '@vultisig/core-chain/chains/ton/api'
import { queryUrl } from '@vultisig/lib-utils/query/queryUrl'

import { tonstakersJettonMasterAddress, tonstakersPoolAddress } from './core'

const tonApiPublicUrl = 'https://tonapi.io'

type TonstakersPoolResponse = {
  pool?: {
    address?: string
    name?: string
    implementation?: string
    liquid_jetton_master?: string
    apy?: number
    min_stake?: number
  }
}

type TonstakersRatesResponse = {
  rates?: Record<
    string,
    {
      prices?: Record<string, number>
    }
  >
}

const sameRawAddress = (left: string | undefined, right: string): boolean =>
  left?.toLowerCase() === right.toLowerCase()

export type TonstakersProtocolInfo = {
  name: string
  apr?: number
  minStake: bigint
  tonPerTsTon: number
}

/**
 * Reads and validates the live Tonstakers pool contract metadata and tsTON rate.
 * A changed pool implementation/master fails closed rather than valuing or
 * signing against a lookalike contract.
 */
export const getTonstakersProtocolInfo =
  async (): Promise<TonstakersProtocolInfo> => {
    const poolUrl = `${tonApiPublicUrl}/v2/staking/pool/${encodeURIComponent(tonstakersPoolAddress)}`
    const ratesUrl = `${tonApiPublicUrl}/v2/rates?tokens=${encodeURIComponent(tonstakersJettonMasterAddress)}&currencies=ton`

    const [poolResponse, ratesResponse] = await Promise.all([
      queryUrl<TonstakersPoolResponse>(poolUrl),
      queryUrl<TonstakersRatesResponse>(ratesUrl),
    ])

    const pool = poolResponse.pool
    const minStake = pool?.min_stake
    if (
      !pool ||
      !sameRawAddress(pool.address, tonstakersPoolAddress) ||
      pool.implementation !== 'liquidTF' ||
      !sameRawAddress(
        pool.liquid_jetton_master,
        tonstakersJettonMasterAddress
      ) ||
      minStake === undefined ||
      !Number.isSafeInteger(minStake) ||
      minStake <= 0
    ) {
      throw new Error('Tonstakers pool contract validation failed')
    }

    const tonPerTsTon =
      ratesResponse.rates?.[tonstakersJettonMasterAddress]?.prices?.TON

    if (
      tonPerTsTon === undefined ||
      !Number.isFinite(tonPerTsTon) ||
      tonPerTsTon <= 0
    ) {
      throw new Error('Tonstakers tsTON/TON rate is unavailable')
    }

    return {
      name: pool.name?.trim() || 'Tonstakers',
      apr:
        pool.apy !== undefined && Number.isFinite(pool.apy)
          ? pool.apy
          : undefined,
      minStake: BigInt(minStake),
      tonPerTsTon,
    }
  }

export type TonstakersPosition = TonstakersProtocolInfo & {
  jettonBalance: bigint
  jettonWalletAddress: string
}

/** Returns `null` for a wallet with no tsTON; otherwise returns one live position. */
export const getTonstakersPosition = async (
  ownerAddress: string
): Promise<TonstakersPosition | null> => {
  const [jettonBalance, protocol] = await Promise.all([
    getJettonBalance({
      ownerAddress,
      jettonMasterAddress: tonstakersJettonMasterAddress,
    }),
    getTonstakersProtocolInfo(),
  ])

  if (jettonBalance <= 0n) return null

  const jettonWalletAddress = await getJettonWalletAddress({
    ownerAddress,
    jettonMasterAddress: tonstakersJettonMasterAddress,
  })

  return {
    ...protocol,
    jettonBalance,
    jettonWalletAddress,
  }
}
