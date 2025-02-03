import { processKeysignPayload } from '../../../chain/keysign/processKeysignPayload';
import { storageCoinToCoin } from '../../../coin/utils/storageCoin';
import { KeysignPayload } from '../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { useTransform } from '../../../lib/ui/hooks/useTransform';
import { useStateDependentQuery } from '../../../lib/ui/query/hooks/useStateDependentQuery';
import { useCurrentVault, useCurrentVaultCoin } from '../../state/currentVault';
import { useSendCappedAmountQuery } from '../queries/useSendCappedAmountQuery';
import { useSendChainSpecificQuery } from '../queries/useSendChainSpecificQuery';
import { useSendMemo } from './memo';
import { useSendReceiver } from './receiver';
import { useCurrentSendCoin } from './sendCoin';

export const useSendTxKeysignPayloadQuery = () => {
  const [coinKey] = useCurrentSendCoin();
  const coin = useTransform(useCurrentVaultCoin(coinKey), storageCoinToCoin);
  const [receiver] = useSendReceiver();
  const [memo] = useSendMemo();

  const vault = useCurrentVault();

  const chainSpecificQuery = useSendChainSpecificQuery();

  const cappedAmountQuery = useSendCappedAmountQuery();

  return useStateDependentQuery({
    state: {
      chainSpecific: chainSpecificQuery.data,
      cappedAmount: cappedAmountQuery.data,
    },
    getQuery: ({ chainSpecific, cappedAmount }) => ({
      queryKey: ['sendKeysignPayload'],
      queryFn: async () => {
        const result = new KeysignPayload({
          coin,
          toAddress: receiver,
          toAmount: cappedAmount.amount.toString(),
          blockchainSpecific: chainSpecific,
          memo,
          vaultLocalPartyId: vault.local_party_id,
          vaultPublicKeyEcdsa: vault.public_key_ecdsa,
        });

        return processKeysignPayload(result);
      },
    }),
  });
};
