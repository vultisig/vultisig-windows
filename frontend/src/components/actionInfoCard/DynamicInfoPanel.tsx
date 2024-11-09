import { Text } from '../../lib/ui/text';
import { ProductLogo } from '../../ui/logo/ProductLogo';
import { TextWrapper, Wrapper } from './DynamicInfoPanel.styled';

type DynamicInfoPanelProps = {
  title: string;
  subtitle?: string;
};

export const DynamicInfoPanel = ({
  title,
  subtitle,
}: DynamicInfoPanelProps) => {
  return (
    <Wrapper>
      <TextWrapper>
        <Text size={15} color="contrast" weight={500}>
          {title}
        </Text>
        <Text size={14} color="contrast" weight={500}>
          {subtitle}
        </Text>
      </TextWrapper>
      <ProductLogo fontSize={150} />
    </Wrapper>
  );
};
