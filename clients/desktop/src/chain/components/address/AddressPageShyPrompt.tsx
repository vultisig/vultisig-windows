import { IconButton } from '@lib/ui/buttons/IconButton'
import { QrCodeIcon } from '@lib/ui/icons/QrCodeIcon'
import { ValueProp } from '@lib/ui/props'
import { Link } from 'react-router-dom'

import { makeAppPath } from '../../../navigation'

export const AddressPageShyPrompt = ({ value }: ValueProp<string>) => {
  return (
    <Link to={makeAppPath('address', { address: value })}>
      <IconButton as="div" title="Address QR code" icon={<QrCodeIcon />} />
    </Link>
  )
}
