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
  toCoin: Coin;
};

export const thorchainSwapQuoteToSwapPayload = ({
  quote,
  fromAddress,
  fromCoin,
  amount,
  toCoin,
}: Input): SwapPayload => {
  const isAffiliate =
    !!quote.fees.affiliate && Number(quote.fees.affiliate) > 0;

  return {
    case: SwapPayloadType.THORCHAIN,
    value: new THORChainSwapPayload({
      fromAddress,
      fromCoin,
      toCoin,
      vaultAddress: quote.inbound_address ?? fromCoin.address,
      routerAddress: quote.router,
      fromAmount: amount.toString(),
      toAmountDecimal: toCoin.decimals.toString(),
      expirationTime: quote.expiry,
      streamingInterval: thorchainSwapConfig.streamingInterval.toString(),
      streamingQuantity: '0',
      toAmountLimit: '0',
      isAffiliate,
    }),
  };
};
