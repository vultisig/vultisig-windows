import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { OnBackProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { WarningBlock } from '@lib/ui/status/WarningBlock'
import { Text } from '@lib/ui/text'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { Chain } from '@vultisig/core-chain/Chain'
import {
  FeeSettings,
  FeeSettingsChain,
  feeSettingsChains,
} from '@vultisig/core-mpc/keysign/chainSpecific/FeeSettings'
import { getKeysignTonGasless } from '@vultisig/core-mpc/keysign/ton/gasless'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { ChainEntityIcon } from '../../../chain/coin/icon/ChainEntityIcon'
import { getChainLogoSrc } from '../../../chain/metadata/getChainLogoSrc'
import { getRippleDisplay } from '../../../chain/tx/getRippleKeysignDisplay'
import {
  isEvmContractCallMemo,
  TxOverviewMemo,
} from '../../../chain/tx/TxOverviewMemo'
import { KeysignReviewSheet } from '../../../mpc/keysign/review/KeysignReviewSheet'
import { ReviewAddressCards } from '../../../mpc/keysign/review/ReviewAddressCards'
import { ReviewAmountHeadline } from '../../../mpc/keysign/review/ReviewAmountHeadline'
import { ReviewDivider } from '../../../mpc/keysign/review/ReviewDivider'
import { ReviewRow } from '../../../mpc/keysign/review/ReviewRow'
import {
  decodedAmountCanBeShown,
  decodeSignedTransaction,
} from '../../../mpc/keysign/transaction-decoding/decodeSignedTransaction'
import { getVerifyTransactionTitleKey } from '../../../mpc/keysign/transaction-decoding/presentation'
import { KeysignFeeAmount } from '../../../mpc/keysign/tx/FeeAmount'
import { useAddressBookNameForAddress } from '../../hooks/useAddressBookNameForAddress'
import { useVaultNameForAddress } from '../../hooks/useVaultNameForAddress'
import { useCurrentVault } from '../../state/currentVault'
import { useSendKeysignPayloadQuery } from '../keysignPayload/query'
import { useSender } from '../sender/hooks/useSender'
import { useSendAmount } from '../state/amount'
import { useSendDestinationTag } from '../state/destinationTag'
import { useSendMemo } from '../state/memo'
import { useSendReceiver } from '../state/receiver'
import { useSendReceiverLabel } from '../state/receiverLabel'
import { useCurrentSendCoin } from '../state/sendCoin'
import { ManageFee } from './ManageFee'

const sendTerms = ['send_terms_1', 'send_terms_0'] as const

const Memo = styled.span`
  overflow-wrap: anywhere;
`

/**
 * The send flow's review sheet. Everything the full-screen review showed is
 * still here — memo, destination tag, fee settings — laid out as the sheet.
 */
export const SendVerify: FC<OnBackProp> = ({ onBack }) => {
  const { t } = useTranslation()
  const { name } = useCurrentVault()
  const [receiver] = useSendReceiver()
  const [receiverLabel] = useSendReceiverLabel()
  const [memo] = useSendMemo()
  const { destinationTag } = useSendDestinationTag()
  const coin = useCurrentSendCoin()
  const { destinationTag: displayDestinationTag, memo: displayMemo } =
    coin.chain === Chain.Ripple
      ? getRippleDisplay({ destinationTag, memo })
      : { destinationTag: undefined, memo: memo || undefined }
  const sender = useSender()
  const receiverVaultName = useVaultNameForAddress({
    address: receiver,
    chain: coin.chain,
  })
  const receiverAddressBookName = useAddressBookNameForAddress({
    address: receiver,
    chain: coin.chain,
  })
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

  const { vaultName, addressBookName, addressLabel } = (() => {
    if (receiverVaultName !== null)
      return {
        vaultName: receiverVaultName,
        addressBookName: undefined,
        addressLabel: undefined,
      }
    if (receiverAddressBookName !== null)
      return {
        vaultName: undefined,
        addressBookName: receiverAddressBookName,
        addressLabel: undefined,
      }
    return {
      vaultName: undefined,
      addressBookName: undefined,
      addressLabel: receiverLabel || undefined,
    }
  })()

  const receiverName = vaultName ?? addressBookName ?? addressLabel

  return (
    <KeysignReviewSheet
      title={t('send_overview')}
      onClose={onBack}
      keysignPayloadQuery={keysignPayloadQuery}
      terms={translatedTerms}
      toAddressLabel={addressLabel}
    >
      <ReviewAmountHeadline
        coin={coin}
        fallbackAmount={fromChainAmount(shouldBePresent(amount), coin.decimals)}
        keysignPayloadQuery={keysignPayloadQuery}
        hidePayloadAmount={payload => {
          const result = decodeSignedTransaction(payload)
          return (
            getVerifyTransactionTitleKey(result.operation) !== undefined &&
            !decodedAmountCanBeShown(result.amount)
          )
        }}
        label={
          // A plain transfer needs no heading; an operation that is not one
          // (e.g. a TRON freeze) names itself so both signing devices frame the
          // transaction the same way.
          <MatchQuery
            value={keysignPayloadQuery}
            pending={() => null}
            error={() => null}
            success={payload => {
              const titleKey = getVerifyTransactionTitleKey(
                decodeSignedTransaction(payload).operation
              )
              return titleKey ? (
                <Text as="span" variant="stationBodyS" color="shy">
                  {t(titleKey)}
                </Text>
              ) : null
            }}
          />
        }
      />
      <ReviewAddressCards
        senderName={name}
        senderAddress={sender}
        receiverName={receiverName}
        receiverAddress={receiver}
      />
      <VStack gap={12}>
        <ReviewRow
          label={t('network')}
          value={
            <>
              <ChainEntityIcon
                value={getChainLogoSrc(coin.chain)}
                style={{ fontSize: 16 }}
              />
              {coin.chain}
            </>
          }
        />
        {displayMemo &&
          (isEvmContractCallMemo({ value: displayMemo, chain: coin.chain }) ? (
            <TxOverviewMemo value={displayMemo} chain={coin.chain} />
          ) : (
            <ReviewRow label={t('memo')} value={<Memo>{displayMemo}</Memo>} />
          ))}
        {displayDestinationTag !== undefined && (
          <ReviewRow
            label={t('ripple_field_destination_tag')}
            value={displayDestinationTag.toString()}
          />
        )}
        <ReviewDivider />
        <ReviewRow
          label={t('est_network_fee')}
          value={
            <MatchQuery
              value={keysignPayloadQuery}
              pending={() => <Spinner />}
              success={keysignPayload => (
                <HStack alignItems="center" gap={8}>
                  <KeysignFeeAmount
                    keysignPayload={keysignPayload}
                    layout="stacked"
                  />
                  {feeSettingsChain && (
                    <ManageFee
                      keysignPayload={keysignPayload}
                      feeSettings={feeSettings}
                      onChange={setFeeSettings}
                      chain={feeSettingsChain}
                    />
                  )}
                  {getKeysignTonGasless(keysignPayload) && (
                    // The relay's commission stands in for the network fee: it
                    // is charged in the jetton, and no TON leaves the account.
                    <Text as="span" variant="stationBodyS" color="shy">
                      {t('ton_gasless_fee_note')}
                    </Text>
                  )}
                </HStack>
              )}
            />
          }
        />
      </VStack>
      <MatchQuery
        value={keysignPayloadQuery}
        pending={() => null}
        error={() => null}
        success={({ blockchainSpecific }) =>
          // Read from the payload being signed, so the warning appears exactly
          // when the account will be emptied.
          blockchainSpecific.case === 'polkadotSpecific' &&
          blockchainSpecific.value.allowDeath ? (
            <WarningBlock>
              {t('substrate_allow_death_review_warning')}
            </WarningBlock>
          ) : null
        }
      />
    </KeysignReviewSheet>
  )
}
