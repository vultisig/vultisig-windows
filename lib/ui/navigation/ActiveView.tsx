import { getLastItem } from '@lib/utils/array/getLastItem'
import { useRef } from 'react'

import { useNavigation } from './state'
import { Views } from './Views'

type ActiveViewProps = {
  views: Views
}

export const ActiveView = ({ views }: ActiveViewProps) => {
  const [{ history }] = useNavigation()
  const viewKeyRef = useRef(0)
  const prevHistoryRef = useRef(history)

  if (history !== prevHistoryRef.current) {
    viewKeyRef.current++
    prevHistoryRef.current = history
  }

  const { id } = getLastItem(history)
  const View = views[id]

  return <View key={viewKeyRef.current} />
}
