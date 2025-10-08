import { FlowPageHeader } from '@core/ui/flow/FlowPageHeader'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useVaults } from '@core/ui/storage/vaults'
import { VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { FitPageContent } from '@lib/ui/page/PageContent'
import { Text } from '@lib/ui/text'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const maxPreview = 4

export const SelectVaultsBackupPage = () => {
  const navigate = useCoreNavigate()
  const vaults = useVaults()
  const { t } = useTranslation()

  const hasMultipleVaults = vaults.length > 1

  useEffect(() => {
    if (!hasMultipleVaults) {
      navigate({ id: 'vaultBackup' })
    }
  }, [hasMultipleVaults, navigate])

  if (!hasMultipleVaults) {
    return null
  }

  return (
    <VStack fullHeight>
      <FlowPageHeader
        title={t('backup')}
        onBack={() => navigate({ id: 'vault' })}
      />
      <FitPageContent contentMaxWidth={520}>
        <VStack gap={16}>
          <Text size={28} weight="600">
            {t('select_vaults_to_backup')}
          </Text>
          <Text color="shy" size={14}>
            {t('select_vaults_to_backup_description')}
          </Text>
          <VStack gap={16}>
            <VStack gap={8}>
              <Text color="light" size={12} weight={500}>
                {t('this_vault_only')}
              </Text>
              <List>
                <ListItem
                  hoverable
                  showArrow
                  onClick={() => navigate({ id: 'vaultBackup' })}
                  title={vaults[0]?.name}
                />
              </List>
            </VStack>
            <VStack gap={8}>
              <Text color="light" size={12} weight={500}>
                {t('all_vaults')}
              </Text>
              <List>
                {vaults.slice(0, maxPreview).map(v => (
                  <ListItem key={v.localPartyId} title={v.name} />
                ))}
                {vaults.length > maxPreview && (
                  <ListItem
                    title={`+${vaults.length - maxPreview} ${t('more')}`}
                    hoverable
                    onClick={() => navigate({ id: 'vaultsBackup' })}
                    showArrow
                  />
                )}
              </List>
            </VStack>
          </VStack>
        </VStack>
      </FitPageContent>
    </VStack>
  )
}
