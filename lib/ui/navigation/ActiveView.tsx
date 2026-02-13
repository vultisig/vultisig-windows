import { getLastItem } from '@lib/utils/array/getLastItem'

import { useNavigation } from './state'
import { Views } from './Views'

type ActiveViewProps = {
  views: Views
}

export const ActiveView = ({ views }: ActiveViewProps) => {
  const [{ history }] = useNavigation()

  const currentView = getLastItem(history)
  const { id } = currentView
  const View = views[id]

  // Create a stable key for each view instance to ensure proper remounting
  // when navigating back to the same view ID with different state
  const viewKey = JSON.stringify(currentView)

  return <View key={viewKey} />
}
