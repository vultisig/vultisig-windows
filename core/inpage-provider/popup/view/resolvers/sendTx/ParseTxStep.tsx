import { FlowErrorPageContent } from '@core/ui/flow/FlowErrorPageContent'
import { OnFinishProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { ParsedTx } from './core/parsedTx'
import { PendingState } from './PendingState'
import { useParsedTxQuery } from './queries/parsedTx'

export const ParseTxStep = ({ onFinish }: OnFinishProp<ParsedTx>) => {
  const { t } = useTranslation()

  const query = useParsedTxQuery()

  useEffect(() => {
    if (query.data) {
      onFinish(query.data)
    }
  }, [query.data, onFinish])

  return (
    <MatchQuery
      value={query}
      pending={() => <PendingState />}
      error={error => (
        <FlowErrorPageContent
          error={error}
          title={t('failed_to_process_transaction')}
        />
      )}
    />
  )
}
