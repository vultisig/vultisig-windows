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
  const prevHistoryLengthRef = useRef(history.length)
  const prevViewIdRef = useRef(getLastItem(history).id)

  const currentView = getLastItem(history)
  if (
    prevHistoryLengthRef.current !== history.length ||
    prevViewIdRef.current !== currentView.id
  ) {
    viewKeyRef.current++
    prevHistoryLengthRef.current = history.length
    prevViewIdRef.current = currentView.id
  }

  const { id } = currentView
  const View = views[id]

  return <View key={viewKeyRef.current} />
}
