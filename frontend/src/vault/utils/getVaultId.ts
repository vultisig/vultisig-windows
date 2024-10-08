import { Vault } from '../../gen/vultisig/vault/v1/vault_pb';

export const getVaultId = (vault: Vault): string => vault.publicKeyEcdsa;
