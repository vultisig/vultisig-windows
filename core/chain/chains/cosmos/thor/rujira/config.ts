export const rujiraGraphQlEndpoint = 'https://api.rujira.network/api/graphql'

export const rujiraStakingConfig = {
  contract: 'thor13g83nn5ef4qzqeafp0508dnvkvm0zqr3sj7eefcn5umu65gqluusrml5cr',
  bondDenom: 'ruji',
  bondDecimals: 6,
  revenueDenom: 'uusdc',
  revenueDecimals: 6,
} as const

export type RujiraStakeView = {
  stakeAmount: string
  stakeTicker: string
  rewardsAmount: string
  rewardsTicker: string
}
