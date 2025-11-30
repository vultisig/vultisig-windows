import { MatchRecordUnion } from '@lib/ui/base/MatchRecordUnion'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'

import { ParsedDeeplink } from '../queries/useParseDeeplinkQuery'
import { ParseDeeplinkStep } from './ParseDeeplinkStep'
import { ProcessNewVault } from './ProcessNewVault'
import { ProcessSignTransaction } from './ProcessSignTransaction'

export const DeeplinkPage = () => {
  return (
    <ValueTransfer<ParsedDeeplink>
      from={({ onFinish }) => <ParseDeeplinkStep onFinish={onFinish} />}
      to={({ value }) => (
        <MatchRecordUnion
          value={value}
          handlers={{
            newVault: data => <ProcessNewVault value={data} />,
            signTransaction: data => <ProcessSignTransaction value={data} />,
          }}
        />
      )}
    />
  )
}
