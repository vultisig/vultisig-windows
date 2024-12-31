import { useCallback } from 'react';

import {
  getKeysignChainSpecificValue,
  KeysignChainSpecific,
} from '../../../chain/keysign/KeysignChainSpecific';
import { useChainSpecificQuery } from '../../../coin/query/useChainSpecificQuery';
import { storageCoinToCoin } from '../../../coin/utils/storageCoin';
import {
  MAYAChainSpecific,
  THORChainSpecific,
} from '../../../gen/vultisig/keysign/v1/blockchain_specific_pb';
import { useTransformQueryData } from '../../../lib/ui/query/hooks/useTransformQueryData';
import { match } from '../../../lib/utils/match';
import { Chain } from '../../../model/chain';
import { useCurrentVaultCoin } from '../../state/currentVault';
import { DepositEnabledChain } from '../DepositEnabledChain';
import { useCurrentDepositCoin } from '../hooks/useCurrentDepositCoin';

export const useDepositChainSpecificQuery = () => {
  const [coinKey] = useCurrentDepositCoin();
  const coin = useCurrentVaultCoin(coinKey);

  return useTransformQueryData(
    useChainSpecificQuery({
      coin: storageCoinToCoin(coin),
      // receiver is only required for Solana which swaps do not support
      receiver: '',
    }),
    useCallback(
      data =>
        match<DepositEnabledChain, KeysignChainSpecific>(
          coin.chain as DepositEnabledChain,
          {
            [Chain.Dydx]: () => data,
            [Chain.Ton]: () => data,
            [Chain.THORChain]: () => {
              const value = getKeysignChainSpecificValue(
                data,
                'thorchainSpecific'
              );

              return {
                case: 'thorchainSpecific',
                value: new THORChainSpecific({
                  ...value,
                  isDeposit: true,
                }),
              };
            },
            [Chain.MayaChain]: () => {
              const value = getKeysignChainSpecificValue(data, 'mayaSpecific');

              return {
                case: 'mayaSpecific',
                value: new MAYAChainSpecific({
                  ...value,
                  isDeposit: true,
                }),
              };
            },
          }
        ),
      [coin.chain]
    )
  );
};
