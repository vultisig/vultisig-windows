import { create } from '@bufbuild/protobuf';
import { RippleSpecificSchema } from '@core/communication/vultisig/keysign/v1/blockchain_specific_pb';

import { RpcServiceRipple } from '../../../services/Rpc/ripple/RpcServiceRipple';
import { rippleConfig } from '../../ripple/config';
import { KeysignChainSpecificValue } from '../KeysignChainSpecific';
import { GetChainSpecificInput } from './GetChainSpecificInput';

export const getRippleSpecific = async ({
  coin,
}: GetChainSpecificInput): Promise<KeysignChainSpecificValue> => {
  const rpcService = new RpcServiceRipple();
  const accountInfo = await rpcService.fetchAccountsInfo(coin.address);
  const sequence = accountInfo?.account_data?.Sequence ?? 0;

  return create(RippleSpecificSchema, {
    sequence,
    gas: BigInt(rippleConfig.fee),
  });
};
