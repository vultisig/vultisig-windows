import { ScrollableFlexboxFiller } from '../../../../lib/ui/layout/ScrollableFlexboxFiller';
import { VStack } from '../../../../lib/ui/layout/Stack';
import { PageContent } from '../../../../ui/page/PageContent';
import { PageHeader } from '../../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../../ui/page/PageHeaderTitle';
import { TokensStore } from '../../../../services/Coin/CoinList';
import { useCurrentVaultChainId } from '../../useCurrentVaultChainId';
import { ManageVaultChainCoin } from './ManageVaultChainCoin';

export const ManageVaultChainCoinsPage = () => {
  const chainId = useCurrentVaultChainId();

  const options = TokensStore.TokenSelectionAssets.filter(
    token => token.chain === chainId && !token.isNativeToken
  );

  return (
    <VStack flexGrow>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={<PageHeaderTitle>Choose coins</PageHeaderTitle>}
      />
      <ScrollableFlexboxFiller>
        <PageContent>
          <VStack gap={16}>
            {options.map(option => (
              <ManageVaultChainCoin key={option.ticker} value={option} />
            ))}
          </VStack>
        </PageContent>
      </ScrollableFlexboxFiller>
    </VStack>
  );
};
