import { Coin } from '../../../../gen/vultisig/keysign/v1/coin_pb';
import { THORChainSwapPayload } from '../../../../gen/vultisig/keysign/v1/thorchain_swap_payload_pb';
import { SwapPayload, SwapPayloadType } from '../../../../model/transaction';
import { ThorchainSwapQuote } from '../api/ThorchainSwapQuote';
import { thorchainSwapConfig } from '../config';

type Input = {
  quote: ThorchainSwapQuote;
  fromAddress: string;
  fromCoin: Coin;
  amount: number;
  toCoinDecimals: number;
};

export const thorchainSwapQuoteToSwapPayload = ({
  quote,
  fromAddress,
  fromCoin,
  amount,
  toCoinDecimals,
}: Input): SwapPayload => {
  return {
    case: SwapPayloadType.THORCHAIN,
    value: new THORChainSwapPayload({
      fromAddress,
      fromCoin,
      routerAddress: quote.router,
      fromAmount: amount.toString(),
      expirationTime: quote.expiry,
      streamingInterval: thorchainSwapConfig.streamingInterval.toString(),
      streamingQuantity: '0',
      toAmountDecimal: toCoinDecimals.toString(),
      toAmountLimit: quote.expected_amount_out,
      vaultAddress: fromAddress,
    }),
  };
};
