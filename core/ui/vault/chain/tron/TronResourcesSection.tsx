import { TronAccountResources } from '@core/chain/chains/tron/resources'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { Panel } from '@lib/ui/panel/Panel'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'

import { ActionsCard } from './ActionsCard'
import { ResourcesCard } from './ResourcesCard'
import { TronPendingUnfreezes } from './TronPendingUnfreezes'
import { useTronAccountResourcesQuery } from './useTronAccountResourcesQuery'

export const TronResourcesSection = () => {
  const query = useTronAccountResourcesQuery()

  return (
    <MatchQuery
      value={query}
      pending={() => (
        <Panel>
          <HStack justifyContent="center" fullWidth>
            <Spinner />
          </HStack>
        </Panel>
      )}
      error={error => (
        <Panel>
          <HStack justifyContent="center" fullWidth>
            <Text color="danger" size={13}>
              {extractErrorMsg(error)}
            </Text>
          </HStack>
        </Panel>
      )}
      success={(data: TronAccountResources) => (
        <VStack gap={16}>
          <ResourcesCard data={data} />
          <ActionsCard data={data} />
          <TronPendingUnfreezes entries={data.unfreezingEntries} />
        </VStack>
      )}
    />
  )
}
