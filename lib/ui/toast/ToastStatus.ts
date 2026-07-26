export const toastStatuses = ['success', 'warning', 'error'] as const

/**
 * Outcome a toast reports, deciding its icon and accent color.
 */
export type ToastStatus = (typeof toastStatuses)[number]
