import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { MatchRecordUnion } from '@lib/ui/base/MatchRecordUnion'
import { Chain } from '@vultisig/core-chain/Chain'
import { ClaimableUtxo } from '@vultisig/core-chain/chains/cosmos/qbtc/claim/ClaimableUtxo'
import { KeysignSignature } from '@vultisig/core-mpc/keysign/KeysignSignature'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { useState } from 'react'

import { ClaimProofResult } from '../utils/generateClaimProofForClaim'
import { getClaimAddresses } from '../utils/getClaimAddresses'
import { getClaimMessageHashHex } from '../utils/getClaimMessageHashHex'
import {
  ClaimBroadcastingPhase,
  QbtcClaimResultData,
} from './ClaimBroadcastingPhase'
import { ClaimPreparingTxPhase } from './ClaimPreparingTxPhase'
import { ClaimServerBroadcastWaitPhase } from './ClaimServerBroadcastWaitPhase'
import { ClaimSignRound } from './ClaimSignRound'

type ClaimRunnerProps = {
  utxos: ClaimableUtxo[]
  /** Fast-vault password. Absent for secure vaults (second-device co-sign). */
  password?: string
  onSuccess: (result: QbtcClaimResultData) => void
  onError: (error: Error) => void
}

type ClaimRunnerPhase =
  | { btcSign: null }
  | {
      preparingTx: {
        btcSig: KeysignSignature
      }
    }
  | {
      mldsaSign: {
        signDocHashHex: string
        bodyBytes: Uint8Array
        authInfoBytes: Uint8Array
        proof: ClaimProofResult
      }
    }
  | {
      broadcasting: {
        bodyBytes: Uint8Array
        authInfoBytes: Uint8Array
        mldsaSig: KeysignSignature
      }
    }
  | { serverBroadcastWait: { txHash: string } }

/**
 * Orchestrates the full QBTC claim pipeline across multiple MPC sessions:
 * BTC sign → proof service → MLDSA sign → broadcast. Hashes are computed
 * once up-front and reused across phase transitions.
 */
export const ClaimRunner = ({
  utxos,
  password,
  onSuccess,
  onError,
}: ClaimRunnerProps) => {
  const walletCore = useAssertWalletCore()
  const vault = useCurrentVault()

  const [claimInputs] = useState(() => {
    // Same derivation a secure-vault co-signer uses, so both sign an identical
    // round-1 hash.
    const messageHashHex = getClaimMessageHashHex({ vault, walletCore })

    return { ...getClaimAddresses({ vault, walletCore }), messageHashHex }
  })

  const [phase, setPhase] = useState<ClaimRunnerPhase>({ btcSign: null })

  return (
    <MatchRecordUnion
      value={phase}
      handlers={{
        btcSign: () => (
          <ClaimSignRound
            messageHashHex={claimInputs.messageHashHex}
            signatureAlgorithm="ecdsa"
            chain={Chain.Bitcoin}
            password={password}
            claimAmount={String(
              utxos.reduce((sum, utxo) => sum + utxo.amount, 0)
            )}
            onFinish={btcSig =>
              setPhase({
                preparingTx: {
                  btcSig,
                },
              })
            }
            onError={onError}
          />
        ),
        preparingTx: ({ btcSig }) => (
          <ClaimPreparingTxPhase
            utxos={utxos}
            btcSig={btcSig}
            bitcoinAddress={claimInputs.bitcoinAddress}
            qbtcAddress={claimInputs.qbtcAddress}
            mldsaPublicKeyHex={shouldBePresent(
              vault.publicKeyMldsa,
              'vault.publicKeyMldsa'
            )}
            onReadyToSign={ready =>
              setPhase({
                mldsaSign: {
                  signDocHashHex: ready.signDocHashHex,
                  bodyBytes: ready.bodyBytes,
                  authInfoBytes: ready.authInfoBytes,
                  proof: ready.proof,
                },
              })
            }
            onServerBroadcast={txHash =>
              setPhase({ serverBroadcastWait: { txHash } })
            }
            onError={onError}
          />
        ),
        mldsaSign: ({ signDocHashHex, bodyBytes, authInfoBytes }) => (
          <ClaimSignRound
            messageHashHex={signDocHashHex}
            signatureAlgorithm="mldsa"
            chain={Chain.QBTC}
            password={password}
            onFinish={mldsaSig =>
              setPhase({
                broadcasting: {
                  bodyBytes,
                  authInfoBytes,
                  mldsaSig,
                },
              })
            }
            onError={onError}
          />
        ),
        broadcasting: ({ bodyBytes, authInfoBytes, mldsaSig }) => (
          <ClaimBroadcastingPhase
            bodyBytes={bodyBytes}
            authInfoBytes={authInfoBytes}
            mldsaSig={mldsaSig}
            onSuccess={onSuccess}
            onError={onError}
          />
        ),
        serverBroadcastWait: ({ txHash }) => (
          <ClaimServerBroadcastWaitPhase
            txHash={txHash}
            onSuccess={onSuccess}
            onError={onError}
          />
        ),
      }}
    />
  )
}
