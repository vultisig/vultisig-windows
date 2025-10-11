import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useVaults } from '@core/ui/storage/vaults'
import { VStack } from '@lib/ui/layout/Stack'
import { FitPageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { PageHeaderBackButton } from '../../../flow/PageHeaderBackButton'
import { useCurrentVault } from '../../state/currentVault'
import { OptionContainer } from './OptionContainer'
import { VaultList } from './VaultList'

const maxPreview = 4

export const SelectVaultsBackupPage = () => {
  const navigate = useCoreNavigate()
  const vaults = useVaults()
  const { t } = useTranslation()

  const currentVault = useCurrentVault()

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
    <VStack fullHeight gap={40}>
      <PageHeader
        title={t('backup')}
        primaryControls={<PageHeaderBackButton />}
      />
      <FitPageContent contentMaxWidth={520}>
        <VStack gap={36}>
          <VStack gap={12}>
            <Text size={28} weight="600">
              {t('select_vaults_to_backup')}
            </Text>
            <Text color="shy" size={14}>
              {t('select_vaults_to_backup_description')}
            </Text>
          </VStack>
          <VStack gap={16}>
            <OptionContainer
              onClick={() => navigate({ id: 'vaultBackup' })}
              title={t('this_vault_only')}
            >
              <VaultList vaults={[currentVault]} />
            </OptionContainer>

            <OptionContainer
              onClick={() => navigate({ id: 'vaultsBackup' })}
              title={t('all_vaults')}
            >
              <VStack fullWidth gap={12}>
                <VaultList vaults={vaults.slice(0, maxPreview)} />
                {vaults.length > maxPreview && (
                  <Text
                    style={{ alignSelf: 'center' }}
                    color="shyExtra"
                    size={13}
                  >
                    +{vaults.length - maxPreview} {t('more')}
                  </Text>
                )}
              </VStack>
            </OptionContainer>
          </VStack>
        </VStack>
      </FitPageContent>
    </VStack>
  )
}
