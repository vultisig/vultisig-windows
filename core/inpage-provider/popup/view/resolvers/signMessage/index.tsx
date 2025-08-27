import { PopupResolver } from '@core/inpage-provider/popup/view/resolver'
import { Text } from '@lib/ui/text'

import { PopupDeadEnd } from '../../flow/PopupDeadEnd'

export const SignMessage: PopupResolver<'signMessage'> = ({
  input,
  context,
}) => {
  return (
    <PopupDeadEnd>
      <Text>A view for testing Popup authorization</Text>
      <pre>{JSON.stringify(input, null, 2)}</pre>
      <pre>{JSON.stringify(context, null, 2)}</pre>
    </PopupDeadEnd>
  )
}
