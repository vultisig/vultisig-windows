import { create } from "@bufbuild/protobuf";
import { getRippleAccountInfo } from "@core/chain/chains/ripple/account/getRippleAccountInfo";
import {
  RippleSpecific,
  RippleSpecificSchema,
} from "@core/communication/vultisig/keysign/v1/blockchain_specific_pb";

import { ChainSpecificResolver } from "./ChainSpecificResolver";
import { rippleTxFee } from "@core/chain/tx/fee/ripple";

export const getRippleSpecific: ChainSpecificResolver<RippleSpecific> = async ({
  coin,
}) => {
  const { Sequence } = await getRippleAccountInfo(coin.address);

  return create(RippleSpecificSchema, {
    sequence: BigInt(Sequence),
    gas: BigInt(rippleTxFee),
  });
};
