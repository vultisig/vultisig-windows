import { createHash } from 'crypto';

import { storage } from '../../../../wailsjs/go/models';

type VaultPublicKeyExport = {
  uid: string;
  name: string;
  public_key_ecdsa: string;
  public_key_eddsa: string;
  hex_chain_code: string;
};

export const getVaultPublicKeyExport = ({
  name,
  public_key_ecdsa,
  public_key_eddsa,
  hex_chain_code,
}: storage.Vault): VaultPublicKeyExport => {
  const uid = createHash('sha256')
    .update(
      [name, public_key_ecdsa, public_key_eddsa, hex_chain_code].join('-')
    )
    .digest('hex');

  return {
    uid,
    name: name,
    public_key_ecdsa,
    public_key_eddsa,
    hex_chain_code,
  };
};
