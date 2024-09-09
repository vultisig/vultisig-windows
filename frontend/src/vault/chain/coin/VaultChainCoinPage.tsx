import { areEqualCoins } from '../../../coin/Coin';
import { getStorageCoinKey } from '../../../coin/utils/storageCoin';
import { RefreshIcon } from '../../../lib/ui/icons/RefreshIcon';
import { VStack } from '../../../lib/ui/layout/Stack';
import { shouldBePresent } from '../../../lib/utils/assert/shouldBePresent';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderIconButton } from '../../../ui/page/PageHeaderIconButton';
import { PageHeaderIconButtons } from '../../../ui/page/PageHeaderIconButtons';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { useAssertCurrentVaultCoins } from '../../state/useCurrentVault';
import { useCurrentVaultCoinKey } from './useCurrentVaultCoinKey';

export const VaultChainCoinPage = () => {
  const coinKey = useCurrentVaultCoinKey();

  const coins = useAssertCurrentVaultCoins();

  const coin = shouldBePresent(
    coins.find(coin => areEqualCoins(getStorageCoinKey(coin), coinKey))
  );

  return (
    <VStack fill>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        secondaryControls={
          <PageHeaderIconButtons>
            <PageHeaderIconButton icon={<RefreshIcon />} />
          </PageHeaderIconButtons>
        }
        title={<PageHeaderTitle>{coin.ticker}</PageHeaderTitle>}
      />
      coin will be here
    </VStack>
  );
};
