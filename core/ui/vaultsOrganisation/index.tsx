import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { SettingsPageHeader } from '@core/ui/settings/SettingsPageHeader'
import {
  useCurrentVaultId,
  useSetCurrentVaultIdMutation,
} from '@core/ui/storage/currentVaultId'
import { useVaultFolders } from '@core/ui/storage/vaultFolders'
import { useFolderlessVaults, useVaults } from '@core/ui/storage/vaults'
import { DoneButton } from '@core/ui/vault/chain/manage/shared/DoneButton'
import {
  LeadingIconBadge,
  SectionHeader,
  VaultListItem,
  VaultListRow,
  VaultSearchField,
} from '@core/ui/vaultsOrganisation/components'
import { VaultMenuRow } from '@core/ui/vaultsOrganisation/components/VaultMenuRow'
import { useVaultsTotalBalances } from '@core/ui/vaultsOrganisation/hooks/useVaultsTotalBalances'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { CheckIcon } from '@lib/ui/icons/CheckIcon'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { FolderIcon } from '@lib/ui/icons/FolderIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { PenWritingFilledIcon } from '@lib/ui/icons/PenWritingFilledIcon'
import { PlusIcon } from '@lib/ui/icons/PlusIcon'
import { SearchIcon } from '@lib/ui/icons/SearchIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnFinishProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { getVaultId } from '@vultisig/core-mpc/vault/Vault'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useCore } from '../state/core'
import { sumVaultTotals } from './utils/sumVaultTotals'

type FolderEntry = {
  id: string
  name: string
  vaultCount: number
  activeVaultName?: string
}

// Gate the batched balance fetch behind a size threshold. Issue #3785 reports
// UI lag that scales with `vaults * coins-per-vault` — each vault's coins fan
// out into independent RPCs against `getCoinBalance`. For small lists the
// batched total is useful UX; past these thresholds we skip the cumulative
// total entirely to keep the switcher snappy. Either signal alone warrants
// skipping because DOM/re-render cost only scales with vault count while
// network cost scales with vault coins.
const heavyBalanceCoinBudget = 100
const heavyBalanceVaultCountThreshold = 30

type VaultsPageProps = Partial<OnFinishProp> & {
  /** Draws the page as the settings vault menu; its controls stay the same. */
  isSettingsLook?: boolean
}

