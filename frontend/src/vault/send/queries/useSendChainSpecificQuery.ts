import {
  getKeysignChainSpecificValue,
  KeysignChainSpecific,
} from '../../../chain/keysign/KeysignChainSpecific';
import { fromChainAmount } from '../../../chain/utils/fromChainAmount';
import { useBalanceQuery } from '../../../coin/query/useBalanceQuery';
import { useChainSpecificQuery } from '../../../coin/query/useChainSpecificQuery';
import { storageCoinToCoin } from '../../../coin/utils/storageCoin';
import { UTXOSpecific } from '../../../gen/vultisig/keysign/v1/blockchain_specific_pb';
import { useStateDependentQuery } from '../../../lib/ui/query/hooks/useStateDependentQuery';
import { isOneOf } from '../../../lib/utils/array/isOneOf';
import { UtxoChain } from '../../../model/chain';
import { useCurrentVaultCoin } from '../../state/currentVault';
import { useFeeSettings } from '../fee/settings/state/feeSettings';
import { useSendAmount } from '../state/amount';
import { useSendReceiver } from '../state/receiver';
import { useCurrentSendCoin } from '../state/sendCoin';

export const useSendChainSpecificQuery = () => {
  const [coinKey] = useCurrentSendCoin();
  const coin = useCurrentVaultCoin(coinKey);
  const [feeSettings] = useFeeSettings();

  const [receiver] = useSendReceiver();

  const fromCoinBalanceQuery = useBalanceQuery(storageCoinToCoin(coin));

  const chainSpecificQuery = useChainSpecificQuery({
    coin: storageCoinToCoin(coin),
    receiver,
    feeSettings,
  });

  const [amount] = useSendAmount();

  return useStateDependentQuery({
    state: {
      fromCoinBalance: fromCoinBalanceQuery.data,
      chainSpecific: chainSpecificQuery.data,
      amount: amount ?? undefined,
    },
    getQuery: ({ fromCoinBalance, chainSpecific, amount }) => ({
      queryKey: ['swapChainSpecific'],
      queryFn: async (): Promise<KeysignChainSpecific> => {
        if (isOneOf(coin.chain, Object.values(UtxoChain))) {
          const sendMaxAmount =
            amount === fromChainAmount(fromCoinBalance.amount, coin.decimals);

          const value = getKeysignChainSpecificValue(
            chainSpecific,
            'utxoSpecific'
          );

          return {
            case: 'utxoSpecific',
            value: new UTXOSpecific({
              ...value,
              sendMaxAmount,
            }),
          };
        }

        return chainSpecific;
      },
    }),
  });
};
