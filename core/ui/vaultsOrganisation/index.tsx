import { getVaultId } from '@core/mpc/vault/Vault'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import {
  useCurrentVaultId,
  useSetCurrentVaultIdMutation,
} from '@core/ui/storage/currentVaultId'
import { useVaultFolders } from '@core/ui/storage/vaultFolders'
import { useVaults } from '@core/ui/storage/vaults'
import { DoneButton } from '@core/ui/vault/chain/manage/shared/DoneButton'
import { VaultSigners } from '@core/ui/vault/signers'
import {
  LeadingIconBadge,
  SectionHeader,
  SelectionIndicator,
  VaultListRow,
} from '@core/ui/vaultsOrganisation/components'
import { useVaultsTotalBalances } from '@core/ui/vaultsOrganisation/hooks/useVaultsTotalBalances'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { FolderLockIcon } from '@lib/ui/icons/FolderLockIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { PlusIcon } from '@lib/ui/icons/PlusIcon'
import { SquarePenIcon } from '@lib/ui/icons/SquarePenIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnFinishProp } from '@lib/ui/props'
import { SearchField } from '@lib/ui/search/SearchField'
import { Text } from '@lib/ui/text'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useCore } from '../state/core'
import { getVaultSecurityTone } from './utils/getVaultSecurityTone'

type FolderEntry = {
  id: string
  name: string
  vaultCount: number
}

export const VaultsPage = ({ onFinish }: Partial<OnFinishProp>) => {
  const { t } = useTranslation()
  const { goHome } = useCore()
  const goBack = useNavigateBack()
  const navigate = useCoreNavigate()

  const { mutate } = useSetCurrentVaultIdMutation()
  const currentVaultId = useCurrentVaultId()
  const folders = useVaultFolders()
  const vaults = useVaults()

  const [searchQuery, setSearchQuery] = useState('')
  const normalizedSearch = searchQuery.trim().toLowerCase()

  const folderEntries = useMemo<FolderEntry[]>(() => {
    return folders.map(folder => {
      const vaultCount = vaults.filter(
        vault => vault.folderId === folder.id
      ).length

      return {
        id: folder.id,
        name: folder.name,
        vaultCount,
      }
    })
  }, [folders, vaults])

  const folderlessVaults = useMemo(
    () => vaults.filter(vault => !vault.folderId),
    [vaults]
  )

  const filteredFolders = useMemo(() => {
    if (!normalizedSearch) return folderEntries

    return folderEntries.filter(entry =>
      entry.name.toLowerCase().includes(normalizedSearch)
    )
  }, [folderEntries, normalizedSearch])

  const filteredVaults = useMemo(() => {
    if (!normalizedSearch) return folderlessVaults

    return folderlessVaults.filter(vault =>
      vault.name.toLowerCase().includes(normalizedSearch)
    )
  }, [folderlessVaults, normalizedSearch])

  const { totals: vaultTotals, isPending: isTotalsPending } =
    useVaultsTotalBalances()
  const formatFiatAmount = useFormatFiatAmount()

  const totalVaultsCount = vaults.length
  const vaultCountLabel = t('vault_count', { count: totalVaultsCount })

  const summarySubtitle = useMemo(() => {
    if (totalVaultsCount === 0) {
      return t('no_vaults')
    }

    const parts = [vaultCountLabel]

    if (!isTotalsPending && vaultTotals) {
      const totalBalance = Object.values(vaultTotals).reduce(
        (sum, value) => sum + value,
        0
      )

      parts.push(formatFiatAmount(totalBalance))
    }

    return parts.join(' • ')
  }, [
    formatFiatAmount,
    isTotalsPending,
    t,
    totalVaultsCount,
    vaultCountLabel,
    vaultTotals,
  ])

  const handleBack = () => (onFinish ? goBack() : goHome())
  const handleDone = () => (onFinish ? onFinish() : goBack())
  const handleManage = () => navigate({ id: 'manageVaults' })
  const handleCreateVault = () => navigate({ id: 'newVault' })

  const handleSelectVault = (vaultId: string) =>
    mutate(vaultId, {
      onSuccess: onFinish ?? goBack,
    })

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={handleBack} />}
        secondaryControls={<DoneButton onClick={handleDone} />}
        title={t('vaults')}
      />
      <PageContent gap={28} flexGrow scrollable>
        <VStack gap={16}>
          <SearchField onSearch={setSearchQuery} value={searchQuery} />
          <SectionHeader
            title={t('vaults')}
            subtitle={summarySubtitle}
            actions={
              <>
                <IconButton
                  kind="action"
                  size="md"
                  onClick={handleManage}
                  aria-label={t('edit_vaults')}
                >
                  <SquarePenIcon />
                </IconButton>
                <IconButton
                  kind="action"
                  size="md"
                  onClick={handleCreateVault}
                  aria-label={t('add_new_vault')}
                >
                  <PlusIcon />
                </IconButton>
              </>
            }
          />
        </VStack>

        {filteredFolders.length > 0 && (
          <VStack gap={16}>
            <Text
              size={13}
              weight={600}
              color="shy"
              style={{ textTransform: 'uppercase' }}
            >
              {t('folders')}
            </Text>
            <VStack gap={12}>
              {filteredFolders.map(folder => (
                <VaultListRow
                  key={folder.id}
                  leading={
                    <LeadingIconBadge tone="neutral">
                      <FolderLockIcon style={{ fontSize: 20 }} />
                    </LeadingIconBadge>
                  }
                  title={folder.name}
                  subtitle={t('vault_count', { count: folder.vaultCount })}
                  trailing={
                    <IconWrapper size={18} color="textShy">
                      <ChevronRightIcon />
                    </IconWrapper>
                  }
                  onClick={() =>
                    navigate({ id: 'vaultFolder', state: { id: folder.id } })
                  }
                />
              ))}
            </VStack>
          </VStack>
        )}

        {filteredVaults.length > 0 && (
          <VStack gap={16}>
            <Text
              size={13}
              weight={600}
              color="shy"
              style={{ textTransform: 'uppercase' }}
            >
              {t('vaults')}
            </Text>
            <VStack gap={12}>
              {filteredVaults.map(vault => {
                const vaultId = getVaultId(vault)
                const { tone, icon } = getVaultSecurityTone(vault)
                const value = vaultTotals?.[vaultId]

                return (
                  <VaultListRow
                    key={vaultId}
                    leading={
                      <LeadingIconBadge tone={tone}>{icon}</LeadingIconBadge>
                    }
                    title={vault.name}
                    subtitle={
                      !isTotalsPending && value !== undefined
                        ? formatFiatAmount(value)
                        : undefined
                    }
                    meta={<VaultSigners vault={vault} />}
                    trailing={
                      vaultId === currentVaultId ? <SelectionIndicator /> : null
                    }
                    onClick={() => handleSelectVault(vaultId)}
                  />
                )
              })}
            </VStack>
          </VStack>
        )}

        {filteredFolders.length === 0 && filteredVaults.length === 0 && (
          <VStack gap={12} alignItems="center" justifyContent="center">
            <Text size={16} weight={500}>
              {t('no_results')}
            </Text>
            <Text size={13} color="shy" centerHorizontally>
              {t('adjust_search_query')}
            </Text>
          </VStack>
        )}
      </PageContent>
    </VStack>
  )
}
