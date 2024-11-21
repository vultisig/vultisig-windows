import { useSpecificTxInfoQuery } from '../../../coin/query/useSpecificTxInfoQuery';
import { storageCoinToCoin } from '../../../coin/utils/storageCoin';
import { useCurrentVaultCoin } from '../../state/currentVault';
import { useFeeSettings } from '../fee/settings/state/feeSettings';
import { useCurrentSendCoin } from '../state/sendCoin';

export const useSpecificSendTxInfoQuery = () => {
  const [coinKey] = useCurrentSendCoin();
  const coin = useCurrentVaultCoin(coinKey);
  const [feeSettings] = useFeeSettings();

  return useSpecificTxInfoQuery({
    coin: storageCoinToCoin(coin),
    feeSettings,
  });
};
