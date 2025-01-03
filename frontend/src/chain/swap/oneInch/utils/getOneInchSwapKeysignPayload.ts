import { getCoinKey } from '../../../../coin/utils/coin';
import {
  OneInchQuote,
  OneInchSwapPayload,
  OneInchTransaction,
} from '../../../../gen/vultisig/keysign/v1/1inch_swap_payload_pb';
import { Coin } from '../../../../gen/vultisig/keysign/v1/coin_pb';
import { KeysignPayload } from '../../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { processErc20KeysignPayload } from '../../../evm/tx/processErc20KeysignPayload';
import { KeysignChainSpecific } from '../../../keysign/KeysignChainSpecific';
import { fromChainAmount } from '../../../utils/fromChainAmount';
import { isNativeCoin } from '../../../utils/isNativeCoin';
import { OneInchSwapQuote } from '../OneInchSwapQuote';

type Input = {
  vaultId: string;
  vaultLocalPartyId: string;
  amount: bigint;
  quote: OneInchSwapQuote;
  fromCoin: Coin;
  toCoin: Coin;
  chainSpecific: KeysignChainSpecific;
};

export const getOneInchSwapKeysignPayload = async ({
  vaultLocalPartyId,
  vaultId,
  amount,
  quote,
  fromCoin,
  toCoin,
  chainSpecific,
}: Input): Promise<KeysignPayload> => {
  const swapPayload = new OneInchSwapPayload({
    fromCoin,
    toCoin,
    fromAmount: amount.toString(),
    toAmountDecimal: fromChainAmount(quote.dstAmount, toCoin.decimals).toFixed(
      toCoin.decimals
    ),
    quote: new OneInchQuote({
      dstAmount: quote.dstAmount,
      tx: new OneInchTransaction({
        ...quote.tx,
        gas: BigInt(quote.tx.gas),
      }),
    }),
  });

  const result = new KeysignPayload({
    coin: fromCoin,
    toAddress: quote.tx.to,
    toAmount: amount.toString(),
    swapPayload: {
      case: 'oneinchSwapPayload',
      value: swapPayload,
    },
    blockchainSpecific: chainSpecific,
    vaultPublicKeyEcdsa: vaultId,
    vaultLocalPartyId,
  });

  if (!isNativeCoin(getCoinKey(fromCoin))) {
    return processErc20KeysignPayload({
      value: result,
      coin: getCoinKey(fromCoin),
      sender: fromCoin.address,
      receiver: quote.tx.to,
      amount,
    });
  }

  return result;
};
