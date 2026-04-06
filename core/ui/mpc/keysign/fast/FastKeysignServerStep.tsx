import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { FullPageFlowErrorState } from '@core/ui/flow/FullPageFlowErrorState'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { WaitForServerLoader } from '@core/ui/mpc/keygen/create/fast/server/components/WaitForServerLoader'
import { useCurrentHexEncryptionKey } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { useMpcSessionId } from '@core/ui/mpc/state/mpcSession'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { constructPolkadotSigningPayload } from '@core/ui/polkadot/dapp/constructSigningPayload'
import { PolkadotSignerPayloadJSON } from '@core/ui/polkadot/dapp/PolkadotSignerPayload'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnFinishProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useMutation } from '@tanstack/react-query'
import { OtherChain } from '@vultisig/core-chain/Chain'
import { getCoinType } from '@vultisig/core-chain/coin/coinType'
import { getPublicKey } from '@vultisig/core-chain/publicKey/getPublicKey'
import { getSignatureAlgorithm } from '@vultisig/core-chain/signing/SignatureAlgorithm'
import { assertChainField } from '@vultisig/core-chain/utils/assertChainField'
import { signWithServer } from '@vultisig/core-mpc/fast/api/signWithServer'
import { getEncodedSigningInputs } from '@vultisig/core-mpc/keysign/signingInputs'
import { getPreSigningHashes } from '@vultisig/core-mpc/tx/preSigningHashes'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'
import { attempt } from '@vultisig/lib-utils/attempt'
import { matchRecordUnion } from '@vultisig/lib-utils/matchRecordUnion'
import { assertField } from '@vultisig/lib-utils/record/assertField'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import {
  customMessageDefaultChain,
  customMessageSupportedChains,
} from '../customMessage/chains'
import { getCustomMessageHex } from '../customMessage/getCustomMessageHex'

type FastKeysignServerStepProps = OnFinishProp & {
  password: string
}

export const FastKeysignServerStep: React.FC<FastKeysignServerStepProps> = ({
  onFinish,
  password,
}) => {
  const { t } = useTranslation()

  const vault = useCurrentVault()
  const { publicKeys, hexChainCode, chainPublicKeys } = vault

  const sessionId = useMpcSessionId()
  const hexEncryptionKey = useCurrentHexEncryptionKey()
  const [{ keysignPayload }] = useCoreViewState<'keysign'>()

  const walletCore = useAssertWalletCore()

  const { mutate, ...state } = useMutation({
    mutationFn: async () => {
      return matchRecordUnion(keysignPayload, {
        keysign: async keysignPayload => {
          const coin = assertField(keysignPayload, 'coin')
          const { chain } = assertChainField(coin)

          // Polkadot dApp signPayload — bypass TW, send raw payload hash
          if (chain === OtherChain.Polkadot && keysignPayload.memo) {
            const parseResult = attempt(
              () =>
                JSON.parse(keysignPayload.memo!) as PolkadotSignerPayloadJSON
            )
            if (
              !('error' in parseResult) &&
              parseResult.data.method &&
              parseResult.data.genesisHash
            ) {
              const signingBytes = constructPolkadotSigningPayload(
                parseResult.data
              )
              const messages = [Buffer.from(signingBytes).toString('hex')]

              return signWithServer({
                public_key: publicKeys.ecdsa,
                messages,
                session: sessionId,
                hex_encryption_key: hexEncryptionKey,
                derive_path: walletCore.CoinTypeExt.derivationPath(
                  getCoinType({ walletCore, chain })
                ),
                is_ecdsa: false,
                vault_password: password,
                chain,
              })
            }
          }

          const publicKey = getPublicKey({
            chain,
            walletCore,
            hexChainCode,
            publicKeys,
            chainPublicKeys,
          })
          const inputs = getEncodedSigningInputs({
            keysignPayload,
            walletCore,
            publicKey,
          })

          const messages = inputs
            .flatMap(txInputData =>
              getPreSigningHashes({
                txInputData,
                walletCore,
                chain,
              }).map(value => Buffer.from(value).toString('hex'))
            )
            .sort()

          return signWithServer({
            public_key: publicKeys.ecdsa,
            messages,
            session: sessionId,
            hex_encryption_key: hexEncryptionKey,
            derive_path: walletCore.CoinTypeExt.derivationPath(
              getCoinType({ walletCore, chain })
            ),
            is_ecdsa: getSignatureAlgorithm(chain) === 'ecdsa',
            vault_password: password,
            chain,
          })
        },
        custom: async ({
          method,
          message,
          chain = customMessageDefaultChain,
        }) => {
          if (!isOneOf(chain, customMessageSupportedChains)) {
            throw new Error(`Unsupported chain ${chain}`)
          }

          const hexMessage = getCustomMessageHex({ chain, message, method })

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
            is_ecdsa: getSignatureAlgorithm(chain) === 'ecdsa',
            vault_password: password,
            chain,
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
        error={error => (
          <FullPageFlowErrorState
            title={t('failed_to_connect_with_server')}
            error={error}
          />
        )}
      />
    </>
  )
}
