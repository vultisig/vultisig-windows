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

import { InstallPluginStep, installPluginSteps } from './InstallPluginStep'

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

const completion: Partial<Record<InstallPluginStep, number>> = {
  verifierServer: 0.5,
  pluginServer: 0.7,
  install: 0.9,
}

export const InstallPluginProgressIndicator = ({
  value,
}: ValueProp<InstallPluginStep | null>) => {
  const { t } = useTranslation()

  const texts: Partial<Record<InstallPluginStep, string>> = {
    verifierServer: t('connecting_to_verifier'),
    pluginServer: t('connecting_to_plugin'),
    install: t('installing_plugin'),
  }

  return (
    <Wrapper justifyContent="center">
      <>
        {installPluginSteps.map((status, index) => {
          const isCompleted = value && installPluginSteps.indexOf(value) > index

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
            value={
              value
                ? (completion[value] ?? pendingCompletion)
                : pendingCompletion
            }
          />
        </ProgressBarWrapper>
      </>
    </Wrapper>
  )
}
