import { getErc20ThorchainSwapKeysignPayload } from '../../../chain/thor/swap/utils/getErc20ThorchainSwapKeysignPayload';
import { fromChainAmount } from '../../../chain/utils/fromChainAmount';
import { getChainPrimaryCoin } from '../../../chain/utils/getChainPrimaryCoin';
import { isNativeCoin } from '../../../chain/utils/isNativeCoin';
import { areEqualCoins } from '../../../coin/Coin';
import { useBalanceQuery } from '../../../coin/query/useBalanceQuery';
import { getCoinMetaKey } from '../../../coin/utils/coinMeta';
import { storageCoinToCoin } from '../../../coin/utils/storageCoin';
import { useStateDependentQuery } from '../../../lib/ui/query/hooks/useStateDependentQuery';
import { shouldBePresent } from '../../../lib/utils/assert/shouldBePresent';
import { Chain, EvmChain } from '../../../model/chain';
import { SpecificEvm } from '../../../model/specific-transaction-info';
import { TransactionType } from '../../../model/transaction';
import { useAssertWalletCore } from '../../../providers/WalletCoreProvider';
import { BlockchainServiceFactory } from '../../../services/Blockchain/BlockchainServiceFactory';
import {
  useCurrentVault,
  useCurrentVaultAddress,
  useCurrentVaultCoin,
} from '../../state/currentVault';
import { getStorageVaultId } from '../../utils/storageVault';
import { useFromAmount } from '../state/fromAmount';
import { useFromCoin } from '../state/fromCoin';
import { useToCoin } from '../state/toCoin';
import { useSwapQuoteQuery } from './useSwapQuoteQuery';
import { useSwapSpecificTxInfoQuery } from './useSwapSpecificTxInfoQuery';

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

  const walletCore = useAssertWalletCore();

  const vault = useCurrentVault();

  const fromCoinBalanceQuery = useBalanceQuery(fromCoin);

  const specificTxInfoQuery = useSwapSpecificTxInfoQuery();

  return useStateDependentQuery({
    state: {
      swapQuote: swapQuoteQuery.data,
      fromCoinBalance: fromCoinBalanceQuery.data,
      specificTransactionInfo: specificTxInfoQuery.data,
      fromAmount: fromAmount ?? undefined,
    },
    getQuery: ({
      swapQuote,
      fromCoinBalance,
      specificTransactionInfo,
      fromAmount,
    }) => ({
      queryKey: ['swapKeysignPayload'],
      queryFn: async () => {
        const service = BlockchainServiceFactory.createService(
          fromCoinKey.chain,
          walletCore
        );

        const sendMaxAmount =
          fromAmount ===
          fromChainAmount(fromCoinBalance.amount, fromCoin.decimals);

        const thorchainPrimaryCoin = getCoinMetaKey(
          getChainPrimaryCoin(Chain.THORChain)
        );

        const { memo } = swapQuote;

        if (fromCoinKey.chain in EvmChain && !isNativeCoin(fromCoinKey)) {
          return getErc20ThorchainSwapKeysignPayload({
            quote: swapQuote,
            fromAddress,
            fromCoin,
            amount: fromAmount,
            toCoin,
            specificTransactionInfo: specificTransactionInfo as SpecificEvm,
            vaultId: getStorageVaultId(vault),
            vaultLocalPartyId: vault.local_party_id,
          });
        }

        const tx = areEqualCoins(fromCoinKey, thorchainPrimaryCoin)
          ? {
              fromAddress,
              toAddress: '',
              amount: fromAmount,
              memo,
              coin: fromCoin,
              transactionType: TransactionType.DEPOSIT,
              specificTransactionInfo,
            }
          : {
              fromAddress,
              amount: fromAmount,
              memo,
              coin: fromCoin,
              sendMaxAmount,
              specificTransactionInfo,
              transactionType: TransactionType.SEND,
              toAddress: shouldBePresent(swapQuote.inbound_address),
            };

        return service.createKeysignPayload(
          tx,
          vault.local_party_id,
          vault.public_key_ecdsa
        );
      },
    }),
  });
};
