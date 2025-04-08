import { KeygenStep } from '@core/mpc/keygen/KeygenStep'
import { VStack } from '@lib/ui/layout/Stack'
import { ValueProp } from '@lib/ui/props'
import { match } from '@lib/utils/match'
import { useTranslation } from 'react-i18next'

import { PageContent } from '../../../ui/page/PageContent'
import { useCurrentKeygenType } from '../state/currentKeygenType'
import { KeygenEducation } from './KeygenEducation'
import { KeygenNetworkReminder } from './KeygenNetworkReminder'
import { KeygenProgressIndicator } from './KeygenProgressIndicator'
import { PendingKeygenMessage } from './PendingKeygenMessage'

export const KeygenPendingState = ({ value }: ValueProp<KeygenStep | null>) => {
  const { t } = useTranslation()

  const keygenType = useCurrentKeygenType()

  if (!value) {
    const message = match(keygenType, {
      create: () => t('waiting_for_keygen_start'),
      migrate: () => t('waiting_for_upgrade_start'),
      reshare: () => t('waiting_for_reshare_start'),
    })

    return (
      <PageContent alignItems="center" justifyContent="center">
        <PendingKeygenMessage>{message}</PendingKeygenMessage>
      </PageContent>
    )
  }

  return (
    <PageContent>
      <VStack flexGrow alignItems="center" justifyContent="center" gap={48}>
        <KeygenProgressIndicator value={value} />
        <KeygenEducation />
      </VStack>
      <KeygenNetworkReminder />
    </PageContent>
  )
}
