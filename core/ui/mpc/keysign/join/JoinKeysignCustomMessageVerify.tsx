import { DappRequestBanner } from '@core/ui/dapp/DappRequestBanner'
import { CustomMessageVerifyContent } from '@core/ui/mpc/keysign/custom/CustomMessageVerifyContent'
import { VStack } from '@lib/ui/layout/Stack'
import { ValueProp } from '@lib/ui/props'
import { CustomMessagePayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/custom_message_payload_pb'

/**
 * Verify step for a device joining a custom-message keysign. Leads with the
 * requesting dApp when the message came from one, as the transaction verify
 * step does.
 */
export const JoinKeysignCustomMessageVerify = ({
  value,
}: ValueProp<CustomMessagePayload>) => (
  <VStack gap={16}>
    <DappRequestBanner value={value.dappMetadata} />
    <CustomMessageVerifyContent method={value.method} message={value.message} />
  </VStack>
)
