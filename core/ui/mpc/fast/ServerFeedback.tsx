import { FlowErrorPageContent } from '@lib/ui/flow/FlowErrorPageContent'
import { FlowPendingPageContent } from '@lib/ui/flow/FlowPendingPageContent'
import { ValueProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Query } from '@lib/ui/query/Query'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useTranslation } from 'react-i18next'

export const ServerFeedback = ({ value }: ValueProp<Query<any>>) => {
  const { t } = useTranslation()

  return (
    <MatchQuery
      value={value}
      error={error => (
        <FlowErrorPageContent
          title={t('failed_to_connect_with_server')}
          message={extractErrorMsg(error)}
        />
      )}
      pending={() => (
        <>
          <FlowPendingPageContent
            title={`${t('connecting_to_server')}...`}
            message={t('fastVaultSetup.takeMinute')}
          />
        </>
      )}
    />
  )
}
