import { useTranslation } from 'react-i18next'

import { CheckIcon } from '../../../../../../../lib/ui/icons/CheckIcon'
import { HStack } from '../../../../../../../lib/ui/layout/Stack'
import { Text } from '../../../../../../../lib/ui/text'
import {
  KeygenStatus,
  keygenStatuses,
  MatchKeygenSessionStatus,
} from '../../../../../../keygen/shared/MatchKeygenSessionStatus'
import {
  IconWrapper,
  Loader,
  ProgressBarWrapper,
  StyledProgressLine,
  Wrapper,
} from './SlidesLoader.styled'

const pendingCompletion = 0.25

const completion: Record<KeygenStatus, number> = {
  prepareVault: 0.5,
  ecdsa: 0.7,
  eddsa: 0.9,
}

export const SlidesLoader = () => {
  const { t } = useTranslation()

  const texts: Record<KeygenStatus, string> = {
    prepareVault: t('fastVaultSetup.preparingVault'),
    ecdsa: t('generating_ecdsa_key'),
    eddsa: t('generating_eddsa_key'),
  }

  const renderContent = (value?: KeygenStatus) => {
    return (
      <>
        {keygenStatuses.map((status, index) => {
          const isCompleted = value && keygenStatuses.indexOf(value) > index

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
    )
  }

  return (
    <Wrapper justifyContent="center">
      <MatchKeygenSessionStatus
        pending={() => renderContent()}
        active={value => renderContent(value)}
      />
    </Wrapper>
  )
}
