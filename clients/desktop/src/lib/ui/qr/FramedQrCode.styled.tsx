import styled from 'styled-components';

export const Wrapper = styled.div<{
  size: number;
  scale: number;
}>`
  position: relative;
  box-sizing: border-box;
  width: ${({ size }) => size}px;
  padding: 24px;
  transition: transform 0.3s ease-in-out;
  transform: scale(${({ scale }) => scale});
`;

export const RiveWrapper = styled.div`
  position: absolute;
  inset: -9px;
  z-index: -1;
`;
