import { useNavigate } from 'react-router-dom';
import { Button } from '../../../lib/ui/buttons/Button';
import { useAssertWalletCore } from '../../../main';
import { useVaultListViewModelDeprecated } from './useVaultListViewModelDeprecated';
import { Chain } from '../../../model/chain';
import { useMemo } from 'react';

export const SendCoinPromptDeprecated = () => {
  const walletCore = useAssertWalletCore();
  const { coins, balances, priceRates } =
    useVaultListViewModelDeprecated(walletCore);

  const navigate = useNavigate();

  const coin = useMemo(() => {
    return (
      Array.from(coins.values())
        .flat()
        .find(coin => coin.chain === Chain.Dogecoin && coin.isNativeToken) ||
      null
    );
  }, [coins]);

  return (
    <Button
      onClick={() => {
        navigate(`/vault/item/send/${Chain.Dogecoin}`, {
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
