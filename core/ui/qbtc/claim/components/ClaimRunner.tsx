import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { MatchRecordUnion } from '@lib/ui/base/MatchRecordUnion'
import { Chain } from '@vultisig/core-chain/Chain'
import { ClaimableUtxo } from '@vultisig/core-chain/chains/cosmos/qbtc/claim/ClaimableUtxo'
import { computeAllClaimHashes } from '@vultisig/core-chain/chains/cosmos/qbtc/claim/computeClaimHashes'
import { type ClaimProofResult } from '@vultisig/core-chain/chains/cosmos/qbtc/claim/proofService'
import { getPublicKey } from '@vultisig/core-chain/publicKey/getPublicKey'
import { KeysignSignature } from '@vultisig/core-mpc/keysign/KeysignSignature'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { useState } from 'react'

import {
  ClaimBroadcastingPhase,
  QbtcClaimResultData,
} from './ClaimBroadcastingPhase'
import { ClaimPreparingTxPhase } from './ClaimPreparingTxPhase'
import { ClaimSignRound } from './ClaimSignRound'

const qbtcChainId = 'qbtc-testnet'

type ClaimRunnerProps = {
  utxos: ClaimableUtxo[]
  password: string
  onSuccess: (result: QbtcClaimResultData) => void
  onError: (error: Error) => void
}

type ClaimRunnerPhase =
  | { btcSign: null }
  | {
      preparingTx: {
        btcSig: KeysignSignature
        compressedPubkeyHex: string
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
  const btcAddress = useCurrentVaultAddress(Chain.Bitcoin)
  const qbtcAddress = useCurrentVaultAddress(Chain.QBTC)

  const [claimInputs] = useState(() => {
    const btcPublicKey = getPublicKey({
      walletCore,
      hexChainCode: vault.hexChainCode,
      publicKeys: vault.publicKeys,
      chainPublicKeys: vault.chainPublicKeys,
      chain: Chain.Bitcoin,
    })
    const compressedPubkey = btcPublicKey.data()
    const compressedPubkeyHex = Buffer.from(compressedPubkey).toString('hex')

    const { messageHash } = computeAllClaimHashes({
      btcAddress,
      compressedPubkey,
      qbtcAddress,
      chainId: qbtcChainId,
    })
    const messageHashHex = Buffer.from(messageHash).toString('hex')

    return { compressedPubkeyHex, messageHashHex }
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
            onFinish={btcSig =>
              setPhase({
                preparingTx: {
                  btcSig,
                  compressedPubkeyHex: claimInputs.compressedPubkeyHex,
                },
              })
            }
            onError={onError}
          />
        ),
        preparingTx: ({ btcSig, compressedPubkeyHex }) => (
          <ClaimPreparingTxPhase
            utxos={utxos}
            btcSig={btcSig}
            compressedPubkeyHex={compressedPubkeyHex}
            qbtcAddress={qbtcAddress}
            mldsaPublicKeyHex={shouldBePresent(
              vault.publicKeyMldsa,
              'vault.publicKeyMldsa'
            )}
            onFinish={ready =>
              setPhase({
                mldsaSign: {
                  signDocHashHex: ready.signDocHashHex,
                  bodyBytes: ready.bodyBytes,
                  authInfoBytes: ready.authInfoBytes,
                  proof: ready.proof,
                },
              })
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
      }}
    />
  )
}
