import { getFeeAmount } from '../../../chain/tx/fee/utils/getFeeAmount';
import { toChainAmount } from '../../../chain/utils/toChainAmount';
import { useBalanceQuery } from '../../../coin/query/useBalanceQuery';
import { storageCoinToCoin } from '../../../coin/utils/storageCoin';
import { KeysignPayload } from '../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { useStateDependentQuery } from '../../../lib/ui/query/hooks/useStateDependentQuery';
import { shouldBePresent } from '../../../lib/utils/assert/shouldBePresent';
import { Chain, UtxoChain } from '../../../model/chain';
import { RpcServiceUtxo } from '../../../services/Rpc/utxo/RpcServiceUtxo';
import { useCurrentVault, useCurrentVaultCoin } from '../../state/currentVault';
import { useSendChainSpecificQuery } from '../queries/useSendChainSpecificQuery';
import { capSendAmountToMax } from '../utils/capSendAmountToMax';
import { useSendAmount } from './amount';
import { useSendMemo } from './memo';
import { useSendReceiver } from './receiver';
import { useCurrentSendCoin } from './sendCoin';

export const useSendTxKeysignPayloadQuery = () => {
  const [coinKey] = useCurrentSendCoin();
  const coin = useCurrentVaultCoin(coinKey);
  const [receiver] = useSendReceiver();
  const [amount] = useSendAmount();
  const [memo] = useSendMemo();

  const vault = useCurrentVault();

  const chainSpecificQuery = useSendChainSpecificQuery();
  const balanceQuery = useBalanceQuery(storageCoinToCoin(coin));

  return useStateDependentQuery({
    state: {
      chainSpecific: chainSpecificQuery.data,
      balance: balanceQuery.data,
    },
    getQuery: ({ chainSpecific, balance }) => ({
      queryKey: ['sendKeysignPayload'],
      queryFn: async () => {
        const chainAmount = toChainAmount(
          shouldBePresent(amount),
          coin.decimals
        );

        const feeAmount = getFeeAmount(chainSpecific);

        const cappedChainAmount = capSendAmountToMax({
          amount: chainAmount,
          coin: storageCoinToCoin(coin),
          fee: BigInt(Math.round(feeAmount)),
          balance: balance.amount,
        });

        const result = new KeysignPayload({
          coin: storageCoinToCoin(coin),
          toAddress: receiver,
          toAmount: cappedChainAmount.toString(),
          blockchainSpecific: chainSpecific,
          memo,
          vaultLocalPartyId: vault.local_party_id,
          vaultPublicKeyEcdsa: vault.public_key_ecdsa,
        });

        if (coin.chain in UtxoChain) {
          const service = new RpcServiceUtxo(coin.chain as Chain);
          result.utxoInfo = await service.getUtxos(storageCoinToCoin(coin));
        }

        return result;
      },
    }),
  });
};
