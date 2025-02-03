import { Erc20ApprovePayload } from '../../gen/vultisig/keysign/v1/erc20_approve_payload_pb';
import { KeysignPayload } from '../../gen/vultisig/keysign/v1/keysign_message_pb';
import { isOneOf } from '../../lib/utils/array/isOneOf';
import { assertField } from '../../lib/utils/record/assertField';
import { EvmChain, UtxoChain } from '../../model/chain';
import { getErc20Allowance } from '../evm/erc20/getErc20Allowance';
import { assertChainField } from '../utils/assertChainField';
import { getUtxos } from '../utxo/tx/getUtxos';

export const processKeysignPayload = async (
  payload: KeysignPayload
): Promise<KeysignPayload> => {
  const result = new KeysignPayload(payload);

  const coin = assertChainField(assertField(payload, 'coin'));
  const { chain } = coin;

  if ('swapPayload' in payload && payload.swapPayload.value) {
    const evmChain = isOneOf(chain, Object.values(EvmChain));
    if (evmChain && !coin.isNativeToken) {
      const allowance = await getErc20Allowance({
        chain: evmChain,
        spenderAddress: payload.toAddress as `0x${string}`,
        ownerAddress: coin.address as `0x${string}`,
        address: coin.contractAddress as `0x${string}`,
      });

      if (allowance < BigInt(payload.toAmount)) {
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
