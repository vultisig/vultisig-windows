import { Coin } from '@core/chain/coin/Coin';
import styled from 'styled-components';

import { ChainCoinIcon } from '../../../chain/ui/ChainCoinIcon';
import { getChainEntityIconSrc } from '../../../chain/utils/getChainEntityIconSrc';
import { UnstyledButton } from '../../../lib/ui/buttons/UnstyledButton';
import { HStack, VStack } from '../../../lib/ui/layout/Stack';
import { panel } from '../../../lib/ui/panel/Panel';
import { IsActiveProp, OnClickProp, ValueProp } from '../../../lib/ui/props';
import { Text } from '../../../lib/ui/text';
import { getColor, matchColor } from '../../../lib/ui/theme/getters';
import { getCoinLogoSrc } from '../../logo/getCoinLogoSrc';
import { isFeeCoin } from '../../utils/isFeeCoin';

const Container = styled(UnstyledButton)<IsActiveProp>`
  ${panel()};

  position: relative;

  border: 2px solid
    ${matchColor('isActive', { true: 'primary', false: 'transparent' })};

  &:hover {
    background: ${getColor('foregroundExtra')};
  }
`;

export const CoinOption = ({
  value,
  onClick,
  isActive,
}: ValueProp<Coin> & OnClickProp & IsActiveProp) => {
  const { chain, logo, ticker } = value;

  return (
    <Container isActive={isActive} onClick={onClick}>
      <HStack fullWidth alignItems="center" gap={12}>
        <ChainCoinIcon
          coinSrc={getCoinLogoSrc(logo)}
          chainSrc={isFeeCoin(value) ? undefined : getChainEntityIconSrc(chain)}
          style={{ fontSize: 32 }}
        />
        <VStack alignItems="start">
          <Text color="contrast" size={20} weight="700">
            {ticker}
          </Text>
          <Text color="contrast" size={16} weight="500">
            {chain}
          </Text>
        </VStack>
      </HStack>
    </Container>
  );
};
