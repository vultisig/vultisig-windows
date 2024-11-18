import styled from 'styled-components';

import { borderRadius } from '../../../lib/ui/css/borderRadius';
import { horizontalPadding } from '../../../lib/ui/css/horizontalPadding';
import { interactive } from '../../../lib/ui/css/interactive';
import { InvisibleHTMLCheckbox } from '../../../lib/ui/inputs/checkbox/InvisibleHTMLCheckbox';
import { SwitchContainer } from '../../../lib/ui/inputs/switch/SwitchContainer';
import { SwitchControl } from '../../../lib/ui/inputs/switch/SwitchControl';
import { hStack } from '../../../lib/ui/layout/Stack';
import { DnDItemContentPrefix } from '../../../lib/ui/list/item/DnDItemContentPrefix';
import { InputProps } from '../../../lib/ui/props';
import { text } from '../../../lib/ui/text';
import { getColor } from '../../../lib/ui/theme/getters';
import { VaultDescription } from '../../components/VaultDescription';

const Container = styled.label`
  height: 52px;
  ${horizontalPadding(12)};
  ${borderRadius.m};
  ${interactive};
  background: ${getColor('foreground')};

  ${text({
    size: 14,
    weight: '600',
    color: 'contrast',
  })}

  ${hStack({
    fullWidth: true,
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 20,
  })}
`;

const Content = styled.div`
  ${hStack({
    flexGrow: true,
    alignItems: 'center',
    gap: 12,
  })}
  overflow: hidden;
`;

type FolderVaultOptionProps = InputProps<boolean> & {
  isDraggable?: boolean;
};

export const FolderVaultOption: React.FC<FolderVaultOptionProps> = ({
  value,
  onChange,
  isDraggable,
}) => {
  const size = 'm';

  return (
    <Container>
      <Content>
        {isDraggable && <DnDItemContentPrefix />}
        <VaultDescription />
      </Content>
      <InvisibleHTMLCheckbox value={value} onChange={onChange} />
      <SwitchContainer size={size} isActive={value}>
        <SwitchControl isActive={value} size={size} />
      </SwitchContainer>
    </Container>
  );
};
