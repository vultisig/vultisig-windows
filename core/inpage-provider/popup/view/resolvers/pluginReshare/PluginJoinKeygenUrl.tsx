import { useJoinKeygenUrlQuery } from '@core/ui/mpc/keygen/queries/useJoinKeygenUrlQuery'
import { Center } from '@lib/ui/layout/Center'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { OnFinishProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { StrictText } from '@lib/ui/text'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export const PluginJoinKeygenUrl = ({ onFinish }: OnFinishProp<string>) => {
  const { t } = useTranslation()
  const query = useJoinKeygenUrlQuery()
  const { data } = query

  useEffect(() => {
    if (data) onFinish(data)
  }, [data, onFinish])

  return (
    <MatchQuery
      value={query}
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
    />
  )
}
