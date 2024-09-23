import styled from 'styled-components';

export const Image = styled.img<{
  width?: string | number;
  height?: string | number;
}>`
  /* To prevent line-height space on images as they're display: inline by default */
  display: block;
  max-width: 100%;
  width: ${({ width }) => (typeof width === 'number' ? `${width}px` : width)};
  height: ${({ height }) =>
    typeof height === 'number' ? `${height}px` : height};
`;
