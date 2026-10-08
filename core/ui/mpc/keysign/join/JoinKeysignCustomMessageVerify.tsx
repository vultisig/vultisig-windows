import { CustomMessageVerifyContent } from '@core/ui/mpc/keysign/custom/CustomMessageVerifyContent'
import { getCustomMessageDisplayMessage } from '@core/ui/mpc/keysign/customMessage/getCustomMessageDisplayMessage'
import { ValueProp } from '@lib/ui/props'
import { CustomMessagePayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/custom_message_payload_pb'

/**
 * Verify step for a device joining a custom-message keysign.
 */
export const JoinKeysignCustomMessageVerify = ({
  value,
}: ValueProp<CustomMessagePayload>) => (
  <CustomMessageVerifyContent
    method={value.method}
    message={getCustomMessageDisplayMessage(value)}
  />
)
