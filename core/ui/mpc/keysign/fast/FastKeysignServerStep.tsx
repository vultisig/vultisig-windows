import { getChainKind } from '@core/chain/ChainKind'
import { getCoinType } from '@core/chain/coin/coinType'
import { signatureAlgorithms } from '@core/chain/signing/SignatureAlgorithm'
import { getPreSigningHashes } from '@core/chain/tx/preSigningHashes'
import { assertChainField } from '@core/chain/utils/assertChainField'
import { hexEncode } from '@core/chain/utils/walletCore/hexEncode'
import { signWithServer } from '@core/mpc/fast/api/signWithServer'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { FullPageFlowErrorState } from '@core/ui/flow/FullPageFlowErrorState'
import { WaitForServerLoader } from '@core/ui/mpc/keygen/create/fast/server/components/WaitForServerLoader'
import { customMessageConfig } from '@core/ui/mpc/keysign/customMessage/config'
import { getTxInputData } from '@core/ui/mpc/keysign/utils/getTxInputData'
import { useCurrentHexEncryptionKey } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { useMpcSessionId } from '@core/ui/mpc/state/mpcSession'
import { useCorePathState } from '@core/ui/navigation/hooks/useCorePathState'
import { useVaultPassword } from '@core/ui/state/password'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { OnFinishProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { assertField } from '@lib/utils/record/assertField'
import { useMutation } from '@tanstack/react-query'
import { keccak256 } from 'js-sha3'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export const FastKeysignServerStep: React.FC<OnFinishProp> = ({ onFinish }) => {
  const { t } = useTranslation()

  const { publicKeys } = useCurrentVault()

  const sessionId = useMpcSessionId()
  const hexEncryptionKey = useCurrentHexEncryptionKey()

  const { keysignPayload } = useCorePathState<'keysign'>()

  const walletCore = useAssertWalletCore()

  const [password] = useVaultPassword()

  const { mutate, ...state } = useMutation({
    mutationFn: async () => {
      return matchRecordUnion(keysignPayload, {
        keysign: async keysignPayload => {
          const inputs = await getTxInputData({
            keysignPayload,
            walletCore,
          })

          const coin = assertField(keysignPayload, 'coin')
          const { chain } = assertChainField(coin)

          const messages = inputs.flatMap(txInputData =>
            getPreSigningHashes({
              txInputData,
              walletCore,
              chain,
            }).map(value =>
              hexEncode({
                value,
                walletCore,
              })
            )
          )

          return signWithServer({
            public_key: publicKeys.ecdsa,
            messages,
            session: sessionId,
            hex_encryption_key: hexEncryptionKey,
            derive_path: walletCore.CoinTypeExt.derivationPath(
              getCoinType({ walletCore, chain })
            ),
            is_ecdsa: signatureAlgorithms[getChainKind(chain)] === 'ecdsa',
            vault_password: password,
          })
        },
        custom: ({ message }) => {
          const { chain } = customMessageConfig
          return signWithServer({
            public_key: publicKeys.ecdsa,
            messages: [keccak256(message)],
            session: sessionId,
            hex_encryption_key: hexEncryptionKey,
            derive_path: walletCore.CoinTypeExt.derivationPath(
              getCoinType({
                walletCore,
                chain,
              })
            ),
            is_ecdsa: signatureAlgorithms[getChainKind(chain)] === 'ecdsa',
            vault_password: password,
          })
        },
      })
    },
    onSuccess: onFinish,
  })

  useEffect(mutate, [mutate])

  const title = t('fast_sign')

  const header = (
    <PageHeader
      title={<PageHeaderTitle>{title}</PageHeaderTitle>}
      primaryControls={<PageHeaderBackButton />}
    />
  )

  return (
    <>
      <MatchQuery
        value={state}
        pending={() => (
          <>
            {header}
            <WaitForServerLoader />
          </>
        )}
        success={() => (
          <>
            {header}
            <WaitForServerLoader />
          </>
        )}
        error={error => <FullPageFlowErrorState message={error.message} />}
      />
    </>
  )
}
