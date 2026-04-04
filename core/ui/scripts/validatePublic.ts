import { Chain, EthereumL2Chain } from '@vultisig/core-chain/Chain'
import { coins } from '@vultisig/core-chain/coin/coins'
import { thorchainNativeTokensMetadata } from '@vultisig/core-chain/coin/knownTokens/thorchain'
import { getLastItem } from '@vultisig/lib-utils/array/getLastItem'
import { withoutDuplicates } from '@vultisig/lib-utils/array/withoutDuplicates'
import { readdir } from 'fs/promises'
import path from 'path'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

import { getCoinLogoSrc } from '../chain/coin/icon/utils/getCoinLogoSrc'
import { getChainLogoSrc } from '../chain/metadata/getChainLogoSrc'

const currentDirname = dirname(fileURLToPath(import.meta.url))

type Entity = 'coin' | 'chain'

type ValidationResult = {
  entity: Entity
  missing: string[]
  unexpected: string[]
  hasIssues: boolean
}

const validateAssets = ({
  expected,
  actual,
  entity,
}: {
  expected: string[]
  actual: string[]
  entity: Entity
}): ValidationResult => {
  const missing = expected.filter(logo => !actual.includes(logo))
  const unexpected = actual.filter(logo => !expected.includes(logo))

  return {
    entity,
    missing,
    unexpected,
    hasIssues: missing.length > 0 || unexpected.length > 0,
  }
}

const printValidationSummary = (results: ValidationResult[]) => {
  const hasAnyIssues = results.some(result => result.hasIssues)

  if (!hasAnyIssues) {
    console.log('✅ All asset validations passed!')
    return
  }

  console.log('🔍 Asset Validation Results\n')
  console.log('═'.repeat(50))

  results.forEach(({ entity, missing, unexpected, hasIssues }) => {
    const emoji = hasIssues ? '❌' : '✅'
    const status = hasIssues ? 'FAILED' : 'PASSED'

    console.log(`\n${emoji} ${entity.toUpperCase()} ASSETS: ${status}`)
    console.log('─'.repeat(30))

    if (missing.length > 0) {
      console.log(`\n🚫 Missing ${entity} assets (${missing.length}):`)
      missing.forEach(asset => console.log(`   • ${asset}`))
    }

    if (unexpected.length > 0) {
      console.log(`\n⚠️  Unexpected ${entity} assets (${unexpected.length}):`)
      unexpected.forEach(asset => console.log(`   • ${asset}`))
    }

    if (!hasIssues) {
      console.log(`\n✨ All ${entity} assets are properly aligned!`)
    }
  })

  console.log('\n' + '═'.repeat(50))

  const totalIssues = results.reduce(
    (sum, result) => sum + result.missing.length + result.unexpected.length,
    0
  )

  console.log(
    `\n📊 Summary: ${totalIssues} issue(s) found across ${results.filter(r => r.hasIssues).length} asset type(s)`
  )

  if (hasAnyIssues) {
    console.log(
      '\n💡 Please resolve the above issues and run the validation again.'
    )
  }
}

const extraCoinAssets = [
  'qbtc.svg',
  'cati.svg',
  'dogs.svg',
  'hmstr.svg',
  'not.svg',
  'ston.svg',
  'tston.svg',
]

const main = async () => {
  try {
    const [coinFiles, chainFiles] = await Promise.all(
      ['coins', 'chains'].map(dir =>
        readdir(path.resolve(currentDirname, '../public', dir))
      )
    )

    const expectedCoins = withoutDuplicates(
      [...Object.values(thorchainNativeTokensMetadata), ...Object.values(coins)]
        .map(coin => coin.logo)
        .filter(logo => logo && !logo.startsWith('http'))
    )
      .map(getCoinLogoSrc)
      .map(logo => getLastItem(logo.split('/')))
      .concat(extraCoinAssets)

    const expectedChains = [...Object.values(EthereumL2Chain), Chain.MayaChain]
      .map(getChainLogoSrc)
      .map(logo => getLastItem(logo.split('/')))

    const results = [
      validateAssets({
        expected: expectedCoins,
        actual: coinFiles,
        entity: 'coin',
      }),
      validateAssets({
        expected: expectedChains,
        actual: chainFiles,
        entity: 'chain',
      }),
    ]

    printValidationSummary(results)

    // Exit with error code if any validation failed (for GitHub Actions)
    const hasFailures = results.some(result => result.hasIssues)
    if (hasFailures) {
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ Validation script failed:', error)
    process.exit(1)
  }
}

main()
