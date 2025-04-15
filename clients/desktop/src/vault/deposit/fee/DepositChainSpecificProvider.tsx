import { KeysignChainSpecific } from '@core/mpc/keysign/chainSpecific/KeysignChainSpecific'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { PageContent } from '@lib/ui/page/PageContent'
import { ChildrenProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'
import { StrictText } from '@lib/ui/text'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'

import { useDepositChainSpecificQuery } from '../queries/useDepositChainSpecificQuery'

export const {
  useValue: useDepositChainSpecific,
  provider: DepositChainSpecificValueProvider,
} = getValueProviderSetup<KeysignChainSpecific>('DepositChainSpecific')

export const DepositChainSpecificProvider: React.FC<ChildrenProp> = ({
  children,
}) => {
  const chainSpecificQuery = useDepositChainSpecificQuery()

  return (
    <MatchQuery
      value={chainSpecificQuery}
      pending={() => (
        <PageContent justifyContent="center" alignItems="center">
          <Spinner size="3em" />
        </PageContent>
      )}
      error={error => <StrictText>{extractErrorMsg(error)}</StrictText>}
      success={value => (
        <DepositChainSpecificValueProvider value={value}>
          {children}
        </DepositChainSpecificValueProvider>
      )}
    />
  )
}
