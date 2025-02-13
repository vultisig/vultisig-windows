import { create } from '@bufbuild/protobuf';
import { CosmosChain } from '@core/chain/Chain';
import { getCosmosAccountInfo } from '@core/chain/chains/cosmos/account/getCosmosAccountInfo';
import {
  MAYAChainSpecific,
  MAYAChainSpecificSchema,
} from '@core/communication/vultisig/keysign/v1/blockchain_specific_pb';

import { GetChainSpecificInput } from './GetChainSpecificInput';

export const getMayaSpecific = async ({
  coin,
  isDeposit = false,
}: Pick<
  GetChainSpecificInput,
  'coin' | 'isDeposit'
>): Promise<MAYAChainSpecific> => {
  const { accountNumber, sequence } = await getCosmosAccountInfo({
    address: coin.address,
    chain: coin.chain as CosmosChain,
  });

  return create(MAYAChainSpecificSchema, {
    accountNumber: BigInt(accountNumber),
    sequence: BigInt(sequence ?? 0),
    isDeposit,
  });
};
