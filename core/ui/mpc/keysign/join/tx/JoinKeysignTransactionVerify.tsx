import { DappRequestBanner } from '@core/ui/dapp/DappRequestBanner'
import { KaminoTransactionSummary } from '@core/ui/defi/chain/solana/kamino/verify/KaminoTransactionSummary'
import { KaminoUnreadableTransaction } from '@core/ui/defi/chain/solana/kamino/verify/KaminoUnreadableTransaction'
import { readKaminoKeysignTransaction } from '@core/ui/defi/chain/solana/kamino/verify/readKaminoKeysignTransaction'
import { verticalPadding } from '@lib/ui/css/verticalPadding'
import { Checkbox } from '@lib/ui/inputs/checkbox/Checkbox'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { OnFinishProp, ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getKeysignLimitSwapCancel } from '@vultisig/core-mpc/keysign/swap/getKeysignLimitSwapCancel'
import { getKeysignLimitSwapOrder } from '@vultisig/core-mpc/keysign/swap/getKeysignLimitSwapOrder'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { updateAtIndex } from '@vultisig/lib-utils/array/updateAtIndex'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { JoinKeysignButton } from './JoinKeysignButton'
import { JoinKeysignLimitOrderCancelVerify } from './JoinKeysignLimitOrderCancelVerify'
import { JoinKeysignLimitOrderVerify } from './JoinKeysignLimitOrderVerify'
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
 * router signing path) still render as deposits. THORChain limit orders are
 * detected from the memo next, since only their ERC20-sourced variant carries a
 * swap payload. Falls back to swap, then to a generic transfer.
 *
 * The generic transfer renders the updated "Send Overview" card and the same
 * confirmation checkboxes the initiator shows, keeping both devices in sync.
 */
export const JoinKeysignTransactionVerify = ({
  value,
  onFinish,
}: ValueProp<KeysignPayload> & OnFinishProp) => {
  const { t } = useTranslation()

  // Ahead of every other reading: a Kamino transaction carries no memo and no
  // swap payload, so it would otherwise fall through to the generic transfer
  // view — which would describe a vault deposit as a send to an opaque address.
  const kamino = readKaminoKeysignTransaction(value)

  const lp = value.memo ? parseThorLpMemo(value.memo) : null
  // Ahead of the swap check on purpose: only ERC20-sourced limit orders carry a
  // swap payload, so keying off the payload alone would route RUNE and
  // native-gas orders to the generic transfer view.
  const limitOrder = lp ? undefined : getKeysignLimitSwapOrder(value)
  // A cancel carries no swap payload on ANY branch, so without this it always
  // renders as a dust send to an opaque address — the amount reads as harmless
  // while the transaction closes a position.
  const limitOrderCancel =
    lp || limitOrder ? undefined : getKeysignLimitSwapCancel(value)
  const isSwap =
    !lp && !limitOrder && !limitOrderCancel && !!value.swapPayload?.value

  // The send terms belong to a transfer. A vault deposit or withdrawal is
  // neither, and a transaction this device cannot read has nothing to confirm.
  const terms = limitOrder
    ? [t('swap_limit_confirm')]
    : lp || isSwap || limitOrderCancel || !('unrelated' in kamino)
      ? []
      : sendTerms.map(term => t(term))
  const [termsAccepted, setTermsAccepted] = useState<boolean[]>(
    new Array(terms.length).fill(false)
  )

  const content =
    'decoded' in kamino ? (
      <KaminoTransactionSummary decoded={kamino.decoded} />
    ) : 'unreadable' in kamino ? (
      <KaminoUnreadableTransaction />
    ) : lp ? (
      <JoinKeysignLpVerify value={value} lp={lp} />
    ) : limitOrder ? (
      <JoinKeysignLimitOrderVerify value={value} order={limitOrder} />
    ) : limitOrderCancel ? (
      <JoinKeysignLimitOrderCancelVerify
        value={value}
        cancel={limitOrderCancel}
      />
    ) : isSwap ? (
      <JoinKeysignSwapVerify value={value} />
    ) : (
      <JoinKeysignTxOverview value={value} />
    )

  // A transaction that reaches the kVaults program and does not decode is not
  // joinable: this device cannot say what it authorises, and joining anyway
  // would contribute a signature to bytes nobody on this screen has read.
  const disabled = 'unreadable' in kamino || termsAccepted.some(term => !term)

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
          disabled={
            'unreadable' in kamino
              ? t('kamino_earn_unreadable_title')
              : disabled
                ? t('terms_required')
                : undefined
          }
        />
      </PageFooter>
    </>
  )
}
