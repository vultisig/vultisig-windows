import { FlowErrorPageContent } from '@core/ui/flow/FlowErrorPageContent'
import { FlowPendingPageContent } from '@lib/ui/flow/FlowPendingPageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnFinishProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { FC, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useMpcSignersQuery } from '../devices/queries/queries/useMpcSignersQuery'

export const WaitForServerStep: FC<OnFinishProp<string[]>> = ({ onFinish }) => {
  const { t } = useTranslation()
  const signersQuery = useMpcSignersQuery()

  useEffect(() => {
    if (signersQuery.data) onFinish(signersQuery.data)
  }, [onFinish, signersQuery.data])

  return (
    <>
      <PageHeader title={t('connecting_to_server')} hasBorder />
      <MatchQuery
        value={signersQuery}
        error={error => (
          <FlowErrorPageContent
            title={t('failed_to_connect_with_server')}
            error={error}
          />
        )}
        pending={() => (
          <FlowPendingPageContent
            title={`${t('connecting_to_server')}...`}
            message={t('fastVaultSetup.takeMinute')}
          />
        )}
      />
    </>
  )
}
