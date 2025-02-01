import { PolkadotSpecific } from '../../../gen/vultisig/keysign/v1/blockchain_specific_pb';
import { RpcServicePolkadot } from '../../../services/Rpc/polkadot/RpcServicePolkadot';
import { KeysignChainSpecificValue } from '../KeysignChainSpecific';
import { GetChainSpecificInput } from './GetChainSpecificInput';

export const getPolkadotSpecific = async ({
  coin,
}: GetChainSpecificInput): Promise<KeysignChainSpecificValue> => {
  const rpcService = new RpcServicePolkadot();

  const recentBlockHash = await rpcService.fetchBlockHash();
  const nonce = await rpcService.fetchNonce(coin.address);
  const currentBlockNumber = Number(await rpcService.fetchBlockHeader());
  const genesisHash = await rpcService.fetchGenesisBlockHash();

  const { specVersion, transactionVersion } =
    await rpcService.fetchRuntimeVersion();

  return new PolkadotSpecific({
    recentBlockHash,
    nonce: BigInt(nonce),
    currentBlockNumber: currentBlockNumber.toString(),
    specVersion,
    transactionVersion,
    genesisHash,
  });
};
