import { PopupResolver } from '@core/inpage-provider/popup/view/resolver'

export const PolicySign: PopupResolver<'policySign'> = ({
  input: { message },
}) => {
  return <>{String(message)}</>
}
