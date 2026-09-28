import { borderRadius } from '@lib/ui/css/borderRadius'
import { Collapse } from '@lib/ui/layout/Collapse'
import { VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { ValueProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useQuery } from '@tanstack/react-query'
import { getEvmContractCallInfo } from '@vultisig/core-chain/chains/evm/contract/call/info'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { TxOverviewPlainMemo } from './TxOverviewPlainMemo'

const CalldataCard = styled(VStack)`
  border: 1px solid ${getColor('foregroundExtra')};
  padding: 24px;
  ${borderRadius.lg};
`

type TxOverviewEvmMemoProps = ValueProp<string> & {
  withinDetailsSection?: boolean
}

/**
 * The 4byte-decoded signature and arguments behind EVM calldata.
 *
 * `withinDetailsSection` drops the card's own "Transaction Details" heading and
 * leaves it open, for when it already sits under a section carrying that title.
 * Both native clients follow the same rule: the toggle owns the label and the
 * box inside it carries none.
 */
export const TxOverviewEvmMemo = ({
  value,
  withinDetailsSection,
}: TxOverviewEvmMemoProps) => {
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

        const body = (
          <>
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
          </>
        )

        // Both variants draw their own border, so neither can be a direct child
        // of a container that spaces children with padding (`SeparatedByLine`):
        // that padding would land inside the card. The wrapper takes it instead.
        return (
          <VStack>
            {withinDetailsSection ? (
              <CalldataCard gap={12}>{body}</CalldataCard>
            ) : (
              <Collapse title={t('transaction_details')}>{body}</Collapse>
            )}
          </VStack>
        )
      }}
    />
  )
}
