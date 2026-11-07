import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { TriangleAlertIcon } from '@lib/ui/icons/TriangleAlertIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { ListItem } from '@lib/ui/list/item'
import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'

import { DecodedContractCall } from './utils/useDecodedContractCall'

/**
 * One row naming a decoded token call and its amount, e.g. `Approve` /
 * `Unlimited USDT`, with the amount in warning colour for an unlimited
 * approval.
 */
export const DecodedContractCallItem = ({
  value,
}: ValueProp<DecodedContractCall>) => (
  <ListItem
    title={
      <HStack alignItems="center" gap={8}>
        <CoinIcon coin={value.coin} style={{ fontSize: 24 }} />
        <Text size={14} weight={500}>
          {value.functionName}
        </Text>
      </HStack>
    }
    extra={
      value.isUnlimited ? (
        <HStack alignItems="center" gap={6}>
          <Text as={TriangleAlertIcon} color="warning" size={16} />
          <Text color="warning" weight={500}>
            {value.display}
          </Text>
        </HStack>
      ) : (
        <Text size={14} weight={500}>
          {value.display}
        </Text>
      )
    }
  />
)
