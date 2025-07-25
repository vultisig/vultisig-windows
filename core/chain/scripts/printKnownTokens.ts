import { recordMap } from '@lib/utils/record/recordMap'
import { sortRecordKeysAlphabetically } from '@lib/utils/record/sortRecordKeysAlphabetically'
import { execSync } from 'child_process'

import { knownTokens } from '../coin/knownTokens'

const main = () => {
  const sorted = sortRecordKeysAlphabetically(
    recordMap(knownTokens, tokens =>
      [...tokens].sort((a, b) => a.ticker.localeCompare(b.ticker))
    )
  )

  const output = JSON.stringify(sorted, null, 2)

  execSync('pbcopy', { input: output })
}

main()
