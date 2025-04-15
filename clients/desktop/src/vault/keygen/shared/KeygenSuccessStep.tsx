import { Vault } from '@core/ui/vault/Vault'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { Transition } from '@lib/ui/base/Transition'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { TitleProp, ValueProp } from '@lib/ui/props'

import { KeygenBackup } from './KeygenBackup'
import { KeygenSuccessState } from './KeygenSuccessState'
import { SaveVaultStep } from './SaveVaultStep'

export const KeygenSuccessStep = ({
  title,
  value,
}: TitleProp & ValueProp<Vault>) => (
  <StepTransition
    from={({ onFinish }) => (
      <SaveVaultStep title={title} value={value} onFinish={onFinish} />
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
