import { chainFeeCoin } from '../../../coin/chainFeeCoin';
import { areEqualCoins } from '../../../coin/Coin';
import { getCoinKey } from '../../../coin/utils/coin';
import { getCoinMetaKey } from '../../../coin/utils/coinMeta';
import {
  OneInchQuote,
  OneInchSwapPayload,
  OneInchTransaction,
} from '../../../gen/vultisig/keysign/v1/1inch_swap_payload_pb';
import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { KeysignPayload } from '../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { isOneOf } from '../../../lib/utils/array/isOneOf';
import { shouldBePresent } from '../../../lib/utils/assert/shouldBePresent';
import { matchRecordUnion } from '../../../lib/utils/matchRecordUnion';
import { EvmChain } from '../../../model/chain';
import { fromChainAmount } from '../../utils/fromChainAmount';
import { GeneralSwapQuote } from '../general/GeneralSwapQuote';
import { thorchainSwapQuoteToSwapPayload } from '../native/thor/utils/thorchainSwapQuoteToSwapPayload';
import { SwapQuote } from '../quote/SwapQuote';

type Input = {
  amount: bigint;
  quote: SwapQuote;
  fromCoin: Coin;
  toCoin: Coin;
};

type Output = Pick<KeysignPayload, 'toAddress' | 'memo'> &
  Partial<Pick<KeysignPayload, 'swapPayload'>>;

export const getSwapKeysignPayloadFields = ({
  amount,
  quote,
  fromCoin,
  toCoin,
}: Input): Output => {
  const fromCoinKey = getCoinKey(fromCoin);

  return matchRecordUnion(quote, {
    general: (quote: GeneralSwapQuote): Output => {
      const swapPayload = new OneInchSwapPayload({
        fromCoin,
        toCoin,
        fromAmount: amount.toString(),
        toAmountDecimal: fromChainAmount(
          quote.dstAmount,
          toCoin.decimals
        ).toFixed(toCoin.decimals),
        quote: new OneInchQuote({
          dstAmount: quote.dstAmount,
          tx: new OneInchTransaction({
            ...quote.tx,
            gas: BigInt(quote.tx.gas),
          }),
        }),
      });

      return {
        toAddress: quote.tx.to,
        swapPayload: {
          case: 'oneinchSwapPayload',
          value: swapPayload,
        },
      };
    },
    native: quote => {
      const { memo, swapChain } = quote;

      if (
        isOneOf(fromCoin.chain, Object.values(EvmChain)) &&
        !fromCoin.isNativeToken
      ) {
        const swapPayload = thorchainSwapQuoteToSwapPayload({
          quote,
          fromAddress: fromCoin.address,
          fromCoin,
          amount,
          toCoin,
        });

        const toAddress = shouldBePresent(quote.router);

        const result: Output = {
          toAddress,
          swapPayload,
          memo: quote.memo,
        };

        return result;
      }

      const nativeFeeCoin = getCoinMetaKey(chainFeeCoin[swapChain]);

      const isDeposit = areEqualCoins(fromCoinKey, nativeFeeCoin);

      const result: Output = {
        toAddress: isDeposit ? '' : shouldBePresent(quote.inbound_address),
        memo,
      };

      return result;
    },
  });
};
