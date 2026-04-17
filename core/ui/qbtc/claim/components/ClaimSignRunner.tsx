import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useKeysignAction } from '@core/ui/mpc/keysign/action/state/keysignAction'
import { KeysignLoadingAnimation } from '@core/ui/mpc/keysign/flow/KeysignLoadingAnimation'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { useMutation } from '@tanstack/react-query'
import { Chain } from '@vultisig/core-chain/Chain'
import { getCoinType } from '@vultisig/core-chain/coin/coinType'
import type { SignatureAlgorithm } from '@vultisig/core-chain/signing/SignatureAlgorithm'
import { KeysignSignature } from '@vultisig/core-mpc/keysign/KeysignSignature'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type ClaimSignRunnerProps = {
  messageHashHex: string
  signatureAlgorithm: SignatureAlgorithm
  chain: Chain
  onFinish: (signature: KeysignSignature) => void
  onError: (error: Error) => void
}

/**
 * Runs the actual TSS/MPC signing of a single message hash.
 * Must be mounted inside a KeysignActionProvider — the provider chain
 * (session, encryption key, peers, server) is established by the enclosing
 * ClaimSignRound. Errors bubble up via onError so the top-level page can
 * return to selection with the picks preserved.
 */
export const ClaimSignRunner = ({
  messageHashHex,
  signatureAlgorithm,
  chain,
  onFinish,
  onError,
}: ClaimSignRunnerProps) => {
  const { t } = useTranslation()
  const walletCore = useAssertWalletCore()
  const keysignAction = useKeysignAction()

  const { mutate } = useMutation({
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
    onError,
  })

  useEffect(mutate, [mutate])

  return (
    <>
      <PageHeader title={t('keysign')} hasBorder />
      <AnimationContainer>
        <KeysignLoadingAnimation
          isConnected
          chainLogoSrc={getChainLogoSrc(chain)}
        />
      </AnimationContainer>
    </>
  )
}

const AnimationContainer = styled.div`
  position: relative;
  flex-grow: 1;
  width: 100%;
  min-height: 0;
  overflow: hidden;
`
