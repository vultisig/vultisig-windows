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
import {
  LeadingIconBadge,
  SectionHeader,
  VaultListItem,
  VaultListRow,
} from '@core/ui/vaultsOrganisation/components'
import { useVaultsTotalBalances } from '@core/ui/vaultsOrganisation/hooks/useVaultsTotalBalances'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { FolderIcon } from '@lib/ui/icons/FolderIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { PlusIcon } from '@lib/ui/icons/PlusIcon'
import { SquarePenIcon } from '@lib/ui/icons/SquarePenIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnFinishProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useCore } from '../state/core'

type FolderEntry = {
  id: string
  name: string
  vaultCount: number
  activeVaultName?: string
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

  const folderlessVaults = useMemo(
    () => vaults.filter(vault => !vault.folderId),
    [vaults]
  )

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

    // Only show cumulative balance if there's more than 1 vault
    if (totalVaultsCount > 1 && !isTotalsPending && vaultTotals) {
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
        <SectionHeader
          title={t('vaults')}
          subtitle={summarySubtitle}
          actions={
            <>
              {totalVaultsCount > 1 && (
                <IconButton
                  kind="action"
                  size="lg"
                  onClick={handleManage}
                  aria-label={t('edit_vaults')}
                >
                  <SquarePenIcon />
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

        {folderEntries.length > 0 && (
          <VStack gap={12}>
            {folderEntries.map(folder => {
              const subtitle = folder.activeVaultName
                ? `✓ '${folder.activeVaultName}' ${t('active')}`
                : t('vault_count', { count: folder.vaultCount })

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
                  subtitle={
                    <Text
                      size={13}
                      weight={500}
                      color={folder.activeVaultName ? 'info' : 'shy'}
                      cropped
                    >
                      {subtitle}
                    </Text>
                  }
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

        {folderlessVaults.length > 0 && (
          <VStack gap={16}>
            <Text size={13} weight={600} color="shy">
              {t('vaults')}
            </Text>
            <VStack gap={12}>
              {folderlessVaults.map(vault => {
                const vaultId = getVaultId(vault)
                const value =
                  !isTotalsPending && vaultTotals?.[vaultId] !== undefined
                    ? vaultTotals[vaultId]
                    : undefined

                return (
                  <VaultListItem
                    key={vaultId}
                    vault={vault}
                    onSelect={() => handleSelectVault(vaultId)}
                    selected={vaultId === currentVaultId}
                    balance={value}
                  />
                )
              })}
            </VStack>
          </VStack>
        )}

        {folderEntries.length === 0 && folderlessVaults.length === 0 && (
          <VStack gap={12} alignItems="center" justifyContent="center">
            <Text size={16} weight={500}>
              {t('no_vaults')}
            </Text>
            <Text size={13} color="shy" centerHorizontally>
              {t('create_new_vault')}
            </Text>
          </VStack>
        )}
      </PageContent>
    </VStack>
  )
}
