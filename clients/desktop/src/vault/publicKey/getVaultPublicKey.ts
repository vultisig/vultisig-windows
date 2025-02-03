import { WalletCore } from '@trustwallet/wallet-core';

import { storage } from '../../../wailsjs/go/models';
import { GetDerivedPubKey } from '../../../wailsjs/go/tss/TssService';
import { getCoinType } from '../../chain/walletCore/getCoinType';
import { match } from '@lib/utils/match';
import { Chain } from '../../model/chain';
import { getTssKeysignType } from '../keysign/utils/getTssKeysignType';

type Input = {
  chain: Chain;
  walletCore: WalletCore;
  vault: Pick<
    storage.Vault,
    'hex_chain_code' | 'public_key_ecdsa' | 'public_key_eddsa'
  >;
};

export const getVaultPublicKey = async ({
  chain,
  walletCore,
  vault,
}: Input) => {
  const coinType = getCoinType({
    walletCore,
    chain,
  });

  const keysignType = getTssKeysignType(chain);

  const publicKeyType = match(keysignType, {
    ecdsa: () => walletCore.PublicKeyType.secp256k1,
    eddsa: () => walletCore.PublicKeyType.ed25519,
  });

  const derivedPublicKey = await match(keysignType, {
    ecdsa: () =>
      GetDerivedPubKey(
        vault.public_key_ecdsa,
        vault.hex_chain_code,
        walletCore.CoinTypeExt.derivationPath(coinType),
        false
      ),
    eddsa: async () => vault.public_key_eddsa,
  });

  return walletCore.PublicKey.createWithData(
    Buffer.from(derivedPublicKey, 'hex'),
    publicKeyType
  );
};
