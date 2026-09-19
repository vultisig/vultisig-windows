import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { getRippleDisplay } from '@core/ui/chain/tx/getRippleKeysignDisplay'
import {
  isEvmContractCallMemo,
  TxOverviewMemo,
} from '@core/ui/chain/tx/TxOverviewMemo'
import { KeysignReviewSheet } from '@core/ui/mpc/keysign/review/KeysignReviewSheet'
import { ReviewAddressCards } from '@core/ui/mpc/keysign/review/ReviewAddressCards'
import { ReviewAmountHeadline } from '@core/ui/mpc/keysign/review/ReviewAmountHeadline'
import { ReviewDivider, ReviewRow } from '@core/ui/mpc/keysign/review/ReviewRow'
import {
  decodedAmountCanBeShown,
  decodeSignedTransaction,
} from '@core/ui/mpc/keysign/transaction-decoding/decodeSignedTransaction'
import { getVerifyTransactionTitleKey } from '@core/ui/mpc/keysign/transaction-decoding/presentation'
import { KeysignFeeAmount } from '@core/ui/mpc/keysign/tx/FeeAmount'
import { useAddressBookNameForAddress } from '@core/ui/vault/hooks/useAddressBookNameForAddress'
import { useVaultNameForAddress } from '@core/ui/vault/hooks/useVaultNameForAddress'
import { useSendKeysignPayloadQuery } from '@core/ui/vault/send/keysignPayload/query'
import { useSender } from '@core/ui/vault/send/sender/hooks/useSender'
import { useSendDestinationTag } from '@core/ui/vault/send/state/destinationTag'
import { useSendMemo } from '@core/ui/vault/send/state/memo'
import { useSendReceiver } from '@core/ui/vault/send/state/receiver'
import { useSendReceiverLabel } from '@core/ui/vault/send/state/receiverLabel'
import { useCurrentSendCoin } from '@core/ui/vault/send/state/sendCoin'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { OnBackProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { Chain } from '@vultisig/core-chain/Chain'
import {
  FeeSettings,
  FeeSettingsChain,
  feeSettingsChains,
} from '@vultisig/core-mpc/keysign/chainSpecific/FeeSettings'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useSendAmount } from '../state/amount'
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
                </HStack>
              )}
            />
          }
        />
      </VStack>
    </KeysignReviewSheet>
  )
}
