import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { KeysignLoadingAnimation } from '@core/ui/mpc/keysign/flow/KeysignLoadingAnimation'
import { useCurrentHexEncryptionKey } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { useIsInitiatingDevice } from '@core/ui/mpc/state/isInitiatingDevice'
import { useMpcPeers } from '@core/ui/mpc/state/mpcPeers'
import { useMpcServerUrl } from '@core/ui/mpc/state/mpcServerUrl'
import { useMpcSessionId } from '@core/ui/mpc/state/mpcSession'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { useMutation } from '@tanstack/react-query'
import { Chain } from '@vultisig/core-chain/Chain'
import { KeysignSignature } from '@vultisig/core-mpc/keysign/KeysignSignature'
import { MldsaKeysign } from '@vultisig/core-mpc/mldsa/mldsaKeysign'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const mldsaChainPath = 'm'

type ClaimMldsaSignRunnerProps = {
  messageHashHex: string
  chain: Chain
  onFinish: (signature: KeysignSignature) => void
  onError: (error: Error) => void
}

/**
 * Runs a single MLDSA signing round for the QBTC claim flow. MLDSA is
 * not routed through the pluggable `keysignAction` — the SDK throws if
 * we try, because MLDSA has its own dedicated `MldsaKeysign` session.
 * This runner instantiates it directly, pulling session/peer state from
 * the same providers the ECDSA round uses.
 */
export const ClaimMldsaSignRunner = ({
  messageHashHex,
  chain,
  onFinish,
  onError,
}: ClaimMldsaSignRunnerProps) => {
  const { t } = useTranslation()
  const vault = useCurrentVault()
  const sessionId = useMpcSessionId()
  const serverUrl = useMpcServerUrl()
  const hexEncryptionKey = useCurrentHexEncryptionKey()
  const isInitiatingDevice = useIsInitiatingDevice()
  const peers = useMpcPeers()

  const { mutate } = useMutation({
    mutationFn: async (): Promise<KeysignSignature> => {
      const keyShareBase64 = shouldBePresent(
        vault.keyShareMldsa,
        'MLDSA keyshare'
      )
      const keysignCommittee = [vault.localPartyId, ...peers]

      const mldsaKeysign = new MldsaKeysign({
        keysignCommittee,
        serverURL: serverUrl,
        sessionId,
        localPartyId: vault.localPartyId,
        messagesToSign: [messageHashHex],
        keyShareBase64,
        hexEncryptionKey,
        chainPath: mldsaChainPath,
        isInitiatingDevice,
      })

      const [result] = await mldsaKeysign.startKeysignWithRetry()
      const { msg, signature } = shouldBePresent(result, 'MLDSA signature')
      return {
        msg: Buffer.from(msg, 'hex').toString('base64'),
        r: '',
        s: '',
        der_signature: signature,
      }
    },
    onSuccess: onFinish,
    onError,
  })

  useEffect(mutate, [mutate])

  return (
    <>
      <PageHeader title={t('keysign')} hasBorder />
      <AnimationContainer>
        <KeysignLoadingAnimation isConnected logoSrc={getChainLogoSrc(chain)} />
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
