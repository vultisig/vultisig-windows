import { useJoinKeygenUrlQuery } from '@core/ui/mpc/keygen/queries/useJoinKeygenUrlQuery'
import { Center } from '@lib/ui/layout/Center'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { OnFinishProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { StrictText } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { PluginReshareMutation } from './PluginReshareMutation'

export const PluginJoinKeygenUrl = ({ onFinish }: OnFinishProp) => {
  const joinUrlQuery = useJoinKeygenUrlQuery()
  const { t } = useTranslation()
  return (
    <MatchQuery
      value={joinUrlQuery}
      pending={() => (
        <Center>
          <Spinner />
        </Center>
      )}
      error={() => (
        <Center>
          <StrictText>{t('failed_to_generate_join_url')}</StrictText>
        </Center>
      )}
      success={url => <PluginReshareMutation value={url} onFinish={onFinish} />}
    />
  )
}
