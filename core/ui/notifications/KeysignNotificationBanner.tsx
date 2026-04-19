import { LightningIcon } from '@lib/ui/icons/LightningIcon'
import { ShieldIcon } from '@lib/ui/icons/ShieldIcon'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import {
  type PointerEvent as ReactPointerEvent,
  type TransitionEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'
import styled from 'styled-components'

const autoDismissMs = 30_000
/** Figma 70608:121371 — total frame height (padding included via border-box). */
export const bannerHeightPx = 198
const bottomCornerRadiusPx = 24
const swipeDismissThresholdPx = 50

export const transitionDuration = '0.35s'
export const transitionEasing = 'cubic-bezier(0.32, 0.72, 0, 1)'

/**
 * Magic texture layer — Figma positions the raster relative to the banner
 * (width 162.12%, height 190.6%, left −31.06%, top −45.3%, opacity 0.5).
 */
const MagicPatternLayer = styled.div`
  border-radius: inherit;
  inset: 0;
  opacity: 0.5;
  overflow: hidden;
  pointer-events: none;
  position: absolute;
`

const MagicPatternImage = styled.div`
  background-image: url('/core/images/keysign-banner-magic.png');
  background-position: center center;
  background-repeat: no-repeat;
  background-size: cover;
  height: 190.6%;
  left: -31.06%;
  position: absolute;
  top: -45.3%;
  width: 162.12%;
`

const BannerRoot = styled.div<{
  $isShown: boolean
  $dragOffset: number
  $layout: 'viewport' | 'contained'
}>`
  background: linear-gradient(
    29.81deg,
    ${getColor('primaryAccentTwo')} 20.77%,
    ${getColor('primaryAccentFour')} 109.97%
  );
  border-radius: 0 0 ${bottomCornerRadiusPx}px ${bottomCornerRadiusPx}px;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: ${bannerHeightPx}px;
  overflow: hidden;
  padding: 64px 16px 24px;
  touch-action: none;
  transform: translateY(
    ${({ $isShown, $dragOffset }) => ($isShown ? `${$dragOffset}px` : '-100%')}
  );
  transition: transform ${transitionDuration} ${transitionEasing};

  ${({ $layout }) =>
    $layout === 'contained'
      ? `
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
    z-index: 1000;
  `
      : `
    flex-shrink: 0;
    position: relative;
    width: 100%;
  `}
`

const Content = styled.div`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  gap: 11px;
  min-height: 0;
  min-width: 0;
  padding: 5px 8px 0;
  position: relative;
  width: 100%;
  z-index: 1;
`

const TitleAndPill = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  gap: 11px;
  width: 100%;
`

const TitleBlock = styled.div`
  display: block;
  flex-shrink: 0;
  text-align: center;
  width: 100%;
`

const VaultPill = styled.div`
  align-items: center;
  background: ${({ theme }) =>
    theme.colors.background.getVariant({ a: () => 0.5 }).toCssValue()};
  border-radius: 999px;
  display: inline-flex;
  flex-shrink: 0;
  gap: 4px;
  max-width: 100%;
  padding: 6px 10px;
`

const VaultPillIcon = styled.span<{ $isFastVault: boolean }>`
  align-items: center;
  color: ${props => getColor(props.$isFastVault ? 'idle' : 'primary')(props)};
  display: flex;
  flex-shrink: 0;
  font-size: 16px;
  height: 16px;
  justify-content: center;
  width: 16px;
`

const VaultNameText = styled(Text)`
  color: ${getColor('text')};
  flex-shrink: 0;
  font-weight: 500;
  letter-spacing: 0;
  line-height: ${20 / 14};
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const BodyText = styled(Text)`
  color: ${getColor('text')};
  display: block;
  flex-shrink: 0;
  font-weight: 500;
  letter-spacing: 0;
  line-height: ${20 / 14};
  margin: 0;
  max-width: 100%;
  text-align: center;
  width: 100%;
`

type KeysignNotificationBannerProps = {
  title: string
  vaultName: string
  description: string
  isFastVault: boolean
  onAction: () => void
  onDismiss: () => void
  /**
   * Parent-controlled visibility. When provided, the banner uses this value for
   * its translateY animation and delegates auto-dismiss to the parent. When
   * omitted, the banner self-manages (Storybook / contained previews).
   */
  isOpen?: boolean
  /**
   * {@code viewport} — in-flow positioning, pushes content down (production).
   * {@code contained} — {@code position: absolute} inside a relatively positioned
   * parent (e.g. 360px Figma-width Storybook frame).
   */
  layout?: 'viewport' | 'contained'
}

/**
 * Top keysign invite banner — layout, spacing, and magic overlay match Figma node
 * 70608:121371 (gradient angle/stops, 198×360 frame, 11px gaps, pill 6×10 + 4px gap).
 */
export const KeysignNotificationBanner = ({
  title,
  vaultName,
  description,
  isFastVault,
  isOpen: externalIsOpen,
  onAction,
  onDismiss,
  layout = 'viewport',
}: KeysignNotificationBannerProps) => {
  const isParentControlled = externalIsOpen !== undefined

  const [internalIsShown, setInternalIsShown] = useState(false)
  const isShown = isParentControlled ? externalIsOpen : internalIsShown

  const [dragOffset, setDragOffset] = useState(0)
  const dragStartY = useRef<number | null>(null)
  const pointerTotalMove = useRef(0)

  const titleId = useId()
  const vaultNameId = useId()
  const descriptionId = useId()

  useEffect(() => {
    if (isParentControlled) return
    const id = requestAnimationFrame(() => {
      setInternalIsShown(true)
    })
    return () => cancelAnimationFrame(id)
  }, [isParentControlled])

  useEffect(() => {
    if (isParentControlled) return
    const timeoutId = window.setTimeout(() => {
      setInternalIsShown(false)
    }, autoDismissMs)
    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [isParentControlled, title, vaultName, description, isFastVault])

  const handleTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.propertyName !== 'transform') return
    if (!isParentControlled && !internalIsShown) {
      onDismiss()
    }
  }

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragStartY.current = event.clientY
    pointerTotalMove.current = 0
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragStartY.current === null) return
    const delta = event.clientY - dragStartY.current
    pointerTotalMove.current +=
      Math.abs(event.movementY) + Math.abs(event.movementX)
    setDragOffset(delta < 0 ? delta : 0)
  }

  const startDismiss = () => {
    if (isParentControlled) {
      onDismiss()
    } else {
      setInternalIsShown(false)
    }
  }

  const endPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    try {
      event.currentTarget.releasePointerCapture(event.pointerId)
    } catch {
      // ignore if capture already released
    }

    if (dragOffset < -swipeDismissThresholdPx) {
      startDismiss()
    } else if (pointerTotalMove.current < 12 && dragStartY.current !== null) {
      startDismiss()
      onAction()
    }

    setDragOffset(0)
    dragStartY.current = null
    pointerTotalMove.current = 0
  }

  const cancelPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    try {
      event.currentTarget.releasePointerCapture(event.pointerId)
    } catch {
      // ignore if capture already released
    }
    setDragOffset(0)
    dragStartY.current = null
    pointerTotalMove.current = 0
  }

  return (
    <BannerRoot
      $dragOffset={dragOffset}
      $isShown={isShown}
      $layout={layout}
      aria-hidden={!isShown}
      aria-labelledby={`${titleId} ${vaultNameId} ${descriptionId}`}
      aria-live={isShown ? 'polite' : 'off'}
      onKeyDown={event => {
        if (!isShown || event.repeat) {
          return
        }
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          startDismiss()
          onAction()
        }
      }}
      onPointerCancel={cancelPointer}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endPointer}
      onTransitionEnd={handleTransitionEnd}
      role="button"
      tabIndex={isShown ? 0 : -1}
    >
      <MagicPatternLayer aria-hidden>
        <MagicPatternImage />
      </MagicPatternLayer>
      <Content>
        <TitleAndPill>
          <TitleBlock>
            <Text as="span" color="regular" id={titleId} variant="title3">
              {title}
            </Text>
          </TitleBlock>
          <VaultPill>
            <VaultPillIcon $isFastVault={isFastVault}>
              {isFastVault ? <LightningIcon /> : <ShieldIcon />}
            </VaultPillIcon>
            <VaultNameText as="span" id={vaultNameId} size={14} weight={500}>
              {vaultName}
            </VaultNameText>
          </VaultPill>
        </TitleAndPill>
        <BodyText as="span" id={descriptionId} size={14} weight={500}>
          {description}
        </BodyText>
      </Content>
    </BannerRoot>
  )
}
