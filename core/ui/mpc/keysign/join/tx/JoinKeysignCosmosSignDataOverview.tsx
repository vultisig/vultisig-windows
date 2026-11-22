import { getChainDisplayName } from '@core/ui/chain/metadata/getChainDisplayName'
import { BlockaidTxScan } from '@core/ui/chain/security/blockaid/tx/BlockaidTxScan'
import { TxOverviewMemo } from '@core/ui/chain/tx/TxOverviewMemo'
import { KeysignFeeAmount } from '@core/ui/mpc/keysign/tx/FeeAmount'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { ValueProp } from '@lib/ui/props'
import { getResolvedQuery } from '@lib/ui/query/Query'
import { fromCommCoin } from '@vultisig/core-mpc/types/utils/commCoin'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { assertField } from '@vultisig/lib-utils/record/assertField'
import { useTranslation } from 'react-i18next'

import { CosmosSignDataTransfers } from '../../tx/components/CosmosSignDataTransfers'
import { SignAminoDisplay } from '../../tx/components/SignAminoDisplay'
import { SignDirectDisplay } from '../../tx/components/SignDirectDisplay'
import { getCosmosSignDataReview } from '../../tx/cosmos/getCosmosSignDataReview'

/**
 * Joiner verify view for Cosmos sign data that a single amount can't describe:
 * several transfers, or messages that aren't summarized. Every transfer and
 * the memo are read from the signed data, matching the initiator's popup.
 */
export const JoinKeysignCosmosSignDataOverview = ({
  value,
}: ValueProp<KeysignPayload>) => {
  const { t } = useTranslation()
  const review = shouldBePresent(
    getCosmosSignDataReview(value),
    'cosmosSignDataReview'
  )
  const coin = shouldBePresent(fromCommCoin(assertField(value, 'coin')))

  return (
    <>
      <BlockaidTxScan keysignPayloadQuery={getResolvedQuery(value)} />
      <List>
        <ListItem description={coin.address} title={t('from')} />
        <ListItem
          description={getChainDisplayName(coin.chain)}
          title={t('network')}
        />
        <ListItem
          description={<KeysignFeeAmount keysignPayload={value} />}
          title={t('est_network_fee')}
        />
      </List>
      <CosmosSignDataTransfers value={review} />
      {review.memo ? (
        <List>
          <ListItem
            title={<TxOverviewMemo value={review.memo} chain={coin.chain} />}
          />
        </List>
      ) : null}
      {value.signData.case === 'signAmino' && (
        <SignAminoDisplay signAmino={value.signData.value} />
      )}
      {value.signData.case === 'signDirect' && (
        <SignDirectDisplay signDirect={value.signData.value} />
      )}
    </>
  )
}
