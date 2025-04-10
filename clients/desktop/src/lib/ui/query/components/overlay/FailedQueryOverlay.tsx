import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { OnCloseProp, TitleProp } from '@lib/ui/props'

import { BodyPortal } from '../../../dom/BodyPortal'
import { Backdrop } from '../../../modal/Backdrop'
import { QueryOverlayContent } from './QueryOverlayContent'

type FailedQueryOverlayProps = TitleProp &
  OnCloseProp & {
    closeText?: string
  }

export const FailedQueryOverlay: React.FC<FailedQueryOverlayProps> = ({
  title,
  onClose,
  closeText = 'Close',
}) => (
  <BodyPortal>
    <Backdrop onClose={onClose}>
      <QueryOverlayContent>
        <VStack alignItems="center" gap={8}>
          {title}
          <Button onClick={onClose}>{closeText}</Button>
        </VStack>
      </QueryOverlayContent>
    </Backdrop>
  </BodyPortal>
)
