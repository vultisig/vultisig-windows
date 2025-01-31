import styled from 'styled-components';

import { storage } from '../../../../wailsjs/go/models';
import { ChainCoinIcon } from '../../../chain/ui/ChainCoinIcon';
import { getChainEntityIconSrc } from '../../../chain/utils/getChainEntityIconSrc';
import { getCoinMetaIconSrc } from '../../../coin/utils/coinMeta';
import { UnstyledButton } from '../../../lib/ui/buttons/UnstyledButton';
import { HStack, VStack } from '../../../lib/ui/layout/Stack';
import { panel } from '../../../lib/ui/panel/Panel';
import { IsActiveProp, OnClickProp, ValueProp } from '../../../lib/ui/props';
import { Text } from '../../../lib/ui/text';
import { getColor, matchColor } from '../../../lib/ui/theme/getters';

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
}: ValueProp<storage.Coin> & OnClickProp & IsActiveProp) => {
  const { is_native_token, chain, logo, ticker } = value;

  return (
    <Container isActive={isActive} onClick={onClick}>
      <HStack fullWidth alignItems="center" gap={12}>
        <ChainCoinIcon
          coinSrc={getCoinMetaIconSrc({ logo })}
          chainSrc={is_native_token ? undefined : getChainEntityIconSrc(chain)}
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
