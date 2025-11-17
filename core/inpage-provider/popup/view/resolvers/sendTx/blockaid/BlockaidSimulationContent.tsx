import { Chain } from '@core/chain/Chain'
import { BlockaidEvmSimulationInfo } from '@core/chain/security/blockaid/tx/simulation/core'
import { getKeysignChain } from '@core/mpc/keysign/utils/getKeysignChain'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { ListItem } from '@lib/ui/list/item'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Query } from '@lib/ui/query/Query'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { formatUnits } from 'ethers'
import { useTranslation } from 'react-i18next'

import { MemoSection } from '../components/MemoSection'
import {
  NetworkFeeSection,
  NetworkFeeSectionProps,
} from '../components/NetworkFeeSection'
import { BlockaidSwapDisplay } from './BlockaidSwapDisplay'
import { BlockaidTransferDisplay } from './BlockaidTransferDisplay'

type BlockaidSimulationContentProps = {
  blockaidSimulationQuery: Query<BlockaidEvmSimulationInfo, unknown>
  keysignPayload: KeysignPayload
  address: string
  chain: Chain
  networkFeeProps: NetworkFeeSectionProps
}

export const BlockaidSimulationContent = ({
  blockaidSimulationQuery,
  keysignPayload,
  address,
  chain,
  networkFeeProps,
}: BlockaidSimulationContentProps) => {
  const { t } = useTranslation()

  return (
    <MatchQuery
      value={blockaidSimulationQuery}
      success={blockaidEvmSimulationInfo => {
        if (!blockaidEvmSimulationInfo) {
          return (
            <>
              <ListItem description={address} title={t('from')} />
              {keysignPayload.toAddress && (
                <ListItem
                  description={keysignPayload.toAddress}
                  title={t('to')}
                />
              )}
              {keysignPayload.toAmount && (
                <ListItem
                  description={`${formatUnits(
                    keysignPayload.toAmount,
                    keysignPayload.coin?.decimals
                  )} ${keysignPayload.coin?.ticker}`}
                  title={t('amount')}
                />
              )}
              <ListItem
                description={getKeysignChain(keysignPayload)}
                title={t('network')}
              />
              <MemoSection memo={keysignPayload.memo} chain={chain} />
              <NetworkFeeSection {...networkFeeProps} />
            </>
          )
        }

        return matchRecordUnion(blockaidEvmSimulationInfo, {
          swap: swap => (
            <BlockaidSwapDisplay
              swap={swap}
              memo={keysignPayload.memo}
              chain={chain}
              networkFeeProps={networkFeeProps}
            />
          ),
          transfer: transfer => (
            <BlockaidTransferDisplay
              transfer={transfer}
              fromAddress={address}
              toAddress={keysignPayload.toAddress}
              memo={keysignPayload.memo}
              chain={chain}
              networkFeeProps={networkFeeProps}
            />
          ),
        })
      }}
      error={() => null}
      pending={() => null}
      inactive={() => null}
    />
  )
}
