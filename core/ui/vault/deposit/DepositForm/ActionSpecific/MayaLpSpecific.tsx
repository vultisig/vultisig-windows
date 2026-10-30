import { fetchLpPools } from '@core/ui/storage/defiPositions'
import {
  useCurrentVaultAddress,
  useCurrentVaultAddresses,
} from '@core/ui/vault/state/currentVaultCoins'
import { VStack } from '@lib/ui/layout/Stack'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { Text } from '@lib/ui/text'
import { useQuery } from '@tanstack/react-query'
import { Chain } from '@vultisig/core-chain/Chain'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { match } from '@vultisig/lib-utils/match'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  getMayaLpAssetChain,
  getMayaLpPool,
  mayaLpChains,
} from '../../mayaLp/config'
import {
  fetchMayachainLiquidityProvider,
  getMayaLpPairedAddress,
  getMayaLpPairing,
  MayaLpPairing,
} from '../../mayaLp/pairing'
import { useDepositCoin } from '../../providers/DepositCoinProvider'
import { useDepositFormHandlers } from '../../providers/DepositFormHandlersProvider'
import { LpPoolSelector } from './LpPoolSelector'

const useMayachainLpPoolsQuery = (enabled: boolean) =>
  useQuery({
    queryKey: ['mayachain', 'lp', 'availablePools'],
    queryFn: () => fetchLpPools(Chain.MayaChain),
    enabled,
    ...noRefetchQueryOptions,
  })

/**
 * Pool and paired address for a MayaChain LP add. The CACAO side picks a pool
 * and names the vault's asset address; the asset side joins its chain's pool
 * and names the vault's CACAO address. Either way the vault's LP record
 * decides whether the add may pair, and the form stays blocked until it does.
 */
export const MayaLpSpecific = () => {
  const [{ setValue, getValues }] = useDepositFormHandlers()
  const [coin] = useDepositCoin()
  const cacaoAddress = useCurrentVaultAddress(Chain.MayaChain)
  const vaultAddresses = useCurrentVaultAddresses()
  const { t } = useTranslation()

  const isCacaoSide = coin.chain === Chain.MayaChain
  const poolsQuery = useMayachainLpPoolsQuery(isCacaoSide)

  const [selectedPool, setSelectedPool] = useState<string | null>(() => {
    const initialPool = getValues('pool')
    return typeof initialPool === 'string' && initialPool ? initialPool : null
  })

  const getPool = () => {
    if (isCacaoSide) return selectedPool

    const { chain } = coin
    if (!isOneOf(chain, mayaLpChains)) {
      throw new Error(`${chain} cannot fund a MayaChain LP`)
    }
    return getMayaLpPool(chain)
  }
  const pool = getPool()

  const getAssetAddress = (): string | undefined => {
    if (!isCacaoSide) return coin.address

    const assetChain = pool ? getMayaLpAssetChain(pool) : undefined
    return assetChain ? vaultAddresses[assetChain] : undefined
  }
  const assetAddress = getAssetAddress()

  const providerQuery = useQuery({
    queryKey: ['mayachain', 'lp', 'provider', pool, cacaoAddress],
    queryFn: () =>
      fetchMayachainLiquidityProvider({
        pool: shouldBePresent(pool, 'Pool'),
        address: cacaoAddress,
      }),
    enabled: pool !== null,
  })

  const pairing = providerQuery.isSuccess
    ? getMayaLpPairing({
        provider: providerQuery.data,
        cacaoAddress,
        assetAddress,
      })
    : undefined

  const pairedAddress = pairing
    ? getMayaLpPairedAddress({
        isCacaoSide,
        pairing,
        cacaoAddress,
        assetAddress,
      })
    : null

  useEffect(() => {
    setValue('pool', pool ?? '', { shouldValidate: true })
    setValue('pairedAddress', pairedAddress ?? undefined, {
      shouldValidate: true,
    })
  }, [pairedAddress, pool, setValue])

  const getRefusalMessage = (value: MayaLpPairing) =>
    match(value, {
      pairable: () => null,
      cacaoOnly: () => t('maya_lp_cacao_only_position', { pool }),
      pairedWithOther: () => t('maya_lp_paired_with_other_address', { pool }),
      mismatch: () => t('maya_lp_pending_address_mismatch', { pool }),
    })

  const getStatus = () => {
    if (pool === null) return null
    if (providerQuery.isPending) {
      return { text: t('maya_lp_checking_position'), isError: false }
    }
    if (providerQuery.isError) {
      return { text: t('maya_lp_position_unavailable'), isError: true }
    }
    if (pairing && pairedAddress === null) {
      return { text: getRefusalMessage(pairing), isError: true }
    }
    if (pairedAddress === '') {
      return { text: t('maya_lp_cacao_alone'), isError: false }
    }
    return null
  }
  const status = getStatus()

  return (
    <VStack gap={8}>
      {isCacaoSide && (
        <LpPoolSelector
          value={selectedPool}
          onChange={setSelectedPool}
          pools={(poolsQuery.data ?? []).map(p => p.asset)}
        />
      )}
      {status && (
        <Text size={13} color={status.isError ? 'danger' : 'shy'}>
          {status.text}
        </Text>
      )}
    </VStack>
  )
}
