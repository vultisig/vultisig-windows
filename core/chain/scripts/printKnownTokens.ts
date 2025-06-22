import { recordMap } from '@lib/utils/record/recordMap'
import { sortRecordKeysAlphabetically } from '@lib/utils/record/sortRecordKeysAlphabetically'
import { execSync } from 'child_process'

import { knownTokens } from '../coin/knownTokens'

const main = () => {
  const sorted = sortRecordKeysAlphabetically(
    recordMap(knownTokens, tokens =>
      [...tokens].sort((a, b) => a.id.localeCompare(b.id))
    )
  )

  const output = JSON.stringify(sorted, null, 2)

  console.log(output)

  execSync('pbcopy', { input: output })
}

main()
