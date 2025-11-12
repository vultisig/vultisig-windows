import { getVaultId } from '@core/mpc/vault/Vault'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import {
  useCurrentVaultId,
  useSetCurrentVaultIdMutation,
} from '@core/ui/storage/currentVaultId'
import { useFolderVaults } from '@core/ui/storage/vaults'
import { DoneButton } from '@core/ui/vault/chain/manage/shared/DoneButton'
import { VaultSigners } from '@core/ui/vault/signers'
import {
  LeadingIconBadge,
  SectionHeader,
  SelectionIndicator,
  VaultListRow,
} from '@core/ui/vaultsOrganisation/components'
import { useCurrentVaultFolder } from '@core/ui/vaultsOrganisation/folder/state/currentVaultFolder'
import { useVaultsTotalBalances } from '@core/ui/vaultsOrganisation/hooks/useVaultsTotalBalances'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { CheckIcon } from '@lib/ui/icons/CheckIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { PlusIcon } from '@lib/ui/icons/PlusIcon'
import { SquarePenIcon } from '@lib/ui/icons/SquarePenIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { getVaultSecurityTone } from '../utils/getVaultSecurityTone'

export const VaultFolderPage = () => {
  const { t } = useTranslation()
  const goBack = useNavigateBack()
  const navigate = useCoreNavigate()
  const { mutate } = useSetCurrentVaultIdMutation()

  const { id, name } = useCurrentVaultFolder()
  const vaults = useFolderVaults(id)
  const currentVaultId = useCurrentVaultId()

  const { totals: vaultTotals, isPending: isTotalsPending } =
    useVaultsTotalBalances()
  const formatFiatAmount = useFormatFiatAmount()

  const folderTotal = useMemo(() => {
    if (!vaultTotals) return undefined

    return vaults.reduce((sum, vault) => {
      const value = vaultTotals[getVaultId(vault)] ?? 0
      return sum + value
    }, 0)
  }, [vaultTotals, vaults])

  const summarySubtitle = useMemo(() => {
    const parts = [t('vault_count', { count: vaults.length })]

    if (!isTotalsPending && folderTotal !== undefined) {
      parts.push(formatFiatAmount(folderTotal))
    }

    return parts.join(' • ')
  }, [folderTotal, formatFiatAmount, isTotalsPending, t, vaults.length])

  const handleSelectVault = (vaultId: string) =>
    mutate(vaultId, {
      onSuccess: () => navigate({ id: 'vault' }),
    })

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={goBack} />}
        secondaryControls={<DoneButton onClick={goBack} />}
        title={name}
      />
      <PageContent gap={24} flexGrow scrollable>
        <SectionHeader
          title={name}
          subtitle={summarySubtitle}
          actions={
            <>
              <IconButton
                kind="action"
                size="md"
                onClick={() =>
                  navigate({ id: 'updateVaultFolder', state: { id } })
                }
                aria-label={t('edit_vaults')}
              >
                <SquarePenIcon />
              </IconButton>
              <IconButton
                kind="action"
                size="md"
                onClick={() => navigate({ id: 'newVault' })}
                aria-label={t('add_new_vault')}
              >
                <PlusIcon />
              </IconButton>
            </>
          }
        />
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
            {vaults.map(vault => {
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
                  meta={
                    <HStack gap={8} alignItems="center">
                      <IconWrapper size={16} color="success">
                        <CheckIcon />
                      </IconWrapper>
                      <VaultSigners vault={vault} />
                    </HStack>
                  }
                  trailing={
                    vaultId === currentVaultId ? <SelectionIndicator /> : null
                  }
                  onClick={() => handleSelectVault(vaultId)}
                />
              )
            })}
          </VStack>
        </VStack>
      </PageContent>
    </VStack>
  )
}
