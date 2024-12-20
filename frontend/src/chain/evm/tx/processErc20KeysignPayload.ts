import { CoinKey } from '../../../coin/Coin';
import { Erc20ApprovePayload } from '../../../gen/vultisig/keysign/v1/erc20_approve_payload_pb';
import { KeysignPayload } from '../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { EvmChain } from '../../../model/chain';
import { RpcServiceEvm } from '../../../services/Rpc/evm/RpcServiceEvm';

type Input = {
  value: KeysignPayload;
  coin: CoinKey;
  amount: bigint;
  sender: string;
  receiver: string;
};

export const processErc20KeysignPayload = async ({
  value,
  coin,
  sender,
  receiver,
  amount,
}: Input): Promise<KeysignPayload> => {
  const service = new RpcServiceEvm(coin.chain as EvmChain);
  const allowance = await service.fetchAllowance(coin.id, sender, receiver);

  const hasEnoughAllowance = allowance >= amount;

  if (!hasEnoughAllowance) {
    return new KeysignPayload({
      ...value,
      erc20ApprovePayload: new Erc20ApprovePayload({
        amount: amount.toString(),
        spender: receiver,
      }),
    });
  }

  return value;
};
