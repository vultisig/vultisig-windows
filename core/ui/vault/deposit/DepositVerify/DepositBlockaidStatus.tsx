import { CheckmarkIcon } from '@lib/ui/icons/CheckmarkIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { BlockaidLogo } from '../../../chain/security/blockaid/BlockaidLogo'
import { useIsBlockaidEnabledQuery } from '../../../storage/blockaid'

const Container = styled(HStack)`
  justify-content: center;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
`

const SuccessIconWrapper = styled.div`
  color: ${getColor('success')};
  display: inline-flex;
  width: 20px;
  height: 20px;
  align-items: center;
  justify-content: center;
  font-size: 20px;
`

const LogoWrapper = styled.div`
  display: flex;
  align-items: center;
  line-height: 1;
  height: 10px;
  width: 55px;

  svg {
    width: 55px;
    height: 10px;
  }
`

/** The Blockaid attribution the DeFi overviews show while Blockaid is on. */
export const DepositBlockaidStatus = () => {
  const { t } = useTranslation()
  const { data: isBlockaidEnabled } = useIsBlockaidEnabledQuery()

  if (!isBlockaidEnabled) {
    return null
  }

  return (
    <Container>
      <SuccessIconWrapper>
        <CheckmarkIcon />
      </SuccessIconWrapper>
      <Text as="span" variant="footnote" color="shy">
        {t('transaction_scanned_by', { provider: '' }).trim()}
      </Text>
      <LogoWrapper>
        <BlockaidLogo />
      </LogoWrapper>
    </Container>
  )
}
