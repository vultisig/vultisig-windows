import { KeysignChainSpecific } from '@core/mpc/keysign/chainSpecific/KeysignChainSpecific'
import { Skeleton } from '@lib/ui/loaders/Skeleton'
import { ChildrenProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'
import { StrictText } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { useSendChainSpecificQuery } from '../queries/useSendChainSpecificQuery'

export const {
  useValue: useSendChainSpecific,
  provider: SendChainSpecificValueProvider,
} = getValueProviderSetup<KeysignChainSpecific>('SendChainSpecific')

export const SendChainSpecificProvider: React.FC<ChildrenProp> = ({
  children,
}) => {
  const chainSpecificQuery = useSendChainSpecificQuery()
  const { t } = useTranslation()

  return (
    <MatchQuery
      value={chainSpecificQuery}
      pending={() => <Skeleton width="88px" height="12px" />}
      error={() => <StrictText>{t('failed_to_load')}</StrictText>}
      success={value => (
        <SendChainSpecificValueProvider value={value}>
          {children}
        </SendChainSpecificValueProvider>
      )}
    />
  )
}
