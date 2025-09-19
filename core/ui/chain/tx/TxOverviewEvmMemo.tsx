import { EvmContractCallInfo } from '@core/chain/chains/evm/contract/call/info'
import { VStack } from '@lib/ui/layout/Stack'
import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

export const TxOverviewEvmMemo = ({
  value,
}: ValueProp<EvmContractCallInfo>) => {
  const { t } = useTranslation()

  const { functionSignature, functionArguments } = value

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
}
