import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type CoachmarkProps = {
  title: string
  description: string
  onClose: () => void
  className?: string
}

export const Coachmark = ({
  title,
  description,
  onClose,
  className,
}: CoachmarkProps) => {
  const { t } = useTranslation()
  const titleId = useId()
  const descriptionId = useId()

  return (
    <Container
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className={className}
      role="dialog"
      aria-modal="false"
    >
      <Background aria-hidden="true" />
      <Content>
        <TitleRow alignItems="start" gap={8}>
          <Text as="span" id={titleId} variant="bodyM" color="reversed">
            {title}
          </Text>
          <CloseButton aria-label={t('close')} onClick={onClose}>
            <CloseIconSvg viewBox="0 0 12 12" aria-hidden="true">
              <path d="M0.300293 11.6895C0.178223 11.5674 0.0976562 11.4258 0.0585938 11.2646C0.0195312 11.1035 0.0195312 10.9424 0.0585938 10.7812C0.0976562 10.6201 0.175781 10.481 0.292969 10.3638L4.6582 5.99121L0.292969 1.62598C0.175781 1.51367 0.0976562 1.37695 0.0585938 1.21582C0.0244141 1.0498 0.0244141 0.88623 0.0585938 0.725098C0.0976562 0.563965 0.178223 0.422363 0.300293 0.300293C0.41748 0.178223 0.556641 0.0976562 0.717773 0.0585938C0.883789 0.0195313 1.04736 0.0195313 1.2085 0.0585938C1.37451 0.0976562 1.51611 0.175781 1.6333 0.292969L5.99854 4.6582L10.3638 0.292969C10.481 0.175781 10.6201 0.0976562 10.7812 0.0585938C10.9424 0.0195313 11.1035 0.0195313 11.2646 0.0585938C11.4258 0.0976562 11.5674 0.180664 11.6895 0.307617C11.8115 0.424805 11.8921 0.563965 11.9312 0.725098C11.9751 0.88623 11.9751 1.04736 11.9312 1.2085C11.8921 1.36963 11.814 1.50879 11.6968 1.62598L7.33887 5.99121L11.6968 10.3638C11.814 10.481 11.8921 10.6201 11.9312 10.7812C11.9702 10.9424 11.9702 11.1035 11.9312 11.2646C11.8921 11.4258 11.8115 11.5674 11.6895 11.6895C11.5674 11.8115 11.4258 11.8921 11.2646 11.9312C11.1035 11.9702 10.9424 11.9702 10.7812 11.9312C10.6201 11.8921 10.481 11.814 10.3638 11.6968L5.99854 7.33154L1.6333 11.6968C1.51611 11.814 1.37695 11.8921 1.21582 11.9312C1.05469 11.9702 0.891113 11.9702 0.725098 11.9312C0.563965 11.8921 0.422363 11.8115 0.300293 11.6895Z" />
            </CloseIconSvg>
          </CloseButton>
        </TitleRow>
        <Description id={descriptionId} variant="footnote" color="reversed">
          {description}
        </Description>
      </Content>
    </Container>
  )
}

const Container = styled(VStack)`
  position: relative;
  width: 196px;
  height: 104px;
  color: ${({ theme }) => theme.colors.contrast.withAlpha(0.97).toCssValue()};
`

const Background = styled.div`
  position: absolute;
  inset: 0;
  background: currentColor;
  backdrop-filter: blur(65px);
  clip-path: path(
    'M16 0H190C193.314 0 196 2.686 196 6V68C196 77.941 187.941 86 178 86H175.5C172.9 86 170.493 87.125 168.831 89.086L163.4 94.248C161.541 96.015 158.459 96.015 156.6 94.248L151.169 89.086C149.507 87.125 147.1 86 144.5 86H16C7.163 86 0 78.837 0 70V16C0 7.163 7.163 0 16 0Z'
  );
  filter: drop-shadow(
    0 10px 30px
      ${({ theme }) => theme.colors.overlay.withAlpha(0.2).toCssValue()}
  );
`

const Content = styled(VStack)`
  position: relative;
  padding-top: 12px;
  padding-right: 16px;
  padding-bottom: 28px;
  padding-left: 16px;
`

const TitleRow = styled(HStack)`
  width: 100%;
  padding-right: 28px;
`

const CloseButton = styled(UnstyledButton)`
  position: absolute;
  top: 14px;
  right: 16px;
  color: ${getColor('buttonTextDisabled')};
  font-size: 12px;
  line-height: 12px;
  width: 12px;
  height: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:focus,
  &:not(:focus-visible) {
    outline: none;
    box-shadow: none;
  }

  &:focus-visible {
    outline: 2px solid ${getColor('foregroundSuper')};
    outline-offset: 4px;
    border-radius: 4px;
  }
`

const CloseIconSvg = styled.svg`
  width: 1em;
  height: 1em;
  fill: currentColor;
`

const Description = styled(Text)`
  width: 100%;
  margin-top: 4px;
`
