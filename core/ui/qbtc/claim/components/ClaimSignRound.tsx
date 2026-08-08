import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { WaitForServerStep } from '@core/ui/mpc/fast/WaitForServerStep'
import { KeysignActionProvider } from '@core/ui/mpc/keysign/action/KeysignActionProvider'
import { KeysignPeerDiscoveryStep } from '@core/ui/mpc/keysign/peers/KeysignPeerDiscoveryStep'
import { StartKeysignProviders } from '@core/ui/mpc/keysign/start/StartKeysignProviders'
import { StartMpcSessionFlow } from '@core/ui/mpc/session/StartMpcSessionFlow'
import { MpcPeersProvider } from '@core/ui/mpc/state/mpcPeers'
import { MpcPeersSelectionProvider } from '@core/ui/mpc/state/mpcSelectedPeers'
import {
  useCurrentVault,
  useCurrentVaultSecurityType,
} from '@core/ui/vault/state/currentVault'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { Chain } from '@vultisig/core-chain/Chain'
import { getPublicKey } from '@vultisig/core-chain/publicKey/getPublicKey'
import type { SignatureAlgorithm } from '@vultisig/core-chain/signing/SignatureAlgorithm'
import { KeysignSignature } from '@vultisig/core-mpc/keysign/KeysignSignature'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'

import { getClaimKeysignPayload } from '../utils/getClaimKeysignPayload'
import { ClaimMldsaSignRunner } from './ClaimMldsaSignRunner'
import { ClaimSignRunner } from './ClaimSignRunner'
import { FastClaimServerStep } from './FastClaimServerStep'

type ClaimSignRoundProps = {
  messageHashHex: string
  signatureAlgorithm: SignatureAlgorithm
  chain: Chain
  /** Fast-vault password. Absent for secure vaults (second-device co-sign). */
  password?: string
  /** Claimed total in satoshis, shown to a secure-vault co-signer. */
  claimAmount?: string
  onFinish: (signature: KeysignSignature) => void
  onError: (error: Error) => void
}

/**
 * One full MPC signing round for the QBTC claim flow. Mounts a fresh
 * StartKeysignProviders subtree so each round gets its own session ID,
 * encryption key, and handshake.
 *
 * Fast vaults co-sign with the VultiServer (password → server kickoff). Secure
 * vaults co-sign with a second device: the round is published as an
 * `isQbtcClaim` Bitcoin pairing QR and the joining device recomputes the claim
 * hash from its own vault before co-signing. Secure vaults only ever run the
 * BTC ECDSA round here — they broadcast via the proof service (no client-side
 * MLDSA round).
 */
export const ClaimSignRound = ({
  messageHashHex,
  signatureAlgorithm,
  chain,
  password,
  claimAmount,
  onFinish,
  onError,
}: ClaimSignRoundProps) => {
  const securityType = useCurrentVaultSecurityType()
  const vault = useCurrentVault()
  const walletCore = useAssertWalletCore()
  const btcAddress = useCurrentVaultAddress(Chain.Bitcoin)
  const qbtcAddress = useCurrentVaultAddress(Chain.QBTC)

  const renderSigner = () =>
    signatureAlgorithm === 'mldsa' ? (
      <ClaimMldsaSignRunner
        messageHashHex={messageHashHex}
        chain={chain}
        onFinish={onFinish}
        onError={onError}
      />
    ) : (
      <KeysignActionProvider>
        <ClaimSignRunner
          messageHashHex={messageHashHex}
          signatureAlgorithm={signatureAlgorithm}
          chain={chain}
          onFinish={onFinish}
          onError={onError}
        />
      </KeysignActionProvider>
    )

  const renderSession = (peers: string[]) => (
    <MpcPeersProvider value={peers}>
      <StartMpcSessionFlow value="keysign" render={renderSigner} />
    </MpcPeersProvider>
  )

  if (securityType === 'secure') {
    const btcPublicKey = getPublicKey({
      walletCore,
      hexChainCode: vault.hexChainCode,
      publicKeys: vault.publicKeys,
      chainPublicKeys: vault.chainPublicKeys,
      chain: Chain.Bitcoin,
    })

    const payload = getClaimKeysignPayload({
      vault,
      btcAddress,
      btcPublicKeyHex: Buffer.from(btcPublicKey.data()).toString('hex'),
      qbtcAddress,
      claimAmount: claimAmount ?? '0',
    })

    return (
      <StartKeysignProviders>
        <ValueTransfer<string[]>
          from={({ onFinish: onPeersReady }) => (
            <MpcPeersSelectionProvider>
              <KeysignPeerDiscoveryStep
                payload={payload}
                onFinish={onPeersReady}
              />
            </MpcPeersSelectionProvider>
          )}
          to={({ value: peers }) => renderSession(peers)}
        />
      </StartKeysignProviders>
    )
  }

  return (
    <StartKeysignProviders>
      <StepTransition
        from={({ onFinish: onServerKickoff }) => (
          <FastClaimServerStep
            messageHashHex={messageHashHex}
            signatureAlgorithm={signatureAlgorithm}
            chain={chain}
            password={shouldBePresent(password, 'fast vault password')}
            onFinish={onServerKickoff}
            onError={onError}
          />
        )}
        to={() => (
          <ValueTransfer<string[]>
            from={({ onFinish: onPeersReady }) => (
              <WaitForServerStep onFinish={onPeersReady} />
            )}
            to={({ value: peers }) => renderSession(peers)}
          />
        )}
      />
    </StartKeysignProviders>
  )
}
