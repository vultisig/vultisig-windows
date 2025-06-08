import { recordMap } from '@lib/utils/record/recordMap'
import { sortRecordKeysAlphabetically } from '@lib/utils/record/sortRecordKeysAlphabetically'
import { execSync } from 'child_process'

import { Chain } from '../Chain'
import { chainTokens } from '../coin/chainTokens'
import { KnownCoin } from '../coin/Coin'

const main = () => {
  const sorted = sortRecordKeysAlphabetically(
    recordMap(chainTokens as Record<Chain, KnownCoin[]>, tokens =>
      [...tokens].sort((a, b) => a.id.localeCompare(b.id))
    )
  )

  const output = JSON.stringify(sorted, null, 2)

  console.log(output)

  execSync('pbcopy', { input: output })
}

main()