/** Vaults and folders, with search, manage and add; picking a vault makes it current. */
export const VaultsPage = ({
  onFinish,
  isSettingsLook = false,
}: VaultsPageProps) => {
  const { t } = useTranslation()
  const { goHome } = useCore()
  const goBack = useNavigateBack()
  const navigate = useCoreNavigate()

  const { mutate } = useSetCurrentVaultIdMutation()
  const currentVaultId = useCurrentVaultId()
  const folders = useVaultFolders()
  const vaults = useVaults()
  const folderlessVaults = useFolderlessVaults()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const folderEntries = useMemo<FolderEntry[]>(() => {
    return folders.map(folder => {
      const folderVaults = vaults.filter(vault => vault.folderId === folder.id)
      const vaultCount = folderVaults.length
      const activeVault = folderVaults.find(
        vault => getVaultId(vault) === currentVaultId
      )

      return {
        id: folder.id,
        name: folder.name,
        vaultCount,
        activeVaultName: activeVault?.name,
      }
    })
  }, [folders, vaults, currentVaultId])

  const totalCoinCount = vaults.reduce(
    (sum, vault) => sum + vault.coins.length,
    0
  )
  const skipBalanceFetch =
    vaults.length > heavyBalanceVaultCountThreshold ||
    totalCoinCount > heavyBalanceCoinBudget

  // Pass every stored vault (folderless + in folders) so the cumulative
  // subtitle, which is labelled with `vault_count` across all vaults, actually
  // sums the same set. Per-row rendering below only uses the folderless
  // subset, but the shared cache means folder vaults' balances are ready when
  // the user drills into a folder.
  const { totals: vaultTotals } = useVaultsTotalBalances({
    vaults,
    enabled: !skipBalanceFetch,
  })
  const formatFiatAmount = useFormatFiatAmount()

  const totalVaultsCount = vaults.length
  const vaultCountLabel = t('vault_count', { count: totalVaultsCount })

  const summarySubtitle = useMemo(() => {
    if (totalVaultsCount === 0) {
      return t('no_vaults')
    }

    const parts = [vaultCountLabel]

    const totalBalance = sumVaultTotals({ totals: vaultTotals, vaults })
    if (
      totalVaultsCount > 1 &&
      !skipBalanceFetch &&
      totalBalance !== undefined
    ) {
      parts.push(formatFiatAmount(totalBalance))
    }

    return parts.join(' • ')
  }, [
    formatFiatAmount,
    skipBalanceFetch,
    t,
    totalVaultsCount,
    vaultCountLabel,
    vaults,
    vaultTotals,
  ])

  const handleBack = () => (onFinish ? goBack() : goHome())
  const handleDone = () => (onFinish ? onFinish() : goBack())
  const handleManage = () => navigate({ id: 'manageVaults' })
  const handleCreateVault = () => navigate({ id: 'newVault' })

  const handleSelectVault = (vaultId: string) =>
    mutate(vaultId, {
      onSuccess: onFinish ?? goHome,
    })

  const openSearch = () => setIsSearchOpen(true)
  const closeSearch = () => {
    setIsSearchOpen(false)
    setSearchQuery('')
  }

  const normalizedQuery = searchQuery.trim().toLowerCase()
  const isSearching = normalizedQuery.length > 0

  const displayedFolders = isSearching
    ? folderEntries.filter(folder =>
        folder.name.toLowerCase().includes(normalizedQuery)
      )
    : folderEntries
  const displayedVaults = isSearching
    ? vaults.filter(vault => vault.name.toLowerCase().includes(normalizedQuery))
    : folderlessVaults

  const hasNoSearchResults =
    isSearching && displayedFolders.length === 0 && displayedVaults.length === 0
  const doneControl = onFinish ? <DoneButton onClick={handleDone} /> : undefined

  return (
    <VStack fullHeight>
      {isSettingsLook ? (
        <SettingsPageHeader
          onBack={handleBack}
          secondaryControls={doneControl}
          title={t('select_vault')}
        />
      ) : (
        <PageHeader
          primaryControls={<PageHeaderBackButton onClick={handleBack} />}
          secondaryControls={doneControl}
          title={t('vaults')}
        />
      )}
      <PageContent gap={28} flexGrow scrollable>
        <SectionHeader
          title={t('vaults')}
          subtitle={summarySubtitle}
          actions={
            <>
              {totalVaultsCount > 1 && (
                <IconButton
                  kind="secondary"
                  size="lg"
                  onClick={openSearch}
                  aria-label={t('search_field_placeholder')}
                >
                  <SearchIcon />
                </IconButton>
              )}
              {totalVaultsCount > 1 && (
                <IconButton
                  kind="secondary"
                  size="lg"
                  onClick={handleManage}
                  aria-label={t('edit_vaults')}
                >
                  <PenWritingFilledIcon />
                </IconButton>
              )}
              <IconButton
                kind="primary"
                size="lg"
                onClick={handleCreateVault}
                aria-label={t('add_new_vault')}
              >
                <PlusIcon />
              </IconButton>
            </>
          }
        />

        {isSearchOpen && (
          <VaultSearchField
            value={searchQuery}
            onChange={setSearchQuery}
            onClose={closeSearch}
          />
        )}

        {displayedFolders.length > 0 && (
          <VStack gap={12}>
            {displayedFolders.map(folder => {
              const subtitle = folder.activeVaultName ? (
                <ActiveVaultSubtitle>
                  <IconWrapper size={14}>
                    <CheckIcon />
                  </IconWrapper>
                  {t('folder_active_vault', { name: folder.activeVaultName })}
                </ActiveVaultSubtitle>
              ) : (
                t('vault_count', { count: folder.vaultCount })
              )

              return (
                <VaultListRow
                  selected={!!folder.activeVaultName}
                  key={folder.id}
                  leading={
                    <LeadingIconBadge tone="info">
                      <FolderIcon />
                    </LeadingIconBadge>
                  }
                  title={folder.name}
                  subtitle={subtitle}
                  trailing={
                    <IconWrapper size={18} color="textShy">
                      <ChevronRightIcon />
                    </IconWrapper>
                  }
                  onClick={() =>
                    navigate({ id: 'vaultFolder', state: { id: folder.id } })
                  }
                />
              )
            })}
          </VStack>
        )}

        {displayedVaults.length > 0 && (
          <VStack gap={isSettingsLook ? 14 : 16}>
            {isSettingsLook ? (
              <Text color="shy" height={1} size={12} weight={500}>
                {t('vaults')}
              </Text>
            ) : (
              <Text size={13} weight={600} color="shy">
                {t('vaults')}
              </Text>
            )}
            <VaultRows $isSettingsLook={isSettingsLook}>
              {displayedVaults.map(vault => {
                const vaultId = getVaultId(vault)
                const value = vaultTotals?.[vaultId]
                const VaultRow = isSettingsLook ? VaultMenuRow : VaultListItem

                return (
                  <VaultRow
                    key={vaultId}
                    vault={vault}
                    onSelect={() => handleSelectVault(vaultId)}
                    selected={vaultId === currentVaultId}
                    balance={value}
                  />
                )
              })}
            </VaultRows>
          </VStack>
        )}

        {!isSearching &&
          folderEntries.length === 0 &&
          folderlessVaults.length === 0 && (
            <VStack gap={12} alignItems="center" justifyContent="center">
              <Text size={16} weight={500}>
                {t('no_vaults')}
              </Text>
              <Text size={13} color="shy" centerHorizontally>
                {t('create_new_vault')}
              </Text>
            </VStack>
          )}

        {hasNoSearchResults && (
          <VStack gap={12} alignItems="center" justifyContent="center">
            <Text size={16} weight={500} centerHorizontally>
              {t('no_results_found')}
            </Text>
          </VStack>
        )}
      </PageContent>
    </VStack>
  )
}

const VaultRows = styled.div<{ $isSettingsLook: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ $isSettingsLook }) => ($isSettingsLook ? 0 : 12)}px;
  ${({ $isSettingsLook }) => $isSettingsLook && borderRadius.md};
  overflow: ${({ $isSettingsLook }) =>
    $isSettingsLook ? 'hidden' : 'visible'};
`

const ActiveVaultSubtitle = styled.span`
  align-items: center;
  color: ${getColor('info')};
  display: inline-flex;
  gap: 4px;
`
