import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../../../lib/ui/buttons/Button';
import { Chain } from '../../../model/chain';
import { makeAppPath } from '../../../navigation';
import { useAssertWalletCore } from '../../../providers/WalletCoreProvider';
import { useVaultListViewModelDeprecated } from './useVaultListViewModelDeprecated';

export const SendCoinPromptDeprecated = () => {
  const walletCore = useAssertWalletCore();
  const { coins, balances, priceRates } =
    useVaultListViewModelDeprecated(walletCore);

  const navigate = useNavigate();

  const coin = useMemo(() => {
    return (
      Array.from(coins.values())
        .flat()
        .find(coin => coin.chain === Chain.Cosmos && coin.ticker == 'ATOM') ||
      null
    );
  }, [coins]);

  return (
    <Button
      onClick={() => {
        navigate(makeAppPath('vaultItemSend', { chain: Chain.Cosmos }), {
          state: {
            coin: coin,
            balances: balances,
            priceRates: priceRates,
          },
        });
      }}
      kind="outlined"
    >
      SEND
    </Button>
  );
};
