import styled from 'styled-components';
import { ComponentWithValueProps } from '../../../lib/ui/props';
import { Chain } from '../../../model/chain';
import { Panel } from '../../../lib/ui/panel/Panel';
import { interactive } from '../../../lib/ui/css/interactive';
import { HStack, VStack } from '../../../lib/ui/layout/Stack';
import { Text } from '../../../lib/ui/text';
import { getChainPrimaryCoin } from '../../../chain/utils/getChainPrimaryCoin';
import { ChainCoinIcon } from '../../../chain/ui/ChainCoinIcon';
import { CheckStatus } from '../../../lib/ui/inputs/checkbox/CheckStatus';
import { sameDimensions } from '../../../lib/ui/css/sameDimensions';
import { useAssertCurrentVaultCoins } from '../../state/useCurrentVault';
import { useSaveCoinMutation } from '../../mutations/useSaveCoinMutation';
import { useDeleteCoinMutation } from '../../mutations/useDeleteCoinMutation';
import { areEqualCoins } from '../../../coin/Coin';
import { getStorageCoinKey } from '../../../coin/utils/storageCoin';
import {
  getCoinMetaIconSrc,
  getCoinMetaKey,
} from '../../../coin/utils/coinMeta';
import { getChainEntityIconSrc } from '../../../chain/utils/getChainEntityIconSrc';

const Container = styled(Panel)`
  ${interactive};
`;

const Check = styled(CheckStatus)`
  ${sameDimensions(24)};
`;

export const ManageVaultChain = ({ value }: ComponentWithValueProps<Chain>) => {
  const coin = getChainPrimaryCoin(value);
  const key = getCoinMetaKey(coin);

  const coins = useAssertCurrentVaultCoins();

  const { mutate: saveCoin } = useSaveCoinMutation();
  const { mutate: deleteCoin } = useDeleteCoinMutation();

  const isChecked = coins.some(c => areEqualCoins(getStorageCoinKey(c), key));

  return (
    <Container
      onClick={() => {
        if (isChecked) {
          deleteCoin(key);
        } else {
          saveCoin(coin);
        }
      }}
    >
      <HStack fullWidth alignItems="center" justifyContent="space-between">
        <HStack alignItems="center" gap={16}>
          <ChainCoinIcon
            coinSrc={getCoinMetaIconSrc(coin)}
            chainSrc={getChainEntityIconSrc(value)}
            style={{ fontSize: 32 }}
          />
          <VStack>
            <Text size={18} weight="700" color="contrast">
              {coin.ticker}
            </Text>
            <Text size={14} weight="600" color="contrast">
              {value}
            </Text>
          </VStack>
        </HStack>
        <Check value={isChecked} />
      </HStack>
    </Container>
  );
};
