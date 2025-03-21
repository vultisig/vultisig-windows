import { MpcServerType } from '@core/mpc/MpcServerType'
import { ValueProp } from '@lib/ui/props'
import { SVGProps } from 'react'

import { Match } from '../../../lib/ui/base/Match'
import { InternetIcon } from '../../../lib/ui/icons/InternetIcon'
import { WifiIcon } from '../../../lib/ui/icons/WifiIcon'

export const KeygenServerTypeIcon = ({
  value,
  ...props
}: SVGProps<SVGSVGElement> & ValueProp<MpcServerType>) => {
  return (
    <Match
      value={value}
      relay={() => <InternetIcon {...props} />}
      local={() => <WifiIcon {...props} />}
    />
  )
}
