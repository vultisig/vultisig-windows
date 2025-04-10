import { toSizeUnit } from '@lib/ui/css/toSizeUnit'
import { hStack } from '@lib/ui/layout/Stack'
import styled from 'styled-components'

import { CoinSearchInput } from './CoinSearchInput'
import { coinSearchConfig } from './config'
import { SaveCoinSearch } from './SaveCoinSearch'

const Container = styled.div`
  ${hStack({
    fullWidth: true,
    alignItems: 'center',
    gap: 8,
  })}
  height: ${toSizeUnit(coinSearchConfig.height)};
`

export const CoinSearch = () => {
  return (
    <Container>
      <CoinSearchInput />
      <SaveCoinSearch />
    </Container>
  )
}
