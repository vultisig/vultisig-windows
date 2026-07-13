import { DappRequestBanner } from '@core/ui/dapp/DappRequestBanner'
import { verticalPadding } from '@lib/ui/css/verticalPadding'
import { Checkbox } from '@lib/ui/inputs/checkbox/Checkbox'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { OnFinishProp, ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { updateAtIndex } from '@vultisig/lib-utils/array/updateAtIndex'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { JoinKeysignButton } from './JoinKeysignButton'
import { JoinKeysignLpVerify } from './JoinKeysignLpVerify'
import { JoinKeysignSwapVerify } from './JoinKeysignSwapVerify'
import { JoinKeysignTxOverview } from './JoinKeysignTxOverview'
import { parseThorLpMemo } from './parseThorLpMemo'

const sendTerms = ['send_terms_1', 'send_terms_0'] as const

const TermItem = styled(Checkbox)`
  ${verticalPadding(10)}
  font-family: inherit;
  font-size: 14px;
`

/**
 * Routes a join keysign payload to the correct verify view and owns the shared
 * footer. THORChain LP add/remove is detected via memo first so iOS-initiated
 * LP deposits (which carry a synthesized `thorchainSwapPayload` for the EVM
 * router signing path) still render as deposits. Falls back to swap, then to a
 * generic transfer.
 *
 * The generic transfer renders the updated "Send Overview" card and the same
 * confirmation checkboxes the initiator shows, keeping both devices in sync.
 */
export const JoinKeysignTransactionVerify = ({
  value,
  onFinish,
}: ValueProp<KeysignPayload> & OnFinishProp) => {
  const { t } = useTranslation()

  const lp = value.memo ? parseThorLpMemo(value.memo) : null
  const isSwap = !lp && !!value.swapPayload?.value

  const terms = lp || isSwap ? [] : sendTerms.map(term => t(term))
  const [termsAccepted, setTermsAccepted] = useState<boolean[]>(
    new Array(terms.length).fill(false)
  )

  const content = lp ? (
    <JoinKeysignLpVerify value={value} lp={lp} />
  ) : isSwap ? (
    <JoinKeysignSwapVerify value={value} />
  ) : (
    <JoinKeysignTxOverview value={value} />
  )

  const disabled = termsAccepted.some(term => !term)

  return (
    <>
      <PageContent gap={12} scrollable>
        {isSwap ? null : <DappRequestBanner value={value.dappMetadata} />}
        {content}
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
        <JoinKeysignButton
          onClick={onFinish}
          disabled={disabled ? t('terms_required') : undefined}
        />
      </PageFooter>
    </>
  )
}
