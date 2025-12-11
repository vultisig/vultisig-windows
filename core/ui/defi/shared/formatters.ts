import { capitalizeFirstLetter } from '@lib/utils/capitalizeFirstLetter'

export const formatStatusLabel = (status?: string | null) => {
  if (!status) return null

  return status
    .split('_')
    .map(part => capitalizeFirstLetter(part))
    .join(' ')
}

export const formatDateShort = (date?: Date, locale?: string) => {
  if (!date) return null

  return date.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    year: '2-digit',
  })
}
