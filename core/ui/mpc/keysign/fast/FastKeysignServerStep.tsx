import { getChainKind } from '@core/chain/ChainKind'
import { getCoinType } from '@core/chain/coin/coinType'
import { signatureAlgorithms } from '@core/chain/signing/SignatureAlgorithm'
import { getPreSigningHashes } from '@core/chain/tx/preSigningHashes'
import { assertChainField } from '@core/chain/utils/assertChainField'
import { signWithServer } from '@core/mpc/fast/api/signWithServer'
import { getTxInputData } from '@core/mpc/keysign/txInputData'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { FullPageFlowErrorState } from '@core/ui/flow/FullPageFlowErrorState'
import { WaitForServerLoader } from '@core/ui/mpc/keygen/create/fast/server/components/WaitForServerLoader'
import {
  chainSigningType,
  customMessageDefaultChain,
  CustomMessageSupportedChain,
  SigningType,
} from '@core/ui/mpc/keysign/customMessage/config'
import { useCurrentHexEncryptionKey } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { useMpcSessionId } from '@core/ui/mpc/state/mpcSession'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { OnFinishProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { match } from '@lib/utils/match'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { assertField } from '@lib/utils/record/assertField'
import { useMutation } from '@tanstack/react-query'
import { keccak256 } from 'js-sha3'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

type FastKeysignServerStepProps = OnFinishProp & {
  password: string
}

export const FastKeysignServerStep: React.FC<FastKeysignServerStepProps> = ({
  onFinish,
  password,
}) => {
  const { t } = useTranslation()

  const { publicKeys } = useCurrentVault()

  const sessionId = useMpcSessionId()
  const hexEncryptionKey = useCurrentHexEncryptionKey()
  const [{ keysignPayload }] = useCoreViewState<'keysign'>()

  const walletCore = useAssertWalletCore()

  const { mutate, ...state } = useMutation({
    mutationFn: async () => {
      return matchRecordUnion(keysignPayload, {
        keysign: async keysignPayload => {
          const inputs = getTxInputData({
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
            }).map(value => Buffer.from(value).toString('hex'))
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
        custom: ({ message, chain: payloadChain }) => {
          const chain =
            (payloadChain as CustomMessageSupportedChain) ??
            (customMessageDefaultChain as CustomMessageSupportedChain)

          const messageToHash = message.startsWith('0x')
            ? Buffer.from(message.slice(2), 'hex')
            : message

          const signingType: SigningType = chainSigningType[chain]
          if (!signingType)
            throw new Error(`Unsupported signing for chain ${chain}`)

          const messageBytes =
            typeof messageToHash === 'string'
              ? new TextEncoder().encode(messageToHash)
              : messageToHash

          const hexMessage = match(signingType, {
            EIP191: () => keccak256(messageBytes),
            RAW_BYTES: () => Buffer.from(messageBytes).toString('hex'),
          })

          return signWithServer({
            public_key: publicKeys.ecdsa,
            messages: [hexMessage],
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
      primaryControls={<PageHeaderBackButton />}
      title={title}
      hasBorder
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
