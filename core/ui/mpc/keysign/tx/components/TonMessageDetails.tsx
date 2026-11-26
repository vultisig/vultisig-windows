import { Collapse } from '@lib/ui/layout/Collapse'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { TonMessage } from '@vultisig/core-mpc/types/vultisig/keysign/v1/wasm_execute_contract_payload_pb'
import { useTranslation } from 'react-i18next'

/** Exposes the exact payload and deployment data for one outgoing message. */
export const TonMessageDetails = ({ message }: { message: TonMessage }) => {
  const { t } = useTranslation()
  if (!message.payload && !message.stateInit) return null

  return (
    <Collapse title={t('transaction_details')}>
      <VStack gap={4}>
        <Text color="shy" size={12}>
          {t('raw_payload')}
        </Text>
        <Text
          color="primary"
          family="mono"
          size={12}
          style={{ overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}
        >
          {JSON.stringify(
            {
              payload: message.payload || undefined,
              stateInit: message.stateInit || undefined,
            },
            null,
            2
          )}
        </Text>
      </VStack>
    </Collapse>
  )
}
