export const feePriorities = ['low', 'normal', 'fast'] as const

export type FeePriority = (typeof feePriorities)[number]
