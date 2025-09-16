import { SendChainSpecificValueProvider } from '@core/ui/vault/send/fee/SendChainSpecificProvider'
import { useSendChainSpecificQuery } from '@core/ui/vault/send/queries/useSendChainSpecificQuery'
import { Opener } from '@lib/ui/base/Opener'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { FuelIcon } from '@lib/ui/icons/FuelIcon'
import { OnCloseProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { FailedQueryOverlay } from '@lib/ui/query/components/overlay/FailedQueryOverlay'
import { PendingQueryOverlay } from '@lib/ui/query/components/overlay/PendingQueryOverlay'
import { StrictText } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

type ManageFeeSettingsFrameProps = {
  render: (props: OnCloseProp) => React.ReactNode
}

export const ManageFeeSettingsFrame = ({
  render,
}: ManageFeeSettingsFrameProps) => {
  const { t } = useTranslation()
  const chainSpecificQuery = useSendChainSpecificQuery()

  return (
    <Opener
      renderOpener={({ onOpen }) => (
        <IconButton onClick={() => onOpen()}>
          <FuelIcon />
        </IconButton>
      )}
      renderContent={({ onClose }) => (
        <MatchQuery
          value={chainSpecificQuery}
          success={value => {
            return (
              <SendChainSpecificValueProvider value={value}>
                {render({ onClose })}
              </SendChainSpecificValueProvider>
            )
          }}
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
