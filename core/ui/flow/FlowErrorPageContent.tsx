import { useCore } from '@core/ui/state/core'
import { Button } from '@lib/ui/buttons/Button'
import {
  ErrorFallbackContent,
  ErrorFallbackContentProps,
} from '@lib/ui/flow/ErrorFallbackContent'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { ActionProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

export type FlowErrorPageContentProps = ErrorFallbackContentProps &
  Partial<ActionProp>

export const FlowErrorPageContent = ({
  action,
  ...props
}: FlowErrorPageContentProps) => {
  const { goBack, version } = useCore()
  const { t } = useTranslation()

  return (
    <>
      <PageContent>
        <ErrorFallbackContent {...props} />
      </PageContent>
      <PageFooter alignItems="center" gap={12}>
        {action ? action : <Button onClick={goBack}>{t('back')}</Button>}
        <Text color="shy" size={12}>
          {t('version')} {version}
        </Text>
      </PageFooter>
    </>
  )
}
