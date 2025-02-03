import { create } from '@bufbuild/protobuf';
import {
  CosmosSpecificSchema,
  TransactionType,
} from '@core/communication/vultisig/keysign/v1/blockchain_specific_pb';

import { Chain } from '../../../model/chain';
import { getCosmosAccountInfo } from '../../cosmos/account/getCosmosAccountInfo';
import {
  ChainsBySpecific,
  KeysignChainSpecificValue,
} from '../KeysignChainSpecific';
import { GetChainSpecificInput } from './GetChainSpecificInput';

type CosmosSpecificChain = ChainsBySpecific<'cosmosSpecific'>;

const defaultGas = 7500;

const defaultGasRecord: Record<CosmosSpecificChain, number> = {
  [Chain.Cosmos]: defaultGas,
  [Chain.Osmosis]: defaultGas,
  [Chain.Kujira]: defaultGas,
  [Chain.Terra]: defaultGas,
  [Chain.Dydx]: 2500000000000000,
  [Chain.TerraClassic]: 100000000,
  [Chain.Noble]: 30000,
  [Chain.Akash]: 200000,
};

export const getCosmosSpecific = async ({
  coin,
}: GetChainSpecificInput): Promise<KeysignChainSpecificValue> => {
  const chain = coin.chain as CosmosSpecificChain;
  const { accountNumber, sequence } = await getCosmosAccountInfo({
    address: coin.address,
    chain,
  });

  const gas = BigInt(defaultGasRecord[chain]);

  return create(CosmosSpecificSchema, {
    accountNumber: BigInt(accountNumber),
    sequence: BigInt(sequence),
    gas,
    transactionType: TransactionType.UNSPECIFIED,
  });
};
