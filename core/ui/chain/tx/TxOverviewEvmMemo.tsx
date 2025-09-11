import { getEvmContractCallInfo } from '@core/chain/chains/evm/contract/call/info'
import { VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { ValueProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { noPersistQueryOptions } from '@lib/ui/query/utils/options'
import { Text } from '@lib/ui/text'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { TxOverviewPlainMemo } from './TxOverviewPlainMemo'

export const TxOverviewEvmMemo = ({ value }: ValueProp<string>) => {
  const query = useQuery({
    queryKey: ['evmContractCallInfo', value],
    queryFn: () => getEvmContractCallInfo(value),
    ...noPersistQueryOptions,
  })
  const { t } = useTranslation()

  return (
    <MatchQuery
      value={query}
      pending={() => <Spinner />}
      error={() => <TxOverviewPlainMemo value={value} />}
      success={info => {
        if (!info) {
          return <TxOverviewPlainMemo value={value} />
        }

        const { functionSignature, functionArguments } = info

        return (
          <>
            <VStack gap={4}>
              <Text color="shy">{t('function_signature')}</Text>
              <Text color="primary" family="mono" size={14} weight="700">
                {functionSignature}
              </Text>
            </VStack>
            <VStack gap={4}>
              <Text size={14} color="shy">
                {t('function_arguments')}
              </Text>
              <Text color="primary" family="mono" size={14} weight="700">
                <pre style={{ width: '100%' }}>
                  <code
                    style={{
                      display: 'block',
                      overflowX: 'auto',
                      width: '100%',
                    }}
                  >
                    {functionArguments}
                  </code>
                </pre>
              </Text>
            </VStack>
          </>
        )
      }}
    />
  )
}
