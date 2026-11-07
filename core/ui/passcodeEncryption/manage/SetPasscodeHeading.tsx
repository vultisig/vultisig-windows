import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { LockPasswordIcon } from '@lib/ui/icons/LockPasswordIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const LockIcon = styled(IconWrapper)`
  margin-bottom: 9px;
`

const Description = styled(Text)`
  max-width: 283px;
`

/** The lock icon, title and explanation above the Set Passcode fields. */
export const SetPasscodeHeading = () => {
  const { t } = useTranslation()

  return (
    <>
      <LockIcon color="primaryAccentFour" size={46}>
        <LockPasswordIcon />
      </LockIcon>
      <VStack alignItems="center" gap={14}>
        <Text centerHorizontally color="regular" variant="title3">
          {t('enter_passcode')}
        </Text>
        <Description
          centerHorizontally
          color="shyExtra"
          height={20 / 14}
          size={14}
          weight={400}
        >
          {t('set_passcode_description')}
        </Description>
      </VStack>
    </>
  )
}
