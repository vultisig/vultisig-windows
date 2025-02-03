import { create } from '@bufbuild/protobuf';
import { SuiSpecificSchema } from '@core/communication/vultisig/keysign/v1/blockchain_specific_pb';

import { RpcServiceSui } from '../../../services/Rpc/sui/RpcServiceSui';
import { KeysignChainSpecificValue } from '../KeysignChainSpecific';
import { GetChainSpecificInput } from './GetChainSpecificInput';

export const getSuiSpecific = async ({
  coin,
}: GetChainSpecificInput): Promise<KeysignChainSpecificValue> => {
  const rpcService = new RpcServiceSui();

  const gasPrice = await rpcService.calculateFee(coin);
  const allCoins = await rpcService.getAllCoins(coin);

  return create(SuiSpecificSchema, {
    referenceGasPrice: gasPrice.toString(),
    coins: allCoins,
  });
};
