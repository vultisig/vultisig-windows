import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../../../lib/ui/buttons/Button';
import { Chain } from '../../../model/chain';
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
        .find(
          coin =>
            coin.chain === Chain.Solana &&
            coin.ticker == 'SOL' &&
            coin.isNativeToken
        ) || null
    );
  }, [coins]);

  return (
    <Button
      onClick={() => {
        navigate(`/vault/item/send/${Chain.Solana}`, {
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
