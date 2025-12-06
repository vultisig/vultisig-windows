import { Chain } from '@core/chain/Chain'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { useQuery } from '@tanstack/react-query'

import {
  rujiStakeViewQuery,
  thorBondedNodesQuery,
  thorLpPositionsQuery,
  thorMergedAssetsQuery,
  thorTcyStakeQuery,
} from './queries'

const useThorchainAddress = () => {
  const thorCoin = useCurrentVaultCoin({ chain: Chain.THORChain })
  return thorCoin?.address
}

export const useThorBondedNodesQuery = () => {
  const address = useThorchainAddress()

  return useQuery(thorBondedNodesQuery(address))
}

export const useThorTcyStakeQuery = () => {
  const address = useThorchainAddress()

  return useQuery(thorTcyStakeQuery(address))
}

export const useThorMergedAssetsQuery = () => {
  const address = useThorchainAddress()
  return useQuery(thorMergedAssetsQuery(address))
}

export const useRujiStakeViewQuery = () => {
  const address = useThorchainAddress()
  return useQuery(rujiStakeViewQuery(address))
}

export const useThorLpPositionsQuery = () => {
  const address = useThorchainAddress()

  return useQuery(thorLpPositionsQuery(address))
}
