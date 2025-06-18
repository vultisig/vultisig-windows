import { KeygenStep } from '@core/mpc/keygen/KeygenStep'
import { KeygenProgressIndicator } from '@core/ui/mpc/keygen/reshare/plugin/KeygenProgressIndicator'
import { SafeImage } from '@lib/ui/images/SafeImage'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { ValueProp } from '@lib/ui/props'
import { FC } from 'react'

export const KeygenPendingState: FC<ValueProp<KeygenStep | null>> = ({
  value,
}) => (
  <>
    <PageContent alignItems="center" scrollable>
      <VStack maxWidth={576} fullWidth>
        <SafeImage
          src={`core/images/plugin-installing.png`}
          render={props => <img alt="" {...props} style={{ width: '100%' }} />}
        />
      </VStack>
    </PageContent>
    <PageFooter alignItems="center">
      <VStack maxWidth={576} fullWidth>
        <KeygenProgressIndicator value={value} />
      </VStack>
    </PageFooter>
  </>
)
