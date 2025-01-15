import { WalletCore } from '@trustwallet/wallet-core';

import { tss } from '../../../wailsjs/go/models';
import { pick } from '../../lib/utils/record/pick';
import { recordMap } from '../../lib/utils/record/recordMap';

type Input = {
  walletCore: WalletCore;
  signature: tss.KeysignResponse;
};

export const generateSignatureWithRecoveryId = ({
  walletCore,
  signature,
}: Input) => {
  const { r, s, recovery_id } = recordMap(
    pick(signature, ['r', 's', 'recovery_id']),
    value => walletCore.HexCoding.decode(value)
  );

  return new Uint8Array([...r, ...s, ...recovery_id]);
};
