import { storage } from '../../../wailsjs/go/models';
import { match } from '../../lib/utils/match';
import { Chain } from '../../model/chain';
import { getTssKeysignType } from '../keysign/utils/getTssKeysignType';
import { VaultPublicKey } from './VaultPublicKey';

type Input = {
  chain: Chain;
  vault: Pick<
    storage.Vault,
    'hex_chain_code' | 'public_key_ecdsa' | 'public_key_eddsa'
  >;
};

export const getVaultPublicKey = ({ chain, vault }: Input): VaultPublicKey => {
  const type = getTssKeysignType(chain);

  const value = match(type, {
    ecdsa: () => vault.public_key_ecdsa,
    eddsa: () => vault.public_key_eddsa,
  });

  return {
    value,
    type,
    hexChainCode: vault.hex_chain_code,
  };
};
