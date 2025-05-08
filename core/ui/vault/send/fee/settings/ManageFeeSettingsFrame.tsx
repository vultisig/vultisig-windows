import { Opener } from '@lib/ui/base/Opener'
import { SettingsIcon } from '@lib/ui/icons/SettingsIcon'
import { PageHeaderIconButton } from '@lib/ui/page/PageHeaderIconButton'
import { OnCloseProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { FailedQueryOverlay } from '@lib/ui/query/components/overlay/FailedQueryOverlay'
import { PendingQueryOverlay } from '@lib/ui/query/components/overlay/PendingQueryOverlay'
import { StrictText } from '@lib/ui/text'
import { t } from 'i18next'

import { useSendChainSpecificQuery } from '../../queries/useSendChainSpecificQuery'
import { SendChainSpecificValueProvider } from '../SendChainSpecificProvider'

type ManageFeeSettingsFrameProps = {
  render: (props: OnCloseProp) => React.ReactNode
}

export const ManageFeeSettingsFrame = ({
  render,
}: ManageFeeSettingsFrameProps) => {
  const chainSpecificQuery = useSendChainSpecificQuery()

  return (
    <Opener
      renderOpener={({ onOpen }) => (
        <PageHeaderIconButton onClick={onOpen} icon={<SettingsIcon />} />
      )}
      renderContent={({ onClose }) => (
        <MatchQuery
          value={chainSpecificQuery}
          success={value => (
            <SendChainSpecificValueProvider value={value}>
              {render({ onClose })}
            </SendChainSpecificValueProvider>
          )}
          pending={() => (
            <PendingQueryOverlay
              onClose={onClose}
              title={<StrictText>{t('loading')}</StrictText>}
            />
          )}
          error={() => (
            <FailedQueryOverlay
              title={<StrictText>{t('failed_to_load')}</StrictText>}
              onClose={onClose}
              closeText={t('close')}
            />
          )}
        />
      )}
    />
  )
}
