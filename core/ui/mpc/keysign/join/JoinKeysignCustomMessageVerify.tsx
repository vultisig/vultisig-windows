import { CustomMessageVerifyContent } from '@core/ui/mpc/keysign/custom/CustomMessageVerifyContent'
import { ValueProp } from '@lib/ui/props'
import { CustomMessagePayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/custom_message_payload_pb'

export const JoinKeysignCustomMessageVerify = ({
  value,
}: ValueProp<CustomMessagePayload>) => (
  <CustomMessageVerifyContent method={value.method} message={value.message} />
)
