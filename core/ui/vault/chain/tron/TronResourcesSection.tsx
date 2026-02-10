import { TronAccountResources } from '@core/chain/chains/tron/resources'
import { HStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { Panel } from '@lib/ui/panel/Panel'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useState } from 'react'

import { ResourcesCard } from './ResourcesCard'
import { TronResourcesInfoModal } from './TronResourcesInfoModal'
import { useTronAccountResourcesQuery } from './useTronAccountResourcesQuery'

export const TronResourcesSection = () => {
  const query = useTronAccountResourcesQuery()
  const [isInfoOpen, setIsInfoOpen] = useState(false)

  return (
    <>
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
          <ResourcesCard data={data} onInfoPress={() => setIsInfoOpen(true)} />
        )}
      />
      {isInfoOpen && (
        <TronResourcesInfoModal onClose={() => setIsInfoOpen(false)} />
      )}
    </>
  )
}
