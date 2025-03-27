import { KeysignChainSpecific } from '@core/mpc/keysign/chainSpecific/KeysignChainSpecific'
import { ChildrenProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useTranslation } from 'react-i18next'

import { Spinner } from '../../../lib/ui/loaders/Spinner'
import { getValueProviderSetup } from '../../../lib/ui/state/getValueProviderSetup'
import { StrictText } from '../../../lib/ui/text'
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
      pending={() => <Spinner />}
      error={() => <StrictText>{t('failed_to_load')}</StrictText>}
      success={value => (
        <SendChainSpecificValueProvider value={value}>
          {children}
        </SendChainSpecificValueProvider>
      )}
    />
  )
}
