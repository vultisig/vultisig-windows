import { Collapse } from '@lib/ui/layout/Collapse'
import { VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { ValueProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { useQuery } from '@tanstack/react-query'
import { getEvmContractCallInfo } from '@vultisig/core-chain/chains/evm/contract/call/info'
import { useTranslation } from 'react-i18next'

import { TxOverviewPlainMemo } from './TxOverviewPlainMemo'

export const TxOverviewEvmMemo = ({ value }: ValueProp<string>) => {
  const query = useQuery({
    queryKey: ['evmContractCallInfo', value],
    queryFn: () => getEvmContractCallInfo(value),
    enabled: value.startsWith('0x') && value.length > 2,
    staleTime: Infinity,
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
          <Collapse title={t('transaction_details')}>
            <VStack gap={4}>
              <Text color="shy" size={12}>
                {t('function_signature')}
              </Text>
              <Text color="primary" family="mono" size={14} weight="700">
                {functionSignature}
              </Text>
            </VStack>
            <VStack gap={4}>
              <Text color="shy" size={12}>
                {t('function_arguments')}
              </Text>
              <Text
                color="primary"
                family="mono"
                size={14}
                weight="700"
                style={{ wordBreak: 'break-all' }}
              >
                {functionArguments}
              </Text>
            </VStack>
          </Collapse>
        )
      }}
    />
  )
}
