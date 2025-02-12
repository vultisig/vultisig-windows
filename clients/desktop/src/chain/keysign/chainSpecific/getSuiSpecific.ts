import { create } from '@bufbuild/protobuf';
import { getSuiClient } from '@core/chain/chains/sui/client';
import {
  SuiCoinSchema,
  SuiSpecificSchema,
} from '@core/communication/vultisig/keysign/v1/blockchain_specific_pb';

import { KeysignChainSpecificValue } from '../KeysignChainSpecific';
import { GetChainSpecificInput } from './GetChainSpecificInput';

export const getSuiSpecific = async ({
  coin,
}: GetChainSpecificInput): Promise<KeysignChainSpecificValue> => {
  const client = getSuiClient();

  const gasPrice = await client.getReferenceGasPrice();

  const allCoins = await client.getAllCoins({
    owner: coin.address,
  });

  const coins = allCoins.data
    .filter(f => f.coinType == '0x2::sui::SUI')
    .map(coin => {
      return create(SuiCoinSchema, coin);
    });

  return create(SuiSpecificSchema, {
    referenceGasPrice: gasPrice.toString(),
    coins,
  });
};
