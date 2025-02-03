import { create } from '@bufbuild/protobuf';
import {
  THORChainSpecific,
  THORChainSpecificSchema,
} from '@core/communication/vultisig/keysign/v1/blockchain_specific_pb';

import { CosmosChain } from '../../../model/chain';
import { getCosmosAccountInfo } from '../../cosmos/account/getCosmosAccountInfo';
import { getThorNetworkInfo } from '../../thor/getThorNetworkInfo';
import { GetChainSpecificInput } from './GetChainSpecificInput';

export const getThorchainSpecific = async ({
  coin,
  isDeposit = false,
}: Pick<
  GetChainSpecificInput,
  'coin' | 'isDeposit'
>): Promise<THORChainSpecific> => {
  const { accountNumber, sequence } = await getCosmosAccountInfo({
    address: coin.address,
    chain: coin.chain as CosmosChain,
  });

  const { native_tx_fee_rune } = await getThorNetworkInfo();

  return create(THORChainSpecificSchema, {
    accountNumber: BigInt(accountNumber),
    sequence: BigInt(sequence ?? 0),
    fee: BigInt(native_tx_fee_rune),
    isDeposit,
  });
};
