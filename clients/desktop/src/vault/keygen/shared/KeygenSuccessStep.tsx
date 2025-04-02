import { StepTransition } from '@lib/ui/base/StepTransition'
import { Transition } from '@lib/ui/base/Transition'
import { TitleProp, ValueProp } from '@lib/ui/props'

import { storage } from '../../../../wailsjs/go/models'
import { PageHeader } from '../../../ui/page/PageHeader'
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle'
import { KeygenBackup } from './KeygenBackup'
import { KeygenSuccessState } from './KeygenSuccessState'
import { SaveVaultStep } from './SaveVaultStep'

export const KeygenSuccessStep = ({
  title,
  value,
}: TitleProp & ValueProp<storage.Vault>) => (
  <StepTransition
    from={({ onForward }) => (
      <SaveVaultStep title={title} value={value} onForward={onForward} />
    )}
    to={() => (
      <Transition
        delay={3000}
        from={
          <>
            <PageHeader title={<PageHeaderTitle>{title}</PageHeaderTitle>} />
            <KeygenSuccessState />
          </>
        }
        to={<KeygenBackup vault={value} />}
      />
    )}
  />
)
