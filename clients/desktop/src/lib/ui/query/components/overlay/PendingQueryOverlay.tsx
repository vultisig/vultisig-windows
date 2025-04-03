import { VStack } from '@lib/ui/layout/Stack'
import { OnCloseProp, TitleProp } from '@lib/ui/props'

import { BodyPortal } from '../../../dom/BodyPortal'
import { Spinner } from '../../../loaders/Spinner'
import { Backdrop } from '../../../modal/Backdrop'
import { QueryOverlayContent } from './QueryOverlayContent'

export const PendingQueryOverlay: React.FC<TitleProp & OnCloseProp> = ({
  title,
  onClose,
}) => (
  <BodyPortal>
    <Backdrop onClose={onClose}>
      <QueryOverlayContent>
        <VStack alignItems="center" gap={8}>
          <Spinner />
          {title}
        </VStack>
      </QueryOverlayContent>
    </Backdrop>
  </BodyPortal>
)
