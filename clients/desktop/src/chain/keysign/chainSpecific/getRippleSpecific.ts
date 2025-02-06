import { create } from '@bufbuild/protobuf';
import { RippleSpecificSchema } from '@core/communication/vultisig/keysign/v1/blockchain_specific_pb';

import { getRippleAccountInfo } from '../../ripple/account/getRippleAccountInfo';
import { rippleConfig } from '../../ripple/config';
import { KeysignChainSpecificValue } from '../KeysignChainSpecific';
import { GetChainSpecificInput } from './GetChainSpecificInput';

export const getRippleSpecific = async ({
  coin,
}: GetChainSpecificInput): Promise<KeysignChainSpecificValue> => {
  const { Sequence } = await getRippleAccountInfo(coin.address);

  return create(RippleSpecificSchema, {
    sequence: BigInt(Sequence),
    gas: BigInt(rippleConfig.fee),
  });
};
