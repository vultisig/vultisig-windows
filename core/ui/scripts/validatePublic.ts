import { EthereumL2Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { chainNativeTokens, chainTokens } from '@core/chain/coin/chainTokens'
import { getLastItem } from '@lib/utils/array/getLastItem'
import { withoutDuplicates } from '@lib/utils/array/withoutDuplicates'
import { readdir } from 'fs/promises'
import path from 'path'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

import { getCoinLogoSrc } from '../chain/coin/icon/utils/getCoinLogoSrc'
import { getChainLogoSrc } from '../chain/metadata/getChainLogoSrc'

const currentDirname = dirname(fileURLToPath(import.meta.url))

type AssertAssetsInput = {
  expected: string[]
  actual: string[]
  entity: 'coin' | 'chain'
}

const assertAssets = ({ expected, actual, entity }: AssertAssetsInput) => {
  const missing = expected.filter(logo => !actual.includes(logo))
  const unexpected = actual.filter(logo => !expected.includes(logo))

  if (missing.length > 0) {
    throw new Error(`Missing ${entity} assets: ${missing.join(', ')}`)
  }

  if (unexpected.length > 0) {
    throw new Error(`Unexpected ${entity} assets: ${unexpected.join(', ')}`)
  }
}

const main = async () => {
  const [coinFiles, chainFiles] = await Promise.all(
    ['coins', 'chains'].map(dir =>
      readdir(path.resolve(currentDirname, '../public', dir))
    )
  )

  console.log(coinFiles, chainFiles)

  const expectedCoins = withoutDuplicates(
    [
      ...Object.values(chainFeeCoin),
      ...Object.values(chainTokens).flat(),
      ...Object.values(chainNativeTokens).flat(),
    ]
      .map(coin => coin.logo)
      .filter(logo => !logo.startsWith('http'))
  )
    .map(getCoinLogoSrc)
    .map(logo => getLastItem(logo.split('/')))

  const expectedChains = Object.values(EthereumL2Chain)
    .map(getChainLogoSrc)
    .map(logo => getLastItem(logo.split('/')))

  assertAssets({
    expected: expectedCoins,
    actual: coinFiles,
    entity: 'coin',
  })

  assertAssets({
    expected: expectedChains,
    actual: chainFiles,
    entity: 'chain',
  })
}

main()
