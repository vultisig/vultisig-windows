import { Chain } from '@core/chain/Chain'
import { getChainKind } from '@core/chain/ChainKind'
import { isMoneroBalanceFinalisePayload } from '@core/chain/chains/monero/balanceFinaliseMessage'
import { getCoinType } from '@core/chain/coin/coinType'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { signatureAlgorithms } from '@core/chain/signing/SignatureAlgorithm'
import { getPreSigningHashes } from '@core/chain/tx/preSigningHashes'
import { assertChainField } from '@core/chain/utils/assertChainField'
import { signWithServer } from '@core/mpc/fast/api/signWithServer'
import { getEncodedSigningInputs } from '@core/mpc/keysign/signingInputs'
import { setMoneroPreparedTx } from '@core/mpc/keysign/signingInputs/moneroSignableTxStore'
import { prepareMoneroSpendTx } from '@core/mpc/keysign/signingInputs/moneroSpend'
import { setZcashPreparedTx } from '@core/mpc/keysign/signingInputs/zcashPreparedTxStore'
import { prepareZcashSaplingTx } from '@core/mpc/keysign/signingInputs/zcashSapling'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { FullPageFlowErrorState } from '@core/ui/flow/FullPageFlowErrorState'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCurrentHexEncryptionKey } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { useMpcSessionId } from '@core/ui/mpc/state/mpcSession'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { HStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnFinishProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { assertField } from '@lib/utils/record/assertField'
import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { keyframes } from 'styled-components'

import {
  customMessageDefaultChain,
  customMessageSupportedChains,
} from '../customMessage/chains'
import { getCustomMessageHex } from '../customMessage/getCustomMessageHex'

const bounce = keyframes`
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
`

const DotsContainer = styled(HStack)`
  gap: 12px;
  justify-content: center;
`

const Dot = styled.div<{ $delay: string; $color: string }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  animation: ${bounce} 1.4s infinite ease-in-out both;
  animation-delay: ${({ $delay }) => $delay};
`

const BouncyLoader = () => (
  <DotsContainer>
    <Dot $color="#33E6BF" $delay="-0.32s" />
    <Dot $color="#0439C7" $delay="-0.16s" />
    <Dot $color="#33E6BF" $delay="0s" />
  </DotsContainer>
)

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
  const isMoneroBalanceFinalise =
    'custom' in keysignPayload &&
    isMoneroBalanceFinalisePayload(keysignPayload.custom)

  const walletCore = useAssertWalletCore()

  const { mutate, ...state } = useMutation({
    mutationFn: async () => {
      await new Promise(resolve => requestAnimationFrame(resolve))

      if (isMoneroBalanceFinalise) {
        const customPayload =
          'custom' in keysignPayload ? keysignPayload.custom : null

        if (!customPayload) {
          throw new Error(
            'Monero balance finalise requires a custom keysign payload'
          )
        }

        return signWithServer({
          public_key: publicKeys.ecdsa,
          messages: ['key-image'],
          session: sessionId,
          hex_encryption_key: hexEncryptionKey,
          derive_path: '',
          is_ecdsa: false,
          vault_password: password,
          chain: Chain.Monero,
        })
      }

      return matchRecordUnion(keysignPayload, {
        keysign: async keysignPayload => {
          const coin = assertField(keysignPayload, 'coin')
          const { chain } = assertChainField(coin)

          if (chain === Chain.Monero) {
            try {
              const prepared = await prepareMoneroSpendTx({
                vault,
                senderAddress: coin.address,
                toAddress: keysignPayload.toAddress,
                amount: BigInt(keysignPayload.toAmount),
              })
              setMoneroPreparedTx(prepared)
              const signableTxHex = Buffer.from(prepared.signableTx).toString(
                'hex'
              )
              const result = await signWithServer({
                public_key: publicKeys.ecdsa,
                messages: [signableTxHex],
                session: sessionId,
                hex_encryption_key: hexEncryptionKey,
                derive_path: "m/44'/128'/0'",
                is_ecdsa: false,
                vault_password: password,
                chain,
              })
              console.log(
                '[FastKeysignServerStep] signWithServer returned for Monero'
              )
              return result
            } catch (err) {
              console.error(
                '[FastKeysignServerStep] Monero signing failed:',
                err
              )
              throw err
            }
          }

          if (chain === Chain.ZcashSapling) {
            const prepared = await prepareZcashSaplingTx({
              vault,
              zAddress: coin.address,
              toAddress: keysignPayload.toAddress,
              amount: Number(keysignPayload.toAmount),
            })
            setZcashPreparedTx(prepared)
            return signWithServer({
              public_key: publicKeys.ecdsa,
              messages: prepared.signData.messages,
              session: sessionId,
              hex_encryption_key: hexEncryptionKey,
              derive_path: '',
              is_ecdsa: false,
              vault_password: password,
              chain,
              zcash_sapling: prepared.signData.context,
            })
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
            is_ecdsa: signatureAlgorithms[getChainKind(chain)] === 'ecdsa',
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
            is_ecdsa: signatureAlgorithms[getChainKind(chain)] === 'ecdsa',
            vault_password: password,
            chain,
          })
        },
      })
    },
    onSuccess: onFinish,
  })

  useEffect(mutate, [mutate])

  const title = isMoneroBalanceFinalise
    ? t('finalise_balance_scan')
    : t('fast_sign')
  const statusLabel = isMoneroBalanceFinalise
    ? t('finalise_balance_scan')
    : t('preparing_transaction')

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
            <PageContent alignItems="center" justifyContent="center">
              <BouncyLoader />
              <Text color="contrast" weight="bold" size={16}>
                {statusLabel}
              </Text>
            </PageContent>
          </>
        )}
        success={() => (
          <>
            {header}
            <PageContent alignItems="center" justifyContent="center">
              <BouncyLoader />
              <Text color="contrast" weight="bold" size={16}>
                {statusLabel}
              </Text>
            </PageContent>
          </>
        )}
        inactive={() => (
          <>
            {header}
            <PageContent alignItems="center" justifyContent="center">
              <BouncyLoader />
              <Text color="contrast" weight="bold" size={16}>
                {statusLabel}
              </Text>
            </PageContent>
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
