import { useJoinKeygenUrlQuery } from '@core/ui/mpc/keygen/queries/useJoinKeygenUrlQuery'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { StrictText } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { PluginReshareMutation } from './PluginReshareMutation'

export const PluginJoinKeygenUrl = () => {
  const joinUrlQuery = useJoinKeygenUrlQuery()
  const { t } = useTranslation()
  return (
    <MatchQuery
      value={joinUrlQuery}
      pending={() => <Spinner />}
      error={() => <StrictText>{t('failed_to_generate_join_url')}</StrictText>}
      success={url => <PluginReshareMutation value={url} />}
    />
  )
}
