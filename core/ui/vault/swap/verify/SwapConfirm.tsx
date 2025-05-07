import { StartKeysignPrompt } from '@core/ui/mpc/keysign/StartKeysignPrompt'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { StrictText } from '@lib/ui/text'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useSwapKeysignPayloadQuery } from '../queries/useSwapKeysignPayloadQuery'
import { useSwapTerms } from './state/swapTerms'

export const SwapConfirm = () => {
  const { t } = useTranslation()
  const keysignPayloadQuery = useSwapKeysignPayloadQuery()

  const [terms] = useSwapTerms()
  const isDisabled = useMemo(() => {
    if (terms.some(term => !term)) {
      return t('terms_required')
    }
  }, [t, terms])

  return (
    <MatchQuery
      value={keysignPayloadQuery}
      pending={() => <StrictText>{t('loading')}</StrictText>}
      error={error => <StrictText>{extractErrorMsg(error)}</StrictText>}
      success={keysign => (
        <StartKeysignPrompt value={{ keysign }} isDisabled={isDisabled} />
      )}
    />
  )
}
