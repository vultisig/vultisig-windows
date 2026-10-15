import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { centerContent } from '@lib/ui/css/centerContent'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { useHorizontalWheelPaging } from '@lib/ui/hooks/useHorizontalWheelPaging'
import { useKeyDown } from '@lib/ui/hooks/useKeyDown'
import { ArrowLeftRightIcon } from '@lib/ui/icons/ArrowLeftRightIcon'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const bottomNavigationClearance = 78
const arrowSize = 10

type HomeSwipeHintOverlayProps = {
  onDismiss: () => void
  /** A swipe on the dim: `1` towards the next tab, `-1` towards the previous. */
  onSwipe: (direction: 1 | -1) => void
}

/** The swipe hint's dim and bubble, pointing down at the bottom tabs. */
export const HomeSwipeHintOverlay = ({
  onDismiss,
  onSwipe,
}: HomeSwipeHintOverlayProps) => {
  const { t } = useTranslation()
  const wheelPagingRef = useHorizontalWheelPaging({ onPage: onSwipe })
  useKeyDown('Escape', onDismiss)

  return (
    <Dim ref={wheelPagingRef} onClick={onDismiss} data-testid="home-swipe-hint">
      <Bubble
        role="dialog"
        aria-modal="true"
        aria-labelledby="home-swipe-hint-title"
        onClick={event => event.stopPropagation()}
      >
        <IconBadge aria-hidden>
          <ArrowLeftRightIcon />
        </IconBadge>
        <Body>
          <Text
            id="home-swipe-hint-title"
            size={14}
            weight={500}
            color="contrast"
          >
            {t('home_swipe_hint_title')}
          </Text>
          <Text size={12} color="shy">
            {t('home_swipe_hint_description')}
          </Text>
          <GotItButton onClick={onDismiss}>
            <Text size={13} weight={500} color="primaryAlt">
              {t('got_it')}
            </Text>
          </GotItButton>
        </Body>
      </Bubble>
    </Dim>
  )
}

const Dim = styled.div`
  position: fixed;
  inset: 0;
  z-index: 40;
  background: rgba(0, 0, 0, 0.5);
`

const Bubble = styled.div`
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: ${bottomNavigationClearance}px;
  max-width: 300px;
  margin: 0 auto;
  display: flex;
  gap: 12px;
  padding: 12px;
  ${borderRadius.md};
  background: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};

  &::after {
    content: '';
    position: absolute;
    left: 25%;
    bottom: -${arrowSize}px;
    transform: translateX(-50%);
    border: ${arrowSize / 2}px solid transparent;
    border-top: ${arrowSize}px solid ${getColor('foreground')};
  }
`

const IconBadge = styled.div`
  flex-shrink: 0;
  ${sameDimensions(36)};
  ${centerContent};
  ${borderRadius.sm};
  font-size: 18px;
  color: ${getColor('primaryAlt')};
  background: ${getColor('foregroundExtra')};
`

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  flex: 1;
`

const GotItButton = styled(UnstyledButton)`
  align-self: flex-end;
  margin-top: 4px;
`
