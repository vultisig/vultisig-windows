import { Button } from '@lib/ui/buttons/Button'
import { BodyPortal } from '@lib/ui/dom/BodyPortal'
import { useKeyDown } from '@lib/ui/hooks/useKeyDown'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { OnCloseProp } from '@lib/ui/props'
import { mediaQuery } from '@lib/ui/responsive/mediaQuery'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { ReactNode, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { ReshareCosignersIcon } from './ReshareCosignersIcon'
import { ReshareOldBackupsIcon } from './ReshareOldBackupsIcon'

type ReshareWarningSheetProps = OnCloseProp & {
  onConfirm: () => void
}

const Overlay = styled.div`
  align-items: flex-end;
  backdrop-filter: blur(6px);
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  inset: 0;
  justify-content: center;
  position: fixed;
  z-index: 1;
`

const Sheet = styled(VStack)`
  background: ${getColor('background')};
  border: 1px solid ${getColor('foregroundExtra')};
  border-bottom: none;
  border-radius: 24px 24px 0 0;
  max-width: 500px;
  padding: 8px 16px 32px;
  width: 100%;

  @media ${mediaQuery.mobileDeviceAndUp} {
    border-bottom: 1px solid ${getColor('foregroundExtra')};
    border-radius: 24px;
    margin-bottom: 16px;
  }
`

const Grabber = styled.div`
  background: ${getColor('foregroundExtra')};
  border-radius: 999px;
  height: 5px;
  margin: 0 auto 16px;
  width: 36px;
`

const Header = styled(VStack)`
  padding: 16px 16px 8px;
`

const WarningCard = styled.div`
  background: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 20px;
  padding: 20px;
`

export const ReshareWarningSheet = ({
  onClose,
  onConfirm,
}: ReshareWarningSheetProps) => {
  const { t } = useTranslation()
  const isPointerDownOnBackdrop = useRef(false)

  useKeyDown('Escape', onClose)

  const warnings: { icon: ReactNode; title: string; description: string }[] = [
    {
      icon: <ReshareOldBackupsIcon />,
      title: t('reshare_warning_old_backups_title'),
      description: t('reshare_warning_old_backups_description'),
    },
    {
      icon: <ReshareCosignersIcon />,
      title: t('reshare_warning_cosigners_title'),
      description: t('reshare_warning_cosigners_description'),
    },
  ]

  return (
    <BodyPortal>
      <Overlay
        onPointerDown={({ target, currentTarget }) => {
          if (target === currentTarget) {
            isPointerDownOnBackdrop.current = true
          }
        }}
        onPointerUp={() => {
          if (isPointerDownOnBackdrop.current) {
            onClose()
          }
          isPointerDownOnBackdrop.current = false
        }}
        onPointerCancel={() => {
          isPointerDownOnBackdrop.current = false
        }}
      >
        <Sheet role="dialog" aria-modal gap={24}>
          <VStack>
            <Grabber />
            <Header gap={8}>
              <Text color="contrast" size={22} weight={500} centerHorizontally>
                {t('before_you_reshare')}
              </Text>
              <Text color="shy" size={13} weight={500} centerHorizontally>
                {t('before_you_reshare_subtitle')}
              </Text>
            </Header>
          </VStack>
          <VStack gap={12}>
            {warnings.map(({ icon, title, description }) => (
              <WarningCard key={title}>
                <HStack gap={12} alignItems="flex-start">
                  <IconWrapper color="idle" size={24}>
                    {icon}
                  </IconWrapper>
                  <VStack gap={8}>
                    <Text color="contrast" size={15} weight={500}>
                      {title}
                    </Text>
                    <Text color="shy" size={13} weight={500}>
                      {description}
                    </Text>
                  </VStack>
                </HStack>
              </WarningCard>
            ))}
          </VStack>
          <Button onClick={onConfirm}>{t('i_understand')}</Button>
        </Sheet>
      </Overlay>
    </BodyPortal>
  )
}
