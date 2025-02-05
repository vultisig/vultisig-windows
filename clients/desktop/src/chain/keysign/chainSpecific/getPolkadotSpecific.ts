import { create } from '@bufbuild/protobuf';
import { PolkadotSpecificSchema } from '@core/communication/vultisig/keysign/v1/blockchain_specific_pb';

import { getPolkadotApiClient } from '../../polkadot/api/getPolkadotApiClient';
import { KeysignChainSpecificValue } from '../KeysignChainSpecific';
import { GetChainSpecificInput } from './GetChainSpecificInput';

export const getPolkadotSpecific = async ({
  coin,
}: GetChainSpecificInput): Promise<KeysignChainSpecificValue> => {
  const client = await getPolkadotApiClient();
  const recentBlockHash = (await client.rpc.chain.getBlockHash()).toHex();
  const nonce = (
    await client.rpc.system.accountNextIndex(coin.address)
  ).toBigInt();
  const header = await client.rpc.chain.getHeader();
  const currentBlockNumber = header.number.toNumber();
  const genesisHash = (await client.rpc.chain.getBlockHash(0)).toHex();

  const { specVersion, transactionVersion } =
    await client.rpc.state.getRuntimeVersion();

  return create(PolkadotSpecificSchema, {
    recentBlockHash,
    nonce,
    currentBlockNumber: currentBlockNumber.toString(),
    specVersion: specVersion.toNumber(),
    transactionVersion: transactionVersion.toNumber(),
    genesisHash,
  });
};
