import { ReactNode, useEffect, useState } from 'react';
import styled from 'styled-components';

import { areEqualCoins } from '../../../coin/Coin';
import { getCoinMetaKey } from '../../../coin/utils/coinMeta';
import { getStorageCoinKey } from '../../../coin/utils/storageCoin';
import { interactive } from '../../../lib/ui/css/interactive';
import { sameDimensions } from '../../../lib/ui/css/sameDimensions';
import { CheckStatus } from '../../../lib/ui/inputs/checkbox/CheckStatus';
import { HStack, VStack } from '../../../lib/ui/layout/Stack';
import { Panel } from '../../../lib/ui/panel/Panel';
import { ValueProp } from '../../../lib/ui/props';
import { Text } from '../../../lib/ui/text';
import { CoinMeta } from '../../../model/coin-meta';
import { useDeleteCoinMutation } from '../../mutations/useDeleteCoinMutation';
import { useSaveCoinMutation } from '../../mutations/useSaveCoinMutation';
import { useCurrentVaultCoins } from '../../state/currentVault';

const Container = styled(Panel)`
  ${interactive};
`;

const Check = styled(CheckStatus)`
  ${sameDimensions(24)};
`;

type ManageVaultCoinProps = ValueProp<CoinMeta> & {
  icon: ReactNode;
};

export const ManageVaultCoin = ({ value, icon }: ManageVaultCoinProps) => {
  const [optimisticIsChecked, setOptimisticIsChecked] = useState(false);
  const key = getCoinMetaKey(value);

  const coins = useCurrentVaultCoins();
  const isChecked = coins.some(c => areEqualCoins(getStorageCoinKey(c), key));

  const { mutate: saveCoin, isPending: isSaving } = useSaveCoinMutation();
  const { mutate: deleteCoin, isPending: isDeleting } = useDeleteCoinMutation();

  // Synchronize in case the mutation was unsuccessful and the optimistic update needs to be reverted
  useEffect(() => {
    if (isChecked !== optimisticIsChecked && !isSaving && !isDeleting) {
      setOptimisticIsChecked(isChecked);
    }
  }, [isChecked, isDeleting, isSaving, optimisticIsChecked]);

  return (
    <Container
      data-testid={`ManageVaultChain-Coin-${value.ticker}`}
      onClick={() => {
        if (isChecked) {
          setOptimisticIsChecked(false);
          deleteCoin(key);
        } else {
          setOptimisticIsChecked(true);
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
        <Check value={optimisticIsChecked} />
      </HStack>
    </Container>
  );
};
