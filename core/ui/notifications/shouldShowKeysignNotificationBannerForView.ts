const blockedViewIds = new Set(['keysign', 'joinKeysign', 'deeplink'])

/**
 * iOS shows the keysign notification banner globally on all screens.
 * We block only views where the user is already processing a transaction
 * (keysign, joinKeysign, deeplink) to avoid confusing interruptions.
 */
export const shouldShowKeysignNotificationBannerForView = (view: {
  id: string
}): boolean => !blockedViewIds.has(view.id)
