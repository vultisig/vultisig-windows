type DateGroup<T> = {
  label: string
  items: T[]
}

const toDateKey = (date: Date): string =>
  `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`

const formatDateLabel = (date: Date, today: Date): string => {
  const todayKey = toDateKey(today)
  const dateKey = toDateKey(date)

  if (dateKey === todayKey) return 'Today'

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (dateKey === toDateKey(yesterday)) return 'Yesterday'

  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  })
}

type GroupByDateInput<T> = {
  items: T[]
  getTimestamp: (item: T) => string
}

export const groupByDate = <T>({
  items,
  getTimestamp,
}: GroupByDateInput<T>): DateGroup<T>[] => {
  const today = new Date()
  const groups = new Map<string, DateGroup<T>>()

  const sorted = [...items].sort(
    (a, b) =>
      new Date(getTimestamp(b)).getTime() - new Date(getTimestamp(a)).getTime()
  )

  sorted.forEach(item => {
    const date = new Date(getTimestamp(item))
    const key = toDateKey(date)

    const existing = groups.get(key)
    if (existing) {
      existing.items.push(item)
    } else {
      groups.set(key, {
        label: formatDateLabel(date, today),
        items: [item],
      })
    }
  })

  return Array.from(groups.values())
}
