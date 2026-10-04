import {
  isAppSessionAuthorizedForAccounts,
  isAppSessionAuthorizedForChain,
} from '@core/extension/storage/appSessionChainAuthorization'
import { getVaultsAppSessions } from '@core/extension/storage/appSessions'
import { getCurrentEVMChainId } from '@core/extension/storage/currentEvmChainId'
import { findVault } from '@core/extension/storage/vaults'
import { getEvmChainByChainId } from '@vultisig/core-chain/chains/evm/chainInfo'
import { areLowerCaseEqual } from '@vultisig/lib-utils/string/areLowerCaseEqual'
import { getUrlBaseDomain } from '@vultisig/lib-utils/url/baseDomain'

import { getVaultChainAddress } from '../core/getVaultChainAddress'
import { BackgroundError } from '../error'
import { BackgroundResolver } from '../resolver'

/** Resolve the signer's session before choosing a network, even for an inactive vault. */
export const getEvmSigningChain: BackgroundResolver<
  'getEvmSigningChain'
> = async ({ context, input: { account } }) => {
  const host = getUrlBaseDomain(context.requestOrigin)
  const sessions = await getVaultsAppSessions()
  const fallbackChainId = await getCurrentEVMChainId()

  for (const [vaultId, vaultSessions] of Object.entries(sessions)) {
    const appSession = vaultSessions[host]
    if (!appSession || !isAppSessionAuthorizedForAccounts(appSession)) continue

    const chain = getEvmChainByChainId(
      appSession.selectedEVMChainId ?? fallbackChainId
    )
    if (!chain || !isAppSessionAuthorizedForChain({ appSession, chain }))
      continue

    const vault = await findVault(vaultId)
    if (!vault) continue

    // Derive on this session's network: imported vaults can have different
    // keys for different EVM chains, or no key for the globally selected one.
    const address = await getVaultChainAddress({ vault, chain })
    if (address && areLowerCaseEqual(address, account)) return chain
  }

  throw BackgroundError.Unauthorized
}
