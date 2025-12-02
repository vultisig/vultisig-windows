export const defiProtocols = ['circle'] as const

export type DefiProtocol = (typeof defiProtocols)[number]
