import { getCustomMessageDisplayMessage } from '@core/ui/mpc/keysign/customMessage/getCustomMessageDisplayMessage'
import { getCustomMessageEvmTx } from '@core/ui/mpc/keysign/customMessage/getCustomMessageEvmTx'
import { VStack } from '@lib/ui/layout/Stack'
import { ValueProp } from '@lib/ui/props'
import { CustomMessagePayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/custom_message_payload_pb'
import { attempt, withFallback } from '@vultisig/lib-utils/attempt'
import { useTranslation } from 'react-i18next'

import { CustomMessageEvmTxOverview } from './CustomMessageEvmTxOverview'
import { CustomMessageReviewField } from './CustomMessageReviewField'

/**
 * Verify step of a custom-message keysign, on the initiating and the joining
 * device alike. A message whose signature would also sign an EVM transaction
 * is called out above the raw message, which stays visible.
 */
export const CustomMessageVerifyContent = ({
  value,
}: ValueProp<CustomMessagePayload>) => {
  const { t } = useTranslation()

  const message = getCustomMessageDisplayMessage(value)

  const formattedMessage = withFallback(
    attempt(() => JSON.stringify(JSON.parse(message), null, 2)),
    message
  )

  const evmTx = getCustomMessageEvmTx(value)

  return (
    <VStack gap={16}>
      {evmTx ? <CustomMessageEvmTxOverview value={evmTx} /> : null}
      {value.method.trim() === '' ? null : (
        <CustomMessageReviewField title={t('signing_method')}>
          {value.method}
        </CustomMessageReviewField>
      )}
      <CustomMessageReviewField title={t('message_to_sign')}>
        {formattedMessage}
      </CustomMessageReviewField>
    </VStack>
  )
}
