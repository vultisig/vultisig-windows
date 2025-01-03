import { SuiSpecific } from '../../../gen/vultisig/keysign/v1/blockchain_specific_pb';
import { RpcServiceSui } from '../../../services/Rpc/sui/RpcServiceSui';
import { assertChainField } from '../../utils/assertChainField';
import { KeysignChainSpecificValue } from '../KeysignChainSpecific';
import { GetChainSpecificInput } from './GetChainSpecificInput';

export const getSuiSpecific = async ({
  coin,
}: GetChainSpecificInput): Promise<KeysignChainSpecificValue> => {
  const { chain } = assertChainField(coin);
  const rpcService = new RpcServiceSui(chain);

  const gasPrice = await rpcService.calculateFee(coin);
  const allCoins = await rpcService.getAllCoins(coin);

  return new SuiSpecific({
    referenceGasPrice: gasPrice.toString(),
    coins: allCoins,
  });
};
