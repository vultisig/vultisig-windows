import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainDisplayName } from '@core/ui/chain/metadata/getChainDisplayName'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { useTxHash } from '@core/ui/chain/state/txHash'
import { getRippleKeysignDisplay } from '@core/ui/chain/tx/getRippleKeysignDisplay'
import { getTronStakingDisplay } from '@core/ui/chain/tx/getTronStakingDisplay'
import { TxOverviewMemo } from '@core/ui/chain/tx/TxOverviewMemo'
import { useKeysignMessagePayload } from '@core/ui/mpc/keysign/state/keysignMessagePayload'
import { useAddressBookNameForAddress } from '@core/ui/vault/hooks/useAddressBookNameForAddress'
import { useVaultNameForAddress } from '@core/ui/vault/hooks/useVaultNameForAddress'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { SeparatedByLine } from '@lib/ui/layout/SeparatedByLine'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Panel } from '@lib/ui/panel/Panel'
import { Text } from '@lib/ui/text'
import { MiddleTruncate } from '@lib/ui/truncate'
import { getKeysignLastValidBlockHeight } from '@vultisig/core-mpc/keysign/utils/getKeysignLastValidBlockHeight'
import { fromCommCoin } from '@vultisig/core-mpc/types/utils/commCoin'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { getRecordUnionValue } from '@vultisig/lib-utils/record/union/getRecordUnionValue'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useTxStatusQuery } from '../../../chain/tx/status/useTxStatusQuery'
import { AddToAddressBookButton } from './components/AddToAddressBookButton'
import { TxActualFeeDisplay } from './components/TxActualFeeDisplay'
import { TxFeeRow } from './components/TxFeeRow'
import { TxVaultSourceLabel } from './components/TxVaultSourceLabel'
import { KeysignFeeAmount } from './FeeAmount'
import { getWasmExecuteTxDisplay } from './getWasmExecuteTxDisplay'
import { SignRippleDisplay } from './ripple/SignRippleDisplay'
import { parseSuiTx } from './sui/parser'
import { SignSuiDisplay } from './sui/SignSuiDisplay'

type KeysignTxOverviewProps = {
  toAddressLabel?: string
}

/**
 * The signed transaction's detail rows — from, to, memo, network and fee —
 * revealed in place beneath the done screen's hero.
 *
 * Renders no amount hero and no tx-hash row on purpose: both belong to the
 * hero above, which reads the payload far more thoroughly (4byte function
 * names, ERC-20 token resolution, Blockaid simulation). A hero here would be a
 * second, poorer answer to the question the first one already answered — which
 * is exactly how an ERC-20 approve came to be reported as a 0 ETH contract
 * execution once the details were opened.
 */
export const KeysignTxOverview = ({
  toAddressLabel,
}: KeysignTxOverviewProps) => {
  const { t } = useTranslation()
  const { name } = useCurrentVault()
  const keysignPayload = getRecordUnionValue(
    useKeysignMessagePayload(),
    'keysign'
  )
  const { toAddress, coin: potentialCoin } = keysignPayload
  const { destinationTag, memo } = getRippleKeysignDisplay(keysignPayload)
  const coin = fromCommCoin(shouldBePresent(potentialCoin))
  const { address, chain } = shouldBePresent(coin)

  // A wasm contract execute (e.g. stake/unstake) is signed purely from
  // `contractPayload`; take its destination from that same payload so display
  // can't diverge from what is signed.
  const wasmDisplay = getWasmExecuteTxDisplay(keysignPayload)
  const displayToAddress = wasmDisplay?.receiver ?? toAddress ?? ''

  // A TRON freeze/unfreeze carries its operation as an internal memo marker
  // that the signer turns into a staking contract, so surface the staked
  // resource instead of a raw marker the chain never sees.
  const tronStaking = getTronStakingDisplay({ chain, memo })
  const memoValue = tronStaking ? tronStaking.resource : memo

  const toVaultName = useVaultNameForAddress({
    address: displayToAddress,
    chain,
  })
  const toAddressBookName = useAddressBookNameForAddress({
    address: displayToAddress,
    chain,
  })
  const toLabel = toVaultName ?? toAddressBookName ?? toAddressLabel ?? null
  const txHash = useTxHash()
  const txStatusQuery = useTxStatusQuery({
    chain,
    hash: txHash,
    lastValidBlockHeight: getKeysignLastValidBlockHeight(keysignPayload),
  })
  const receipt = txStatusQuery.data?.receipt

  const suiTxData =
    keysignPayload.signData.case === 'signSui'
      ? parseSuiTx(keysignPayload.signData.value.unsignedTxMsg)
      : null

  const rippleRawJson =
    keysignPayload.signData.case === 'signRipple'
      ? keysignPayload.signData.value.rawJson
      : null

  return (
    <>
      {suiTxData && <SignSuiDisplay data={suiTxData} />}
      {rippleRawJson !== null && <SignRippleDisplay rawJson={rippleRawJson} />}
      <Panel>
        <SeparatedByLine gap={16}>
          <HStack
            alignItems="center"
            gap={8}
            justifyContent="space-between"
            wrap="nowrap"
          >
            <RowTitle color="shy" weight="500">
              {t('from')}
            </RowTitle>
            <TxVaultSourceLabel
              name={name}
              address={
                <MiddleTruncate
                  color="textShy"
                  text={`(${address})`}
                  weight={500}
                  width={96}
                />
              }
            />
          </HStack>
          {displayToAddress && (
            <VStack gap={8}>
              <HStack
                alignItems="center"
                gap={8}
                justifyContent="space-between"
                wrap="nowrap"
              >
                <Text color="shy" weight="500">
                  {t('to')}
                </Text>
                {toLabel !== null ? (
                  <TxVaultSourceLabel
                    name={toLabel}
                    address={
                      <MiddleTruncate
                        color="textShy"
                        text={`(${displayToAddress})`}
                        weight={500}
                        width={96}
                      />
                    }
                  />
                ) : (
                  <MiddleTruncate
                    text={displayToAddress}
                    weight={500}
                    width={160}
                  />
                )}
              </HStack>
              <HStack justifyContent="flex-end">
                <AddToAddressBookButton
                  address={displayToAddress}
                  chain={chain}
                />
              </HStack>
            </VStack>
          )}
          {memoValue && (
            <TxOverviewMemo
              value={memoValue}
              chain={chain}
              withinDetailsSection
            />
          )}
          {destinationTag !== undefined && (
            <HStack justifyContent="space-between">
              <Text color="shy" weight="500">
                {t('ripple_field_destination_tag')}
              </Text>
              <Text>{destinationTag}</Text>
            </HStack>
          )}
          <HStack alignItems="center" gap={4} justifyContent="space-between">
            <Text color="shy" weight="500">
              {t('network')}
            </Text>
            <HStack alignItems="center" gap={4}>
              <ChainEntityIcon
                value={getChainLogoSrc(chain)}
                style={{ fontSize: 16 }}
              />
              <Text>{getChainDisplayName(chain)}</Text>
            </HStack>
          </HStack>
          <TxFeeRow label={receipt ? t('network_fee') : t('est_network_fee')}>
            {receipt ? (
              <TxActualFeeDisplay chain={chain} receipt={receipt} />
            ) : (
              <KeysignFeeAmount keysignPayload={keysignPayload} />
            )}
          </TxFeeRow>
        </SeparatedByLine>
      </Panel>
    </>
  )
}

const RowTitle = styled(Text)`
  flex-shrink: 0;
`
