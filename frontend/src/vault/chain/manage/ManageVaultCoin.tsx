import { ReactNode } from 'react';
import styled from 'styled-components';

import { areEqualCoins } from '../../../coin/Coin';
import { getCoinMetaKey } from '../../../coin/utils/coinMeta';
import { getStorageCoinKey } from '../../../coin/utils/storageCoin';
import { interactive } from '../../../lib/ui/css/interactive';
import { sameDimensions } from '../../../lib/ui/css/sameDimensions';
import { CheckStatus } from '../../../lib/ui/inputs/checkbox/CheckStatus';
import { HStack, VStack } from '../../../lib/ui/layout/Stack';
import { Panel } from '../../../lib/ui/panel/Panel';
import { ComponentWithValueProps } from '../../../lib/ui/props';
import { Text } from '../../../lib/ui/text';
import { CoinMeta } from '../../../model/coin-meta';
import { useDeleteCoinMutation } from '../../mutations/useDeleteCoinMutation';
import { useSaveCoinMutation } from '../../mutations/useSaveCoinMutation';
import { useAssertCurrentVaultCoins } from '../../state/useCurrentVault';

const Container = styled(Panel)`
  ${interactive};
`;

const Check = styled(CheckStatus)`
  ${sameDimensions(24)};
`;

type ManageVaultCoinProps = ComponentWithValueProps<CoinMeta> & {
  icon: ReactNode;
};

export const ManageVaultCoin = ({ value, icon }: ManageVaultCoinProps) => {
  const key = getCoinMetaKey(value);

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
          saveCoin(value);
        }
      }}
    >
      <HStack fullWidth alignItems="center" justifyContent="space-between">
        <HStack alignItems="center" gap={16}>
          {icon}
          <VStack>
            <Text size={18} weight="700" color="contrast">
              {value.ticker}
            </Text>
            <Text size={14} weight="600" color="contrast">
              {value.chain}
            </Text>
          </VStack>
        </HStack>
        <Check value={isChecked} />
      </HStack>
    </Container>
  );
};
