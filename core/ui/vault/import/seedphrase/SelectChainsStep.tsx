import { Chain } from '@core/chain/Chain'
import {
  ChainGroup,
  chainGroups,
  evmChains,
  groupedChainSet,
} from '@core/chain/chainGroups'
import { chainDerivationPath } from '@core/chain/derivationPath'
import { getChainKeyGroup } from '@core/chain/signing/getChainKeyGroup'
import {
  VaultKeyGroup,
  vaultKeyGroups,
} from '@core/chain/signing/VaultKeyGroup'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { SelectableChainItem } from '@core/ui/chain/selection/SelectableChainItem'
import { AlgorithmSectionHeader } from '@core/ui/vault/chain/manage/AlgorithmSectionHeader'
import { ItemGrid } from '@core/ui/vault/chain/manage/shared/ItemGrid'
import { SearchInput } from '@core/ui/vault/chain/manage/shared/SearchInput'
import { Button } from '@lib/ui/buttons/Button'
import { hideScrollbars } from '@lib/ui/css/hideScrollbars'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { seedphraseImportSupportedChains } from './config'
import { useMnemonic } from './state/mnemonic'
import { useMoneroBirthday } from './state/moneroBirthday'
import { useSelectedChains } from './state/selectedChains'
import { useZcashBirthday } from './state/zcashBirthday'
import { useFinishSeedphraseImport } from './utils/useFinishSeedphraseImport'

const ScrollableContent = styled.div`
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  ${hideScrollbars}
`

const Wrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow: hidden;
`

const individualChains = seedphraseImportSupportedChains.filter(
  chain => !groupedChainSet.has(chain)
)

const chainsByKeyGroup: Record<VaultKeyGroup, Chain[]> = {
  ecdsa: [],
  eddsa: [],
  frozt: [],
  fromt: [],
  mldsa: [],
}

for (const chain of individualChains) {
  const group = getChainKeyGroup(chain)
  chainsByKeyGroup[group].push(chain)
}

for (const group of vaultKeyGroups) {
  chainsByKeyGroup[group].sort((a, b) => a.localeCompare(b))
}

const groupsByKeyGroup: Record<VaultKeyGroup, ChainGroup[]> = {
  ecdsa: chainGroups.filter(
    g => getChainKeyGroup(g.representative) === 'ecdsa'
  ),
  eddsa: [],
  frozt: [],
  fromt: [],
  mldsa: [],
}

const defaultChains: Chain[] = [...evmChains, Chain.Bitcoin, Chain.Solana]

export const SelectChainsStep = () => {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [selectedChains, setSelectedChains] = useSelectedChains()
  const [zcashBirthday, setZcashBirthday] = useZcashBirthday()
  const [moneroBirthday, setMoneroBirthday] = useMoneroBirthday()
  const handleFinish = useFinishSeedphraseImport()
  const walletCore = useAssertWalletCore()
  const [mnemonic] = useMnemonic()

  const isMnemonicInvalid = !walletCore.Mnemonic.isValid(mnemonic)

  useEffect(() => {
    if (selectedChains.length === 0 && !isMnemonicInvalid) {
      setSelectedChains(defaultChains)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const normalizedSearch = search.toLowerCase()

  const filterBySearch = (chains: Chain[]) => {
    if (!search) return chains
    return chains.filter(chain =>
      chain.toLowerCase().includes(normalizedSearch)
    )
  }

  const matchesSearch = (group: ChainGroup) => {
    if (!search) return true
    return group.chains.some(c => c.toLowerCase().includes(normalizedSearch))
  }

  const toggleChain = (chain: Chain) => {
    setSelectedChains(prev =>
      prev.includes(chain) ? prev.filter(c => c !== chain) : [...prev, chain]
    )
  }

  const toggleGroup = (group: ChainGroup) => {
    setSelectedChains(prev => {
      const allSelected = group.chains.every(c => prev.includes(c))
      if (allSelected) {
        return prev.filter(c => !group.chains.includes(c))
      }
      const toAdd = group.chains.filter(c => !prev.includes(c))
      return [...prev, ...toAdd]
    })
  }

  const showZcashBirthday = selectedChains.includes(Chain.ZcashShielded)
  const showMoneroBirthday = selectedChains.includes(Chain.Monero)

  const frostOnlyGroups: VaultKeyGroup[] = ['frozt', 'fromt']
  const visibleKeyGroups = isMnemonicInvalid
    ? frostOnlyGroups
    : vaultKeyGroups.filter(g => g !== 'mldsa')

  const hasAnyVisibleSection = visibleKeyGroups.some(group => {
    const hasChains = filterBySearch(chainsByKeyGroup[group]).length > 0
    const hasGroups = groupsByKeyGroup[group].some(matchesSearch)
    return hasChains || hasGroups
  })

  return (
    <Wrapper>
      <Text size={13} color="shy" style={{ lineHeight: 1.4 }}>
        {t('seed_import_chain_warning')}
      </Text>
      <SearchInput value={search} onChange={setSearch} />
      <ScrollableContent>
        {hasAnyVisibleSection ? (
          <VStack gap={24}>
            {visibleKeyGroups.map(group => {
              const chains = filterBySearch(chainsByKeyGroup[group])
              const groups = groupsByKeyGroup[group].filter(matchesSearch)
              if (chains.length === 0 && groups.length === 0) return null

              return (
                <VStack key={group} gap={12}>
                  <AlgorithmSectionHeader group={group} hasKeys={false} />
                  <ItemGrid>
                    {groups.map(g => (
                      <SelectableChainItem
                        key={g.representative}
                        chain={g.representative}
                        value={g.chains.every(c => selectedChains.includes(c))}
                        onChange={() => toggleGroup(g)}
                        description={chainDerivationPath[g.representative]}
                      />
                    ))}
                    {chains.map(chain => (
                      <SelectableChainItem
                        key={chain}
                        chain={chain}
                        value={selectedChains.includes(chain)}
                        onChange={() => toggleChain(chain)}
                        description={chainDerivationPath[chain]}
                      />
                    ))}
                  </ItemGrid>
                </VStack>
              )
            })}
          </VStack>
        ) : (
          <Text color="shy" size={14}>
            {t('no_chains_found')}
          </Text>
        )}
      </ScrollableContent>
      {showZcashBirthday && (
        <VStack gap={4}>
          <Text size={14} color="supporting">
            {t('zcash_wallet_birthday')}
          </Text>
          <TextInput
            type="number"
            placeholder={t('zcash_wallet_birthday_placeholder')}
            value={zcashBirthday !== null ? String(zcashBirthday) : ''}
            onValueChange={value => {
              const num = parseInt(value, 10)
              setZcashBirthday(Number.isNaN(num) ? null : num)
            }}
          />
          <Text size={12} color="shy">
            {t('zcash_wallet_birthday_hint')}
          </Text>
        </VStack>
      )}
      {showMoneroBirthday && (
        <VStack gap={4}>
          <Text size={14} color="supporting">
            {t('monero_wallet_birthday')}
          </Text>
          <TextInput
            type="number"
            placeholder={t('monero_wallet_birthday_placeholder')}
            value={moneroBirthday !== null ? String(moneroBirthday) : ''}
            onValueChange={value => {
              const num = parseInt(value, 10)
              setMoneroBirthday(Number.isNaN(num) ? null : num)
            }}
          />
          <Text size={12} color="shy">
            {t('monero_wallet_birthday_hint')}
          </Text>
        </VStack>
      )}
      <Button disabled={selectedChains.length === 0} onClick={handleFinish}>
        {t('next')}
      </Button>
    </Wrapper>
  )
}
