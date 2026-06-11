import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { useGetCoin } from '@core/ui/chain/coin/useGetCoin'
import { BlockaidTxScan } from '@core/ui/chain/security/blockaid/tx/BlockaidTxScan'
import { TxOverviewMemo } from '@core/ui/chain/tx/TxOverviewMemo'
import { extractTokenAndAmount } from '@core/ui/chain/tx/utils/extractTokenAndAmount'
import { formatTokenAmount } from '@core/ui/chain/tx/utils/formatTokenAmount'
import { useEvmContractCallInfoQuery } from '@core/ui/chain/tx/utils/useEvmContractCallInfoQuery'
import { VerifyTransactionOverview } from '@core/ui/mpc/keysign/verify/VerifyTransactionOverview'
import { useAddressBookNameForAddress } from '@core/ui/vault/hooks/useAddressBookNameForAddress'
import { useVaultNameForAddress } from '@core/ui/vault/hooks/useVaultNameForAddress'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { FuelIcon } from '@lib/ui/icons/FuelIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { TriangleAlertIcon } from '@lib/ui/icons/TriangleAlertIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { ListItem } from '@lib/ui/list/item'
import { ValueProp } from '@lib/ui/props'
import { getResolvedQuery } from '@lib/ui/query/Query'
import { Text } from '@lib/ui/text'
import { useQuery } from '@tanstack/react-query'
import { isChainOfKind } from '@vultisig/core-chain/ChainKind'
import { feeSettingsChains } from '@vultisig/core-mpc/keysign/chainSpecific/FeeSettings'
import { fromCommCoin } from '@vultisig/core-mpc/types/utils/commCoin'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { capitalizeFirstLetter } from '@vultisig/lib-utils/capitalizeFirstLetter'
import { assertField } from '@vultisig/lib-utils/record/assertField'
import { useTranslation } from 'react-i18next'

import { SignAminoDisplay } from '../../tx/components/SignAminoDisplay'
import { SignDirectDisplay } from '../../tx/components/SignDirectDisplay'
import { parseSuiTx } from '../../tx/sui/parser'
import { SignSuiDisplay } from '../../tx/sui/SignSuiDisplay'

/**
 * Joiner verify view for a regular transfer. Renders the same card-based
 * "Send Overview" design the initiator shows (`VerifyTransactionOverview`) so
 * both devices in a keysign session display matching transaction details.
 *
 * The keysign payload is already resolved on the joiner, so it is wrapped with
 * `getResolvedQuery` to satisfy the shared overview's query-driven API. EVM
 * contract-call decoding (e.g. `Approve / amount TICKER`) and Cosmos sign
 * displays are preserved as extra rows below the standard fields.
 */
