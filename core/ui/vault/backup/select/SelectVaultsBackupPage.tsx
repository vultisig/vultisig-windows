import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { SettingsBaselineText } from '@core/ui/settings/SettingsBaselineText'
import { SettingsPageHeader } from '@core/ui/settings/SettingsPageHeader'
import { useVaults } from '@core/ui/storage/vaults'
import { VStack } from '@lib/ui/layout/Stack'
import { FitPageContent } from '@lib/ui/page/PageContent'
import { Text } from '@lib/ui/text'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useCurrentVault } from '../../state/currentVault'
import { OptionContainer } from './OptionContainer'
import { VaultList } from './VaultList'

const maxPreview = 4

// The frame's title sits 8 under the borderless header.
const Content = styled(FitPageContent)`
  padding-top: 8px;
`

/** Chooses between backing up this vault or all of them; skipped with a single vault. */
export const SelectVaultsBackupPage = () => {
  const navigate = useCoreNavigate()
  const vaults = useVaults()
  const { t } = useTranslation()

  const currentVault = useCurrentVault()

  const hasMultipleVaults = vaults.length > 1

  useEffect(() => {
    if (!hasMultipleVaults) {
      navigate({ id: 'vaultBackup' }, { replace: true })
    }
  }, [hasMultipleVaults, navigate])

  if (!hasMultipleVaults) {
    return null
  }

  return (
    <VStack fullHeight>
      <SettingsPageHeader hasBorder={false} title={null} />
      <Content contentMaxWidth={520}>
        <VStack gap={36}>
          <VStack gap={12}>
            <Text color="regular" variant="stationTitle1">
              {t('select_vaults_to_backup')}
            </Text>
            <SettingsBaselineText
              color="shy"
              height={20 / 14}
              size={14}
              weight={500}
            >
              {t('select_vaults_to_backup_description')}
            </SettingsBaselineText>
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
                  <SettingsBaselineText
                    style={{ alignSelf: 'center' }}
                    color="shyExtra"
                    variant="footnote"
                  >
                    +{vaults.length - maxPreview} {t('more')}
                  </SettingsBaselineText>
                )}
              </VStack>
            </OptionContainer>
          </VStack>
        </VStack>
      </Content>
    </VStack>
  )
}
