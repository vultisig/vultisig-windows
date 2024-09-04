/* eslint-disable */
import { useNavigate } from 'react-router-dom';
import { Button } from '../../lib/ui/buttons/Button';
import { UniformColumnGrid } from '../../lib/ui/css/uniformColumnGrid';
import { Text } from '../../lib/ui/text';
import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { Balance } from '../../model/balance';
import { Rate } from '../../model/price-rate';
import { Chain } from '../../model/chain';

type VaultPrimaryActionsProps = {
  coin: Coin;
  balances: Map<Coin, Balance>;
  priceRates: Map<string, Rate[]>;
};

export const VaultPrimaryActions: React.FC<VaultPrimaryActionsProps> = ({
  coin,
  balances,
  priceRates,
}) => {
  const navigate = useNavigate();

  function handleGoSendCrypto() {
    navigate(`/vault/item/send/${Chain.THORChain}`, {
      state: {
        coin: coin,
        balances: balances,
        priceRates: priceRates,
      },
    });
  }

  function handleGoSwapCrypto() {}

  return (
    <UniformColumnGrid fullWidth gap={12}>
      <Button kind="outlined" onClick={handleGoSendCrypto}>
        SEND
      </Button>
      <Button kind="outlined">
        <Text color="primarAlt">SWAP</Text>
      </Button>
    </UniformColumnGrid>
  );
};
