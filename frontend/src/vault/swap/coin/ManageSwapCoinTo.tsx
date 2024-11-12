import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { ChainCoinIcon } from '../../../chain/ui/ChainCoinIcon';
import { getChainEntityIconSrc } from '../../../chain/utils/getChainEntityIconSrc';
import { storageCoinToCoin } from '../../../coin/utils/storageCoin';
import Skeleton from '../../../components/skeleton';
import useSwapPairs from '../../../lib/hooks/useSwapPairs';
import { Opener } from '../../../lib/ui/base/Opener';
import { UnstyledButton } from '../../../lib/ui/buttons/UnstyledButton';
import {
  textInputBackground,
  textInputFrame,
} from '../../../lib/ui/css/textInput';
import { ChevronRightIcon } from '../../../lib/ui/icons/ChevronRightIcon';
import { IconWrapper } from '../../../lib/ui/icons/IconWrapper';
import { InputContainer } from '../../../lib/ui/inputs/InputContainer';
import { InputLabel } from '../../../lib/ui/inputs/InputLabel';
import { HStack, hStack } from '../../../lib/ui/layout/Stack';
import { Text } from '../../../lib/ui/text';
import { getColor } from '../../../lib/ui/theme/getters';
import { Chain } from '../../../model/chain';
import { convertChainToChainTicker } from '../../../utils/crypto';
import { useCurrentVaultCoin } from '../../state/currentVault';
import { useCoinTo } from '../state/coin-to';
import { useCurrentSwapCoin } from '../state/swapCoin';
import { SwapCoinToExplorer } from './SwapCoinToExplorer';

const Container = styled(UnstyledButton)`
  ${textInputFrame};
  ${textInputBackground};

  color: ${getColor('contrast')};

  ${hStack({
    alignItems: 'center',
    justifyContent: 'space-between',
  })}

  &:hover {
    background: ${getColor('foregroundExtra')};
  }
`;

export const ManageSwapCoinTo = () => {
  const [coinKey] = useCurrentSwapCoin();
  const coin = useCurrentVaultCoin(coinKey);
  const [coinTo, setCoinTo] = useCoinTo();

  const { t } = useTranslation();

  const { data: pairs, isLoading: pairsLoading } = useSwapPairs(
    convertChainToChainTicker(coin.chain as Chain),
    coin.ticker,
    storageCoinToCoin(coin).contractAddress
  );

  useEffect(() => {
    if (pairs?.length) {
      setCoinTo(pairs[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pairs]);

  return (
    <InputContainer>
      <InputLabel>{t('to')}</InputLabel>
      {pairsLoading || !pairs || !coinTo ? (
        <Skeleton height="48px" />
      ) : (
        <Opener
          renderOpener={({ onOpen }) => (
            <Container onClick={onOpen}>
              <HStack alignItems="center" gap={8}>
                <ChainCoinIcon
                  coinSrc={coinTo?.logo}
                  chainSrc={
                    coinTo?.is_native_token
                      ? undefined
                      : getChainEntityIconSrc(coinTo?.chain || '')
                  }
                  style={{ fontSize: 32 }}
                />
                <Text weight="400" family="mono" size={16}>
                  {coinTo?.ticker}
                </Text>
              </HStack>
              <IconWrapper style={{ fontSize: 20 }}>
                <ChevronRightIcon />
              </IconWrapper>
            </Container>
          )}
          renderContent={({ onClose }) => (
            <SwapCoinToExplorer onClose={onClose} coins={pairs} />
          )}
        />
      )}
    </InputContainer>
  );
};
