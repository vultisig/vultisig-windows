import { useBlockaidTxScanQuery } from '@core/ui/chain/security/blockaid/tx/queries/useBlockaidTxScanQuery'
import { verticalPadding } from '@lib/ui/css/verticalPadding'
import { Checkbox } from '@lib/ui/inputs/checkbox/Checkbox'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { Query } from '@lib/ui/query/Query'
import { Text } from '@lib/ui/text'
import { SwapQuote } from '@vultisig/core-chain/swap/quote/SwapQuote'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { updateAtIndex } from '@vultisig/lib-utils/array/updateAtIndex'
import { ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { BlockaidTxScan } from '../../../chain/security/blockaid/tx/BlockaidTxScan'
import { RefetchableKeysignPayloadQuery } from './refreshKeysignPayload'
import { resolveStartKeysignPromptProps } from './resolveStartKeysignPromptProps'
import { StartKeysignPromptWithRefresh } from './StartKeysignPromptWithRefresh'

type VerifyKeysignStartInput = {
  children: ReactNode
  /**
   * Must be refetchable: the payload is rebuilt when signing starts so the
   * builder's fail-closed gates run at sign time. See
   * {@link refreshKeysignPayload}.
   */
  keysignPayloadQuery: Query<KeysignPayload> &
    RefetchableKeysignPayloadQuery<KeysignPayload>
  terms?: string[]
  toAddressLabel?: string
  extraPendingMessage?: string
  /**
   * Blocks the start-keysign button with this message even when the payload is
   * ready. Use for pre-keysign gates such as an insufficient-funds check that
   * would otherwise waste an MPC ceremony on a transaction that can't broadcast.
   */
  disabledMessage?: string
  footer?: ReactNode
  swapQuote?: SwapQuote
}

const TermItem = styled(Checkbox)`
  ${verticalPadding(10)}
  font-family: inherit;
  font-size: 14px;
`

export const VerifyKeysignStart = ({
  children,
  keysignPayloadQuery,
  terms = [],
  toAddressLabel,
  extraPendingMessage,
  disabledMessage,
  footer,
  swapQuote,
}: VerifyKeysignStartInput) => {
  const { t } = useTranslation()

  const [termsAccepted, setTermsAccepted] = useState<boolean[]>(
    new Array(terms.length).fill(false)
  )

  const { isScanning } = useBlockaidTxScanQuery(keysignPayloadQuery)

  const startKeysignPromptProps = resolveStartKeysignPromptProps({
    t,
    termsAccepted,
    keysignPayloadQuery,
    isScanning,
    extraPendingMessage,
    disabledMessage,
    toAddressLabel,
    swapQuote,
  })

  return (
    <>
      <PageContent gap={12} scrollable>
        <BlockaidTxScan keysignPayloadQuery={keysignPayloadQuery} />

        {children}

        {terms.length > 0 && (
          <VStack>
            {terms.map((term, index) => (
              <TermItem
                key={index}
                data-testid={`terms-checkbox-${index}`}
                label={<Text size={14}>{term}</Text>}
                value={termsAccepted[index]}
                onChange={v =>
                  setTermsAccepted(prev => updateAtIndex(prev, index, () => v))
                }
              />
            ))}
          </VStack>
        )}
      </PageContent>
      <PageFooter>
        {footer ?? (
          <StartKeysignPromptWithRefresh
            keysignPayloadQuery={keysignPayloadQuery}
            toKeysignPayload={keysign => ({ keysign })}
            promptProps={startKeysignPromptProps}
          />
        )}
      </PageFooter>
    </>
  )
}
