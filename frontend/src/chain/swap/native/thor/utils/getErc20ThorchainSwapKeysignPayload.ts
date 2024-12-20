import { getCoinKey } from '../../../../../coin/utils/coin';
import { Coin } from '../../../../../gen/vultisig/keysign/v1/coin_pb';
import { KeysignPayload } from '../../../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { shouldBePresent } from '../../../../../lib/utils/assert/shouldBePresent';
import { SpecificEvm } from '../../../../../model/specific-transaction-info';
import { defaultEvmSwapGasLimit } from '../../../../evm/evmGasLimit';
import { processErc20KeysignPayload } from '../../../../evm/tx/processErc20KeysignPayload';
import { toEthereumSpecific } from '../../../../evm/tx/toEthereumSpecific';
import { toChainAmount } from '../../../../utils/toChainAmount';
import { NativeSwapQuote } from '../../NativeSwapQuote';
import { thorchainSwapQuoteToSwapPayload } from './thorchainSwapQuoteToSwapPayload';

type Input = {
  quote: NativeSwapQuote;
  fromAddress: string;
  fromCoin: Coin;
  amount: number;
  toCoin: Coin;
  specificTransactionInfo: SpecificEvm;
  vaultId: string;
  vaultLocalPartyId: string;
};

export const getErc20ThorchainSwapKeysignPayload = async ({
  quote,
  fromAddress,
  fromCoin,
  amount,
  toCoin,
  specificTransactionInfo,
  vaultId,
  vaultLocalPartyId,
}: Input) => {
  const swapPayload = thorchainSwapQuoteToSwapPayload({
    quote,
    fromAddress,
    fromCoin,
    amount,
    toCoin,
  });

  const toAddress = shouldBePresent(quote.router);

  const result = new KeysignPayload({
    coin: fromCoin,
    toAddress,
    toAmount: swapPayload.value.fromAmount,
    swapPayload,
    blockchainSpecific: {
      case: 'ethereumSpecific',
      value: toEthereumSpecific({
        ...specificTransactionInfo,
        gasLimit: defaultEvmSwapGasLimit,
      }),
    },
    memo: quote.memo,
    vaultPublicKeyEcdsa: vaultId,
    vaultLocalPartyId,
  });

  return processErc20KeysignPayload({
    value: result,
    coin: getCoinKey(fromCoin),
    amount: toChainAmount(amount, fromCoin.decimals),
    sender: fromAddress,
    receiver: toAddress,
  });

  return result;
};
