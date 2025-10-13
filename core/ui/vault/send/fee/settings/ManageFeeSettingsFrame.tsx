import { Opener } from '@lib/ui/base/Opener'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { FuelIcon } from '@lib/ui/icons/FuelIcon'
import { OnCloseProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { FailedQueryOverlay } from '@lib/ui/query/components/overlay/FailedQueryOverlay'
import { PendingQueryOverlay } from '@lib/ui/query/components/overlay/PendingQueryOverlay'
import { StrictText } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { useSendFeeQuoteQuery } from '../../queries/useSendFeeQuoteQuery'

type ManageFeeSettingsFrameProps = {
  render: (props: OnCloseProp) => React.ReactNode
}

export const ManageFeeSettingsFrame = ({
  render,
}: ManageFeeSettingsFrameProps) => {
  const { t } = useTranslation()
  const feeQuoteQuery = useSendFeeQuoteQuery()

  return (
    <Opener
      renderOpener={({ onOpen }) => (
        <IconButton onClick={() => onOpen()}>
          <FuelIcon />
        </IconButton>
      )}
      renderContent={({ onClose }) => (
        <MatchQuery
          value={feeQuoteQuery}
          success={() => render({ onClose })}
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
