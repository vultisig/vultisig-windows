import { KeygenStep, keygenSteps } from '@core/mpc/keygen/KeygenStep'
import { CheckIcon } from '@lib/ui/icons/CheckIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import {
  IconWrapper,
  Loader,
  ProgressBarWrapper,
  StyledProgressLine,
  Wrapper,
} from './SlidesLoader.styled'

const pendingCompletion = 0.25

const completion: Record<KeygenStep, number> = {
  prepareVault: 0.5,
  ecdsa: 0.7,
  eddsa: 0.9,
}

export const SlidesLoader = ({ value }: ValueProp<KeygenStep | null>) => {
  const { t } = useTranslation()

  const texts: Record<KeygenStep, string> = {
    prepareVault: t('fastVaultSetup.preparingVault'),
    ecdsa: t('generating_ecdsa_key'),
    eddsa: t('generating_eddsa_key'),
  }

  return (
    <Wrapper justifyContent="center">
      <>
        {keygenSteps.map((status, index) => {
          const isCompleted = value && keygenSteps.indexOf(value) > index

          const text = texts[status]

          return (
            <HStack gap={8} key={index} alignItems="center">
              {isCompleted ? (
                <IconWrapper>
                  <CheckIcon />
                </IconWrapper>
              ) : (
                <Loader />
              )}
              <Text color="shy">{text}</Text>
            </HStack>
          )
        })}
        <ProgressBarWrapper>
          <StyledProgressLine
            value={value ? completion[value] : pendingCompletion}
          />
        </ProgressBarWrapper>
      </>
    </Wrapper>
  )
}
