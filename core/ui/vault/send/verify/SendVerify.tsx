import {
  FeeSettings,
  FeeSettingsChain,
  feeSettingsChains,
} from '@core/mpc/keysign/chainSpecific/FeeSettings'
import { TxOverviewMemo } from '@core/ui/chain/tx/TxOverviewMemo'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { VerifyKeysignStart } from '@core/ui/mpc/keysign/start/VerifyKeysignStart'
import { VerifyTransactionOverview } from '@core/ui/mpc/keysign/verify/VerifyTransactionOverview'
import { useSendKeysignPayloadQuery } from '@core/ui/vault/send/keysignPayload/query'
import { useSender } from '@core/ui/vault/send/sender/hooks/useSender'
import { useSendMemo } from '@core/ui/vault/send/state/memo'
import { useSendReceiver } from '@core/ui/vault/send/state/receiver'
import { useCurrentSendCoin } from '@core/ui/vault/send/state/sendCoin'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { ListItem } from '@lib/ui/list/item'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnBackProp } from '@lib/ui/props'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useSendAmount } from '../state/amount'
import { ManageFee } from './ManageFee'

const sendTerms = ['send_terms_1', 'send_terms_0'] as const

export const SendVerify: FC<OnBackProp> = ({ onBack }) => {
  const { t } = useTranslation()
  const { name } = useCurrentVault()
  const [receiver] = useSendReceiver()
  const [memo] = useSendMemo()
  const coin = useCurrentSendCoin()
  const sender = useSender()
  const [feeSettings, setFeeSettings] = useState<FeeSettings | undefined>(
    undefined
  )
  const keysignPayloadQuery = useSendKeysignPayloadQuery({
    feeSettings,
  })
  const translatedTerms = sendTerms.map(term => t(term))
  const [amount] = useSendAmount()

  const feeSettingsChain: FeeSettingsChain | null = isOneOf(
    coin.chain,
    feeSettingsChains
  )
    ? coin.chain
    : null

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={onBack} />}
        title={t('send_overview')}
      />
      <VerifyKeysignStart
        keysignPayloadQuery={keysignPayloadQuery}
        terms={translatedTerms}
      >
        <VerifyTransactionOverview
          coin={coin}
          amount={shouldBePresent(amount)}
          senderName={name}
          senderAddress={sender}
          receiver={receiver}
          chain={coin.chain}
          keysignPayloadQuery={keysignPayloadQuery}
          renderFeeExtra={
            feeSettingsChain
              ? keysignPayload => (
                  <ManageFee
                    keysignPayload={keysignPayload}
                    feeSettings={feeSettings}
                    onChange={setFeeSettings}
                    chain={feeSettingsChain}
                  />
                )
              : undefined
          }
        >
          {memo && (
            <ListItem
              title={<TxOverviewMemo value={memo} chain={coin.chain} />}
            />
          )}
        </VerifyTransactionOverview>
      </VerifyKeysignStart>
    </>
  )
}
