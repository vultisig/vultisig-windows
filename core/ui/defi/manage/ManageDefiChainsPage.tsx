import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { featureFlags } from '@core/ui/featureFlags'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCreateCoinMutation } from '@core/ui/storage/coins'
import {
  isSupportedDefiChain,
  useDefiChainAvailability,
  useDefiChains,
  useSetDefiChainsMutation,
} from '@core/ui/storage/defiChains'
import { DoneButton } from '@core/ui/vault/chain/manage/shared/DoneButton'
import { ItemGrid } from '@core/ui/vault/chain/manage/shared/ItemGrid'
import { SearchInput } from '@core/ui/vault/chain/manage/shared/SearchInput'
import { useCurrentVaultChains } from '@core/ui/vault/state/currentVaultCoins'
import { useAvailableChains } from '@core/ui/vault/state/useAvailableChains'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { EmptyState } from '@lib/ui/status/EmptyState'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { circleChain, circleName } from '../protocols/circle/core/config'
import { CircleItem } from './CircleItem'
import { DefiChainItem } from './DefiChainItem'

export const ManageDefiChainsPage = () => {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const navigate = useCoreNavigate()
  const chainAvailability = useDefiChainAvailability()
  const availableChains = useAvailableChains()
  const defiChains = useDefiChains()
  const vaultChains = useCurrentVaultChains()
  const [draftSelectedChains, setDraftSelectedChains] = useState<Chain[]>([])
  const draftInitialized = useRef(false)
  const setDefiChainsMutation = useSetDefiChainsMutation()
  const createCoinMutation = useCreateCoinMutation()

  useEffect(() => {
    if (draftInitialized.current) return
    draftInitialized.current = true
    setDraftSelectedChains([...defiChains])
  }, [defiChains])

  const hasCircle = featureFlags.circle && availableChains.includes(circleChain)

  const showCircle = useMemo(() => {
    if (!hasCircle) return false
    if (!search) return true

    const normalizedSearch = search.toLowerCase()
    return circleName.toLowerCase().includes(normalizedSearch)
  }, [hasCircle, search])

  const filteredChains = useMemo(() => {
    let chains = chainAvailability

    if (search) {
      const normalizedSearch = search.toLowerCase()
      chains = chainAvailability.filter(({ chain }) =>
        chain.toLowerCase().includes(normalizedSearch)
      )
    }

    return [...chains].sort((a, b) => a.chain.localeCompare(b.chain))
  }, [chainAvailability, search])

  const hasNoItems = filteredChains.length === 0 && !showCircle

  const toggleDraft = (chain: Chain) => {
    if (!isSupportedDefiChain(chain)) return
    setDraftSelectedChains(prev =>
      prev.includes(chain) ? prev.filter(c => c !== chain) : [...prev, chain]
    )
  }

  const handleDone = async () => {
    setSaveError(null)
    setIsSaving(true)
    try {
      const chainsToAddToVault = draftSelectedChains.filter(
        chain => !vaultChains.includes(chain)
      )
      for (const chain of chainsToAddToVault) {
        const coin = chainFeeCoin[chain]
        if (coin) await createCoinMutation.mutateAsync(coin)
      }
      await setDefiChainsMutation.mutateAsync(draftSelectedChains)
      navigate({ id: 'defi', state: {} })
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={
          <PageHeaderBackButton
            onClick={() => navigate({ id: 'defi', state: {} })}
          />
        }
        secondaryControls={
          <DoneButton onClick={handleDone} disabled={isSaving} />
        }
        title={t('select_chains')}
        hasBorder
      />
      <PageContent gap={24} flexGrow scrollable>
        {saveError != null && (
          <EmptyState
            title={t('failed_to_save_vault')}
            description={saveError}
          />
        )}
        <SearchInput value={search} onChange={setSearch} />
        {hasNoItems ? (
          <EmptyState title={t('no_chains_found')} />
        ) : (
          <ItemGrid>
            {showCircle && <CircleItem />}
            {filteredChains.map(({ chain, canEnable }) => (
              <DefiChainItem
                key={chain}
                value={chain}
                canEnable={canEnable}
                isSelected={draftSelectedChains.includes(chain)}
                onToggle={() => toggleDraft(chain)}
              />
            ))}
          </ItemGrid>
        )}
      </PageContent>
    </VStack>
  )
}
