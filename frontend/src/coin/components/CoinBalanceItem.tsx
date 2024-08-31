import { UnstyledButton } from '../../lib/ui/buttons/UnstyledButton';
import { HStack, VStack } from '../../lib/ui/layout/Stack';
import { Panel } from '../../lib/ui/panel/Panel';
import { ClickableComponentProps } from '../../lib/ui/props';
import { Text } from '../../lib/ui/text';
import { formatAmount } from '../../lib/utils/formatAmount';
import { fromChainAmount } from '../../chain/utils/fromChainAmount';
import { ChainEntityIcon } from '../../chain/ui/ChainEntityIcon';

type CoinBalanceItemProps = ClickableComponentProps & {
  name: string;
  address: string;
  amount: number;
  decimals: number;
  icon?: string;
  fiatPrice?: number;
};

export const CoinBalanceItem = ({
  icon,
  name,
  address,
  amount,
  decimals,
  onClick,
  fiatPrice,
}: CoinBalanceItemProps) => {
  return (
    <UnstyledButton onClick={onClick}>
      <Panel>
        <HStack fullWidth alignItems="center" gap={12}>
          <ChainEntityIcon value={icon} />

          <VStack fullWidth alignItems="start" gap={16}>
            <HStack
              fullWidth
              alignItems="center"
              justifyContent="space-between"
              gap={20}
            >
              <Text color="regular" weight="700" size={16}>
                {name}
              </Text>
              <HStack alignItems="center" gap={12}>
                <Text color="regular" weight="400" size={12}>
                  {formatAmount(fromChainAmount(amount, decimals))}
                </Text>
                {fiatPrice && (
                  <Text color="regular" weight="700" size={16}>
                    $
                    {formatAmount(
                      fromChainAmount(amount, decimals) * fiatPrice
                    )}
                  </Text>
                )}
              </HStack>
            </HStack>
            <Text color="primary" weight="400" size={12}>
              {address}
            </Text>
          </VStack>
        </HStack>
      </Panel>
    </UnstyledButton>
  );
};
