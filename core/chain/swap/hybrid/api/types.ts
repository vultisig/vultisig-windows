export type KyberSwapRouteParams = {
  tokenIn: string
  tokenOut: string
  amountIn: string
  saveGas: boolean
  gasInclude: boolean
  slippageTolerance: number
  source?: string
  referral?: string
}

export type KyberSwapRouteResponse = {
  code: number
  message: string
  data: {
    routeSummary: any
    routerAddress: string
  }
  requestId: string
}

export type KyberSwapBuildResponse = {
  code: number
  data: {
    amountOut: string
    data: string
    gas: string
    routerAddress: string
    gasPrice?: string
  }
}
