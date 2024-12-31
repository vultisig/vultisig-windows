import {
  getKeysignChainSpecificValue,
  KeysignChainSpecific,
} from '../../../chain/keysign/KeysignChainSpecific';
import { NativeSwapChain } from '../../../chain/swap/native/NativeSwapChain';
import { getChainFeeCoin } from '../../../chain/tx/fee/utils/getChainFeeCoin';
import { fromChainAmount } from '../../../chain/utils/fromChainAmount';
import { areEqualCoins } from '../../../coin/Coin';
import { useBalanceQuery } from '../../../coin/query/useBalanceQuery';
import { useChainSpecificQuery } from '../../../coin/query/useChainSpecificQuery';
import { getCoinMetaKey } from '../../../coin/utils/coinMeta';
import { storageCoinToCoin } from '../../../coin/utils/storageCoin';
import {
  MAYAChainSpecific,
  THORChainSpecific,
  UTXOSpecific,
} from '../../../gen/vultisig/keysign/v1/blockchain_specific_pb';
import { useStateDependentQuery } from '../../../lib/ui/query/hooks/useStateDependentQuery';
import { isOneOf } from '../../../lib/utils/array/isOneOf';
import { match } from '../../../lib/utils/match';
import { matchRecordUnion } from '../../../lib/utils/matchRecordUnion';
import { Chain, UtxoChain } from '../../../model/chain';
import { useCurrentVaultCoin } from '../../state/currentVault';
import { useFromAmount } from '../state/fromAmount';
import { useFromCoin } from '../state/fromCoin';
import { useSwapQuoteQuery } from './useSwapQuoteQuery';

export const useSwapChainSpecificQuery = () => {
  const [fromCoinKey] = useFromCoin();
  const fromStorageCoin = useCurrentVaultCoin(fromCoinKey);
  const fromCoin = storageCoinToCoin(fromStorageCoin);

  const fromCoinBalanceQuery = useBalanceQuery(fromCoin);

  const chainSpecificQuery = useChainSpecificQuery({
    coin: fromCoin,
    // receiver is only required for Solana which swaps do not support
    receiver: '',
  });

  const [fromAmount] = useFromAmount();

  const swapQuoteQuery = useSwapQuoteQuery();

  return useStateDependentQuery({
    state: {
      fromCoinBalance: fromCoinBalanceQuery.data,
      chainSpecific: chainSpecificQuery.data,
      swapQuote: swapQuoteQuery.data,
      fromAmount: fromAmount ?? undefined,
    },
    getQuery: ({ fromCoinBalance, chainSpecific, swapQuote }) => ({
      queryKey: ['swapChainSpecific'],
      queryFn: async (): Promise<KeysignChainSpecific> => {
        return matchRecordUnion(swapQuote, {
          oneInch: () => chainSpecific,
          native: ({ swapChain }) => {
            const nativeFeeCoin = getCoinMetaKey(getChainFeeCoin(swapChain));

            const isDeposit = areEqualCoins(fromCoinKey, nativeFeeCoin);

            if (isDeposit) {
              return match<NativeSwapChain, KeysignChainSpecific>(swapChain, {
                [Chain.THORChain]: () => {
                  const value = getKeysignChainSpecificValue(
                    chainSpecific,
                    'thorchainSpecific'
                  );

                  return {
                    case: 'thorchainSpecific',
                    value: new THORChainSpecific({
                      ...value,
                      isDeposit,
                    }),
                  };
                },
                [Chain.MayaChain]: () => {
                  const value = getKeysignChainSpecificValue(
                    chainSpecific,
                    'mayaSpecific'
                  );

                  return {
                    case: 'mayaSpecific',
                    value: new MAYAChainSpecific({
                      ...value,
                      isDeposit,
                    }),
                  };
                },
              });
            }

            if (isOneOf(fromCoinKey.chain, Object.values(UtxoChain))) {
              const sendMaxAmount =
                fromAmount ===
                fromChainAmount(fromCoinBalance.amount, fromCoin.decimals);

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
        });
      },
    }),
  });
};
