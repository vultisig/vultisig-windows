import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { HStack } from '@lib/ui/layout/Stack'
import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { formatWalletAddress } from '@vultisig/lib-utils/formatWalletAddress'

/**
 * The vault a review sheet signs from — its name and an abbreviated address —
 * centred under the summary cards. Takes the sending address so it names the
 * account the funds actually leave, not a vault-level default.
 */
export const ReviewVaultLine = ({ value }: ValueProp<string>) => {
  const { name } = useCurrentVault()

  return (
    <HStack alignItems="center" justifyContent="center" gap={8} wrap="wrap">
      <Text as="span" variant="stationBodyS" color="regular" cropped>
        {name}
      </Text>
      <Text as="span" variant="stationBodyS" color="shy">
        ({formatWalletAddress(value)})
      </Text>
    </HStack>
  )
}
