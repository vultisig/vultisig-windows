import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { Erc20ApprovePayload } from '../../../gen/vultisig/keysign/v1/erc20_approve_payload_pb';
import { EvmChain } from '../../../model/chain';
import { SpecificTransactionInfo } from '../../../model/specific-transaction-info';
import {
  ISwapTransaction,
  SwapPayload,
  TransactionType,
} from '../../../model/transaction';
import { RpcServiceEvm } from '../../../services/Rpc/evm/RpcServiceEvm';
import { fromChainAmount } from '../../utils/fromChainAmount';
import { toChainAmount } from '../../utils/toChainAmount';

type Input = {
  fromAddress: string;
  toAddress: string;
  amount: number;
  coin: Coin;
  sendMaxAmount: boolean;
  specificTransactionInfo: SpecificTransactionInfo;
  swapPayload: SwapPayload;
  memo: string;
};

export const getErc20SwapTx = async ({
  fromAddress,
  toAddress,
  amount,
  coin,
  sendMaxAmount,
  specificTransactionInfo,
  swapPayload,
  memo,
}: Input): Promise<ISwapTransaction> => {
  const tx: ISwapTransaction = {
    fromAddress,
    toAddress,
    amount,
    memo,
    coin,
    sendMaxAmount,
    specificTransactionInfo,
    transactionType: TransactionType.SWAP,
    swapPayload,
  };

  const service = new RpcServiceEvm(coin.chain as EvmChain);
  const allowance = await service.fetchAllowance(
    coin.contractAddress,
    fromAddress,
    toAddress
  );

  const hasEnoughAllowance =
    fromChainAmount(allowance, coin.decimals) >= amount;

  if (!hasEnoughAllowance) {
    tx.erc20ApprovePayload = new Erc20ApprovePayload({
      amount: toChainAmount(amount, coin.decimals).toString(),
      spender: toAddress,
    });
  }

  return tx;
};
