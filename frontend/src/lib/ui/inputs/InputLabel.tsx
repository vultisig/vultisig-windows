import styled from 'styled-components';

import { Text } from '../text';

export const InputLabel = styled(Text)``;

InputLabel.defaultProps = {
  size: 14,
  color: 'contrast',
  weight: '500',
  as: 'div',
};
