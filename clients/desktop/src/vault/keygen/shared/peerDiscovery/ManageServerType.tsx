import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { UnstyledButton } from '../../../../lib/ui/buttons/UnstyledButton';
import { centerContent } from '../../../../lib/ui/css/centerContent';
import { round } from '../../../../lib/ui/css/round';
import { HStack, hStack } from '../../../../lib/ui/layout/Stack';
import { IsActiveProp } from '../../../../lib/ui/props';
import { text } from '../../../../lib/ui/text';
import { matchColor } from '../../../../lib/ui/theme/getters';
import { IconWrapper } from '../../../../pages/edItVault/EditVaultPage.styles';
import {
  KeygenServerType,
  keygenServerTypes,
} from '../../server/KeygenServerType';
import { useCurrentServerType } from '../../state/currentServerType';
import { KeygenServerTypeIcon } from '../KeygenServerTypeIcon';

const Option = styled(UnstyledButton)<IsActiveProp>`
  ${round};
  ${centerContent};

  height: 40px;
  width: 164px;

  ${text({
    size: 14,
    weight: '700',
  })}

  ${hStack({
    alignItems: 'center',
    gap: 8,
  })}

  color: ${matchColor('isActive', {
    true: 'contrast',
    false: 'text',
  })};
  background: ${matchColor('isActive', {
    true: 'foregroundSuper',
    false: 'foregroundExtra',
  })};
`;

const IconContainer = styled(IconWrapper)`
  ${text({
    color: 'primary',
    size: 16,
  })}
`;

export const ManageServerType = () => {
  const [serverType, setServerType] = useCurrentServerType();

  const { t } = useTranslation();

  const textRecord: Record<KeygenServerType, string> = {
    relay: t('internet'),
    local: t('local'),
  };

  return (
    <HStack gap={16}>
      {keygenServerTypes.map(option => (
        <Option
          key={option}
          isActive={serverType === option}
          onClick={() => setServerType(option)}
        >
          <IconContainer>
            <KeygenServerTypeIcon value={option} />
          </IconContainer>
          {textRecord[option]}
        </Option>
      ))}
    </HStack>
  );
};
