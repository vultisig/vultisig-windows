import { useCurrentKeygenType } from '@core/ui/mpc/keygen/state/currentKeygenType'
import { Button } from '@lib/ui/buttons/Button'
import { FilledAlertIcon } from '@lib/ui/icons/FilledAlertIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { match } from '@lib/utils/match'
import { useTranslation } from 'react-i18next'

import { WarningBlock } from '../../../lib/ui/status/WarningBlock'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
import { PageContent } from '../../../ui/page/PageContent'

type KeygenFailedStatePros = {
  message: string
  onTryAgain?: () => void
}

export const KeygenFailedState = ({
  message,
  onTryAgain,
}: KeygenFailedStatePros) => {
  const { t } = useTranslation()

  const keygenType = useCurrentKeygenType()

  const title = match(keygenType, {
    create: () => t('keygen'),
    migrate: () => t('upgrade'),
    reshare: () => t('reshare'),
  })

  const goBack = useNavigateBack()

  return (
    <PageContent>
      <VStack flexGrow gap={40} alignItems="center" justifyContent="center">
        <FilledAlertIcon style={{ fontSize: 66 }} />
        <VStack style={{ maxWidth: 320 }} alignItems="center" gap={8}>
          <Text
            family="mono"
            weight="700"
            size={16}
            color="contrast"
            centerHorizontally
          >
            {title}
          </Text>
          <Text centerHorizontally size={14} color="contrast">
            {message}
          </Text>
        </VStack>
      </VStack>
      <VStack fullWidth gap={12}>
        <WarningBlock>
          {t('information_note1')}
          <br />
          {t('information_note2')}
        </WarningBlock>
        <Button onClick={onTryAgain || goBack}>{t('try_again')}</Button>
      </VStack>
    </PageContent>
  )
}
