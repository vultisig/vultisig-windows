import { KeygenStep, keygenSteps } from '@core/mpc/keygen/KeygenStep'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { ProgressLine } from '@lib/ui/flow/ProgressLine'
import { CheckIcon } from '@lib/ui/icons/CheckIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const Wrapper = styled(VStack)`
  overflow-y: hidden;
  position: relative;
  ${borderRadius.m};
  border: 1px solid ${getColor('foregroundExtra')};
  padding: 28px 36px;
  background-color: ${getColor('foreground')};
  gap: 24px;
  width: 100%;
`

const Loader = styled(Spinner)`
  font-size: 20px;
`

const ProgressBarWrapper = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
`

const StyledProgressLine = styled(ProgressLine)`
  height: 4px;
`

const IconWrapper = styled(VStack)`
  color: ${getColor('primary')};
`

const pendingCompletion = 0.25

const completion: Record<KeygenStep, number> = {
  prepareVault: 0.5,
  ecdsa: 0.7,
  eddsa: 0.9,
}

export const KeygenProgressIndicator = ({
  value,
}: ValueProp<KeygenStep | null>) => {
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
