import {
  isAppSessionAuthorizedForAccounts,
  isAppSessionAuthorizedForChain,
} from '@core/extension/storage/appSessionChainAuthorization'
import { getVault } from '@core/extension/storage/vaults'
import { getWalletCore } from '@core/extension/tw'
import { BackgroundError } from '@core/inpage-provider/background/error'
import { BackgroundResolver } from '@core/inpage-provider/background/resolver'
import { getPublicKey } from '@vultisig/core-chain/publicKey/getPublicKey'
import { getSignatureAlgorithm } from '@vultisig/core-chain/signing/SignatureAlgorithm'
import { assertField } from '@vultisig/lib-utils/record/assertField'

import { getVaultChainAddress } from '../core/getVaultChainAddress'

export const getAccount: BackgroundResolver<'getAccount'> = async ({
  context,
  input: { chain },
}) => {
  const appSession = assertField(context, 'appSession')
  if (!isAppSessionAuthorizedForChain({ appSession, chain })) {
    throw BackgroundError.Unauthorized
  }

  if (!isAppSessionAuthorizedForAccounts(appSession)) {
    throw BackgroundError.Unauthorized
  }

  const vault = await getVault(appSession.vaultId)

  // An empty address makes `requestAccount` re-prompt the user to pick a
  // vault that supports this chain, instead of throwing.
  const address = await getVaultChainAddress({ vault, chain })
  if (!address) {
    return { address: '', publicKey: '' }
  }

  const signatureAlgorithm = getSignatureAlgorithm(chain)

  if (signatureAlgorithm === 'mldsa') {
    return {
      address,
      publicKey: assertField(vault, 'publicKeyMldsa'),
    }
  }

  const publicKey = getPublicKey({
    chain,
    walletCore: await getWalletCore(),
    hexChainCode: vault.hexChainCode,
    publicKeys: vault.publicKeys,
    chainPublicKeys: vault.chainPublicKeys,
  })

  return {
    address,
    publicKey: Buffer.from(publicKey.data()).toString('hex'),
  }
}
