import { execSync } from 'child_process'

import { chainTokens } from '../coin/chainTokens'

const main = () => {
  const sortedChainTokens = Object.entries(chainTokens)
    .sort(([chainA], [chainB]) => chainA.localeCompare(chainB))
    .reduce(
      (acc, [chain, coins]) => {
        if (coins) {
          const sortedCoins = [...coins].sort((a, b) =>
            a.id.localeCompare(b.id)
          )
          ;(acc as any)[chain] = sortedCoins
        }
        return acc
      },
      {} as typeof chainTokens
    )

  const output = JSON.stringify(sortedChainTokens, null, 2)

  console.log(output)

  execSync('pbcopy', { input: output })
}

main()
