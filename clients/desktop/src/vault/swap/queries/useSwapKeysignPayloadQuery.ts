import { create } from '@bufbuild/protobuf';
import { KeysignPayloadSchema } from '@core/communication/vultisig/keysign/v1/keysign_message_pb';

import { processKeysignPayload } from '../../../chain/keysign/processKeysignPayload';
import { getSwapKeysignPayloadFields } from '../../../chain/swap/keysign/getSwapKeysignPayloadFields';
import { toChainAmount } from '../../../chain/utils/toChainAmount';
import { storageCoinToCoin } from '../../../coin/utils/storageCoin';
import { useTransform } from '../../../lib/ui/hooks/useTransform';
import { useStateDependentQuery } from '../../../lib/ui/query/hooks/useStateDependentQuery';
import { useCurrentVault, useCurrentVaultCoin } from '../../state/currentVault';
import { useFromAmount } from '../state/fromAmount';
import { useFromCoin } from '../state/fromCoin';
import { useToCoin } from '../state/toCoin';
import { useSwapChainSpecificQuery } from './useSwapChainSpecificQuery';
import { useSwapQuoteQuery } from './useSwapQuoteQuery';

export const useSwapKeysignPayloadQuery = () => {
  const [fromCoinKey] = useFromCoin();
  const fromCoin = useTransform(
    useCurrentVaultCoin(fromCoinKey),
    storageCoinToCoin
  );

  const [toCoinKey] = useToCoin();
  const toStorageCoin = useCurrentVaultCoin(toCoinKey);
  const toCoin = storageCoinToCoin(toStorageCoin);

  const [fromAmount] = useFromAmount();

  const swapQuoteQuery = useSwapQuoteQuery();

  const vault = useCurrentVault();

  const chainSpecificQuery = useSwapChainSpecificQuery();

  return useStateDependentQuery({
    state: {
      swapQuote: swapQuoteQuery.data,
      chainSpecific: chainSpecificQuery.data,
      fromAmount: fromAmount ?? undefined,
    },
    getQuery: ({ swapQuote, chainSpecific, fromAmount }) => ({
      queryKey: ['swapKeysignPayload'],
      queryFn: async () => {
        const amount = toChainAmount(fromAmount, fromCoin.decimals);
        const swapSpecificFields = await getSwapKeysignPayloadFields({
          amount,
          quote: swapQuote,
          fromCoin,
          toCoin,
        });

        const result = create(KeysignPayloadSchema, {
          coin: fromCoin,
          toAmount: amount.toString(),
          blockchainSpecific: chainSpecific,
          vaultLocalPartyId: vault.local_party_id,
          vaultPublicKeyEcdsa: vault.public_key_ecdsa,
          ...swapSpecificFields,
        });

        return processKeysignPayload(result);
      },
    }),
  });
};
