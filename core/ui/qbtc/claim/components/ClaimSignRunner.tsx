import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { FullPageFlowErrorState } from '@core/ui/flow/FullPageFlowErrorState'
import { useKeysignAction } from '@core/ui/mpc/keysign/action/state/keysignAction'
import { KeysignSigningState } from '@core/ui/mpc/keysign/flow/KeysignSigningState'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useMutation } from '@tanstack/react-query'
import { Chain } from '@vultisig/core-chain/Chain'
import { getCoinType } from '@vultisig/core-chain/coin/coinType'
import type { SignatureAlgorithm } from '@vultisig/core-chain/signing/SignatureAlgorithm'
import { KeysignSignature } from '@vultisig/core-mpc/keysign/KeysignSignature'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

type ClaimSignRunnerProps = {
  messageHashHex: string
  signatureAlgorithm: SignatureAlgorithm
  chain: Chain
  onFinish: (signature: KeysignSignature) => void
}

/**
 * Runs the actual TSS/MPC signing of a single message hash.
 * Must be mounted inside a KeysignActionProvider — the provider chain
 * (session, encryption key, peers, server) is established by the enclosing
 * ClaimSignRound.
 */
export const ClaimSignRunner = ({
  messageHashHex,
  signatureAlgorithm,
  chain,
  onFinish,
}: ClaimSignRunnerProps) => {
  const { t } = useTranslation()
  const walletCore = useAssertWalletCore()
  const keysignAction = useKeysignAction()

  const { mutate, ...state } = useMutation({
    mutationFn: async () => {
      const coinType = getCoinType({ walletCore, chain })
      const [signature] = await keysignAction({
        msgs: [messageHashHex],
        signatureAlgorithm,
        coinType,
        chain,
      })
      return signature
    },
    onSuccess: onFinish,
  })

  useEffect(mutate, [mutate])

  return (
    <MatchQuery
      value={state}
      pending={() => (
        <>
          <PageHeader title={t('keysign')} hasBorder />
          <KeysignSigningState />
        </>
      )}
      success={() => (
        <>
          <PageHeader title={t('keysign')} hasBorder />
          <KeysignSigningState />
        </>
      )}
      error={error => (
        <FullPageFlowErrorState error={error} title={t('signing_error')} />
      )}
    />
  )
}
