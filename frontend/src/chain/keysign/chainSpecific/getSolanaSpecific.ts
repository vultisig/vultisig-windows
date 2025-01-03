import { SolanaSpecific } from '../../../gen/vultisig/keysign/v1/blockchain_specific_pb';
import { RpcServiceSolana } from '../../../services/Rpc/solana/RpcServiceSolana';
import { KeysignChainSpecificValue } from '../KeysignChainSpecific';
import { GetChainSpecificInput } from './GetChainSpecificInput';

export const getSolanaSpecific = async ({
  coin,
  receiver,
}: GetChainSpecificInput): Promise<KeysignChainSpecificValue> => {
  const rpcService = new RpcServiceSolana();
  // Fetch the recent block hash and priority fee concurrently
  const [recentBlockHash, highPriorityFee] = await Promise.all([
    rpcService.fetchRecentBlockhash(),
    rpcService.fetchHighPriorityFee(coin.address),
  ]);

  if (!recentBlockHash) {
    throw new Error('Failed to get recent block hash');
  }

  let fromAddressPubKey = coin.address;
  let toAddressPubKey = receiver;

  // If the coin is not a native token and both from and to addresses are available
  if (fromAddressPubKey && toAddressPubKey && !coin.isNativeToken) {
    // Fetch associated token accounts for both the from and to addresses
    const [associatedTokenAddressFrom, associatedTokenAddressTo] =
      await Promise.all([
        rpcService.fetchTokenAssociatedAccountByOwner(
          fromAddressPubKey,
          coin.contractAddress
        ),
        rpcService.fetchTokenAssociatedAccountByOwner(
          toAddressPubKey,
          coin.contractAddress
        ),
      ]);

    fromAddressPubKey = associatedTokenAddressFrom;
    toAddressPubKey = associatedTokenAddressTo;
  }

  return new SolanaSpecific({
    recentBlockHash,
    priorityFee: highPriorityFee.toString(),
    fromTokenAssociatedAddress: fromAddressPubKey,
    toTokenAssociatedAddress: toAddressPubKey,
  });
};
