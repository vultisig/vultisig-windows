import styled from 'styled-components';
import { UnstyledButton } from '../../lib/ui/buttons/UnstyledButton';
import { SafeImage } from '../../lib/ui/images/SafeImage';
import { HStack, VStack } from '../../lib/ui/layout/Stack';
import { Panel } from '../../lib/ui/panel/Panel';
import { ClickableComponentProps } from '../../lib/ui/props';
import { sameDimensions } from '../../lib/ui/css/sameDimensions';
import { centerContent } from '../../lib/ui/css/centerContent';
import { round } from '../../lib/ui/css/round';
import { getColor } from '../../lib/ui/theme/getters';
import { CoverImage } from '../../lib/ui/images/CoverImage';
import { PictureIcon } from '../../lib/ui/icons/PictureIcon';
import { Text } from '../../lib/ui/text';
import { formatAmount } from '../../lib/utils/formatAmount';
import { fromChainAmount } from '../../lib/chain/utils/fromChainAmount';

type CoinBalanceItemProps = ClickableComponentProps & {
  name: string;
  address: string;
  amount: number;
  decimals: number;
  icon?: string;
};

const ImageContainer = styled.div`
  ${sameDimensions(32)};
  ${centerContent};
  ${round};
  background: ${getColor('mist')};
  overflow: hidden;
  font-size: 14px;
`;

export const CoinBalanceItem = ({
  icon,
  name,
  address,
  amount,
  decimals,
  onClick,
}: CoinBalanceItemProps) => {
  return (
    <UnstyledButton onClick={onClick}>
      <Panel>
        <HStack fullWidth alignItems="center" gap={12}>
          <ImageContainer>
            <SafeImage
              src={icon}
              render={props => <CoverImage {...props} />}
              fallback={<PictureIcon />}
            />
          </ImageContainer>

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
                <Text color="regular" weight="700" size={16}>
                  $65,899
                </Text>
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
