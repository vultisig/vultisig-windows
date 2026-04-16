import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { WaitForServerLoader } from '@core/ui/mpc/keygen/create/fast/server/components/WaitForServerLoader'
import { useCurrentHexEncryptionKey } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { useMpcSessionId } from '@core/ui/mpc/state/mpcSession'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnFinishProp } from '@lib/ui/props'
import { useMutation } from '@tanstack/react-query'
import { Chain } from '@vultisig/core-chain/Chain'
import { getCoinType } from '@vultisig/core-chain/coin/coinType'
import type { SignatureAlgorithm } from '@vultisig/core-chain/signing/SignatureAlgorithm'
import { signWithServer } from '@vultisig/core-mpc/fast/api/signWithServer'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

type FastClaimServerStepProps = OnFinishProp & {
  messageHashHex: string
  signatureAlgorithm: SignatureAlgorithm
  chain: Chain
  password: string
  onError: (error: Error) => void
}

/**
 * Kicks off fast-vault server signing for a raw message hash used by the
 * QBTC claim flow. Mirrors FastKeysignServerStep but sidesteps
 * KeysignMessagePayload since the claim signs two different hashes
 * (BTC ECDSA + MLDSA) across separate sessions. Failures bubble up via
 * onError so the top-level page can return to selection.
 */
export const FastClaimServerStep = ({
  messageHashHex,
  signatureAlgorithm,
  chain,
  password,
  onFinish,
  onError,
}: FastClaimServerStepProps) => {
  const { t } = useTranslation()
  const vault = useCurrentVault()
  const sessionId = useMpcSessionId()
  const hexEncryptionKey = useCurrentHexEncryptionKey()
  const walletCore = useAssertWalletCore()

  const { mutate } = useMutation({
    mutationFn: async () => {
      const coinType = getCoinType({ walletCore, chain })
      const derivePath = walletCore.CoinTypeExt.derivationPath(coinType)

      return signWithServer({
        public_key: vault.publicKeys.ecdsa,
        messages: [messageHashHex],
        session: sessionId,
        hex_encryption_key: hexEncryptionKey,
        derive_path: derivePath,
        is_ecdsa: signatureAlgorithm === 'ecdsa',
        mldsa: signatureAlgorithm === 'mldsa',
        vault_password: password,
        chain,
      })
    },
    onSuccess: onFinish,
    onError,
  })

  useEffect(mutate, [mutate])

  return (
    <>
      <PageHeader title={t('fast_sign')} hasBorder />
      <WaitForServerLoader />
    </>
  )
}
