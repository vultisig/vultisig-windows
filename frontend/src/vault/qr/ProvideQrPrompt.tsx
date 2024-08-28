import styled from 'styled-components';
import { UnstyledButton } from '../../lib/ui/buttons/UnstyledButton';
import { round } from '../../lib/ui/css/round';
import { getColor } from '../../lib/ui/theme/getters';
import { centerContent } from '../../lib/ui/css/centerContent';
import { CameraIcon } from '../../lib/ui/icons/CameraIcon';
import { sameDimensions } from '../../lib/ui/css/sameDimensions';
import { Link } from 'react-router-dom';

const Container = styled(UnstyledButton)`
  ${round};
  background: ${getColor('primary')};
  ${centerContent};
  color: ${getColor('foreground')};
  ${sameDimensions(64)};
  font-size: 24px;
`;

export const ProvideQrPrompt = () => {
  return (
    <Link to="/vault/qr/upload">
      <Container>
        <CameraIcon />
      </Container>
    </Link>
  );
};
