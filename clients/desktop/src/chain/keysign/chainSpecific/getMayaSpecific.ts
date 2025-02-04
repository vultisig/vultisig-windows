import { create } from '@bufbuild/protobuf';
import {
  MAYAChainSpecific,
  MAYAChainSpecificSchema,
} from '@core/communication/vultisig/keysign/v1/blockchain_specific_pb';

import { CosmosChain } from '../../../model/chain';
import { getCosmosAccountInfo } from '../../cosmos/account/getCosmosAccountInfo';
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
