type DateGroup<T> = {
  label: string
  items: T[]
}

type DateGroupLabels = {
  today: string
  yesterday: string
}

const toDateKey = (date: Date): string =>
  `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`

type FormatDateLabelInput = {
  date: Date
  today: Date
  labels: DateGroupLabels
}

const formatDateLabel = ({
  date,
  today,
  labels,
}: FormatDateLabelInput): string => {
  const todayKey = toDateKey(today)
  const dateKey = toDateKey(date)

  if (dateKey === todayKey) return labels.today

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (dateKey === toDateKey(yesterday)) return labels.yesterday

  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  })
}

type GroupByDateInput<T> = {
  items: T[]
  getTimestamp: (item: T) => string
  labels: DateGroupLabels
}

export const groupByDate = <T>({
  items,
  getTimestamp,
  labels,
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
        label: formatDateLabel({ date, today, labels }),
        items: [item],
      })
    }
  })

  return Array.from(groups.values())
}
