import styled from 'styled-components';

import { UnstyledButton } from '../../../../lib/ui/buttons/UnstyledButton';
import { borderRadius } from '../../../../lib/ui/css/borderRadius';
import { HStack, VStack } from '../../../../lib/ui/layout/Stack';
import { getColor } from '../../../../lib/ui/theme/getters';
import { PageContent } from '../../../../ui/page/PageContent';

export const OverlayContent = styled(VStack)`
  background-color: ${getColor('foregroundDark')};
`;

export const RiveWrapper = styled.div`
  position: absolute;
  top: 163px;
  left: 140px;
  z-index: 3;
  width: 100px;
  height: 100px;
`;

export const PhoneImageOverlay = styled.div`
  position: absolute;
  inset: 0;
  background-color: rgba(42, 83, 150, 0.09);
`;

export const OverlayWrapper = styled(VStack)`
  padding: 0px 35px 48px 35px;
  background-color: ${getColor('foreground')};
  max-width: 800px;
`;

export const PulseRiveWrapper = styled(VStack)`
  position: fixed;
  width: 100%;
  height: 100%;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
`;

export const PhoneImageWrapper = styled(VStack)`
  position: relative;
  border-bottom-left-radius: 24px;
  border-bottom-right-radius: 24px;
  object-fit: contain;
  width: 600px;
  height: 450px;
  overflow: hidden;

  padding: 0px 24px 24px 24px;
  background-color: ${getColor('foregroundExtra')};

  & > img {
    margin-top: -50px;
  }
`;

export const InfoIconWrapper = styled.div``;

export const PillPlaceholder = styled.div`
  height: 52.5px;
  align-self: stretch;
`;

export const CloseIconWrapper = styled.div`
  font-size: 12px;
  padding: 4px 6px;
  border-radius: 99px;
  background-color: ${getColor('foregroundExtra')};
`;

export const ContentWrapper = styled(VStack)``;

export const PillWrapper = styled(HStack)`
  position: relative;
  min-height: 52.5px;
  padding: 12px;
  ${borderRadius.m};
  background-color: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
`;

export const PageWrapper = styled(PageContent)`
  max-width: 800px;
  margin-inline: auto;
`;

export const BottomItemsWrapper = styled(VStack)`
  align-self: stretch;
`;

export const SwitchModeWrapper = styled.div`
  align-self: center;
`;

export const SwitchModeButton = styled(UnstyledButton)`
  text-decoration: underline;
`;

export const LocalPillWrapper = styled(HStack)`
  padding: 12px;
  gap: 12px;
  border: 1px solid #4879fd;
  ${borderRadius.m};
  align-self: stretch;
`;

export const CloudOffWrapper = styled.div`
  font-size: 17px;
`;
