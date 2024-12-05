import { useQuery } from '@tanstack/react-query';

import { thorchainSwapConfig } from '../../../chain/thor/swap/config';
import { fromChainAmount } from '../../../chain/utils/fromChainAmount';
import { useBalanceQuery } from '../../../coin/query/useBalanceQuery';
import { storageCoinToCoin } from '../../../coin/utils/storageCoin';
import { THORChainSwapPayload } from '../../../gen/vultisig/keysign/v1/thorchain_swap_payload_pb';
import { shouldBePresent } from '../../../lib/utils/assert/shouldBePresent';
import {
  ISwapTransaction,
  SwapPayloadType,
  TransactionType,
} from '../../../model/transaction';
import { useAssertWalletCore } from '../../../providers/WalletCoreProvider';
import { BlockchainServiceFactory } from '../../../services/Blockchain/BlockchainServiceFactory';
import { useSpecificSendTxInfoQuery } from '../../send/queries/useSpecificSendTxInfoQuery';
import {
  useCurrentVault,
  useCurrentVaultAddress,
  useCurrentVaultCoin,
} from '../../state/currentVault';
import { useFromAmount } from '../state/fromAmount';
import { useFromCoin } from '../state/fromCoin';
import { useToCoin } from '../state/toCoin';
import { useSwapQuoteQuery } from './useSwapQuoteQuery';

export const useSwapKeysignPayloadQuery = () => {
  const [fromCoinKey] = useFromCoin();
  const fromStorageCoin = useCurrentVaultCoin(fromCoinKey);
  const fromCoin = storageCoinToCoin(fromStorageCoin);
  const fromAddress = useCurrentVaultAddress(fromCoinKey.chainId);

  const [toCoinKey] = useToCoin();
  const toStorageCoin = useCurrentVaultCoin(toCoinKey);
  const toCoin = storageCoinToCoin(toStorageCoin);
  const [receiver] = useCurrentVaultAddress(toCoinKey.chainId);

  const [fromAmount] = useFromAmount();

  const swapQuoteQuery = useSwapQuoteQuery();

  const walletCore = useAssertWalletCore();

  const vault = useCurrentVault();

  const fromCoinBalanceQuery = useBalanceQuery(fromCoin);

  const specificTxInfoQuery = useSpecificSendTxInfoQuery();

  return useQuery({
    queryKey: ['swapKeysignPayload'],
    queryFn: async () => {
      const swapQuote = shouldBePresent(swapQuoteQuery.data);

      const toAddress =
        swapQuote.router ?? swapQuote.inbound_address ?? receiver;

      const service = BlockchainServiceFactory.createService(
        fromCoinKey.chainId,
        walletCore
      );

      const amount = shouldBePresent(fromAmount);

      const fromCoinBalance = shouldBePresent(fromCoinBalanceQuery.data);

      const sendMaxAmount =
        fromAmount ===
        fromChainAmount(fromCoinBalance.amount, fromCoin.decimals);

      const specificTransactionInfo = shouldBePresent(specificTxInfoQuery.data);

      const tx: ISwapTransaction = {
        fromAddress,
        toAddress,
        amount,
        memo: swapQuote.memo,
        coin: fromCoin,
        sendMaxAmount,
        specificTransactionInfo,
        transactionType: TransactionType.SWAP,
        swapPayload: {
          case: SwapPayloadType.THORCHAIN,
          value: new THORChainSwapPayload({
            fromAddress,
            fromCoin,
            routerAddress: swapQuote.router,
            fromAmount: amount.toString(),
            expirationTime: swapQuote.expiry,
            streamingInterval: thorchainSwapConfig.streamingInterval.toString(),
            streamingQuantity: '0',
            toAmountDecimal: toCoin.decimals.toString(),
            toAmountLimit: swapQuote.expected_amount_out,
            vaultAddress: fromAddress,
          }),
        },
      };

      return service.createKeysignPayload(
        tx,
        vault.local_party_id,
        vault.public_key_ecdsa
      );
    },
    enabled:
      !!swapQuoteQuery.data &&
      !!fromCoinBalanceQuery.data &&
      !!specificTxInfoQuery.data,
  });
};