export const JoinKeysignTxOverview = ({ value }: ValueProp<KeysignPayload>) => {
  const { t } = useTranslation()
  const { toAddress, memo } = value

  const coin = shouldBePresent(fromCommCoin(assertField(value, 'coin')))

  const { name } = useCurrentVault()

  const receiverVaultName = useVaultNameForAddress({
    address: toAddress,
    chain: coin.chain,
  })
  const receiverAddressBookName = useAddressBookNameForAddress({
    address: toAddress,
    chain: coin.chain,
  })

  // Match the initiator's fee row, which shows a fuel icon on fee-settings
  // chains (EVM/UTXO). On the joiner the fee is fixed by the initiator's
  // payload, so the icon is a non-interactive indicator rather than the
  // editable ManageFee control.
  const showFeeIcon = isOneOf(coin.chain, feeSettingsChains)

  // Decode the EVM calldata so the joiner sees the same `[icon] Approve / amount TICKER`
  // (and the unlimited-approval warning) the initiator shows on its pre-sign popup.
  // The query shares its memo-keyed react-query cache with the initiator's path,
  // so we don't refetch the 4byte signature.
  const getCoin = useGetCoin()
  const contractCallQuery = useEvmContractCallInfoQuery({
    memo,
    enabled: isChainOfKind(coin.chain, 'evm'),
  })
  const tokenPair = contractCallQuery.data
    ? extractTokenAndAmount(
        contractCallQuery.data.functionSignature,
        contractCallQuery.data.functionArguments,
        toAddress
      )
    : null
  const tokenQuery = useQuery({
    queryKey: ['resolveToken', tokenPair?.tokenAddress, coin.chain],
    queryFn: () => getCoin({ id: tokenPair!.tokenAddress, chain: coin.chain }),
    enabled: !!tokenPair,
    staleTime: Infinity,
  })
  const rawFunctionName =
    contractCallQuery.data?.functionSignature.split('(')[0]
  const decodedCall =
    tokenQuery.data && tokenPair && rawFunctionName
      ? (() => {
          const fmt = formatTokenAmount({
            rawAmount: BigInt(tokenPair.rawAmount),
            decimals: tokenQuery.data.decimals,
            functionName: rawFunctionName,
          })
          // MAX_UINT256 in a non-approval (withdraw/repay) — exact amount
          // depends on on-chain state, so skip the row entirely.
          if (!fmt.display) return null
          const amountLabel = fmt.isSentinel ? t('unlimited') : fmt.display
          return {
            coin: tokenQuery.data,
            functionName: capitalizeFirstLetter(rawFunctionName),
            display: `${amountLabel} ${tokenQuery.data.ticker}`,
            isUnlimited: fmt.isSentinel,
          }
        })()
      : null

  const keysignPayloadQuery = getResolvedQuery(value)

  // Sui dApp signing carries a pre-built PTB with no transfer amount/recipient,
  // so the standard "You're sending" card would read an empty 0-SUI transfer.
  // Decode the bytes and show the actual command/input breakdown instead, so
  // the joiner sees exactly what it is co-signing.
  if (value.signData.case === 'signSui') {
    const suiTxData = parseSuiTx(value.signData.value.unsignedTxMsg)
    return (
      <>
        <BlockaidTxScan keysignPayloadQuery={keysignPayloadQuery} />
        {suiTxData ? <SignSuiDisplay data={suiTxData} /> : null}
      </>
    )
  }

  return (
    <>
      <BlockaidTxScan keysignPayloadQuery={keysignPayloadQuery} />
      <VerifyTransactionOverview
        coin={coin}
        amount={BigInt(value.toAmount)}
        senderName={name}
        senderAddress={coin.address}
        receiver={toAddress}
        receiverVaultName={receiverVaultName ?? undefined}
        receiverAddressBookName={receiverAddressBookName ?? undefined}
        chain={coin.chain}
        keysignPayloadQuery={keysignPayloadQuery}
        renderFeeExtra={
          showFeeIcon
            ? () => (
                <IconWrapper style={{ fontSize: 16 }}>
                  <FuelIcon />
                </IconWrapper>
              )
            : undefined
        }
      >
        {decodedCall && (
          <ListItem
            title={
              <HStack alignItems="center" gap={8}>
                <CoinIcon coin={decodedCall.coin} style={{ fontSize: 24 }} />
                <Text size={14} weight={500}>
                  {decodedCall.functionName}
                </Text>
              </HStack>
            }
            extra={
              decodedCall.isUnlimited ? (
                <HStack alignItems="center" gap={6}>
                  <Text as={TriangleAlertIcon} color="warning" size={16} />
                  <Text color="warning" weight={500}>
                    {decodedCall.display}
                  </Text>
                </HStack>
              ) : (
                <Text size={14} weight={500}>
                  {decodedCall.display}
                </Text>
              )
            }
          />
        )}
        {memo && (
          <ListItem
            title={<TxOverviewMemo value={memo} chain={coin.chain} />}
          />
        )}
      </VerifyTransactionOverview>
      {value.signData.case === 'signAmino' && (
        <SignAminoDisplay signAmino={value.signData.value} />
      )}
      {value.signData.case === 'signDirect' && (
        <SignDirectDisplay signDirect={value.signData.value} />
      )}
    </>
  )
}
