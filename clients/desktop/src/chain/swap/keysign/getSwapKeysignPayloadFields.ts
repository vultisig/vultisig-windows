import { create } from '@bufbuild/protobuf';
import { EvmChain } from '@core/chain/Chain';
import {
  OneInchQuoteSchema,
  OneInchSwapPayloadSchema,
  OneInchTransactionSchema,
} from '@core/communication/vultisig/keysign/v1/1inch_swap_payload_pb';
import { KeysignPayload } from '@core/communication/vultisig/keysign/v1/keysign_message_pb';
import { isOneOf } from '@lib/utils/array/isOneOf';
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent';
import { matchRecordUnion } from '@lib/utils/matchRecordUnion';

import { AccountCoin, Coin } from '../../../coin/Coin';
import { isFeeCoin } from '../../../coin/utils/isFeeCoin';
import { fromChainAmount } from '../../utils/fromChainAmount';
import { GeneralSwapQuote } from '../general/GeneralSwapQuote';
import { thorchainSwapQuoteToSwapPayload } from '../native/thor/utils/thorchainSwapQuoteToSwapPayload';
import { SwapQuote } from '../quote/SwapQuote';

type Input = {
  amount: bigint;
  quote: SwapQuote;
  fromCoin: AccountCoin;
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
  return matchRecordUnion(quote, {
    general: (quote: GeneralSwapQuote): Output => {
      const swapPayload = create(OneInchSwapPayloadSchema, {
        fromCoin,
        toCoin,
        fromAmount: amount.toString(),
        toAmountDecimal: fromChainAmount(
          quote.dstAmount,
          toCoin.decimals
        ).toFixed(toCoin.decimals),
        quote: create(OneInchQuoteSchema, {
          dstAmount: quote.dstAmount,
          tx: create(OneInchTransactionSchema, {
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
      const { memo } = quote;

      if (
        isOneOf(fromCoin.chain, Object.values(EvmChain)) &&
        !isFeeCoin(fromCoin)
      ) {
        const swapPayload = thorchainSwapQuoteToSwapPayload({
          quote,
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

      const isDeposit = isFeeCoin(fromCoin);

      const result: Output = {
        toAddress: isDeposit ? '' : shouldBePresent(quote.inbound_address),
        memo,
      };

      return result;
    },
  });
};
