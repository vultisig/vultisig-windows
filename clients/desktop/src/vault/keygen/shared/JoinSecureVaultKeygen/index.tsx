import { useTranslation } from 'react-i18next'

import ShieldCheckIcon from '../../../../lib/ui/icons/ShieldCheckIcon'
import { VStack } from '../../../../lib/ui/layout/Stack'
import { Spinner } from '../../../../lib/ui/loaders/Spinner'
import { Text } from '../../../../lib/ui/text'
import { PageContent } from '../../../../ui/page/PageContent'
import { KeygenEducation } from '../KeygenEducation'
import { KeygenNetworkReminder } from '../KeygenNetworkReminder'
import { KeygenProgressIndicator } from '../KeygenProgressIndicator'
import { MatchKeygenSessionStatus } from '../MatchKeygenSessionStatus'
import { ContentWrapper, SecureVaultPill } from './JoinSecureVaultKeygen.styled'

export const JoinSecureVaultKeygen = () => {
  const { t } = useTranslation()

  return (
    <MatchKeygenSessionStatus
      pending={() => (
        <PageContent alignItems="center" justifyContent="center">
          <ContentWrapper gap={24} justifyContent="center">
            <SecureVaultPill alignItems="center" gap={8}>
              <ShieldCheckIcon />
              <Text color="contrast" size={14}>
                Secure Vault
              </Text>
            </SecureVaultPill>
            <VStack gap={12}>
              <Text centerHorizontally color="contrast" size={28}>
                {t('waiting_for_devices_to_join')}
              </Text>
              <Text centerHorizontally color="shy" size={14}>
                {t('waiting_for_devices_to_join_description')}
              </Text>
            </VStack>
            <Spinner size="3em" />
          </ContentWrapper>
        </PageContent>
      )}
      active={value => (
        <PageContent>
          <VStack flexGrow alignItems="center" justifyContent="center" gap={48}>
            <KeygenProgressIndicator value={value} />
            <KeygenEducation />
          </VStack>
          <KeygenNetworkReminder />
        </PageContent>
      )}
    />
  )
}
