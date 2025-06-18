import { useKeygenMutation } from '@core/ui/mpc/keygen/mutations/useKeygenMutation'
import { KeygenPendingState } from '@core/ui/mpc/keygen/reshare/plugin/KeygenPendingState'
import { Button } from '@lib/ui/buttons/Button'
import { FlowErrorPageContent } from '@lib/ui/flow/FlowErrorPageContent'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { GradientText, Text } from '@lib/ui/text'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export const KeygenFlow = () => {
  const { t } = useTranslation()
  const { step, mutate, ...mutationState } = useKeygenMutation()

  useEffect(mutate, [mutate])

  return (
    <MatchQuery
      value={mutationState}
      success={() => (
        <>
          <PageContent justifyContent="end">
            <GradientText
              as="span"
              size={28}
              weight={500}
              centerHorizontally
            >{`${t('success')}.`}</GradientText>
            <Text as="span" size={28} weight={500} centerHorizontally>
              {t('plugin_success_desc', { name: '' })}
            </Text>
          </PageContent>
          <PageFooter>
            <Button onClick={() => window.close()}>{t('go_to_wallet')}</Button>
          </PageFooter>
        </>
      )}
      error={error => (
        <FlowErrorPageContent
          title={t('keygen_failed')}
          message={extractErrorMsg(error)}
        />
      )}
      pending={() => <KeygenPendingState value={step} />}
    />
  )
}
