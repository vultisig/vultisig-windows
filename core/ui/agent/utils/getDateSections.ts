type DateSection<T> = {
  key: string
  label: string
  items: T[]
}

type DateSectionLabels = {
  today: string
  yesterday: string
  locale: string
}

type GetDateSectionsInput<T> = {
  items: T[]
  getTimestamp: (item: T) => string
  labels: DateSectionLabels
  now?: Date
}

type GetDateSectionsResult<T> = {
  sections: DateSection<T>[]
  showLabels: boolean
}

const toDateKey = (date: Date): string =>
  `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`

const getSafeDate = (timestamp: string, fallback: Date): Date => {
  const parsed = new Date(timestamp)

  return Number.isNaN(parsed.getTime()) ? fallback : parsed
}

const formatDateLabel = ({
  date,
  today,
  labels,
}: {
  date: Date
  today: Date
  labels: DateSectionLabels
}): string => {
  const todayKey = toDateKey(today)
  const dateKey = toDateKey(date)

  if (dateKey === todayKey) return labels.today

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (dateKey === toDateKey(yesterday)) return labels.yesterday

  return date.toLocaleDateString(labels.locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Groups items by local calendar day while preserving their existing order.
 * Invalid timestamps fall back to `now` so chat content still renders safely.
 * Labels are hidden for same-day "today" conversations to avoid extra noise.
 */
export const getDateSections = <T>({
  items,
  getTimestamp,
  labels,
  now = new Date(),
}: GetDateSectionsInput<T>): GetDateSectionsResult<T> => {
  const sections: DateSection<T>[] = []

  items.forEach(item => {
    const date = getSafeDate(getTimestamp(item), now)
    const key = toDateKey(date)
    const lastSection = sections[sections.length - 1]

    if (lastSection?.key === key) {
      lastSection.items.push(item)
      return
    }

    sections.push({
      key,
      label: formatDateLabel({ date, today: now, labels }),
      items: [item],
    })
  })

  const todayKey = toDateKey(now)
  const showLabels =
    sections.length > 1 || (sections[0] != null && sections[0].key !== todayKey)

  return { sections, showLabels }
}
