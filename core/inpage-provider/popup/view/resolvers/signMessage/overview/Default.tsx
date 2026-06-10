import { Eip712V4Payload } from '@core/inpage-provider/popup/interface'
import { Animation } from '@core/inpage-provider/popup/view/resolvers/signMessage/components/Animation'
import { Collapse } from '@core/inpage-provider/popup/view/resolvers/signMessage/components/Collapse'
import { Eip712PermitDisplay } from '@core/inpage-provider/popup/view/resolvers/signMessage/components/Eip712PermitDisplay'
import { Request } from '@core/inpage-provider/popup/view/resolvers/signMessage/components/Request'
import { Sender } from '@core/inpage-provider/popup/view/resolvers/signMessage/components/Sender'
import { SignSuiTransactionDisplay } from '@core/inpage-provider/popup/view/resolvers/signMessage/components/SignSuiTransactionDisplay'
import { SuiTxIntentDisplay } from '@core/inpage-provider/popup/view/resolvers/signMessage/components/SuiTxIntentDisplay'
import { parseSuiTx } from '@core/inpage-provider/popup/view/resolvers/signMessage/core/sui/parser'
import { usePopupContext } from '@core/inpage-provider/popup/view/state/context'
import { usePopupInput } from '@core/inpage-provider/popup/view/state/input'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { StartKeysignPrompt } from '@core/ui/mpc/keysign/prompt/StartKeysignPrompt'
import { useCore } from '@core/ui/state/core'
import { Button } from '@lib/ui/buttons/Button'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { useQuery } from '@tanstack/react-query'
import { EvmChain, OtherChain } from '@vultisig/core-chain/Chain'
import { getTxBlockaidSimulation } from '@vultisig/core-chain/security/blockaid/tx/simulation'
import {
  BlockaidSuiSimulation,
  parseBlockaidSuiSimulation,
} from '@vultisig/core-chain/security/blockaid/tx/simulation/api/core'
import { KeysignMessagePayload } from '@vultisig/core-mpc/keysign/keysignPayload/KeysignMessagePayload'
import { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export type SignMessageOverview = {
  address: string
  keysignPayload: KeysignMessagePayload
  message: string
  method: string
  signature?: string
  typedData?: { chain: EvmChain; payload: Eip712V4Payload }
}

export const DefaultOverview: FC<SignMessageOverview> = ({
  address,
  keysignPayload,
  message,
  method,
  signature,
  typedData,
}) => {
  const { t } = useTranslation()
  const { goHome } = useCore()
  const { requestFavicon, requestOrigin } = usePopupContext<'signMessage'>()
  const input = usePopupInput<'signMessage'>()
  const isFinished = Boolean(signature)
  const isTransaction = method === 'sui_sign_transaction'

  // The popup's `message` prop is the display-formatted string (hex form for
  // Sui transactions). Reach into the raw input variant to recover the
  // base64-encoded PTB that `parseSuiTx` expects.
  const suiTransactionBytes =
    'sui_sign_transaction' in input
      ? input.sui_sign_transaction.transactionBytes
      : null

  const suiTxData = useMemo(() => {
    if (!isTransaction || !suiTransactionBytes) return null
    return parseSuiTx(suiTransactionBytes)
  }, [isTransaction, suiTransactionBytes])

  // Ask Blockaid for the predicted balance changes — same scan endpoint the
  // sendTx popup uses for Solana. The popup runs in the extension's own
  // context so we can call Blockaid directly without a background hop; the
  // dApp page's CSP doesn't apply here.
  const suiIntentQuery = useQuery({
    queryKey: ['blockaidSuiScan', address, suiTransactionBytes],
    queryFn: async () => {
      const simulation = (await getTxBlockaidSimulation({
        chain: OtherChain.Sui,
        data: {
          chain: 'mainnet',
          options: ['simulation'],
          account_address: address,
          transaction: suiTransactionBytes ?? '',
          metadata: {},
        },
      })) as BlockaidSuiSimulation
      return parseBlockaidSuiSimulation(simulation)
    },
    enabled: isTransaction && !!suiTransactionBytes,
    staleTime: 30_000,
    retry: false,
  })

  const formattedMessage = useMemo(() => {
    try {
      const parsed = JSON.parse(message)
      return JSON.stringify(parsed, null, 2)
    } catch {
      return null
    }
  }, [message])

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={t(
          isFinished
            ? 'overview'
            : isTransaction
              ? 'sign_transaction'
              : 'sign_message'
        )}
        hasBorder
      />
      <PageContent gap={16} scrollable>
        {isFinished && <Animation />}
        <Sender favicon={requestFavicon} origin={requestOrigin} />
        <Request address={address} method={method} />
        {!isFinished && typedData && (
          <Eip712PermitDisplay
            chain={typedData.chain}
            payload={typedData.payload}
          />
        )}
        {!isFinished && suiIntentQuery.data ? (
          <SuiTxIntentDisplay intent={suiIntentQuery.data} />
        ) : null}
        {!isFinished && suiTxData ? (
          <SignSuiTransactionDisplay data={suiTxData} />
        ) : null}
        {isFinished ? (
          <Collapse title={t('signed_signature')}>
            <Text as="span" color="info" size={14} weight={500}>
              {signature}
            </Text>
          </Collapse>
        ) : (
          <Collapse
            title={t(
              typedData
                ? 'raw_message'
                : isTransaction
                  ? 'raw_transaction_data'
                  : 'message'
            )}
          >
            {formattedMessage ? (
              <Text color="info" family="mono" size={14} weight={500}>
                <pre style={{ width: '100%' }}>
                  <code
                    style={{
                      display: 'block',
                      overflowX: 'auto',
                      width: '100%',
                    }}
                  >
                    {formattedMessage}
                  </code>
                </pre>
              </Text>
            ) : (
              <Text as="span" color="info" size={14} weight={500}>
                {message}
              </Text>
            )}
          </Collapse>
        )}
      </PageContent>
      <PageFooter>
        {isFinished ? (
          <Button onClick={goHome}>{t('complete')}</Button>
        ) : (
          <StartKeysignPrompt keysignPayload={keysignPayload} />
        )}
      </PageFooter>
    </>
  )
}
