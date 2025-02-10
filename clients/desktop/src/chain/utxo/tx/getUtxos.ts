import { create } from '@bufbuild/protobuf';
import { UtxoChain } from '@core/chain/Chain';
import { ChainAccount } from '@core/chain/ChainAccount';
import { UtxoInfoSchema } from '@core/communication/vultisig/keysign/v1/utxo_info_pb';

import { getUtxoAddressInfo } from '../blockchair/getUtxoAddressInfo';

export const getUtxos = async (account: ChainAccount<UtxoChain>) => {
  const { data } = await getUtxoAddressInfo(account);

  const { utxo } = data[account.address];

  return utxo.map(({ transaction_hash, value, index }) =>
    create(UtxoInfoSchema, {
      hash: transaction_hash,
      amount: BigInt(value),
      index,
    })
  );
};
