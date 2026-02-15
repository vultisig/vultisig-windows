import { Chain } from '@core/chain/Chain'
import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import {
  useCreateCoinMutation,
  useDeleteCoinMutation,
} from '@core/ui/storage/coins'
import { useCurrentVaultNativeCoins } from '@core/ui/vault/state/currentVaultCoins'
import { useAvailableChains } from '@core/ui/vault/state/useAvailableChains'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { EmptyState } from '@lib/ui/status/EmptyState'
import { attempt } from '@lib/utils/attempt'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ChainItem } from './ChainItem'
import { DoneButton } from './shared/DoneButton'
import { ItemGrid } from './shared/ItemGrid'
import { SearchInput } from './shared/SearchInput'

export const ManageVaultChainsPage = () => {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const availableChains = useAvailableChains()
  const currentCoins = useCurrentVaultNativeCoins()
  const [draftSelectedChains, setDraftSelectedChains] = useState<Set<Chain>>(
    () => new Set()
  )
  const draftInitialized = useRef(false)
  const navigate = useCoreNavigate()
  const createCoin = useCreateCoinMutation()
  const deleteCoin = useDeleteCoinMutation()

  useEffect(() => {
    if (draftInitialized.current) return
    draftInitialized.current = true
    setDraftSelectedChains(new Set(currentCoins.map(c => c.chain)))
  }, [currentCoins])

  const nativeCoins = useMemo(
    () =>
      Object.values(chainFeeCoin).filter(coin =>
        availableChains.includes(coin.chain)
      ),
    [availableChains]
  )

  const sortedNativeCoins = useMemo(() => {
    let coins = nativeCoins

    if (search) {
      const normalizedSearch = search.toLowerCase()
      coins = nativeCoins.filter(
        ({ chain, ticker }) =>
          chain.toLowerCase().includes(normalizedSearch) ||
          ticker.toLowerCase().includes(normalizedSearch)
      )
    }

    return coins.sort((a, b) => a.chain.localeCompare(b.chain))
  }, [nativeCoins, search])

  const toggleDraft = (chain: Chain) => {
    setDraftSelectedChains(prev => {
      const next = new Set(prev)
      if (next.has(chain)) next.delete(chain)
      else next.add(chain)
      return next
    })
  }

  const handleDone = async () => {
    setSaveError(null)
    setIsSaving(true)
    const result = await attempt(async () => {
      const currentChains = new Set(currentCoins.map(c => c.chain))
      const toRemove = currentCoins.filter(
        c => !draftSelectedChains.has(c.chain)
      )
      const toAdd = [...draftSelectedChains].filter(
        chain => !currentChains.has(chain)
      )

      for (const coin of toRemove) {
        await deleteCoin.mutateAsync(extractAccountCoinKey(coin))
      }
      for (const chain of toAdd) {
        const coin = chainFeeCoin[chain]
        if (coin) await createCoin.mutateAsync(coin)
      }

      navigate({ id: 'vault' })
    })
    setIsSaving(false)
    if ('error' in result) {
      setSaveError(
        result.error instanceof Error
          ? result.error.message
          : String(result.error)
      )
    }
  }

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={
          <PageHeaderBackButton onClick={() => navigate({ id: 'vault' })} />
        }
        secondaryControls={
          <DoneButton onClick={handleDone} disabled={isSaving} />
        }
        title={t('manage_chains')}
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
        {sortedNativeCoins.length > 0 ? (
          <ItemGrid>
            {sortedNativeCoins.map(coin => (
              <ChainItem
                key={coin.chain}
                value={coin}
                isSelected={draftSelectedChains.has(coin.chain)}
                onToggle={() => toggleDraft(coin.chain)}
              />
            ))}
          </ItemGrid>
        ) : (
          <EmptyState title={t('no_chains_found')} />
        )}
      </PageContent>
    </VStack>
  )
}
