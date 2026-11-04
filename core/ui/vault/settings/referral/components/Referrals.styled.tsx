import {
  settingsFieldHairline,
  settingsInputHeight,
} from '@core/ui/settings/settingsField'
import { SettingsPageContent } from '@core/ui/settings/SettingsPageContent'
import { SettingsPageFooter } from '@core/ui/settings/SettingsPageFooter'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { CenterAbsolutely } from '@lib/ui/layout/CenterAbsolutely'
import { HStack, VStack, vStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { mediaQuery } from '@lib/ui/responsive/mediaQuery'
import { text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import styled, { css } from 'styled-components'

const desktopColumn = css`
  @media ${mediaQuery.tabletDeviceAndUp} {
    margin-inline: auto;
    max-width: 650px;
    width: 100%;
  }
`

/** The hairline between sections of the referral forms. */
export const DecorationLine = styled.div`
  background: ${getColor('foregroundExtra')};
  flex-shrink: 0;
  height: 1px;
  margin-bottom: -1px;
`

/** Scrolling body of the referral forms, 24 below the header. */
export const ReferralFormContent = styled(SettingsPageContent)`
  ${desktopColumn};
`

/** The referral forms' button area, pinned 24 above the window edge. */
export const ReferralFormFooter = styled(SettingsPageFooter)`
  ${desktopColumn};
`

/** A label stacked over its input. */
export const FormField = styled.div`
  ${vStack({
    gap: 8,
  })}
`

/** Label text of a referral form field. */
export const FormFieldLabel = styled.label`
  ${text({
    size: 14,
    weight: 500,
    height: 20 / 14,
    color: 'regular',
  })}
  position: relative;
  top: 1px;
`

/**
 * The decorative glow (`Overlay`) is wider than the card it sits behind, so
 * at the popup width it bleeds past the page. Clipping only one axis makes
 * the browser turn the other into `auto`, which is where the horizontal
 * scrollbar came from — clip both so the bleed is cut off, never scrolled.
 */
export const ReferralPageWrapper = styled(PageContent)`
  overflow: hidden;

  @media (${mediaQuery.tabletDeviceAndUp}) {
    max-width: 650px;
    width: 100%;
    margin-inline: auto;
  }
`

/** A referral form field's error line. */
export const FormFieldErrorText = styled.span`
  ${text({
    size: 12,
    weight: 500,
    height: 16 / 12,
    letterSpacing: 0.12,
    color: 'danger',
  })}
`

/** The referral forms' text input; shows its validation on the border. */
export const ReferralTextInput = styled(TextInput)`
  ${borderRadius.md};
  background: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
  color: ${getColor('text')};
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  padding: 2px 15px 0;

  &:focus,
  &:active {
    border-color: ${getColor('foregroundSuper')};
  }

  &::placeholder {
    color: ${getColor('textShy')};
    font-size: 16px;
    font-weight: 500;
    line-height: 24px;
  }

  ${({ validation }) =>
    validation === 'valid' &&
    css`
      &,
      &:focus,
      &:active {
        border-color: ${getColor('success')};
      }
    `}

  ${({ validation }) =>
    validation === 'invalid' &&
    css`
      &,
      &:focus,
      &:active {
        border-color: ${getColor('danger')};
      }
    `}
`

/** Full-window layer the vault menu opens in. */
export const FixedWrapper = styled(CenterAbsolutely)`
  position: fixed;
  background-color: ${getColor('background')};
`

/** The soft glow behind the My Referral panel. */
// eslint-disable-next-line local/no-hardcoded-border-radius -- a decorative glow, not a surface
export const Overlay = styled.div`
  position: absolute;
  width: 374px;
  height: min(416px, 100%);
  left: 50%;
  bottom: 50%;
  transform: translate(-50%, 50%);
  flex-shrink: 0;
  border-radius: 416px;
  background: linear-gradient(
    82deg,
    rgba(51, 230, 191, 0.15) 8.02%,
    rgba(4, 57, 199, 0.15) 133.75%
  );
  filter: blur(126.94499969482422px);
  pointer-events: none;
`

/** Scrolling body of the My Referral screens. */
export const ReferralPageBody = styled(VStack)`
  ${desktopColumn};
  flex-grow: 1;
  gap: 8px;
  min-height: 0;
  overflow: hidden auto;
  padding: 12px 16px 12px;
`

/** The panel holding the vault, rewards and code on the My Referral screens. */
export const ReferralPanel = styled(VStack)`
  ${borderRadius.xl};
  background: ${({ theme }) =>
    theme.colors.background.withAlpha(0.5).toCssValue()};
  border: 1px solid ${getColor('foregroundExtra')};
  flex-shrink: 0;
  gap: 14px;
  padding: 13px;
  position: relative;
`

/** Border, fill and padding of the My Referral read-only cards. */
export const fieldWrapperStyles = css`
  ${borderRadius.md};
  background: ${getColor('background')};
  border: 1px solid ${getColor('foregroundExtra')};
  padding: 13px;
`

/** A My Referral read-only card with stacked content. */
export const VerticalFieldWrapper = styled(VStack)`
  ${fieldWrapperStyles};
`

/** The My Referral code field, with the copy action on its right. */
export const HorizontalFieldWrapper = styled(HStack)`
  ${borderRadius.lg};
  align-items: center;
  background: ${getColor('background')};
  border: 1px solid ${settingsFieldHairline};
  gap: 8px;
  justify-content: space-between;
  min-height: ${settingsInputHeight}px;
  padding: 0 15px;
`

/** The My Referral pill that opens the vault menu. */
export const VaultFieldWrapper = styled(HStack)`
  ${borderRadius.pill};
  align-items: center;
  background: ${getColor('background')};
  border: 1px solid ${getColor('foregroundExtra')};
  cursor: pointer;
  gap: 4px;
  justify-content: space-between;
  min-height: 48px;
  padding: 9px 11px;
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background-color: ${getColor('foregroundExtra')};
  }
`
