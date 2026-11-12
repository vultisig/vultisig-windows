import { useDebounce } from '@lib/ui/hooks/useDebounce'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { FeeSettingsChain } from '@vultisig/core-mpc/keysign/chainSpecific/FeeSettings'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { KeysignFeeAmount } from '../../../mpc/keysign/tx/FeeAmount'
import { useSendKeysignPayloadQuery } from '../keysignPayload/query'
import { useSendAmount } from '../state/amount'
import { useSendFeeSettings } from '../state/feeSettings'
import { ManageFee } from '../verify/ManageFee'
import { SendAmountFeeRowLayout } from './SendAmountFeeRowLayout'
import { SendFeeSkeleton } from './SendFeeSkeleton'

type SendAmountFeeEstimateProps = {
  feeSettingsChain: FeeSettingsChain | null
}

const feeEstimateDebounceMs = 500
const outdatedOpacity = 0.5

/**
 * The fee of the send as it stands, from a payload built the way Verify builds
 * the one it signs. Display only: it is rebuilt once the amount settles, the
 * previous fee is dimmed meanwhile, and nothing here feeds the transaction.
 */
export const SendAmountFeeEstimate = ({
  feeSettingsChain,
}: SendAmountFeeEstimateProps) => {
  const { t } = useTranslation()
  const [amount] = useSendAmount()
  const settledAmount = useDebounce(amount, feeEstimateDebounceMs)
  const [feeSettings, setFeeSettings] = useSendFeeSettings()
  const query = useSendKeysignPayloadQuery({
    feeSettings,
    preview: { isPaused: settledAmount !== amount },
  })

  const value = (
    <MatchQuery
      value={query}
      pending={() => <SendFeeSkeleton />}
      error={() => (
        <Text size={12} color="shy">
          {t('failed_to_load')}
        </Text>
      )}
      success={keysignPayload => (
        <FeeValue
          style={{ opacity: query.isPlaceholderData ? outdatedOpacity : 1 }}
        >
          <KeysignFeeAmount keysignPayload={keysignPayload} layout="stacked" />
        </FeeValue>
      )}
    />
  )

  const { data: keysignPayload } = query
  if (!feeSettingsChain || !keysignPayload || query.isPlaceholderData) {
    return (
      <SendAmountFeeRowLayout
        value={value}
        hasSettings={feeSettingsChain !== null}
      />
    )
  }

  return (
    <ManageFee
      keysignPayload={keysignPayload}
      feeSettings={feeSettings}
      onChange={setFeeSettings}
      chain={feeSettingsChain}
      renderOpener={({ onOpen }) => (
        <SendAmountFeeRowLayout
          value={value}
          hasSettings
          onOpenSettings={onOpen}
        />
      )}
    />
  )
}

const FeeValue = styled.div`
  transition: opacity 0.2s ease-in-out;
`
