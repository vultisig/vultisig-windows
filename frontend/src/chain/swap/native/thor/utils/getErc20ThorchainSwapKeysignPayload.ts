import { Coin } from '../../../../../gen/vultisig/keysign/v1/coin_pb';
import { Erc20ApprovePayload } from '../../../../../gen/vultisig/keysign/v1/erc20_approve_payload_pb';
import { KeysignPayload } from '../../../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { shouldBePresent } from '../../../../../lib/utils/assert/shouldBePresent';
import { EvmChain } from '../../../../../model/chain';
import { SpecificEvm } from '../../../../../model/specific-transaction-info';
import { RpcServiceEvm } from '../../../../../services/Rpc/evm/RpcServiceEvm';
import { defaultEvmSwapGasLimit } from '../../../../evm/evmGasLimit';
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

  const service = new RpcServiceEvm(fromCoin.chain as EvmChain);
  const allowance = await service.fetchAllowance(
    fromCoin.contractAddress,
    fromAddress,
    toAddress
  );

  const fromChainAmount = toChainAmount(amount, fromCoin.decimals);

  const hasEnoughAllowance = allowance >= fromChainAmount;

  if (!hasEnoughAllowance) {
    result.erc20ApprovePayload = new Erc20ApprovePayload({
      amount: fromChainAmount.toString(),
      spender: toAddress,
    });
  }

  return result;
};
