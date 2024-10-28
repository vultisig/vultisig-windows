import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { storage } from '../../../../wailsjs/go/models';
import { ChainCoinIcon } from '../../../chain/ui/ChainCoinIcon';
import { getChainEntityIconSrc } from '../../../chain/utils/getChainEntityIconSrc';
import { storageCoinToCoin } from '../../../coin/utils/storageCoin';
import { useThorwalletApi } from '../../../lib/hooks/use-thorwallet-api';
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
import {
  convertChainSymbolToChain,
  convertChainToChainTicker,
} from '../../../utils/crypto';
import {
  useAssertCurrentVaultAddreses,
  useAssertCurrentVaultCoin,
} from '../../state/useCurrentVault';
import { nativeTokenForChain } from '../../utils/helpers';
import Coin = storage.Coin;
import Skeleton from '../../../components/skeleton';
import { TokenSelectionAssets } from '../../../token-store';
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
  const [pairs, setPairs] = useState<Coin[]>([]);
  const [pairsLoading, setPairsLoading] = useState(true);
  const [coinKey] = useCurrentSwapCoin();
  const coin = useAssertCurrentVaultCoin(coinKey);
  const { getSwapPairs } = useThorwalletApi();
  const addresses = useAssertCurrentVaultAddreses();
  const [coinTo, setCoinTo] = useCoinTo();

  console.log(coin);
  // console.log(swapPairsData);

  const { t } = useTranslation();

  // const balanceQuery = useBalanceQuery(storageCoinToCoin(coinTo));

  const getSwapPains = async () => {
    setPairsLoading(true);
    const swapPairs = await getSwapPairs(
      convertChainToChainTicker(coin.chain as Chain),
      coin.ticker,
      storageCoinToCoin(coin).contractAddress
    );
    const pairs: Coin[] = [];
    swapPairs
      .filter(asset => !asset.isSynth)
      .forEach(pair => {
        const coin = TokenSelectionAssets.find(
          asset =>
            asset.chain === convertChainSymbolToChain(pair.chain) &&
            asset.ticker === pair.ticker
        );
        if (coin) {
          pairs.push({
            chain: coin.chain,
            address:
              addresses[
                convertChainSymbolToChain(coin.chain) as keyof typeof addresses
              ],
            contract_address: coin.contractAddress || '',
            decimals: coin.decimals,
            hex_public_key: '',
            id: `${convertChainToChainTicker(coin.chain)}:${nativeTokenForChain[convertChainToChainTicker(coin.chain)] === coin.ticker ? coin.ticker : coin.contractAddress}:${addresses[convertChainSymbolToChain(coin.chain) as keyof typeof addresses]}`,
            is_native_token:
              nativeTokenForChain[convertChainToChainTicker(coin.chain)] ===
              coin.ticker,
            price_provider_id: coin.priceProviderId,
            logo: pair.icon,
            ticker: coin.ticker,
          });
        }
      });
    setPairs(pairs);
    setCoinTo(pairs[0]);
    setPairsLoading(false);
  };

  console.log(pairs);

  useEffect(() => {
    getSwapPains();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coin]);

  return (
    <InputContainer>
      <InputLabel>{t('to')}</InputLabel>
      {pairsLoading ? (
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
      {/*<Text*/}
      {/*  centerVertically*/}
      {/*  weight="400"*/}
      {/*  size={14}*/}
      {/*  family="mono"*/}
      {/*  color="supporting"*/}
      {/*  style={{ gap: 8 }}*/}
      {/*>*/}
      {/*  <span>{t('balance')}:</span>*/}
      {/*  <QueryDependant*/}
      {/*    success={({ amount, decimals }) => (*/}
      {/*      <span>{formatAmount(fromChainAmount(amount, decimals))}</span>*/}
      {/*    )}*/}
      {/*    query={balanceQuery}*/}
      {/*    pending={() => <Spinner />}*/}
      {/*    error={() => t('failed_to_load')}*/}
      {/*  />*/}
      {/*</Text>*/}
    </InputContainer>
  );
};
