import { useQuery } from '@tanstack/react-query';

import { thorchainSwapConfig } from '../../../chain/thor/swap/config';
import { fromChainAmount } from '../../../chain/utils/fromChainAmount';
import { getChainPrimaryCoin } from '../../../chain/utils/getChainPrimaryCoin';
import { isNativeCoin } from '../../../chain/utils/isNativeCoin';
import { areEqualCoins } from '../../../coin/Coin';
import { useBalanceQuery } from '../../../coin/query/useBalanceQuery';
import { getCoinMetaKey } from '../../../coin/utils/coinMeta';
import { storageCoinToCoin } from '../../../coin/utils/storageCoin';
import { THORChainSwapPayload } from '../../../gen/vultisig/keysign/v1/thorchain_swap_payload_pb';
import { shouldBePresent } from '../../../lib/utils/assert/shouldBePresent';
import { Chain, EvmChain } from '../../../model/chain';
import {
  IDepositTransactionVariant,
  ISendTransaction,
  ISwapTransaction,
  SwapPayloadType,
  TransactionType,
} from '../../../model/transaction';
import { useAssertWalletCore } from '../../../providers/WalletCoreProvider';
import { BlockchainServiceFactory } from '../../../services/Blockchain/BlockchainServiceFactory';
import {
  useCurrentVault,
  useCurrentVaultAddress,
  useCurrentVaultCoin,
} from '../../state/currentVault';
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
  const [receiver] = useCurrentVaultAddress(toCoinKey.chain);

  const [fromAmount] = useFromAmount();

  const swapQuoteQuery = useSwapQuoteQuery();

  const walletCore = useAssertWalletCore();

  const vault = useCurrentVault();

  const fromCoinBalanceQuery = useBalanceQuery(fromCoin);

  const specificTxInfoQuery = useSwapSpecificTxInfoQuery();

  return useQuery({
    queryKey: ['swapKeysignPayload'],
    queryFn: async () => {
      const swapQuote = shouldBePresent(swapQuoteQuery.data);

      const toAddress =
        swapQuote.router ?? swapQuote.inbound_address ?? receiver;

      const service = BlockchainServiceFactory.createService(
        fromCoinKey.chain,
        walletCore
      );

      const amount = shouldBePresent(fromAmount);

      const fromCoinBalance = shouldBePresent(fromCoinBalanceQuery.data);

      const sendMaxAmount =
        fromAmount ===
        fromChainAmount(fromCoinBalance.amount, fromCoin.decimals);

      const specificTransactionInfo = shouldBePresent(specificTxInfoQuery.data);

      const thorchainPrimaryCoin = getCoinMetaKey(
        getChainPrimaryCoin(Chain.THORChain)
      );

      const { memo } = swapQuote;

      type Tx =
        | ISendTransaction
        | ISwapTransaction
        | IDepositTransactionVariant;

      const getTx = async (): Promise<Tx> => {
        if (areEqualCoins(fromCoinKey, thorchainPrimaryCoin)) {
          return {
            fromAddress,
            toAddress: '',
            amount: shouldBePresent(fromAmount),
            memo,
            coin: fromCoin,
            transactionType: TransactionType.DEPOSIT,
            specificTransactionInfo,
          };
        }

        if (fromCoinKey.chain in EvmChain && !isNativeCoin(fromCoinKey)) {
          return {
            fromAddress,
            amount: shouldBePresent(fromAmount),
            memo,
            coin: fromCoin,
            sendMaxAmount,
            specificTransactionInfo,
            transactionType: TransactionType.SEND,
            toAddress,
          };
        }

        return {
          fromAddress,
          toAddress,
          amount,
          memo,
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
              streamingInterval:
                thorchainSwapConfig.streamingInterval.toString(),
              streamingQuantity: '0',
              toAmountDecimal: toCoin.decimals.toString(),
              toAmountLimit: swapQuote.expected_amount_out,
              vaultAddress: fromAddress,
            }),
          },
        };
      };

      const tx = await getTx();

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
