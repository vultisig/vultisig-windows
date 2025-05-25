import { useAppNavigate } from '@clients/extension/src/navigation/hooks/useAppNavigate'
import { UNAUTHENTICATED_VIEW_IDS } from '@clients/extension/src/navigation/views'
import { useCurrentVaultId } from '@core/ui/storage/currentVaultId'
import { getLastItem } from '@lib/utils/array/getLastItem'

import { useNavigation } from './state'
import { Views } from './Views'

type ActiveViewProps = {
  views: Views
}

export const ActiveView = ({ views }: ActiveViewProps) => {
  const [{ history }] = useNavigation()
  const navigate = useAppNavigate()
  const hasExistingVault = useCurrentVaultId()
  const { id } = getLastItem(history)

  if (!hasExistingVault && !UNAUTHENTICATED_VIEW_IDS.includes(id)) {
    navigate({ id: 'newVault' })
    return
  }

  const View = views[id]

  return <View />
}
