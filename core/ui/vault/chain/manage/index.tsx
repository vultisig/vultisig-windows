import { Chain } from '@core/chain/Chain'
import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { Coin } from '@core/chain/coin/Coin'
import { getDerivationPathStub } from '@core/chain/publicKey/getDerivationPathStub'
import { getChainKeyGroup } from '@core/chain/signing/getChainKeyGroup'
import {
  VaultKeyGroup,
  vaultKeyGroups,
} from '@core/chain/signing/VaultKeyGroup'
import { getVaultKeyGroupHasKeys } from '@core/mpc/vault/getVaultKeyGroupHasKeys'
import { isKeyImportVault } from '@core/mpc/vault/Vault'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import {
  useCreateCoinMutation,
  useDeleteCoinMutation,
} from '@core/ui/storage/coins'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useCurrentVaultNativeCoins } from '@core/ui/vault/state/currentVaultCoins'
import { useAvailableChains } from '@core/ui/vault/state/useAvailableChains'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { EmptyState } from '@lib/ui/status/EmptyState'
import { attempt } from '@lib/utils/attempt'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AlgorithmSectionHeader } from './AlgorithmSectionHeader'
import { ChainItem } from './ChainItem'
import { DoneButton } from './shared/DoneButton'
import { ItemGrid } from './shared/ItemGrid'
import { SearchInput } from './shared/SearchInput'

export const ManageVaultChainsPage = () => {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const vault = useCurrentVault()
  const walletCore = useAssertWalletCore()
  const availableChains = useAvailableChains()
  const currentCoins = useCurrentVaultNativeCoins()
  const [draftSelectedChains, setDraftSelectedChains] = useState<Set<Chain>>(
    () => new Set()
  )
  const draftInitialized = useRef(false)
  const navigate = useCoreNavigate()
  const createCoin = useCreateCoinMutation()
  const deleteCoin = useDeleteCoinMutation()
  const isKeyImport = isKeyImportVault(vault)

  useEffect(() => {
    if (draftInitialized.current) return
    draftInitialized.current = true
    setDraftSelectedChains(new Set(currentCoins.map(c => c.chain)))
  }, [currentCoins])

  const nativeCoins = Object.values(chainFeeCoin).filter(coin =>
    availableChains.includes(coin.chain)
  )

  const normalizedSearch = search.toLowerCase()

  const filterBySearch = (coins: Coin[]) => {
    if (!search) return coins
    return coins.filter(
      ({ chain, ticker }) =>
        chain.toLowerCase().includes(normalizedSearch) ||
        ticker.toLowerCase().includes(normalizedSearch)
    )
  }

  const groupedCoins: Record<VaultKeyGroup, Coin[]> = {
    ecdsa: [],
    eddsa: [],
    frozt: [],
    mldsa: [],
  }

  for (const coin of nativeCoins) {
    const group = getChainKeyGroup(coin.chain)
    groupedCoins[group].push(coin)
  }

  for (const group of vaultKeyGroups) {
    groupedCoins[group].sort((a, b) => a.chain.localeCompare(b.chain))
  }

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

      const needsFroztKeygen =
        toAdd.some(c => getChainKeyGroup(c) === 'frozt') &&
        !getVaultKeyGroupHasKeys(vault, 'frozt')

      for (const coin of toRemove) {
        await deleteCoin.mutateAsync(extractAccountCoinKey(coin))
      }

      if (needsFroztKeygen) {
        const nonFroztToAdd = toAdd.filter(c => getChainKeyGroup(c) !== 'frozt')
        for (const chain of nonFroztToAdd) {
          const coin = chainFeeCoin[chain]
          if (coin) await createCoin.mutateAsync(coin)
        }

        const froztChainsToAdd = toAdd.filter(
          c => getChainKeyGroup(c) === 'frozt'
        )
        navigate({
          id: 'addChainKeys',
          state: { keyGroup: 'frozt', chainsToAdd: froztChainsToAdd },
        })
        return
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

  const hasAnyVisibleSection = vaultKeyGroups.some(group => {
    if (group === 'mldsa') return false
    const coins = filterBySearch(groupedCoins[group])
    return coins.length > 0
  })

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
        {hasAnyVisibleSection ? (
          vaultKeyGroups.map(group => {
            const coins = filterBySearch(groupedCoins[group])
            const hasKeys = getVaultKeyGroupHasKeys(vault, group)

            if (group === 'mldsa' || coins.length === 0) return null

            return (
              <VStack key={group} gap={12}>
                <AlgorithmSectionHeader group={group} hasKeys={hasKeys} />
                <ItemGrid>
                  {coins.map(coin => (
                    <ChainItem
                      key={coin.chain}
                      value={coin}
                      isSelected={draftSelectedChains.has(coin.chain)}
                      onToggle={() => toggleDraft(coin.chain)}
                      derivationPath={
                        isKeyImport
                          ? getDerivationPathStub(coin.chain, walletCore)
                          : undefined
                      }
                    />
                  ))}
                </ItemGrid>
              </VStack>
            )
          })
        ) : (
          <EmptyState title={t('no_chains_found')} />
        )}
      </PageContent>
    </VStack>
  )
}
