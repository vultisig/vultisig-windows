import { IconButton } from '@lib/ui/buttons/IconButton'
import { QrCodeIcon } from '@lib/ui/icons/QrCodeIcon'
import { ValueProp } from '@lib/ui/props'

import { useCoreNavigate } from '../../../navigation/hooks/useCoreNavigate'

export const AddressPageShyPrompt = ({ value }: ValueProp<string>) => {
  const navigate = useCoreNavigate()

  return (
    <IconButton
      as="div"
      title="Address QR code"
      icon={<QrCodeIcon />}
      onClick={() => navigate({ id: 'address', state: { address: value } })}
    />
  )
}
