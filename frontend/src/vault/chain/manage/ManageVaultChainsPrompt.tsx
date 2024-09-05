import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { IconWrapper } from '../../../lib/ui/icons/IconWrapper';
import { PlusIcon } from '../../../lib/ui/icons/PlusIcon';
import { getColor } from '../../../lib/ui/theme/getters';
import { UnstyledButton } from '../../../lib/ui/buttons/UnstyledButton';

const Container = styled(UnstyledButton)`
  gap: 16px;
  display: flex;
  align-items: center;

  font-weight: 700;
  font-size: 16px;
  color: ${getColor('primary')};
`;

const IconContainer = styled(IconWrapper)`
  font-size: 20px;
`;

export const ManageVaultChainsPrompt = () => {
  return (
    <Link to="/vault/chains">
      <Container>
        <IconContainer>
          <PlusIcon />
        </IconContainer>
        Choose Chains
      </Container>
    </Link>
  );
};
