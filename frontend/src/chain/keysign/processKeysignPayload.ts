import { Erc20ApprovePayload } from '../../gen/vultisig/keysign/v1/erc20_approve_payload_pb';
import { KeysignPayload } from '../../gen/vultisig/keysign/v1/keysign_message_pb';
import { isOneOf } from '../../lib/utils/array/isOneOf';
import { assertField } from '../../lib/utils/record/assertField';
import { EvmChain, UtxoChain } from '../../model/chain';
import { RpcServiceEvm } from '../../services/Rpc/evm/RpcServiceEvm';
import { assertChainField } from '../utils/assertChainField';
import { getUtxos } from '../utxo/tx/getUtxos';

export const processKeysignPayload = async (
  payload: KeysignPayload
): Promise<KeysignPayload> => {
  const result = new KeysignPayload(payload);

  const coin = assertChainField(assertField(payload, 'coin'));
  const { chain } = coin;

  if ('swapPayload' in payload && payload.swapPayload.value) {
    if (isOneOf(chain, Object.values(EvmChain)) && !coin.isNativeToken) {
      const service = new RpcServiceEvm(coin.chain as EvmChain);
      const allowance = await service.fetchAllowance(
        coin.contractAddress,
        coin.address,
        payload.toAddress
      );

      const hasEnoughAllowance = BigInt(allowance) >= BigInt(payload.toAmount);

      if (!hasEnoughAllowance) {
        result.erc20ApprovePayload = new Erc20ApprovePayload({
          amount: payload.toAmount,
          spender: payload.toAddress,
        });
      }
    }
  }

  if (isOneOf(chain, Object.values(UtxoChain))) {
    result.utxoInfo = await getUtxos(assertChainField(coin));
  }

  return result;
};
