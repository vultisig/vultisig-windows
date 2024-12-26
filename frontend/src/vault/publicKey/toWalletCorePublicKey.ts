import { WalletCore } from '@trustwallet/wallet-core';

import { GetDerivedPubKey } from '../../../wailsjs/go/tss/TssService';
import { walletCorePublicKeyType } from '../../chain/keysign/TssKeysignType';
import { getCoinType } from '../../chain/walletCore/getCoinType';
import { Chain } from '../../model/chain';
import { VaultPublicKey } from './VaultPublicKey';

type Input = {
  chain: Chain;
  walletCore: WalletCore;
  value: VaultPublicKey;
};

export const toWalletCorePublicKey = async ({
  chain,
  walletCore,
  value,
}: Input) => {
  const coinType = getCoinType({
    walletCore,
    chain,
  });

  const isEdDSA = value.type === 'eddsa';

  const derivedPublicKey = await GetDerivedPubKey(
    value.value,
    value.hexChainCode,
    walletCore.CoinTypeExt.derivationPath(coinType),
    isEdDSA
  );

  const publicKeyType = walletCorePublicKeyType[value.type];

  return walletCore.PublicKey.createWithData(
    Buffer.from(derivedPublicKey, 'hex'),
    publicKeyType
  );
};
