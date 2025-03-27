import { getChainKind } from '@core/chain/ChainKind'
import { getCoinType } from '@core/chain/coin/coinType'
import { signatureAlgorithms } from '@core/chain/signing/SignatureAlgorithm'
import { getPreSigningHashes } from '@core/chain/tx/preSigningHashes'
import { hexEncode } from '@core/chain/utils/walletCore/hexEncode'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { OnForwardProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { assertField } from '@lib/utils/record/assertField'
import { useMutation } from '@tanstack/react-query'
import { keccak256 } from 'js-sha3'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { assertChainField } from '../../../../chain/utils/assertChainField'
import { useMpcSessionId } from '../../../../mpc/session/state/mpcSession'
import { FullPageFlowErrorState } from '../../../../ui/flow/FullPageFlowErrorState'
import { PageHeader } from '../../../../ui/page/PageHeader'
import { PageHeaderBackButton } from '../../../../ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '../../../../ui/page/PageHeaderTitle'
import { signWithServer } from '../../../fast/api/signWithServer'
import { WaitForServerLoader } from '../../../server/components/WaitForServerLoader'
import { useVaultPassword } from '../../../server/password/state/password'
import { useCurrentHexEncryptionKey } from '../../../setup/state/currentHexEncryptionKey'
import { useCurrentVault } from '../../../state/currentVault'
import { customMessageConfig } from '../../customMessage/config'
import { useKeysignMessagePayload } from '../../shared/state/keysignMessagePayload'
import { getTxInputData } from '../../utils/getTxInputData'

export const FastKeysignServerStep: React.FC<OnForwardProp> = ({
  onForward,
}) => {
  const { t } = useTranslation()

  const { public_key_ecdsa } = useCurrentVault()

  const sessionId = useMpcSessionId()
  const hexEncryptionKey = useCurrentHexEncryptionKey()

  const payload = useKeysignMessagePayload()

  const walletCore = useAssertWalletCore()

  const [password] = useVaultPassword()

  const { mutate, ...state } = useMutation({
    mutationFn: async () => {
      return matchRecordUnion(payload, {
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
            public_key: public_key_ecdsa,
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
          return signWithServer({
            public_key: public_key_ecdsa,
            messages: [keccak256(message)],
            session: sessionId,
            hex_encryption_key: hexEncryptionKey,
            derive_path: walletCore.CoinTypeExt.derivationPath(
              getCoinType({
                walletCore,
                chain: customMessageConfig.chain,
              })
            ),
            is_ecdsa:
              signatureAlgorithms[getChainKind(customMessageConfig.chain)] ===
              'ecdsa',
            vault_password: password,
          })
        },
      })
    },
    onSuccess: onForward,
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
