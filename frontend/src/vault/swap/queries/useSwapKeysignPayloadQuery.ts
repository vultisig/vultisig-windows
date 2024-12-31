import { getErc20ThorchainSwapKeysignPayload } from '../../../chain/swap/native/thor/utils/getErc20ThorchainSwapKeysignPayload';
import { getOneInchSwapKeysignPayload } from '../../../chain/swap/oneInch/utils/getOneInchSwapKeysignPayload';
import { getChainFeeCoin } from '../../../chain/tx/fee/utils/getChainFeeCoin';
import { isNativeCoin } from '../../../chain/utils/isNativeCoin';
import { toChainAmount } from '../../../chain/utils/toChainAmount';
import { areEqualCoins } from '../../../coin/Coin';
import { getCoinMetaKey } from '../../../coin/utils/coinMeta';
import { storageCoinToCoin } from '../../../coin/utils/storageCoin';
import { KeysignPayload } from '../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { useStateDependentQuery } from '../../../lib/ui/query/hooks/useStateDependentQuery';
import { shouldBePresent } from '../../../lib/utils/assert/shouldBePresent';
import { matchRecordUnion } from '../../../lib/utils/matchRecordUnion';
import { Chain, EvmChain, UtxoChain } from '../../../model/chain';
import { RpcServiceUtxo } from '../../../services/Rpc/utxo/RpcServiceUtxo';
import {
  useCurrentVault,
  useCurrentVaultAddress,
  useCurrentVaultCoin,
} from '../../state/currentVault';
import { getStorageVaultId } from '../../utils/storageVault';
import { useFromAmount } from '../state/fromAmount';
import { useFromCoin } from '../state/fromCoin';
import { useToCoin } from '../state/toCoin';
import { useSwapChainSpecificQuery } from './useSwapChainSpecificQuery';
import { useSwapQuoteQuery } from './useSwapQuoteQuery';

export const useSwapKeysignPayloadQuery = () => {
  const [fromCoinKey] = useFromCoin();
  const fromStorageCoin = useCurrentVaultCoin(fromCoinKey);
  const fromCoin = storageCoinToCoin(fromStorageCoin);
  const fromAddress = useCurrentVaultAddress(fromCoinKey.chain);

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
        const result = await matchRecordUnion(swapQuote, {
          oneInch: quote => {
            return getOneInchSwapKeysignPayload({
              quote,
              fromCoin,
              toCoin,
              amount: toChainAmount(fromAmount, fromCoin.decimals),
              chainSpecific,
              vaultId: getStorageVaultId(vault),
              vaultLocalPartyId: vault.local_party_id,
            });
          },
          native: quote => {
            const { memo, swapChain } = quote;

            if (fromCoinKey.chain in EvmChain && !isNativeCoin(fromCoinKey)) {
              return getErc20ThorchainSwapKeysignPayload({
                quote,
                fromAddress,
                fromCoin,
                amount: fromAmount,
                toCoin,
                chainSpecific,
                vaultId: getStorageVaultId(vault),
                vaultLocalPartyId: vault.local_party_id,
              });
            }

            const nativeFeeCoin = getCoinMetaKey(getChainFeeCoin(swapChain));

            const isDeposit = areEqualCoins(fromCoinKey, nativeFeeCoin);

            return new KeysignPayload({
              coin: fromCoin,
              toAddress: isDeposit
                ? ''
                : shouldBePresent(quote.inbound_address),
              toAmount: toChainAmount(fromAmount, fromCoin.decimals).toString(),
              blockchainSpecific: chainSpecific,
              memo,
              vaultLocalPartyId: vault.local_party_id,
              vaultPublicKeyEcdsa: vault.public_key_ecdsa,
            });
          },
        });

        if (fromCoin.chain in UtxoChain) {
          const service = new RpcServiceUtxo(fromCoin.chain as Chain);
          result.utxoInfo = await service.getUtxos(fromCoin);
        }

        return result;
      },
    }),
  });
};
