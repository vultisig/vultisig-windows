import { WaitForServerStep } from '@core/ui/mpc/fast/WaitForServerStep'
import { KeysignActionProvider } from '@core/ui/mpc/keysign/action/KeysignActionProvider'
import { StartKeysignProviders } from '@core/ui/mpc/keysign/start/StartKeysignProviders'
import { StartMpcSessionFlow } from '@core/ui/mpc/session/StartMpcSessionFlow'
import { MpcPeersProvider } from '@core/ui/mpc/state/mpcPeers'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { Chain } from '@vultisig/core-chain/Chain'
import type { SignatureAlgorithm } from '@vultisig/core-chain/signing/SignatureAlgorithm'
import { KeysignSignature } from '@vultisig/core-mpc/keysign/KeysignSignature'

import { ClaimSignRunner } from './ClaimSignRunner'
import { FastClaimServerStep } from './FastClaimServerStep'

type ClaimSignRoundProps = {
  messageHashHex: string
  signatureAlgorithm: SignatureAlgorithm
  chain: Chain
  password: string
  onFinish: (signature: KeysignSignature) => void
}

/**
 * One full MPC signing round for the QBTC claim flow. Mounts a fresh
 * StartKeysignProviders subtree so each round (BTC ECDSA, then MLDSA)
 * gets its own session ID, encryption key, and server-server handshake.
 */
export const ClaimSignRound = ({
  messageHashHex,
  signatureAlgorithm,
  chain,
  password,
  onFinish,
}: ClaimSignRoundProps) => (
  <StartKeysignProviders>
    <StepTransition
      from={({ onFinish: onServerKickoff }) => (
        <FastClaimServerStep
          messageHashHex={messageHashHex}
          signatureAlgorithm={signatureAlgorithm}
          chain={chain}
          password={password}
          onFinish={onServerKickoff}
        />
      )}
      to={() => (
        <ValueTransfer<string[]>
          from={({ onFinish: onPeersReady }) => (
            <WaitForServerStep onFinish={onPeersReady} />
          )}
          to={({ value: peers }) => (
            <MpcPeersProvider value={peers}>
              <StartMpcSessionFlow
                value="keysign"
                render={() => (
                  <KeysignActionProvider>
                    <ClaimSignRunner
                      messageHashHex={messageHashHex}
                      signatureAlgorithm={signatureAlgorithm}
                      chain={chain}
                      onFinish={onFinish}
                    />
                  </KeysignActionProvider>
                )}
              />
            </MpcPeersProvider>
          )}
        />
      )}
    />
  </StartKeysignProviders>
)
