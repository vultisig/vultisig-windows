import {
  OneInchQuote,
  OneInchSwapPayload,
  OneInchTransaction,
} from '../../../../gen/vultisig/keysign/v1/1inch_swap_payload_pb';
import { Coin } from '../../../../gen/vultisig/keysign/v1/coin_pb';
import { KeysignPayload } from '../../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { SpecificEvm } from '../../../../model/specific-transaction-info';
import { defaultEvmSwapGasLimit } from '../../../evm/evmGasLimit';
import { toEthereumSpecific } from '../../../evm/tx/toEthereumSpecific';
import { fromChainAmount } from '../../../utils/fromChainAmount';
import { OneInchSwapQuote } from '../OneInchSwapQuote';

type Input = {
  vaultId: string;
  vaultLocalPartyId: string;
  amount: bigint;
  quote: OneInchSwapQuote;
  fromCoin: Coin;
  toCoin: Coin;
  specificTransactionInfo: SpecificEvm;
};

export const getOneInchSwapKeysignPayload = ({
  vaultLocalPartyId,
  vaultId,
  amount,
  quote,
  fromCoin,
  toCoin,
  specificTransactionInfo,
}: Input): KeysignPayload => {
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
    blockchainSpecific: {
      case: 'ethereumSpecific',
      value: toEthereumSpecific({
        ...specificTransactionInfo,
        gasLimit: defaultEvmSwapGasLimit,
      }),
    },
    vaultPublicKeyEcdsa: vaultId,
    vaultLocalPartyId,
  });

  return result;
};
